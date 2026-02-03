"use client";

import * as React from "react";
import Waveform from "@/components/waveform/waveform";
import { Button } from "@/components/button/button";
import { CheckCircle2, LoaderCircle, RotateCcw } from "lucide-react";
import useRecorder from "../_hooks/use-recorder";
import RecordButton from "./record-button";
import useAudio from "@/hooks/use-audio";
import {
  confirmUpload,
  requestPresignedUrl,
  uploadToStorage,
} from "../_lib/audio-upload-api";
import { AUDIO_CONFIG } from "../_constants/audio-config-constant";
import { StatusError } from "./status-error";
import { StatusMessage, RecordingState } from "./status-message";
import { CountdownOverlay } from "./countdown-overlay";
import { PlaybackControls } from "./playback-controls";

interface VoiceInputProps {
  maxDurationSeconds?: number;
  onSubmitSuccess: (assetId: number, durationMs: number) => Promise<void>;
  onError: (message: string) => void;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
  disabled?: boolean;
}

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

    if (disabled || isSubmitting) {
      setCountdown(null);
      return;
    }

    if (countdown === 0) {
      setCountdown(null);
      // 녹음이 실제로 시작된 후 딩 사운드 재생
      startRecording(() => {
        if (dingReady) {
          playDing();
        }
      });
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, dingReady, playDing, startRecording, disabled, isSubmitting]);

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
              <PlaybackControls
                isPlaying={isPlaying}
                playbackTime={playbackTime}
                duration={duration}
                elapsedSeconds={elapsedSeconds}
                isSubmitting={isSubmitting}
                onPlay={playRecording}
                onPause={pausePlayback}
                onSeek={seekTo}
              />
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

export default VoiceInput;
