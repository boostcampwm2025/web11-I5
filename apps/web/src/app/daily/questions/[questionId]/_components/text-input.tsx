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

/**
 * Renders a controlled text input UI for composing and submitting an answer.
 *
 * Displays a textarea with a character counter and a submit button; the button is enabled only when the trimmed input has content and neither `isSubmitting` nor `disabled` are true. Calling the submit button invokes `onSubmit` with the trimmed text.
 *
 * @param onSubmit - Callback invoked with the trimmed text when the user submits a non-empty answer
 * @param isSubmitting - When true, disables input and shows a loading indicator on the submit button
 * @param disabled - When true, disables input and prevents submission
 * @param maxLength - Maximum allowed characters for the textarea (used for the input limit and counter)
 * @returns A JSX element containing the textarea, character count, and submit button
 */
function TextInput({
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
    <div className="p-4 md:p-6 flex flex-col gap-3 md:gap-4">
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
          aria-label="답변 작성"
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