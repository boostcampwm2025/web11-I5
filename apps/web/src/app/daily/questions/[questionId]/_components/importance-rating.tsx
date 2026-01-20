"use client";

import * as React from "react";
import { Button } from "@/components/button/button";
import { StarRating } from "@/components/star/star-rating";
import { cn } from "@/lib/cn";
import {
  updateImportanceAction,
  type ActionState,
} from "../_lib/submit-importance-action";

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
    { questionId: number; score: number }
  >(updateImportanceAction, null);

  React.useEffect(() => {
    if (!state) return;

    if (state.success) {
      alert(state.message);
      if (onSuccess) onSuccess();
    } else {
      alert(state.message);
    }
  }, [state, onSuccess]);

  if (!open) return null;

  const handleSubmit = () => {
    formAction({ questionId, score });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      <div className="w-75 max-w-sm bg-white p-6 rounded-2xl border border-zinc-100 shadow-2xl flex flex-col gap-6 animate-in zoom-in-95 duration-200">
        <div className="text-center space-y-1">
          <h2 className="text-lg font-bold text-zinc-900">
            이 문제가 얼마나 중요했나요?
          </h2>
          <p className="text-sm text-zinc-500">
            문제의 중요도를 별점으로 평가해주세요
          </p>
        </div>

        <div className="flex justify-center py-2">
          <StarRating value={score} onChange={setScore} />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isPending || score === 0}
          size="lg"
          className={cn(
            "w-full rounded-xl text-base font-semibold transition-all duration-200",
            score > 0
              ? "bg-zinc-900 text-white hover:bg-zinc-800 shadow-md"
              : "bg-zinc-100 text-zinc-400 hover:bg-zinc-100 cursor-not-allowed",
          )}
        >
          {isPending ? "분석 중..." : "평가 제출하기"}
        </Button>
      </div>
    </div>
  );
}

export default ImportanceRating;
