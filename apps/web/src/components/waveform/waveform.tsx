"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import useAnimationFrame from "@/hooks/use-animation-frame";
import { useCanvas2D } from "@/hooks/use-canvas-2d";
import drawWaveform from "./draw-wave-form";

interface WaveFormProps {
  historyRef: React.RefObject<number[]>;
  barWidthPx?: number;
  barGapPx?: number;
  barColor?: string;
  numberOfPaddingBars?: number;
  className?: string;
  onChangeSize?: (size: { width: number; height: number }) => void;
}

function Waveform({
  historyRef,
  barWidthPx = 4,
  barGapPx = 2,
  barColor = "#4ee4e4",
  numberOfPaddingBars = 8,
  className,
  onChangeSize,
}: WaveFormProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const { ctx, width } = useCanvas2D(canvasRef, { onChangeSize });

  useAnimationFrame(() => {
    if (!ctx) return;

    drawWaveform(ctx, width, 158, historyRef.current, {
      barWidthPx: barWidthPx,
      barGapPx: barGapPx,
      barColor: barColor,
      numberOfPaddingBars: numberOfPaddingBars,
    });
  });

  return (
    <canvas
      ref={canvasRef}
      className={cn("w-full h-40 relative z-10", className)}
    />
  );
}

export default Waveform;
