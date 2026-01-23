import * as React from "react";
import createAudioStreamer, { AudioStreamerHandle } from "@/lib/audio-streamer";
import { encodePcmToWav } from "@/lib/wav-encoder";
import {
  AUDIO_CONFIG,
  WAVEFORM_CONFIG,
} from "../_constants/audio-config-constant";

interface UseRecorderOptions {
  maxDurationSeconds?: number;
}

function useRecorder(options: UseRecorderOptions = {}) {
  const { maxDurationSeconds = 300 } = options;

  const [isRecording, setIsRecording] = React.useState(false);
  const [elapsedSeconds, setElapsedSeconds] = React.useState(0);
  const [hasRecorded, setHasRecorded] = React.useState(false);

  // 결과 WAV Blob
  const recordedBlobRef = React.useRef<Blob | null>(null);

  // PCM 청크를 메모리에 누적
  const pcmChunksRef = React.useRef<ArrayBuffer[]>([]);

  // 파형 데이터(RMS 히스토리)
  const historyRef = React.useRef<number[]>(
    Array.from({ length: WAVEFORM_CONFIG.maxBars }, () => 0),
  );

  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const streamerRef = React.useRef<AudioStreamerHandle | null>(null);

  const accumRef = React.useRef({
    sumSq: 0,
    count: 0,
    nextFlushAt: 0,
  });

  // AudioStreamer 초기화 (한 번만 실행)
  React.useEffect(() => {
    const streamer = createAudioStreamer({
      sampleRate: AUDIO_CONFIG.sampleRate,
      channels: AUDIO_CONFIG.channels,
      bitsPerSample: AUDIO_CONFIG.bitsPerSample,
    });

    streamerRef.current = streamer;

    return () => {
      streamer.stop();
      streamerRef.current = null;
    };
  }, []);

  // onAudioChunk 콜백 설정
  React.useEffect(() => {
    if (!streamerRef.current) return;

    // 초기화
    accumRef.current.sumSq = 0;
    accumRef.current.count = 0;
    accumRef.current.nextFlushAt =
      Date.now() + WAVEFORM_CONFIG.updateIntervalMs;

    streamerRef.current.setOnAudioChunk(({ wave, buffer }) => {
      // PCM 청크를 메모리에 저장
      const arrayBuffer = buffer as ArrayBuffer;
      pcmChunksRef.current.push(arrayBuffer.slice(0));

      const now = Date.now();

      // 그래프용 누적: 제곱합 + 카운트
      let sumSq = 0;
      for (let i = 0; i < wave.length; i++) sumSq += wave[i] * wave[i];

      accumRef.current.sumSq += sumSq;
      accumRef.current.count += wave.length;

      // 100ms마다 한 번만 history 업데이트
      if (now >= accumRef.current.nextFlushAt) {
        const meanSq = accumRef.current.count
          ? accumRef.current.sumSq / accumRef.current.count
          : 0;
        const rms100 = Math.sqrt(meanSq);

        historyRef.current.push(rms100);
        if (historyRef.current.length > WAVEFORM_CONFIG.maxBars) {
          historyRef.current.shift();
        }

        // 다음 버킷으로 리셋
        accumRef.current.sumSq = 0;
        accumRef.current.count = 0;
        accumRef.current.nextFlushAt = now + WAVEFORM_CONFIG.updateIntervalMs;
      }
    });
  }, []);

  const startRecording = React.useCallback(async () => {
    try {
      // 초기화
      recordedBlobRef.current = null;
      pcmChunksRef.current = [];
      historyRef.current = Array.from(
        { length: WAVEFORM_CONFIG.maxBars },
        () => 0,
      );
      setHasRecorded(false);

      // 오디오 스트리머 시작
      await streamerRef.current?.start();

      setIsRecording(true);
    } catch (error) {
      console.error("Failed to start recording:", error);
      setIsRecording(false);
    }
  }, []);

  const stopRecording = React.useCallback(async () => {
    try {
      // 녹음 중지
      await streamerRef.current?.stop();

      // PCM -> WAV 변환
      if (pcmChunksRef.current.length > 0) {
        const wavBlob = encodePcmToWav(
          pcmChunksRef.current,
          AUDIO_CONFIG.sampleRate,
          AUDIO_CONFIG.channels,
        );
        recordedBlobRef.current = wavBlob;
        setHasRecorded(true);
      }

      setIsRecording(false);
    } catch (error) {
      console.error("Failed to stop recording:", error);
      setIsRecording(false);
    }
  }, []);

  const retryRecording = React.useCallback(() => {
    recordedBlobRef.current = null;
    pcmChunksRef.current = [];
    historyRef.current = Array.from(
      { length: WAVEFORM_CONFIG.maxBars },
      () => 0,
    );
    setHasRecorded(false);
    setElapsedSeconds(0);
    setIsRecording(false);
  }, []);

  const getAudioBlob = React.useCallback(
    () => recordedBlobRef.current ?? null,
    [],
  );

  const getAudioMimeType = React.useCallback(() => "audio/wav", []);

  // 녹음 타이머 + maxDurationSeconds 도달 시 stop
  React.useEffect(() => {
    if (!isRecording) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      return;
    }

    setElapsedSeconds(0);
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;
        if (next >= maxDurationSeconds) {
          void stopRecording();
        }
        return next;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [isRecording, maxDurationSeconds, stopRecording]);

  return {
    historyRef,

    isRecording,
    elapsedSeconds,
    maxDurationSeconds,
    hasRecorded,

    startRecording,
    stopRecording,
    retryRecording,

    getAudioBlob, // WAV Blob
    getAudioMimeType, // "audio/wav"
  };
}

export default useRecorder;
