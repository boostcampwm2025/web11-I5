"use client";
import * as React from "react";

function useWav(src: string, volume = 1) {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    setReady(false);

    const a = new Audio(src);
    a.preload = "auto";
    a.volume = volume;

    const onReady = () => setReady(true);
    a.addEventListener("canplaythrough", onReady);

    audioRef.current = a;
    return () => {
      a.removeEventListener("canplaythrough", onReady);
      a.pause();
      audioRef.current = null;
    };
  }, [src, volume]);

  const play = async () => {
    const a = audioRef.current;
    if (!a || !ready) return;
    a.currentTime = 0;
    try {
      await a.play();
    } catch {}
  };

  return { play, ready };
}

export default useWav;
