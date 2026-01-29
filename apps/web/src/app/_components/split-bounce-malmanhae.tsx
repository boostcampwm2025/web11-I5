"use client";

import { cn } from "@/lib/cn";
import { motion } from "motion/react";

const letters = [
  { char: "말", extra: "" },
  { char: "만", extra: "translate-y-6" },
  { char: "해", extra: "" },
];

const STAGGER = 0.12;
const LETTER_DURATION = 0.6;
const START_DELAY = 0.05;

const LOGO_DELAY =
  START_DELAY + (letters.length - 1) * STAGGER + LETTER_DURATION + 0.08;

export function SplitBounceMalManHae({ className }: { className?: string }) {
  return (
    <div
      className={cn("text-9xl flex mb-15 text-teal-400 relative", className)}
      aria-label="말만해"
    >
      {letters.map(({ char, extra }, i) => (
        <div key={`${char}-${i}`} className={cn("relative", extra)}>
          <motion.div
            className="select-none will-change-transform"
            initial={{
              opacity: 0,
              y: 28,
              scale: 0.92,
              rotate: -3,
              filter: "blur(6px)",
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: [0.92, 1.1, 0.98, 1],
              rotate: [-3, 2, -1, 0],
              filter: "blur(0px)",
            }}
            transition={{
              delay: START_DELAY + i * STAGGER,
              duration: LETTER_DURATION,
              ease: [0.2, 0.9, 0.2, 1],
            }}
          >
            {char}
          </motion.div>

          {char === "만" && (
            <motion.div
              className={cn(
                "pointer-events-none absolute left-1/2 -translate-x-1/2",
                "-top-24",
              )}
              initial={{
                opacity: 0,
                y: 22,
                scale: 0.7,
                rotate: -10,
                filter: "blur(8px)",
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: [0.7, 1.15, 0.98, 1],
                rotate: [-10, 6, -2, 0],
                filter: "blur(0px)",
              }}
              transition={{
                delay: LOGO_DELAY, // 말만해 끝난 다음
                duration: 0.55,
                ease: [0.2, 0.9, 0.2, 1],
              }}
            >
              <svg
                width="79"
                height="81"
                viewBox="0 0 79 81"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-teal-400 drop-shadow-sm"
                aria-hidden="true"
                focusable={false}
              >
                <path
                  d="M78.4034 28.7648C75.7372 19.6597 69.922 11.7983 61.9959 6.58405C54.0697 1.36978 44.5485 -0.858017 35.1317 0.298313C25.7149 1.45464 17.0155 5.91984 10.5864 12.8969C4.15728 19.8739 0.416847 28.9086 0.0327867 38.3883C-0.351273 47.868 2.64604 57.1757 8.48969 64.65C14.3333 72.1242 22.643 77.2785 31.9354 79.1928C41.2277 81.1071 50.898 79.6569 59.22 75.1009C67.542 70.5449 73.974 63.1797 77.368 54.3201L40.0078 40.0079L78.4034 28.7648Z"
                  fill="currentColor"
                />
              </svg>
            </motion.div>
          )}
        </div>
      ))}
    </div>
  );
}
