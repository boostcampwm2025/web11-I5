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
  const { max = 5, readOnly = false, className, onChange } = props;

  const { containerRef, displayValue, eventHandlers } = useStarRating({
    ...props,
    max,
    readOnly,
  });

  const [inputValue, setInputValue] = React.useState<string>(
    displayValue.toString(),
  );

  const [isFocused, setIsFocused] = React.useState(false);

  React.useEffect(() => {
    if (!isFocused) {
      setInputValue(displayValue.toFixed(1));
    }
  }, [displayValue, isFocused]);

  const isOverLimit = parseFloat(inputValue) > max;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;

    const newValue = e.target.value;

    if (newValue.length > 3) return;
    setInputValue(newValue);

    const parsedValue = parseFloat(newValue);
    if (!isNaN(parsedValue)) {
      const clampedValue = Math.min(Math.max(parsedValue, 0), max);
      onChange?.(clampedValue);
    }
  };

  const handleBlur = () => {
    if (readOnly) return;
    setIsFocused(false);
    setInputValue(displayValue.toFixed(1));
  };

  const currentVisualValue = parseFloat(inputValue);
  const safeValue = isNaN(currentVisualValue) ? 0 : currentVisualValue;
  const fillWidthPercent = (Math.min(safeValue, max) / max) * 100;

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

      <div className="flex items-baseline gap-1 ml-1">
        <input
          type="number"
          inputMode="decimal"
          min={0}
          max={max}
          step="0.1"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          disabled={readOnly}
          className={cn(
            "w-12 bg-transparent text-2xl font-bold text-zinc-900 tabular-nums text-right outline-none p-0 border-none focus:ring-0 focus:border-none",
            "appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none", // 스피너 제거
            readOnly && "cursor-default text-zinc-500",
            isOverLimit && "text-red-500",
          )}
        />
        <span className="text-lg font-medium text-zinc-400 select-none">
          / {max}
        </span>
      </div>

      {isOverLimit && (
        <div className="absolute top-full left-0 mt-1 w-full text-center md:text-right md:pr-12">
          <span className="text-xs font-medium text-red-500 whitespace-nowrap">
            최대 {max}점까지 가능합니다.
          </span>
        </div>
      )}
    </div>
  );
}
