"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const segmentedControlVariants = cva(
  "relative inline-flex items-center bg-muted rounded-lg p-1 select-none",
  {
    variants: {
      size: {
        default: "h-12",
        sm: "h-10",
        lg: "h-14",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

const segmentedControlItemVariants = cva(
  "relative z-10 flex items-center justify-center text-base font-medium transition-colors duration-200 rounded-md cursor-pointer",
  {
    variants: {
      size: {
        default: "px-4 h-8",
        sm: "px-3 h-6 text-xs",
        lg: "px-5 h-10",
      },
      selected: {
        true: "text-foreground",
        false: "text-muted-foreground hover:text-foreground",
      },
    },
    defaultVariants: {
      size: "default",
      selected: false,
    },
  },
);

interface SegmentedControlOption {
  label: string;
  value: string;
  disabled?: boolean;
}

interface SegmentedControlProps
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue">,
    VariantProps<typeof segmentedControlVariants> {
  options: SegmentedControlOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}

function SegmentedControl({
  className,
  size,
  options,
  value: controlledValue,
  defaultValue,
  onChange,
  ...props
}: SegmentedControlProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [uncontrolledValue, setUncontrolledValue] = React.useState(
    defaultValue ?? options[0]?.value ?? "",
  );
  const [indicatorStyle, setIndicatorStyle] = React.useState<{
    width: number;
    left: number;
  } | null>(null);

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;

  const selectedIndex = options.findIndex((opt) => opt.value === value);

  React.useLayoutEffect(() => {
    if (containerRef.current && selectedIndex >= 0) {
      const container = containerRef.current;
      const buttons = container.querySelectorAll("[data-segment-item]");
      const selectedButton = buttons[selectedIndex] as HTMLElement;

      if (selectedButton) {
        setIndicatorStyle({
          width: selectedButton.offsetWidth,
          left: selectedButton.offsetLeft,
        });
      }
    } else {
      setIndicatorStyle(null);
    }
  }, [selectedIndex, options]);

  return (
    <div
      ref={containerRef}
      className={cn(segmentedControlVariants({ size, className }))}
      role="tablist"
      {...props}
    >
      {indicatorStyle && (
        <div
          className="absolute top-1 bottom-1 bg-background rounded-md shadow-sm transition-all duration-200 ease-out"
          style={{
            width: indicatorStyle.width,
            left: indicatorStyle.left,
          }}
        />
      )}

      {options.map((option) => {
        const isSelected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            data-segment-item
            aria-selected={isSelected}
            disabled={option.disabled}
            onClick={() => {
              if (option.disabled) return;
              if (!isControlled) {
                setUncontrolledValue(option.value);
              }
              onChange?.(option.value);
            }}
            className={cn(
              segmentedControlItemVariants({
                size,
                selected: isSelected,
              }),
              option.disabled && "opacity-50 cursor-not-allowed",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export { SegmentedControl, type SegmentedControlOption };
