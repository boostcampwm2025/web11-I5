"use client";

import * as React from "react";
import { Button } from "@/components/button/button";
import { Question } from "../_types/types";
import Link from "next/link";
import MicrophoneTester from "./mic-tester";
import { cn } from "@/lib/cn";
import { Mic, Keyboard, Star } from "lucide-react";

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
        className="bg-white rounded-2xl w-full min-w-62.5 max-w-lg shadow-xl relative flex flex-col max-h-[90vh] overflow-y-auto"
      >
        <div className="p-8">
          {/* 배지 영역 */}
          <div className="flex gap-2 mb-4">
            <span className="px-2.5 py-1 rounded-md bg-gray-100 text-gray-500 text-sm font-medium">
              {question.category?.name}
            </span>
            {/* 중요도 숫자 표기 */}
            <span className="px-3 py-1.5 rounded-lg bg-yellow-50 text-yellow-600 text-xs font-bold flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
              {(question.avgImportance ?? 0).toFixed(1)}
            </span>
          </div>

          {/* 제목 및 내용 */}
          <h2 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
            {question.title}
          </h2>
          <p className="text-gray-600 text-base leading-relaxed mb-8 whitespace-pre-wrap">
            {question.content}
          </p>

          {/* 답변 모드 선택 UI */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => setAnswerMode("voice")}
              className={cn(
                "flex items-center justify-center gap-2 py-4 rounded-xl border transition-all duration-200",
                answerMode === "voice"
                  ? "bg-white border-teal-400 ring-1 ring-teal-400 text-teal-600 shadow-sm"
                  : "bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100",
              )}
            >
              <Mic
                className={cn(
                  "w-4 h-4",
                  answerMode === "voice" ? "fill-teal-100" : "",
                )}
              />
              <span className="font-bold text-sm">음성 답변</span>
            </button>

            <button
              onClick={() => setAnswerMode("text")}
              className={cn(
                "flex items-center justify-center gap-2 py-4 rounded-xl border transition-all duration-200",
                answerMode === "text"
                  ? "bg-white border-teal-400 ring-1 ring-teal-400 text-teal-600 shadow-sm"
                  : "bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100",
              )}
            >
              <Keyboard className="w-4 h-4" />
              <span className="font-bold text-sm">텍스트 답변</span>
            </button>
          </div>

          {answerMode === "voice" && (
            <div className="mb-6 animate-in fade-in zoom-in-95 duration-300 ">
              <MicrophoneTester />
            </div>
          )}

          {answerMode === "text" && (
            <div className=" h-65 mb-6 w-full bg-slate-50 border border-slate-100 rounded-2xl p-8 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-300">
              <Keyboard className="w-10 h-10 text-slate-300 mb-4" />
              <p className="text-slate-500 text-sm font-medium">
                마이크가 아닌{" "}
                <span className="text-teal-400 text-base">키보드</span>를
                입력하여 <br />
                문제에 대한 답변을 진행합니다.
              </p>
            </div>
          )}

          {/* 하단 버튼 */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={onClose}
              className="flex-1 font-semibold border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              닫기
            </Button>
            <Button
              asChild
              variant="default"
              size="lg"
              className="flex-1 font-semibold"
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
