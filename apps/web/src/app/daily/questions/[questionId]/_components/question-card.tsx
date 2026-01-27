"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface QuestionCardProps {
  title: string;
  content: string;
  categoryName?: string;
  parentCategoryName?: string;
}

export default function QuestionCard({
  title,
  content,
  categoryName,
  parentCategoryName,
}: QuestionCardProps) {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <section className="bg-white border px-6 py-12 rounded-xl flex flex-col items-center justify-center relative">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label={isVisible ? "문제 숨기기" : "문제 보기"}
      >
        {isVisible ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      {(parentCategoryName || categoryName) && (
        <p className="text-gray-500 text-sm mb-3">
          {[parentCategoryName, categoryName].filter(Boolean).join(" | ")}
        </p>
      )}

      {isVisible ? (
        <>
          <h2 className="text-2xl font-bold leading-tight mb-4">{title}</h2>
          <p className="text-zinc-600 leading-relaxed">{content}</p>
        </>
      ) : (
        <p className="text-gray-400 text-base">문제가 숨겨져 있습니다</p>
      )}
    </section>
  );
}
