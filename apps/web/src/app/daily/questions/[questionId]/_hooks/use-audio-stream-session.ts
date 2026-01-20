import createAudioStreamer, { AudioStreamerHandle } from "@/lib/audio-streamer";
import * as React from "react";
import {
  AUDIO_CONFIG,
  WAVEFORM_CONFIG,
} from "../_constants/audio-config-constant";
import useSocket from "@/hooks/use-socket";
import {
  finalizeAudioSession,
  startAudioSession,
} from "../_lib/audio-session-api";

interface UseAudioStreamSessionOptions {
  maxDurationSeconds?: number;
  onMaxDurationReached?: () => void;
}

function useAudioStreamSession(options: UseAudioStreamSessionOptions = {}) {
  const { maxDurationSeconds = 300, onMaxDurationReached } = options;

  const [isRecording, setIsRecording] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [sessionId, setSessionId] = React.useState<string | null>(null);
  const [assetId, setAssetId] = React.useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = React.useState(0);

  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  const streamerRef = React.useRef<AudioStreamerHandle | null>(null);
  const lastUpdateTimeRef = React.useRef<number>(0);
  const historyRef = React.useRef<number[]>(
    Array.from({ length: 250 }, () => 0),
  );
  const seqRef = React.useRef(0);

  const accumRef = React.useRef({
    sumSq: 0,
    count: 0,
    nextFlushAt: 0,
  });

  const { socketRef } = useSocket();

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

  // 녹음 타이머
  React.useEffect(() => {
    if (isRecording) {
      setElapsedSeconds(0);
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => {
          const next = prev + 1;
          if (next >= maxDurationSeconds) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            onMaxDurationReached?.();
          }
          return next;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRecording, maxDurationSeconds, onMaxDurationReached]);

  // sessionId 변경 시 onAudioChunk 콜백 업데이트
  React.useEffect(() => {
    if (!streamerRef.current) return;

    // 초기화
    accumRef.current.sumSq = 0;
    accumRef.current.count = 0;
    accumRef.current.nextFlushAt =
      Date.now() + WAVEFORM_CONFIG.updateIntervalMs;

    streamerRef.current.setOnAudioChunk(({ wave, buffer }) => {
      // (1) 전송은 그대로 10ms 단위로
      if (socketRef.current && sessionId) {
        const bytes = Buffer.from(buffer);
        const seq = seqRef.current++;
        socketRef.current.emit("audio.chunk", { sessionId, seq, bytes });
      }

      const now = Date.now();
      lastUpdateTimeRef.current = now;

      // (2) 그래프용 누적: 제곱합 + 카운트
      let sumSq = 0;
      for (let i = 0; i < wave.length; i++) sumSq += wave[i] * wave[i];

      accumRef.current.sumSq += sumSq;
      accumRef.current.count += wave.length;

      // (3) 100ms마다 한 번만 history 업데이트
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

        // 드리프트 줄이기: 현재 시간 기준으로 다음 flush 설정
        accumRef.current.nextFlushAt = now + WAVEFORM_CONFIG.updateIntervalMs;
      }
    });
  }, [socketRef, sessionId]);

  const startRecording = React.useCallback(async () => {
    if (!socketRef.current) {
      console.warn("Socket is not connected");
      return;
    }

    try {
      setIsLoading(true);
      // 1. 세션 시작
      const { sessionId: newSessionId } = await startAudioSession({
        codec: AUDIO_CONFIG.codec,
        sampleRate: AUDIO_CONFIG.sampleRate,
        channels: AUDIO_CONFIG.channels,
      });

      seqRef.current = 0;

      // 2. 오디오 스트리머 시작
      socketRef.current.connect();
      await streamerRef.current?.start();

      setIsLoading(false);
      setSessionId(newSessionId);
      setIsRecording(true);
    } catch (error) {
      console.error("Failed to start recording:", error);
    }
  }, [socketRef]);

  const stopRecording = React.useCallback(async () => {
    await streamerRef.current?.stop();

    if (!sessionId) {
      return;
    }

    try {
      setIsRecording(false);
      setIsLoading(true);

      // 세션 종료
      const res = await finalizeAudioSession({
        sessionId,
      });

      setAssetId(res.assetId);
      setIsLoading(false);

      socketRef.current?.disconnect();
    } catch (error) {
      console.error("Failed to stop recording:", error);
    }
  }, [socketRef, sessionId]);

  // 다시 시도 핸들러
  const retryRecording = React.useCallback(() => {
    setSessionId(null);
    historyRef.current = Array.from(
      { length: WAVEFORM_CONFIG.maxBars },
      () => 0,
    );
    startRecording();
  }, [startRecording]);

  return {
    socketRef,
    streamerRef,
    historyRef,

    assetId,
    sessionId,

    isLoading,
    isRecording,

    elapsedSeconds,
    maxDurationSeconds,

    startRecording,
    stopRecording,
    retryRecording,
  };
}

export default useAudioStreamSession;
