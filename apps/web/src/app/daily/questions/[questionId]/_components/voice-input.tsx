"use client";

import * as React from "react";
import Waveform from "@/components/waveform/waveform";
import { Button } from "@/components/button/button";
import { CheckCircle2, LoaderCircle, RotateCcw } from "lucide-react";
import useRecorder from "../_hooks/use-recorder";
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
  onSubmitSuccess: (assetId: number, durationMs: number) => void;
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
    historyRef,
    isRecording,
    hasRecorded,
    elapsedSeconds,
    startRecording,
    stopRecording,
    retryRecording,
    getAudioBlob,
  } = useRecorder({ maxDurationSeconds });

  const { play: playDing, ready: dingWavReady } = useWav("/ui-confirm.wav", 1);

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

      onSubmitSuccess(result.assetId, durationMs);
    } catch {
      onError("답변 제출에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border rounded-xl h-100 flex flex-col items-center justify-center">
      <StatusMessage
        state={recordingState}
        elapsedSeconds={elapsedSeconds}
        maxDurationSeconds={maxDurationSeconds}
      />

      <div className="max-w-lg">
        <Waveform historyRef={historyRef} />
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
          <p className="text-5xl font-semibold tabular-nums text-center tracking-tight">
            {formatTime(elapsedSeconds)}{" "}
            <span className="text-lg text-muted-foreground font-normal">
              / {formatTime(maxDurationSeconds)}
            </span>
          </p>
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
