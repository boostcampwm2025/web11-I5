"use client";

import * as React from "react";
import { Button } from "@/components/button/button";
import { StarRating } from "@/components/star/star-rating";
import {
  updateImportanceAction,
  type ActionState,
} from "../_lib/submit-importance-action";
import toast from "react-hot-toast";

interface ImportanceRatingProps {
  open?: boolean;
  questionId: number;
  onSuccess?: () => void;
}

function ImportanceRating({
  open,
  questionId,
  onSuccess,
}: ImportanceRatingProps) {
  const [score, setScore] = React.useState(0);

  const [state, formAction, isPending] = React.useActionState<
    ActionState | null,
    FormData
  >(updateImportanceAction, null);

  const onSuccessRef = React.useRef(onSuccess);
  React.useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  const lastProcessedStateRef = React.useRef<ActionState | null>(null);

  React.useEffect(() => {
    if (!state || state === lastProcessedStateRef.current) return;

    lastProcessedStateRef.current = state;

    if (state.success) {
      toast.success(state.message, {
        duration: 800,
        className:
          "bg-[#2dd4bf]/90 backdrop-blur-md text-white font-semibold py-4 px-6 rounded-[16px] text-base border border-white/20 shadow-xl min-w-[280px]",
        iconTheme: {
          primary: "#fff",
          secondary: "#2dd4bf",
        },
      });

      const timer = setTimeout(() => {
        onSuccessRef.current?.();
        setScore(0);
      }, 800);

      return () => clearTimeout(timer);
    } else {
      toast.error(state.message);
    }
  }, [state]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      <form
        action={formAction}
        className="w-75 max-w-sm bg-white p-6 rounded-2xl border border-zinc-100 shadow-2xl flex flex-col gap-6 animate-in zoom-in-95 duration-200"
      >
        <input type="hidden" name="questionId" value={questionId} />
        <input type="hidden" name="score" value={score} />

        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold text-zinc-900">
            이 문제가 얼마나 중요했나요?
          </h2>
          <p className="text-base text-zinc-500">
            문제의 중요도를 별점으로 평가해주세요
          </p>
        </div>

        <div className="flex justify-center py-2">
          <StarRating value={score} onChange={setScore} />
        </div>

        <Button
          type="submit"
          disabled={isPending || score === 0 || state?.success}
          size="lg"
          className={
            "w-full text-base font-semibold transition-all duration-200"
          }
        >
          {isPending ? "분석 중..." : "평가 제출하기"}
        </Button>
      </form>
    </div>
  );
}

export default ImportanceRating;
