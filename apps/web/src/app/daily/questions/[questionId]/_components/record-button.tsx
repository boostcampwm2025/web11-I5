"use client";

import { motion } from "motion/react";
import { Mic, Square } from "lucide-react";

interface RecordButtonProps {
  isRecording: boolean;
  onClick: () => void;
  disabled?: boolean;
}

/**
 * Render a responsive record button that reflects and controls the recording state.
 *
 * The button visually switches between recording and idle appearances, exposes accessible
 * labels and pressed state for screen readers, and invokes `onClick` when activated unless
 * `disabled` is true.
 *
 * @param isRecording - Whether recording is active; controls visuals and accessibility state.
 * @param onClick - Callback invoked when the button is activated (no-op if `disabled`).
 * @param disabled - When true, prevents interaction and disables hover/tap animations.
 * @returns A JSX element representing the record control button.
 */
function RecordButton({
  isRecording,
  onClick,
  disabled = false,
}: RecordButtonProps) {
  const handleClick = () => {
    if (disabled) return;
    onClick();
  };

  return (
    <motion.button
      aria-label={isRecording ? "녹음 중지" : "녹음 시작"}
      aria-pressed={isRecording}
      onClick={handleClick}
      whileHover={disabled ? {} : { scale: 1.1 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      disabled={disabled}
      className={`relative w-24 h-24 flex items-center justify-center bg-transparent p-0 border-0 ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {/* PULSE AURA */}
      {isRecording && (
        <span className="pointer-events-none absolute inline-flex h-4/5 w-4/5 animate-ping rounded-full bg-teal-400 opacity-50"></span>
      )}

      {/* SVG 컨테이너 */}
      <motion.svg
        className="absolute inset-0"
        viewBox="0 0 100 100"
        width="100%"
        height="100%"
        aria-hidden="true"
      >
        <motion.rect
          x="2"
          y="2"
          width="96"
          height="96"
          fill="#14b8a6"
          stroke="#ccfbf1"
          strokeWidth="4"
          initial={{ rx: 48, ry: 48 }}
          animate={{
            rx: isRecording ? 14 : 48,
            ry: isRecording ? 14 : 48,
          }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 22,
          }}
        />
      </motion.svg>

      {/* ICON */}
      <span className="relative z-10">
        {isRecording ? (
          <Square className="size-7 text-white" />
        ) : (
          <Mic className="size-7 text-white" />
        )}
      </span>
    </motion.button>
  );
}

export default RecordButton;