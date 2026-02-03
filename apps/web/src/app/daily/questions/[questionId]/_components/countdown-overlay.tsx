interface CountdownOverlayProps {
  countdown: number | null;
}

function CountdownOverlay({ countdown }: CountdownOverlayProps) {
  if (countdown === null) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        key={countdown}
        className="relative text-8xl md:text-9xl font-bold text-teal-300 tabular-nums animate-countdown-spring"
      >
        {countdown}
      </div>
    </div>
  );
}

export { CountdownOverlay };
