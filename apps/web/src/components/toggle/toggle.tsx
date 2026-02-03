"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const toggleContainerVariants = cva(
  "relative grid grid-cols-2 items-center bg-gray-100 rounded-lg border border-gray-200 select-none overflow-hidden",
  {
    variants: {
      size: {
        default: "h-10 p-1",
        sm: "h-8 p-1",
        lg: "h-12 p-1.5",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

interface ToggleOption {
  label: string;
  value: string;
}

interface ToggleProps
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, "onChange">,
    VariantProps<typeof toggleContainerVariants> {
  options: [ToggleOption, ToggleOption];
  value: string;
  onChange: (value: string) => void;
}

function Toggle({
  className,
  size,
  options,
  value,
  onChange,
  ...props
}: ToggleProps) {
  const isFirstSelected = value === options[0].value;

  return (
    <div
      className={cn(toggleContainerVariants({ size, className }))}
      {...props}
    >
      <div
        className={cn(
          "absolute top-1 bottom-1 rounded-md bg-black shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.2,1,0.4,1)] z-10",
          "left-1 w-[calc(50%-4px)]",
          isFirstSelected ? "translate-x-0" : "translate-x-full",
        )}
      />

      {options.map((option) => {
        const isSelected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={isSelected}
            aria-label={option.label}
            className={cn(
              "flex-1 z-20 h-full text-center rounded-md text-sm font-bold transition-colors duration-200 bg-transparent",
              isSelected
                ? "text-white bg-black"
                : "text-gray-400 hover:text-gray-600",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export { Toggle };
