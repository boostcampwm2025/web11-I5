"use client";

import * as React from "react";
import { RotateCcw } from "lucide-react";
import QuestionModal from "@/app/daily/questions/_components/question-modal";
import { Question } from "@/app/daily/questions/_types/types";

interface RetryButtonProps {
  question: Question;
  className?: string;
  children?: React.ReactNode;
}

function RetryButton({ question, className, children }: RetryButtonProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  return (
    <>
      <button
        className={className}
        type="button"
        onClick={() => setIsModalOpen(true)}
      >
        {children ?? (
          <>
            <RotateCcw className="w-4 h-4" />
            <span>다시 도전하기</span>
          </>
        )}
      </button>

      {isModalOpen && (
        <QuestionModal
          question={question}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}

export default RetryButton;
