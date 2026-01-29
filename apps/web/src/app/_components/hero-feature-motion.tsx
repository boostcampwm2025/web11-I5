"use client";

import { cn } from "@/lib/cn";
import { motion } from "motion/react";

export function HeroFeatureMotion({ className }: { className?: string }) {
  const cards = [
    { title: "AI 피드백", desc: "정확도·논리·깊이 정량 평가" },
    { title: "지식 시각화", desc: "개념 간 관계를 구조적으로 이해" },
    { title: "설명 기반 학습", desc: "말로 설명하며 개념을 정리" },
    { title: "지속 학습 설계", desc: "스트릭과 점수로 학습을 루틴화" },
  ];

  return (
    <div className={cn("w-full", className)}>
      {/* 문장 */}
      <motion.div
        className={cn("text-xl font-medium text-teal-400 text-center")}
        initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.55, ease: [0.2, 0.9, 0.2, 1] }}
      >
        말로 설명하고, AI로 구조화하며, 습관처럼 학습하자!
      </motion.div>

      {/* 카드들(데스크탑에서만) */}
      <motion.div
        className={cn("mt-10 hidden md:flex flex-col gap-5")}
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: {
            transition: {
              delayChildren: 0.15,
              staggerChildren: 0.12,
            },
          },
        }}
      >
        <div className="flex gap-5">
          {cards.slice(0, 2).map((c) => (
            <FeatureCard key={c.title} title={c.title} desc={c.desc} />
          ))}
        </div>

        <div className="flex gap-5">
          {cards.slice(2, 4).map((c) => (
            <FeatureCard key={c.title} title={c.title} desc={c.desc} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function FeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <motion.div
      className={cn(
        "flex flex-col items-center justify-center gap-2",
        "bg-teal-500/10 text-teal-600 w-80 h-30 rounded-lg",
        "will-change-transform",
      )}
      variants={{
        hidden: { opacity: 0, y: 14, scale: 0.98, filter: "blur(8px)" },
        show: {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          transition: { duration: 0.5, ease: [0.2, 0.9, 0.2, 1] },
        },
      }}
      whileHover={{
        y: -4,
        scale: 1.01,
        transition: { duration: 0.18, ease: "easeOut" },
      }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="text-xl font-bold text-center">{title}</div>
      <div className="text-center">{desc}</div>
    </motion.div>
  );
}
