import * as React from "react";
import { WAVEFORM_CONFIG } from "../_constants/audio-config-constant";

interface UseRecorderOptions {
  maxDurationSeconds?: number;
}

type RecorderBlob = {
  blob: Blob;
  mimeType: string; // 항상 audio/mp4 계열
};

function pickM4aMimeTypeStrict(): string {
  if (typeof MediaRecorder === "undefined") return "";

  const candidates = ["audio/mp4;codecs=mp4a.40.2", "audio/mp4"];

  for (const t of candidates) {
    try {
      if (MediaRecorder.isTypeSupported(t)) return t;
    } catch {
      // ignore
    }
  }
  return "";
}

function useRecorder(options: UseRecorderOptions = {}) {
  const { maxDurationSeconds = 300 } = options;

  const [isRecording, setIsRecording] = React.useState(false);
  const [elapsedSeconds, setElapsedSeconds] = React.useState(0);
  const [hasRecorded, setHasRecorded] = React.useState(false);

  // 결과(m4a만)
  const recordedRef = React.useRef<RecorderBlob | null>(null);

  // 파형 데이터(RMS 히스토리)
  const historyRef = React.useRef<number[]>(
    Array.from({ length: WAVEFORM_CONFIG.maxBars }, () => 0),
  );

  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  const mediaStreamRef = React.useRef<MediaStream | null>(null);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const recordedChunksRef = React.useRef<BlobPart[]>([]);

  const audioCtxRef = React.useRef<AudioContext | null>(null);
  const analyserRef = React.useRef<AnalyserNode | null>(null);
  const waveformTimerRef = React.useRef<number | null>(null);

  const stopAll = React.useCallback(() => {
    if (waveformTimerRef.current != null) {
      window.clearInterval(waveformTimerRef.current);
      waveformTimerRef.current = null;
    }

    if (audioCtxRef.current) {
      try {
        void audioCtxRef.current.close();
      } catch {
        // ignore
      }
      audioCtxRef.current = null;
    }
    analyserRef.current = null;

    if (mediaStreamRef.current) {
      for (const t of mediaStreamRef.current.getTracks()) t.stop();
      mediaStreamRef.current = null;
    }

    mediaRecorderRef.current = null;
  }, []);

  const startWaveform = React.useCallback((stream: MediaStream) => {
    const AudioContextCtor = window.AudioContext;
    if (!AudioContextCtor) return;

    const ctx: AudioContext = new AudioContextCtor();
    audioCtxRef.current = ctx;

    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyserRef.current = analyser;

    source.connect(analyser);

    const buf = new Float32Array(analyser.fftSize);

    waveformTimerRef.current = window.setInterval(() => {
      if (!analyserRef.current) return;

      analyserRef.current.getFloatTimeDomainData(buf);

      let sumSq = 0;
      for (let i = 0; i < buf.length; i++) sumSq += buf[i] * buf[i];
      const rms = Math.sqrt(sumSq / buf.length);

      historyRef.current.push(rms);
      if (historyRef.current.length > WAVEFORM_CONFIG.maxBars) {
        historyRef.current.shift();
      }
    }, WAVEFORM_CONFIG.updateIntervalMs);
  }, []);

  const startRecording = React.useCallback(async () => {
    try {
      recordedRef.current = null;
      recordedChunksRef.current = [];
      historyRef.current = Array.from(
        { length: WAVEFORM_CONFIG.maxBars },
        () => 0,
      );

      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error("mediaDevices not available");
      }
      if (typeof MediaRecorder === "undefined") {
        throw new Error("MediaRecorder not supported");
      }

      // ✅ m4a 강제: 지원 안 되면 여기서 막음
      const mimeType = pickM4aMimeTypeStrict();
      if (!mimeType) {
        throw new Error("This browser cannot record audio/mp4 (m4a).");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });

      mediaStreamRef.current = stream;
      startWaveform(stream);

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        // mimeType은 항상 audio/mp4 계열
        const finalMime = recorder.mimeType || mimeType;
        const blob = new Blob(recordedChunksRef.current, { type: finalMime });

        recordedRef.current = { blob, mimeType: finalMime };
        recordedChunksRef.current = [];
        setHasRecorded(true);
      };

      recorder.onerror = (e) => {
        console.error("MediaRecorder error:", e);
      };

      // timeslice: 1초 단위로 청크 생성(메모리 피크 예측 가능)
      recorder.start(1000);

      setIsRecording(true);
    } catch (error) {
      console.error("Failed to start recording:", error);
      setIsRecording(false);
      stopAll();
      // 필요하면 여기서 UI 토스트로 “m4a 미지원 브라우저” 안내
    }
  }, [startWaveform, stopAll]);

  const stopRecording = React.useCallback(async () => {
    try {
      const r = mediaRecorderRef.current;
      if (r && r.state !== "inactive") r.stop();

      setIsRecording(false);
      stopAll();
    } catch (error) {
      console.error("Failed to stop recording:", error);
      setIsRecording(false);
      stopAll();
    }
  }, [stopAll]);

  const retryRecording = React.useCallback(() => {
    recordedRef.current = null;
    recordedChunksRef.current = [];
    historyRef.current = Array.from(
      { length: WAVEFORM_CONFIG.maxBars },
      () => 0,
    );
    setHasRecorded(false);
    setElapsedSeconds(0);
    setIsRecording(false);
  }, []);

  const getAudioBlob = React.useCallback(
    () => recordedRef.current?.blob ?? null,
    [],
  );
  const getAudioMimeType = React.useCallback(
    () => recordedRef.current?.mimeType ?? null,
    [],
  );

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

    getAudioBlob, // m4a Blob
    getAudioMimeType, // "audio/mp4" 계열
  };
}

export default useRecorder;
