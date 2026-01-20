"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Waveform from "@/components/waveform/waveform";
import { Button } from "@/components/button/button";
import { CheckCircle2, Mic, RotateCcw, Square } from "lucide-react";
import useAudioStreamSession from "../_hooks/use-audio-stream-session";
import {
  submitAnswerAction,
  type SubmitAnswerState,
} from "../_lib/submit-answer-action";
import RecordingTimer from "./recording-timer";
import ImportanceRating from "./importance-rating";

interface RecordingSectionProps {
  questionId: number;
}

function RecordingSection({ questionId }: RecordingSectionProps) {
  const {
    historyRef,
    isLoading,
    isRecording,
    sessionId,
    assetId,
    startRecording,
    stopRecording,
    retryRecording,
  } = useAudioStreamSession();

  const router = useRouter();

  const [state, formAction, isPending] = React.useActionState<
    SubmitAnswerState | null,
    FormData
  >(submitAnswerAction, null);

  const handleSubmitClick = async (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();

    if (!assetId) {
      console.error("오디오 데이터가 존재하지 않습니다.");
      return;
    }

    const formData = new FormData();
    formData.append("audioAssetId", assetId.toString());
    formData.append("questionId", questionId.toString());

    formAction(formData);
  };

  const handleMaxTimeReached = React.useCallback(() => {
    stopRecording();
  }, [stopRecording]);

  return (
    <section className="flex flex-col">
      <div className="relative p-10 rounded-xl border border-zinc-200 shadow-sm flex flex-col items-center justify-center mb-6">
        <RecordingTimer
          maxRecordingTime={300}
          isRecording={isRecording}
          sessionId={sessionId}
          onMaxTimeReached={handleMaxTimeReached}
        />
        <Waveform historyRef={historyRef} />
      </div>
      <div className="flex items-center justify-center gap-4">
        {(() => {
          if (isLoading) {
            // TODO: Add a loading indicator
            return null;
          }

          if (isRecording) {
            return (
              <Button onClick={stopRecording} variant="destructive" size="lg">
                <Square className="w-4 h-4 fill-current" /> 중지
              </Button>
            );
          }

          if (!isRecording && !sessionId) {
            return (
              <Button onClick={startRecording} size="lg">
                <Mic className="w-4 h-4" /> 녹음 시작
              </Button>
            );
          }

          if (!isRecording && sessionId) {
            return (
              <form action={formAction}>
                <input
                  type="hidden"
                  name="audioAssetId"
                  value={assetId || ""}
                />
                <input type="hidden" name="questionId" value={questionId} />
                <div className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={retryRecording}
                  >
                    <RotateCcw className="w-4 h-4" /> 다시 시도
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSubmitClick}
                    disabled={isPending}
                    className="pl-6 pr-6"
                  >
                    {isPending ? "제출 중..." : "답변 제출"}{" "}
                    <CheckCircle2 className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            );
          }

          return null;
        })()}
      </div>
      <ImportanceRating
        open={Boolean(state?.success)}
        questionId={questionId}
        onSuccess={() => {
          if (state?.submissionId) {
            router.push(`/reports/${questionId}?attempt=${state.submissionId}`);
          }
        }}
      />
    </section>
  );
}

export default RecordingSection;
