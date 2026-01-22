"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Waveform from "@/components/waveform/waveform";
import { Button } from "@/components/button/button";
import { CheckCircle2, LoaderCircle, RotateCcw } from "lucide-react";
import useRecorder from "../_hooks/use-recorder";
import { submitAnswerAction } from "../_lib/submit-answer-action";
import ImportanceRating from "./importance-rating";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/tabs/tabs";
import RecordButton from "./record-button";
import useWav from "@/hooks/use-wav";
import {
  confirmUpload,
  requestPresignedUrl,
  uploadToStorage,
} from "../_lib/audio-upload-api";
import { AUDIO_CONFIG } from "../_constants/audio-config-constant";

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
  const {
    historyRef,
    isRecording,
    hasRecorded,
    elapsedSeconds,
    startRecording,
    stopRecording,
    retryRecording,
    getAudioBlob,
  } = useRecorder({
    maxDurationSeconds,
  });

  const { play: playDing, ready: dingWavReady } = useWav("/ui-confirm.wav", 1);

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submissionId, setSubmissionId] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const router = useRouter();

  const startRecordingWithSound = () => {
    if (dingWavReady) {
      setTimeout(() => playDing(), 100);
    }
    setError(null);
    startRecording();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const audioBlob = getAudioBlob();
      if (!audioBlob) {
        throw Error("failed to create an audio blob");
      }

      // 1. Pre-signed URL 발급 받기
      const presignedData = await requestPresignedUrl({
        codec: AUDIO_CONFIG.codec,
        sampleRate: AUDIO_CONFIG.sampleRate,
        channels: AUDIO_CONFIG.channels,
      });

      // 2. Object Storage에 직접 업로드
      await uploadToStorage(presignedData.uploadUrl, audioBlob);

      // 3. 업로드 완료 확인
      const durationMs = elapsedSeconds * 1000;

      const result = await confirmUpload({
        assetId: presignedData.assetId,
        byteSize: audioBlob.size,
        durationMs,
      });

      const submissionResult = await submitAnswerAction(
        result.assetId,
        questionId,
      );

      if (submissionResult.submissionId) {
        setSubmissionId(submissionResult.submissionId);
      }
    } catch {
      setError("답변 제출에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <div className="h-20 text-center">
            {(() => {
              if (isRecording) {
                return (
                  <div className="animate-in fade-in">
                    <p className="text-5xl font-semibold tabular-nums text-center tracking-tight">
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
              if (!isRecording && !hasRecorded) {
                return (
                  <div>
                    <h3 className="text-2xl font-bold mb-3">답변 시작</h3>
                    <p className="text-muted-foreground">
                      버튼을 눌러 녹음을 시작하세요.
                    </p>
                  </div>
                );
              }
              if (!isRecording && hasRecorded) {
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
              if (!hasRecorded) {
                return (
                  <RecordButton
                    isRecording={isRecording}
                    onClick={
                      isRecording ? stopRecording : startRecordingWithSound
                    }
                  />
                );
              }

              if (!isRecording && hasRecorded) {
                return (
                  <form>
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
                        type="button"
                        size="lg"
                        disabled={isSubmitting || !!submissionId}
                        className="pl-6 pr-6  font-semibold"
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
                    {error && (
                      <p className="text-red-500 text-center text-sm mt-2">
                        {error}
                      </p>
                    )}
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

      <ImportanceRating
        open={!!submissionId}
        questionId={questionId}
        onSuccess={() => {
          if (submissionId) {
            router.push(`/reports/${questionId}?attempt=${submissionId}`);
          }
        }}
      />
    </Tabs>
  );
}

export default RecordingSection;
