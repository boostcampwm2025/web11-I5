import * as React from "react";
import createAudioStreamer, { AudioStreamerHandle } from "@/lib/audio-streamer";
import { logger } from "@/lib/sentry-logger";
import { encodePcmToWav } from "@/lib/wav-encoder";
import useAnimationFrame from "@/hooks/use-animation-frame";
import {
  AUDIO_CONFIG,
  WAVEFORM_CONFIG,
} from "../_constants/audio-config-constant";

export type RecorderStatus =
  | "unsupported"
  | "permission_denied"
  | "permission_prompt"
  | "no_device"
  | "ready";

interface UseRecorderOptions {
  maxDurationSeconds?: number;
}

function checkBrowserSupport(): boolean {
  return !!(
    typeof navigator !== "undefined" &&
    navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === "function"
  );
}

async function checkMicrophoneDevice(): Promise<boolean> {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.some((device) => device.kind === "audioinput");
  } catch {
    return false;
  }
}

async function getPermissionState(): Promise<PermissionState | null> {
  try {
    if (navigator.permissions && navigator.permissions.query) {
      const result = await navigator.permissions.query({
        name: "microphone" as PermissionName,
      });
      return result.state;
    }
  } catch {
    // Permissions API not supported or microphone permission query not allowed
  }
  return null;
}

function useRecorder(options: UseRecorderOptions = {}) {
  const { maxDurationSeconds = 300 } = options;

  const [status, setStatus] =
    React.useState<RecorderStatus>("permission_prompt");
  const [isRecording, setIsRecording] = React.useState(false);
  const [elapsedSeconds, setElapsedSeconds] = React.useState(0);
  const [hasRecorded, setHasRecorded] = React.useState(false);

  // 재생 관련 상태
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [playbackTime, setPlaybackTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);

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

  // 재생 관련 Ref
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = React.useRef<string | null>(null);
  const audioHandlersRef = React.useRef<{
    loadedmetadata: (() => void) | null;
    ended: (() => void) | null;
  }>({ loadedmetadata: null, ended: null });

  const accumRef = React.useRef({
    sumSq: 0,
    count: 0,
    nextFlushAt: 0,
  });

  // 상태 체크 함수
  const checkStatus = React.useCallback(async (): Promise<RecorderStatus> => {
    // 1. 브라우저 지원 확인
    if (!checkBrowserSupport()) {
      return "unsupported";
    }

    // 2. 권한 상태 확인
    const permissionState = await getPermissionState();

    if (permissionState === "denied") {
      return "permission_denied";
    }

    if (permissionState === "prompt") {
      return "permission_prompt";
    }

    // 3. granted 상태이거나 Permissions API 미지원 시 디바이스 확인
    if (permissionState === "granted") {
      const hasDevice = await checkMicrophoneDevice();
      if (!hasDevice) {
        return "no_device";
      }
      return "ready";
    }

    // Permissions API 미지원 시 permission_prompt로 간주
    return "permission_prompt";
  }, []);

  // 초기 상태 체크 및 권한 변경 리스너
  React.useEffect(() => {
    let permissionStatus: PermissionStatus | null = null;

    const updateStatus = async () => {
      const newStatus = await checkStatus();
      setStatus(newStatus);
    };

    void updateStatus();

    // 권한 변경 리스너 등록
    const setupPermissionListener = async () => {
      try {
        if (navigator.permissions && navigator.permissions.query) {
          permissionStatus = await navigator.permissions.query({
            name: "microphone" as PermissionName,
          });
          if (typeof permissionStatus.addEventListener === "function") {
            permissionStatus.addEventListener("change", updateStatus);
          }
        }
      } catch {
        // Permissions API not supported
      }
    };

    void setupPermissionListener();

    // 디바이스 변경 리스너 등록
    const handleDeviceChange = () => {
      void updateStatus();
    };

    if (
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.addEventListener === "function"
    ) {
      navigator.mediaDevices.addEventListener(
        "devicechange",
        handleDeviceChange,
      );
    }

    return () => {
      if (
        permissionStatus &&
        typeof permissionStatus.removeEventListener === "function"
      ) {
        permissionStatus.removeEventListener("change", updateStatus);
      }
      if (
        navigator.mediaDevices &&
        typeof navigator.mediaDevices.removeEventListener === "function"
      ) {
        navigator.mediaDevices.removeEventListener(
          "devicechange",
          handleDeviceChange,
        );
      }
    };
  }, [checkStatus]);

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

      setStatus("ready");
      setIsRecording(true);
    } catch (error) {
      logger.error("녹음 시작 실패", {
        error: error instanceof Error ? error.message : String(error),
      });
      setIsRecording(false);

      // 에러 유형에 따라 상태 업데이트
      if (error instanceof Error) {
        const errorName = error.name;
        const errorMessage = error.message.toLowerCase();

        if (
          errorName === "NotAllowedError" ||
          errorMessage.includes("permission denied")
        ) {
          setStatus("permission_denied");
        } else if (
          errorName === "NotFoundError" ||
          errorMessage.includes("no device") ||
          errorMessage.includes("not found")
        ) {
          setStatus("no_device");
        } else if (
          errorName === "NotSupportedError" ||
          errorMessage.includes("not supported")
        ) {
          setStatus("unsupported");
        }
      }
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
      logger.error("녹음 중지 실패", {
        error: error instanceof Error ? error.message : String(error),
      });
      setIsRecording(false);
    }
  }, []);

  const retryRecording = React.useCallback(() => {
    // 재생 정리 - 이벤트 리스너 제거
    if (audioRef.current) {
      if (audioHandlersRef.current.loadedmetadata) {
        audioRef.current.removeEventListener(
          "loadedmetadata",
          audioHandlersRef.current.loadedmetadata,
        );
      }
      if (audioHandlersRef.current.ended) {
        audioRef.current.removeEventListener(
          "ended",
          audioHandlersRef.current.ended,
        );
      }
      audioRef.current.pause();
      audioRef.current = null;
    }
    audioHandlersRef.current = { loadedmetadata: null, ended: null };

    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    setIsPlaying(false);
    setPlaybackTime(0);
    setDuration(0);

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

  // 재생 시작/재개
  // Audio 엘리먼트 생성 (재생 또는 seek 시 lazy 생성)
  const ensureAudioElement = React.useCallback(() => {
    if (!recordedBlobRef.current) return null;

    if (!audioRef.current) {
      audioUrlRef.current = URL.createObjectURL(recordedBlobRef.current);
      audioRef.current = new Audio(audioUrlRef.current);

      const handleLoadedMetadata = () => {
        setDuration(audioRef.current?.duration ?? 0);
      };
      const handleEnded = () => {
        setIsPlaying(false);
      };

      audioHandlersRef.current.loadedmetadata = handleLoadedMetadata;
      audioHandlersRef.current.ended = handleEnded;

      audioRef.current.addEventListener("loadedmetadata", handleLoadedMetadata);
      audioRef.current.addEventListener("ended", handleEnded);
    }

    return audioRef.current;
  }, []);

  const playRecording = React.useCallback(async () => {
    const audio = ensureAudioElement();
    if (!audio) return;

    try {
      await audio.play();
      setIsPlaying(true);
    } catch (error) {
      setIsPlaying(false);
      logger.error("녹음 재생 실패", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }, [ensureAudioElement]);

  // 일시정지
  const pausePlayback = React.useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  // 정지 (처음으로)
  const stopPlayback = React.useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setPlaybackTime(0);
    }
  }, []);

  // 특정 위치로 이동
  const seekTo = React.useCallback(
    (time: number) => {
      const audio = ensureAudioElement();
      if (audio) {
        audio.currentTime = time;
        setPlaybackTime(time);
      }
    },
    [ensureAudioElement],
  );

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
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
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

  // 상태 새로고침 함수 (수동 호출용)
  const refreshStatus = React.useCallback(async () => {
    const newStatus = await checkStatus();
    setStatus(newStatus);
    return newStatus;
  }, [checkStatus]);

  // 재생 중일 때 부드럽게 playbackTime 업데이트
  useAnimationFrame(() => {
    if (audioRef.current) {
      setPlaybackTime(audioRef.current.currentTime);
    }
  }, isPlaying);

  // 컴포넌트 언마운트 시 오디오 리소스 정리
  React.useEffect(() => {
    return () => {
      if (audioRef.current) {
        if (audioHandlersRef.current.loadedmetadata) {
          audioRef.current.removeEventListener(
            "loadedmetadata",
            audioHandlersRef.current.loadedmetadata,
          );
        }
        if (audioHandlersRef.current.ended) {
          audioRef.current.removeEventListener(
            "ended",
            audioHandlersRef.current.ended,
          );
        }
        audioRef.current.pause();
      }
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
    };
  }, []);

  return {
    status,
    refreshStatus,

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

    // 재생 관련
    isPlaying,
    playbackTime,
    duration,
    playRecording,
    pausePlayback,
    stopPlayback,
    seekTo,
  };
}

export default useRecorder;
