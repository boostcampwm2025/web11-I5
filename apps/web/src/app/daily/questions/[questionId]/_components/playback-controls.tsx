"use client";

import * as React from "react";
import { Button } from "@/components/button/button";
import { Slider } from "@/components/slider/slider";
import { Play, Pause } from "lucide-react";
import { formatTime } from "../_lib/format-time";

interface PlaybackControlsProps {
  isPlaying: boolean;
  playbackTime: number;
  duration: number;
  elapsedSeconds: number;
  isSubmitting: boolean;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (value: number) => void;
}

function PlaybackControls({
  isPlaying,
  playbackTime,
  duration,
  elapsedSeconds,
  isSubmitting,
  onPlay,
  onPause,
  onSeek,
}: PlaybackControlsProps) {
  const wasPlayingBeforeSeekRef = React.useRef(false);

  const handleSeekStart = () => {
    wasPlayingBeforeSeekRef.current = isPlaying;
    if (isPlaying) {
      onPause();
    }
  };

  const handleSeekEnd = (value: number[]) => {
    onSeek(value[0]);
    const shouldResume = wasPlayingBeforeSeekRef.current;
    wasPlayingBeforeSeekRef.current = false;
    if (shouldResume) {
      onPlay();
    }
  };

  const handleSeekCancel = () => {
    const shouldResume = wasPlayingBeforeSeekRef.current;
    wasPlayingBeforeSeekRef.current = false;
    if (shouldResume) {
      onPlay();
    }
  };

  const totalDuration = duration || elapsedSeconds;

  return (
    <div className="flex items-center gap-2 md:gap-3 h-20 md:h-30">
      <Button
        type="button"
        size="icon-lg"
        onClick={isPlaying ? onPause : onPlay}
        disabled={isSubmitting}
        aria-label={isPlaying ? "일시정지" : "재생"}
        className="rounded-full shrink-0"
        aria-pressed={isPlaying}
      >
        {isPlaying ? (
          <Pause className="w-5 h-5 fill-current" />
        ) : (
          <Play className="w-5 h-5 ml-0.5 fill-current" />
        )}
      </Button>
      <div className="flex-1 flex items-center gap-2 md:gap-3 min-w-0">
        <Slider
          value={[playbackTime]}
          min={0}
          max={totalDuration}
          step={0.1}
          onPointerDown={handleSeekStart}
          onPointerUp={handleSeekCancel}
          onPointerLeave={handleSeekCancel}
          onValueChange={([value]) => onSeek(value)}
          onValueCommit={handleSeekEnd}
          disabled={isSubmitting}
          className="flex-1"
          aria-label="녹음 재생 위치"
          aria-valuetext={`${formatTime(Math.floor(playbackTime))} / ${formatTime(Math.floor(totalDuration))}`}
        />
        <span className="text-xs md:text-sm tabular-nums text-muted-foreground shrink-0">
          {formatTime(Math.floor(playbackTime))} /{" "}
          {formatTime(Math.floor(totalDuration))}
        </span>
      </div>
    </div>
  );
}

export { PlaybackControls };
