"use client";

import * as React from "react";
import Waveform from "@/components/waveform/waveform";
import { Button } from "@/components/button/button";
import { CheckCircle2, Mic, RotateCcw, Square } from "lucide-react";
import useAudioStreamSession from "../_hooks/use-audio-stream-session";
import {
  submitAnswerAction,
  type SubmitAnswerState,
} from "../_lib/submit-answer-action";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/tabs/tabs";

interface RecordingSectionProps {
  questionId: number;
  maxDurationSeconds?: number;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function RecordingSection({
  questionId,
  maxDurationSeconds = 300,
}: RecordingSectionProps) {
  const stopRecordingRef = React.useRef<() => void>(() => {});

  const {
    historyRef,
    isLoading,
    isRecording,
    sessionId,
    assetId,
    elapsedSeconds,
    startRecording,
    stopRecording,
    retryRecording,
  } = useAudioStreamSession({
    maxDurationSeconds,
    onMaxDurationReached: () => stopRecordingRef.current(),
  });

  React.useEffect(() => {
    stopRecordingRef.current = stopRecording;
  }, [stopRecording]);

  const [_, formAction, isPending] = React.useActionState<
    SubmitAnswerState | null,
    FormData
  >(submitAnswerAction, null);

  return (
    <Tabs defaultValue="voice" className="w-full">
      <TabsList className="w-full justify-start">
        <TabsTrigger value="voice">음성 답변하기</TabsTrigger>
        <TabsTrigger value="text" disabled>
          텍스트 답변하기
        </TabsTrigger>
      </TabsList>
      <TabsContent value="voice">
        <div className="bg-white border rounded-xl h-100 flex flex-col items-center justify-center">
          <div className="h-18 text-center">
            {(() => {
              if (isLoading) {
                return null;
              }
              if (isRecording) {
                return (
                  <div className="animate-in fade-in">
                    <p className="text-3xl font-bold tabular-nums text-center">
                      {formatTime(elapsedSeconds)}{" "}
                      <span className="text-lg text-muted-foreground font-normal">
                        / {formatTime(maxDurationSeconds)}
                      </span>
                    </p>
                    <p className="text-muted-foreground text-center mt-1">
                      녹음 중...
                    </p>
                  </div>
                );
              }
              if (!isRecording && !sessionId) {
                return (
                  <div>
                    <h3 className="text-2xl font-bold mb-3">답변 시작</h3>
                    <p className="text-muted-foreground">
                      버튼을 눌러 녹음을 시작하세요.
                    </p>
                  </div>
                );
              }
              if (!isRecording && sessionId) {
                return (
                  <div>
                    <h3 className="text-2xl font-bold mb-3">녹음 완료</h3>
                    <p className="text-muted-foreground">
                      답변을 제출하고 채점 결과를 확인해보세요
                    </p>
                  </div>
                );
              }
            })()}
          </div>
          <div className="max-w-lg">
            <Waveform historyRef={historyRef} />
          </div>
          <div className="flex items-center justify-center h-24">
            {(() => {
              if (isLoading) {
                return null;
              }

              if (isRecording) {
                return (
                  <button
                    onClick={stopRecording}
                    className="w-24 h-24 flex items-center justify-center bg-teal-500 rounded-2xl hover:scale-105 transition-all border-4 border-teal-100 animate-in fade-in slide-in-from-bottom-2"
                  >
                    <Square className="size-7 text-white" />
                  </button>
                );
              }

              if (!isRecording && !sessionId) {
                return (
                  <button
                    onClick={startRecording}
                    className="w-24 h-24 flex items-center justify-center bg-teal-500 rounded-full hover:scale-110 transition-all border-4 border-teal-100"
                  >
                    <Mic className="text-white size-7" />
                  </button>
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
                        size="lg"
                        type="button"
                        variant="outline"
                        onClick={retryRecording}
                      >
                        <RotateCcw className="w-4 h-4" /> 다시 시도
                      </Button>
                      <Button
                        size="lg"
                        type="submit"
                        disabled={isPending}
                        className="pl-6 pr-6  font-semibold"
                      >
                        답변 제출 <CheckCircle2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </form>
                );
              }
            })()}
          </div>
        </div>
      </TabsContent>
      <TabsContent value="text">
        <div className="bg-white border rounded-xl p-7">hi</div>
      </TabsContent>
    </Tabs>
  );
}

export default RecordingSection;
