"use client";

import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { reEvaluate } from "../_lib/fetch/fetch-evaluate";

interface ReEvaluateButtonProps {
  submissionId: number;
  className?: string;
}

function ReEvaluateButton({ submissionId, className }: ReEvaluateButtonProps) {
  const router = useRouter();

  const handleReEvaluate = async () => {
    const success = await reEvaluate(submissionId);
    if (success) {
      router.refresh();
    }
  };

  return (
    <button className={className} onClick={handleReEvaluate}>
      <RefreshCw className="w-4 h-4" />
      <span>채점 다시하기</span>
    </button>
  );
}

export default ReEvaluateButton;
