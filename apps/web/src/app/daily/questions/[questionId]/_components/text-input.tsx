"use client";

import * as React from "react";
import { Textarea } from "@/components/Textarea/textarea";
import { Button } from "@/components/button/button";
import { CheckCircle2, LoaderCircle, TextAlignStart } from "lucide-react";

interface TextInputProps {
  questionTitle: string;
  questionContent: string;
  onSubmit: (text: string) => void;
  isSubmitting: boolean;
  disabled?: boolean;
  maxLength?: number;
}

function TextInput({
  questionTitle,
  questionContent,
  onSubmit,
  isSubmitting,
  disabled = false,
  maxLength = 5000,
}: TextInputProps) {
  const [text, setText] = React.useState("");

  const trimmed = text.trim();
  const charCount = text.length;
  const canSubmit = trimmed.length > 0 && !isSubmitting && !disabled;

  const handleSubmit = () => {
    if (canSubmit) {
      onSubmit(trimmed);
    }
  };

  return (
    <div className="px-4 md:px-6 py-8 md:py-10 flex flex-col gap-3 md:gap-4">
      <div className="text-center">
        <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-3">
          {questionTitle}
        </h3>
        <p className="text-muted-foreground text-sm md:text-base">
          {questionContent}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <TextAlignStart className="w-4 h-4 text-teal-400" />
        <span className="text-sm text-muted-foreground font-medium">
          답변 작성
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="면접 질문에 답하듯이 지식을 논리적으로 작성해 보세요."
          className="min-h-32 md:min-h-40 resize-none text-base"
          maxLength={maxLength}
          disabled={isSubmitting || disabled}
        />
        <p className="text-xs md:text-sm text-muted-foreground text-right">
          {charCount.toLocaleString()} / {maxLength.toLocaleString()}자
        </p>
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          size="default"
          disabled={!canSubmit}
          className="px-6 font-semibold w-full sm:w-auto"
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
    </div>
  );
}

export default TextInput;
