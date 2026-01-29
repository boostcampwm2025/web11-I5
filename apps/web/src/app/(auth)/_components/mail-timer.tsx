"use client";

import * as React from "react";

interface MailTimerProps {
  onExpire?: () => void;
}

function MailTimer({ onExpire }: MailTimerProps) {
  const [seconds, setSeconds] = React.useState(300); // 5분 단위 -> 300초
  const rafIdRef = React.useRef<number | null>(null);
  const prevTimeRef = React.useRef<number | null>(null);

  const loop = (time: number) => {
    if (prevTimeRef.current === null) {
      prevTimeRef.current = time;
    }

    const delta = time - prevTimeRef.current;

    if (delta >= 1000) {
      setSeconds((prev) => {
        const newSeconds = prev - Math.floor(delta / 1000);
        return newSeconds > 0 ? newSeconds : 0;
      });
      prevTimeRef.current += Math.floor(delta / 1000) * 1000;
    }

    rafIdRef.current = requestAnimationFrame(loop);
  };

  React.useEffect(() => {
    rafIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (seconds === 0) {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      onExpire?.();
    }
  }, [seconds, onExpire]);

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const formattedTime = `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;

  return (
    <div className="text-sm font-medium text-slate-600">{formattedTime}</div>
  );
}

export default MailTimer;
