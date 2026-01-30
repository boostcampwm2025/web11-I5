"use client";
import * as React from "react";

interface UseAudioOptions {
  volume?: number;
  loop?: boolean;
}

function useAudio(src: string, options: UseAudioOptions | number = 1) {
  const { volume = 1, loop = false } =
    typeof options === "number" ? { volume: options } : options;

  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    setReady(false);

    const a = new Audio(src);
    a.preload = "auto";
    a.volume = volume;
    a.loop = loop;

    const onReady = () => setReady(true);
    a.addEventListener("canplaythrough", onReady);

    audioRef.current = a;
    return () => {
      a.removeEventListener("canplaythrough", onReady);
      a.pause();
      audioRef.current = null;
    };
  }, [src, volume, loop]);

  const play = React.useCallback(async () => {
    const a = audioRef.current;
    if (!a || !ready) return;
    a.currentTime = 0;
    try {
      await a.play();
    } catch {}
  }, [ready]);

  const stop = React.useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    a.pause();
    a.currentTime = 0;
  }, []);

  return { play, stop, ready };
}

export default useAudio;
