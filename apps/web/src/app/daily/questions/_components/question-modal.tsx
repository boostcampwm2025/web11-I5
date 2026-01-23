"use client";

import * as React from "react";
import { Button } from "@/components/button/button";
import { Question } from "../_types/types";
import { SegmentedControl } from "@/components/segmented-control/segmented-control";
import Link from "next/link";

interface QuestionModalProps {
  question: Question;
  onClose: () => void;
}

function QuestionModal({ question, onClose }: QuestionModalProps) {
  const [answerMode, setAnswerMode] = React.useState<string>("voice");

  if (!question) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden relative"
      >
        <div className="p-8">
          {/* 배지 영역 */}
          <div className="flex gap-2 mb-4">
            <span className="px-2.5 py-1 rounded-md bg-gray-100 text-gray-500 text-xs font-medium">
              {question.category?.name}
            </span>
            {/* 중요도 숫자 표기 */}
            <span className="px-2.5 py-1 rounded-md bg-yellow-50 text-yellow-600 text-xs font-medium flex items-center gap-1">
              <span>⭐️</span>
              {(question.avgImportance ?? 0).toFixed(1)}
            </span>
          </div>

          {/* 제목 및 내용 */}
          <h2 className="text-xl font-bold text-gray-900 mb-4 leading-tight">
            {question.title}
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-8 whitespace-pre-wrap">
            {question.content}
          </p>

          {/* 답변 모드 선택 UI */}
          <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between mb-8">
            <span className="text-sm font-medium text-gray-700">답변 모드</span>
            <SegmentedControl
              value={answerMode}
              onChange={setAnswerMode}
              options={[
                { label: "텍스트", value: "text" },
                { label: "음성", value: "voice" },
              ]}
            />
          </div>

          {/* 하단 버튼 */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={onClose}
              className="flex-1 rounded-xl text-sm font-semibold border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              닫기
            </Button>
            <Button
              asChild
              variant="default"
              size="lg"
              className="flex-1 rounded-xl text-sm font-semibold shadow-lg shadow-gray-200"
            >
              <Link href={`/daily/questions/${question.id}?mode=${answerMode}`}>
                시작하기
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuestionModal;
