interface AudioStreamerConfig {
  sampleRate: number; // 16000
  channels: number; // 1
  bitsPerSample: number; // 16
  /**
   * PCM16(LE) chunk를 받는 콜백
   * - buffer: Int16Array.buffer (transferable)
   * - sampleRate: 실제 전송 샘플레이트(보통 config.sampleRate)
   * - wave: 오디오 파형
   */
  onAudioChunk?: (payload: {
    buffer: ArrayBufferLike;
    sampleRate: number;
    wave: Float32Array;
  }) => void;
  onStart?: () => void;
  onStop?: () => void;
  onError?: (err: unknown) => void;
  constraints?: MediaStreamConstraints;
}

interface AudioStreamerHandle {
  start: () => Promise<void>;
  stop: () => Promise<void>;
  getState: () => { isRecording: boolean };
  setOnAudioChunk: (callback: AudioStreamerConfig["onAudioChunk"]) => void;
}

function createAudioStreamer(config: AudioStreamerConfig): AudioStreamerHandle {
  let audioContext: AudioContext | null = null;
  let audioWorkletNode: AudioWorkletNode | null = null;
  let mediaStream: MediaStream | null = null;
  let isRecording = false;
  let onAudioChunkCallback = config.onAudioChunk;

  const defaultConstraints: MediaStreamConstraints = {
    audio: {
      channelCount: 1,
      sampleRate: 48000,
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
  };

  const floatToPCM16 = (float32Array: Float32Array): Int16Array => {
    const pcm16 = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return pcm16;
  };

  const processAudioData = (audioData: Float32Array) => {
    if (!audioContext) return;

    const currentSampleRate = audioContext.sampleRate || 48000;

    // 48k/44.1k -> target (ex: 16k)
    const resampled =
      currentSampleRate === config.sampleRate
        ? audioData
        : resampleLinear(audioData, currentSampleRate, config.sampleRate);

    const wave = downsampleForWave(resampled, 256);

    const pcmData = floatToPCM16(resampled);

    onAudioChunkCallback?.({
      buffer: pcmData.buffer,
      sampleRate: config.sampleRate,
      wave,
    });
  };

  const cleanup = async () => {
    // AudioWorkletNode
    if (audioWorkletNode) {
      audioWorkletNode.port.onmessage = null;
      audioWorkletNode.disconnect();
      audioWorkletNode = null;
    }

    // AudioContext
    if (audioContext && audioContext.state !== "closed") {
      try {
        await audioContext.close();
      } finally {
        audioContext = null;
      }
    } else {
      audioContext = null;
    }

    // MediaStream
    if (mediaStream) {
      mediaStream.getTracks().forEach((t) => t.stop());
      mediaStream = null;
    }
  };

  const start = async () => {
    if (isRecording) return;

    try {
      mediaStream = await navigator.mediaDevices.getUserMedia(
        config.constraints ?? defaultConstraints,
      );

      audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(mediaStream);

      // AudioWorklet 로드/생성
      const workletURL = makeWorkletURL();
      await audioContext.audioWorklet.addModule(workletURL);

      audioWorkletNode = new AudioWorkletNode(audioContext, "mic-tap");
      audioWorkletNode.port.onmessage = (event) => {
        // worklet에서 Float32Array를 보내준다는 가정
        processAudioData(event.data as Float32Array);
      };

      source.connect(audioWorkletNode);

      // 주의: destination에 연결하면 스피커로 모니터링(에코)될 수 있음.
      // 필요할 때만 켜고 싶으면 옵션으로 빼는 게 좋음.
      audioWorkletNode.connect(audioContext.destination);

      isRecording = true;
      config.onStart?.();
    } catch (err) {
      config.onError?.(err);
      isRecording = false;
      await cleanup();
      throw err;
    }
  };

  const stop = async () => {
    if (!isRecording) {
      await cleanup();
      return;
    }

    isRecording = false;
    await cleanup();
    config.onStop?.();
  };

  const getState = () => ({ isRecording });

  const setOnAudioChunk = (callback: AudioStreamerConfig["onAudioChunk"]) => {
    onAudioChunkCallback = callback;
  };

  return { start, stop, getState, setOnAudioChunk };
}

function makeWorkletURL() {
  const code = `
    class MicTap extends AudioWorkletProcessor {
      process(inputs) {
        const input = inputs[0];
        if (input && input[0] && input[0].length) {
          // mono: channel 0
          this.port.postMessage(input[0]);
        }
        return true;
      }
    }
    registerProcessor("mic-tap", MicTap);
  `;
  return URL.createObjectURL(
    new Blob([code], { type: "application/javascript" }),
  );
}

// 48k(or 44.1k) -> 16k 최소 리샘플(선형 보간)
function resampleLinear(input: Float32Array, inRate: number, outRate: number) {
  if (inRate === outRate) return input;

  const ratio = inRate / outRate;
  const outLen = Math.floor(input.length / ratio);
  const out = new Float32Array(outLen);

  let pos = 0;
  for (let i = 0; i < outLen; i++) {
    const idx = Math.floor(pos);
    const frac = pos - idx;
    const s0 = input[idx] ?? 0;
    const s1 = input[idx + 1] ?? s0;
    out[i] = s0 + (s1 - s0) * frac;
    pos += ratio;
  }
  return out;
}

const downsampleForWave = (samples: Float32Array, targetPoints = 256) => {
  if (samples.length <= targetPoints) return samples;

  const out = new Float32Array(targetPoints);
  const step = samples.length / targetPoints;

  for (let i = 0; i < targetPoints; i++) {
    const start = Math.floor(i * step);
    const end = Math.floor((i + 1) * step);

    let peak = 0;
    for (let j = start; j < end; j++) {
      const v = Math.abs(samples[j]);
      if (v > peak) peak = v;
    }

    out[i] = peak;
  }

  return out;
};

export default createAudioStreamer;
export type { AudioStreamerHandle };
