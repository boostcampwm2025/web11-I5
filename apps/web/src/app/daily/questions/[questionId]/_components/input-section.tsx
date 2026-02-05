"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { submitAnswerAction } from "../_lib/submit-answer-action";
import ImportanceRating from "./importance-rating";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/tabs/tabs";
import VoiceInput from "./voice-input";
import TextInput from "./text-input";
import { ErrorMessage } from "./error-message";

interface InputSectionProps {
  initialInputMode: "voice" | "text";
  questionId: number;
  maxDurationSeconds?: number;
}

function InputSection({
  initialInputMode,
  questionId,
  maxDurationSeconds = 300,
}: InputSectionProps) {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submissionId, setSubmissionId] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleAssetSubmit = async (assetId: number) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await submitAnswerAction({
        questionId,
        audioAssetId: assetId,
      });

      if (!result.success || !result.submissionId) {
        setError(
          result.error || "제출 결과를 확인할 수 없습니다. 다시 시도해주세요.",
        );
        return;
      }

      setSubmissionId(result.submissionId);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : String(err) || "제출 중 오류가 발생했습니다.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTextSubmit = async (text: string) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await submitAnswerAction({
        questionId,
        rawAnswer: text,
      });

      if (!result.success || !result.submissionId) {
        setError(
          result.error || "제출 결과를 확인할 수 없습니다. 다시 시도해주세요.",
        );
        return;
      }

      setSubmissionId(result.submissionId);
    } catch {
      setError("답변 제출에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleError = (message: string) => {
    setError(message);
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <Tabs
      defaultValue={initialInputMode}
      className="w-full"
      onValueChange={clearError}
    >
      <TabsList className="w-full justify-start">
        <TabsTrigger value="voice">음성 답변하기</TabsTrigger>
        <TabsTrigger value="text">텍스트 답변하기</TabsTrigger>
      </TabsList>

      <TabsContent value="voice">
        <VoiceInput
          maxDurationSeconds={maxDurationSeconds}
          onSubmitSuccess={handleAssetSubmit}
          onError={handleError}
          isSubmitting={isSubmitting}
          setIsSubmitting={setIsSubmitting}
          disabled={!!submissionId}
        />
        <ErrorMessage message={error} />
      </TabsContent>

      <TabsContent value="text">
        <TextInput
          onSubmit={handleTextSubmit}
          isSubmitting={isSubmitting}
          disabled={!!submissionId}
        />
        <ErrorMessage message={error} />
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

export default InputSection;
