"use client";

import * as React from "react";

import { Button } from "@/components/button/button";
import QuestionModal from "./question-modal";
import { Question } from "../_types/types";

interface QuestionLinkButtonProps {
  question: Question;
}
function QuestionLinkButton({ question }: QuestionLinkButtonProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  return (
    <>
      <Button
        variant="link"
        className="text-slate-900 hover:text-teal-600 hover:underline hover:cursor-pointer px-0"
        onClick={() => setIsModalOpen(true)}
      >
        {question.title}
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

export { QuestionLinkButton };
