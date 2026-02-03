"use client";

import * as React from "react";
import Waveform from "@/components/waveform/waveform";
import { Button } from "@/components/button/button";
import {
  CheckCircle2,
  LoaderCircle,
  RotateCcw,
  MicOff,
  ShieldAlert,
  AlertCircle,
  Play,
  Pause,
} from "lucide-react";
import { Slider } from "@/components/slider/slider";
import useRecorder, { RecorderStatus } from "../_hooks/use-recorder";
import RecordButton from "./record-button";
import useAudio from "@/hooks/use-audio";
import {
  confirmUpload,
  requestPresignedUrl,
  uploadToStorage,
} from "../_lib/audio-upload-api";
import { AUDIO_CONFIG } from "../_constants/audio-config-constant";
import { formatTime } from "../_lib/format-time";

interface VoiceInputProps {
  maxDurationSeconds?: number;
  onSubmitSuccess: (assetId: number, durationMs: number) => Promise<void>;
  onError: (message: string) => void;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
  disabled?: boolean;
}

type RecordingState = "idle" | "countdown" | "recording" | "recorded";

function VoiceInput({
  maxDurationSeconds = 300,
  onSubmitSuccess,
  onError,
  isSubmitting,
  setIsSubmitting,
  disabled = false,
}: VoiceInputProps) {
  const {
    status,
    historyRef,
    isRecording,
    hasRecorded,
    elapsedSeconds,
    startRecording,
    stopRecording,
    retryRecording,
    getAudioBlob,
    isPlaying,
    playbackTime,
    duration,
    playRecording,
    pausePlayback,
    seekTo,
  } = useRecorder({ maxDurationSeconds });

  const { play: playDing, ready: dingReady } = useAudio("/ui-confirm.wav", 1);
  const {
    play: playTickTock,
    stop: stopTickTock,
    ready: tickTockReady,
  } = useAudio("/ticking.wav", { volume: 0.5, loop: true });

  const [countdown, setCountdown] = React.useState<number | null>(null);
  const isCountingDown = countdown !== null;

  React.useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      setCountdown(null);
      if (dingReady) {
        playDing();
      }
      startRecording();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, dingReady, playDing, startRecording]);

  const WARNING_SECONDS = 10;
  const isInWarningZone =
    isRecording && elapsedSeconds >= maxDurationSeconds - WARNING_SECONDS;
  const wasInWarningZoneRef = React.useRef(false);

  React.useEffect(() => {
    if (isInWarningZone && !wasInWarningZoneRef.current && tickTockReady) {
      wasInWarningZoneRef.current = true;
      playTickTock();
    } else if (!isInWarningZone && wasInWarningZoneRef.current) {
      wasInWarningZoneRef.current = false;
      stopTickTock();
    }
  }, [isInWarningZone, tickTockReady, playTickTock, stopTickTock]);

  const wasPlayingBeforeSeekRef = React.useRef(false);

  const handleSeekStart = () => {
    wasPlayingBeforeSeekRef.current = isPlaying;
    if (isPlaying) {
      pausePlayback();
    }
  };

  const handleSeekEnd = (value: number[]) => {
    seekTo(value[0]);
    const shouldResume = wasPlayingBeforeSeekRef.current;
    wasPlayingBeforeSeekRef.current = false;
    if (shouldResume) {
      playRecording();
    }
  };

  const handleSeekCancel = () => {
    const shouldResume = wasPlayingBeforeSeekRef.current;
    wasPlayingBeforeSeekRef.current = false;
    if (shouldResume) {
      playRecording();
    }
  };

  const recordingState: RecordingState = isCountingDown
    ? "countdown"
    : isRecording
      ? "recording"
      : hasRecorded
        ? "recorded"
        : "idle";

  const handleStartRecording = () => {
    setCountdown(3);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const audioBlob = getAudioBlob();
      if (!audioBlob) {
        throw new Error("녹음된 오디오가 없습니다.");
      }

      const presignedData = await requestPresignedUrl({
        codec: AUDIO_CONFIG.codec,
        sampleRate: AUDIO_CONFIG.sampleRate,
        channels: AUDIO_CONFIG.channels,
      });

      await uploadToStorage(presignedData.uploadUrl, audioBlob);

      const durationMs = elapsedSeconds * 1000;

      const result = await confirmUpload({
        assetId: presignedData.assetId,
        byteSize: audioBlob.size,
        durationMs,
      });

      await onSubmitSuccess(result.assetId, durationMs);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : String(err) || "답변 제출에 실패했습니다. 다시 시도해주세요.";
      onError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStatusError =
    status === "unsupported" ||
    status === "permission_denied" ||
    status === "no_device";

  return (
    <div className="flex flex-col items-center justify-center py-8 md:py-10">
      <CountdownOverlay countdown={countdown} />
      {isStatusError ? (
        <StatusError status={status} />
      ) : (
        <>
          <StatusMessage
            state={recordingState}
            elapsedSeconds={elapsedSeconds}
            maxDurationSeconds={maxDurationSeconds}
          />

          <div className="max-w-sm w-full px-12">
            {hasRecorded ? (
              <div className="flex items-center gap-2 md:gap-3 h-20 md:h-30">
                <Button
                  type="button"
                  size="icon-lg"
                  onClick={isPlaying ? pausePlayback : playRecording}
                  disabled={isSubmitting}
                  aria-label={isPlaying ? "일시정지" : "재생"}
                  className="rounded-full shrink-0"
                  aria-pressed={isPlaying}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5 fill-current" />
                  )}
                </Button>
                <div className="flex-1 flex items-center gap-2 md:gap-3 min-w-0">
                  <Slider
                    value={[playbackTime]}
                    min={0}
                    max={duration || elapsedSeconds}
                    step={0.1}
                    onPointerDown={handleSeekStart}
                    onPointerUp={handleSeekCancel}
                    onPointerLeave={handleSeekCancel}
                    onValueChange={([value]) => seekTo(value)}
                    onValueCommit={handleSeekEnd}
                    disabled={isSubmitting}
                    className="flex-1"
                    aria-label="녹음 재생 위치"
                    aria-valuetext={`${formatTime(Math.floor(playbackTime))} / ${formatTime(Math.floor(duration || elapsedSeconds))}`}
                  />
                  <span className="text-xs md:text-sm tabular-nums text-muted-foreground shrink-0">
                    {formatTime(Math.floor(playbackTime))} /{" "}
                    {formatTime(Math.floor(duration || elapsedSeconds))}
                  </span>
                </div>
              </div>
            ) : (
              <Waveform historyRef={historyRef} className="h-20 md:h-30" />
            )}
          </div>

          <div className="flex items-center justify-center h-20 md:h-24">
            {recordingState !== "recorded" && recordingState !== "countdown" ? (
              <RecordButton
                isRecording={isRecording}
                onClick={isRecording ? stopRecording : handleStartRecording}
                disabled={isSubmitting || disabled || isCountingDown}
              />
            ) : (
              <div className="flex items-center gap-2 md:gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <Button
                  size="default"
                  type="button"
                  variant="outline"
                  onClick={retryRecording}
                  disabled={isSubmitting}
                >
                  <RotateCcw className="w-4 h-4" /> 다시 시도
                </Button>
                <Button
                  type="button"
                  size="default"
                  disabled={isSubmitting || disabled}
                  className="px-6 font-semibold"
                  onClick={handleSubmit}
                >
                  답변 제출
                  {isSubmitting ? (
                    <LoaderCircle className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

interface StatusErrorProps {
  status: RecorderStatus;
}

function StatusError({ status }: StatusErrorProps) {
  const config = {
    unsupported: {
      icon: AlertCircle,
      title: "지원되지 않는 브라우저",
      description:
        "이 브라우저는 음성 녹음을 지원하지 않습니다. Chrome, Safari 등 최신 브라우저를 이용해주세요.",
    },
    permission_denied: {
      icon: ShieldAlert,
      title: "마이크 권한 필요",
      description:
        "음성 녹음을 위해 마이크 권한이 필요합니다. 브라우저 설정에서 마이크 권한을 허용해주세요.",
    },
    no_device: {
      icon: MicOff,
      title: "마이크를 찾을 수 없음",
      description:
        "연결된 마이크 장치가 없습니다. 마이크를 연결하고 다시 시도해주세요.",
    },
  } as const;

  const current = config[status as keyof typeof config];

  if (!current) return null;

  const Icon = current.icon;

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center px-6">
      <div className="w-16 h-16 mb-4 rounded-full bg-red-50 flex items-center justify-center">
        <Icon className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {current.title}
      </h3>
      <p className="text-sm text-gray-500 max-w-sm">{current.description}</p>
    </div>
  );
}

interface StatusMessageProps {
  state: RecordingState;
  elapsedSeconds: number;
  maxDurationSeconds: number;
}

function StatusMessage({
  state,
  elapsedSeconds,
  maxDurationSeconds,
}: StatusMessageProps) {
  const showIdle = state === "idle" || state === "countdown";

  return (
    <div className="text-center px-4 flex items-center justify-center">
      {state === "recording" && (
        <div
          key="recording"
          className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-3"
        >
          <div className="pt-1">
            <div className="text-4xl md:text-4xl font-semibold tabular-nums text-center tracking-tight flex items-end justify-center gap-1">
              <div>{formatTime(elapsedSeconds)} </div>
              <div className="text-base md:text-lg text-muted-foreground font-normal">
                / {formatTime(maxDurationSeconds)}
              </div>
            </div>
            <p className="text-muted-foreground text-center text-sm mt-1">
              녹음 중...
            </p>
          </div>
        </div>
      )}

      {showIdle && (
        <div key="idle">
          <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-3">
            답변 시작
          </h3>
          <p className="text-muted-foreground text-sm md:text-base">
            버튼을 눌러 녹음을 시작하세요.
          </p>
        </div>
      )}

      {state === "recorded" && (
        <div
          key="recorded"
          className="animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-3">
            녹음 완료
          </h3>
          <p className="text-muted-foreground text-sm md:text-base">
            답변을 제출하고 채점 결과를 확인해보세요
          </p>
        </div>
      )}
    </div>
  );
}

function CountdownOverlay({ countdown }: { countdown: number | null }) {
  if (countdown === null) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        key={countdown}
        className="relative text-8xl md:text-9xl font-bold text-teal-300 tabular-nums animate-countdown-spring"
      >
        {countdown}
      </div>
    </div>
  );
}

export default VoiceInput;
