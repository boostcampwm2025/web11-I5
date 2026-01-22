"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/cn";
import { useStarRating } from "./_hooks/use-star-rating";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  className?: string;
  max?: number;
}

export function StarRating(props: StarRatingProps) {
  const { max = 5, readOnly = false, className } = props;

  const { containerRef, displayValue, eventHandlers } = useStarRating({
    ...props,
    max,
    readOnly,
  });

  const fillWidthPercent = (displayValue / max) * 100;

  return (
    <div className={cn("inline-flex items-center gap-3", className)}>
      <div
        ref={containerRef}
        style={{ width: "160px", height: "32px" }}
        className={cn(
          "relative cursor-pointer touch-none select-none",
          readOnly && "cursor-default",
        )}
        {...eventHandlers}
      >
        {/* Layer 1: 배경 (회색 별) */}
        <div className="absolute inset-0 flex justify-between z-0">
          {Array.from({ length: max }).map((_, i) => (
            <Star
              key={`bg-${i}`}
              className="w-8 h-8"
              strokeWidth={0}
              style={{ fill: "#E4E4E7" }}
            />
          ))}
        </div>

        {/* Layer 2: 전경 (노란 별) */}
        <div
          className="absolute inset-y-0 left-0 overflow-hidden z-10 transition-[width] duration-75 ease-linear"
          style={{ width: `${fillWidthPercent}%` }}
        >
          <div
            style={{ width: "160px" }}
            className="h-full flex justify-between"
          >
            {Array.from({ length: max }).map((_, i) => (
              <Star
                key={`fg-${i}`}
                className="w-8 h-8 text-orange-400 fill-orange-400"
                strokeWidth={0}
                style={{ fill: "#FACC15" }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 점수 텍스트 표시 */}
      <div className="flex items-baseline gap-1 ml-1 select-none">
        <span className="text-2xl font-bold text-zinc-900 tabular-nums">
          {displayValue.toFixed(1)}
        </span>
        <span className="text-lg font-medium text-zinc-400">/ {max}</span>
      </div>
    </div>
  );
}
