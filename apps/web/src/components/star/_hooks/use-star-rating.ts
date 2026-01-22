import * as React from "react";

interface UseStarRatingProps {
  value: number;
  max: number;
  readOnly: boolean;
  onChange?: (value: number) => void;
}

export function useStarRating({
  value,
  max,
  readOnly,
  onChange,
}: UseStarRatingProps) {
  const [hoverValue, setHoverValue] = React.useState<number | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const displayValue = hoverValue !== null ? hoverValue : value;

  const calculateRating = React.useCallback(
    (clientX: number) => {
      if (!containerRef.current) return 0;
      const { left, width } = containerRef.current.getBoundingClientRect();
      const x = clientX - left;
      const percent = Math.max(0, Math.min(1, x / width));
      return Math.round(percent * max * 10) / 10;
    },
    [max],
  );

  const getEventHandlers = React.useMemo(() => {
    if (readOnly) return {};

    return {
      onPointerMove: (e: React.PointerEvent) => {
        const rating = calculateRating(e.clientX);
        setHoverValue(rating);
        if (isDragging) onChange?.(rating);
      },
      onPointerDown: (e: React.PointerEvent) => {
        setIsDragging(true);
        const rating = calculateRating(e.clientX);
        setHoverValue(rating);
        onChange?.(rating);
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      },
      onPointerUp: (e: React.PointerEvent) => {
        setIsDragging(false);
        if (hoverValue !== null) onChange?.(hoverValue);
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      },
      onPointerLeave: () => {
        setIsDragging(false);
        setHoverValue(null);
      },
    };
  }, [readOnly, calculateRating, isDragging, onChange, hoverValue]);

  return {
    containerRef,
    displayValue,
    eventHandlers: getEventHandlers,
  };
}
