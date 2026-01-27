"use client";

import * as React from "react";
import { RotateCcw } from "lucide-react";
import QuestionModal from "@/app/daily/questions/_components/question-modal";
import { Question } from "@/app/daily/questions/_types/types";
import { Button } from "@/components/button/button";

interface RetryButtonProps {
  question: Question;
  className?: string;
  children?: React.ReactNode;
}

function RetryButton({ question, children }: RetryButtonProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  return (
    <>
      <Button className="font-semibold" onClick={() => setIsModalOpen(true)}>
        {children ?? (
          <>
            <RotateCcw className="w-4 h-4" />
            <span>다시 도전하기</span>
          </>
        )}
      </Button>

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
