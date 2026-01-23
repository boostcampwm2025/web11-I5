"use client";

import * as React from "react";
import { Textarea } from "@/components/Textarea/textarea";
import { Button } from "@/components/button/button";
import { CheckCircle2, LoaderCircle, TextAlignStart } from "lucide-react";

interface TextInputProps {
  onSubmit: (text: string) => void;
  isSubmitting: boolean;
  disabled?: boolean;
  maxLength?: number;
}

function TextInput({
  onSubmit,
  isSubmitting,
  disabled = false,
  maxLength = 5000,
}: TextInputProps) {
  const [text, setText] = React.useState("");

  const charCount = text.length;
  const canSubmit = charCount > 0 && !isSubmitting && !disabled;

  const handleSubmit = () => {
    if (canSubmit) {
      onSubmit(text.trim());
    }
  };

  return (
    <div className="bg-white border rounded-xl p-6 flex flex-col gap-4">
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
          className="min-h-40 resize-none"
          maxLength={maxLength}
          disabled={isSubmitting || disabled}
        />
        <p className="text-sm text-muted-foreground text-right">
          {charCount.toLocaleString()} / {maxLength.toLocaleString()}자
        </p>
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          size="lg"
          disabled={!canSubmit}
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
    </div>
  );
}

export default TextInput;
