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
import useWav from "@/hooks/use-wav";
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

type RecordingState = "idle" | "recording" | "recorded";

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

  const { play: playDing, ready: dingWavReady } = useWav("/ui-confirm.wav", 1);

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

  const recordingState: RecordingState = isRecording
    ? "recording"
    : hasRecorded
      ? "recorded"
      : "idle";

  const handleStartRecording = () => {
    if (dingWavReady) {
      setTimeout(() => playDing(), 100);
    }
    startRecording();
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
    <div className="bg-white border rounded-xl h-100 flex flex-col items-center justify-center">
      {isStatusError ? (
        <StatusError status={status} />
      ) : (
        <>
          <StatusMessage
            state={recordingState}
            elapsedSeconds={elapsedSeconds}
            maxDurationSeconds={maxDurationSeconds}
          />

          <div className="max-w-sm w-full px-6">
            {hasRecorded ? (
              <div className="flex items-center gap-3 h-40">
                <button
                  type="button"
                  onClick={isPlaying ? pausePlayback : playRecording}
                  disabled={isSubmitting}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5" />
                  )}
                </button>
                <div className="flex-1 flex items-center gap-3">
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
                  />
                  <span className="text-sm tabular-nums text-muted-foreground min-w-17.5 text-right">
                    {formatTime(Math.floor(playbackTime))} /{" "}
                    {formatTime(Math.floor(duration || elapsedSeconds))}
                  </span>
                </div>
              </div>
            ) : (
              <Waveform historyRef={historyRef} />
            )}
          </div>

          <div className="flex items-center justify-center h-24">
            {recordingState !== "recorded" ? (
              <RecordButton
                isRecording={isRecording}
                onClick={isRecording ? stopRecording : handleStartRecording}
                disabled={isSubmitting || disabled}
              />
            ) : (
              <div className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <Button
                  size="lg"
                  type="button"
                  variant="outline"
                  onClick={retryRecording}
                  disabled={isSubmitting}
                >
                  <RotateCcw className="w-4 h-4" /> 다시 시도
                </Button>
                <Button
                  type="button"
                  size="lg"
                  disabled={isSubmitting || disabled}
                  className="pl-6 pr-6 font-semibold"
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
  return (
    <div className="h-20 text-center">
      {state === "recording" && (
        <div className="animate-in fade-in">
          <div className="text-5xl font-semibold tabular-nums text-center tracking-tight flex items-end gap-1">
            <div>{formatTime(elapsedSeconds)} </div>
            <div className="text-lg text-muted-foreground font-normal">
              / {formatTime(maxDurationSeconds)}
            </div>
          </div>
          <p className="text-muted-foreground text-center mt-1">녹음 중...</p>
        </div>
      )}

      {state === "idle" && (
        <div>
          <h3 className="text-2xl font-bold mb-3">답변 시작</h3>
          <p className="text-muted-foreground">
            버튼을 눌러 녹음을 시작하세요.
          </p>
        </div>
      )}

      {state === "recorded" && (
        <div>
          <h3 className="text-2xl font-bold mb-3">녹음 완료</h3>
          <p className="text-muted-foreground">
            답변을 제출하고 채점 결과를 확인해보세요
          </p>
        </div>
      )}
    </div>
  );
}

export default VoiceInput;
