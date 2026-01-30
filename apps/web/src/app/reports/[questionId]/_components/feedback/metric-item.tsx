"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

interface MetricItemProps {
  label: string;
  score: number;
  max: number;
  reason?: string;
  value?: string;
}

function MetricItem({ label, score, max, reason, value }: MetricItemProps) {
  const percentage = Math.min((score / max) * 100, 100);

  // reason이 없으면 일반 div로 렌더링
  if (!reason) {
    return (
      <div className="border border-slate-100 rounded-lg md:rounded-xl bg-white p-3 md:p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div className="flex justify-between items-end mb-2">
          <span className="font-bold text-sm md:text-base text-slate-800">
            {label}
          </span>
          <div className="flex items-baseline gap-0.5">
            <span className="text-xl md:text-2xl font-extrabold text-slate-700">
              {score}
            </span>
            <span className="text-sm md:text-base font-medium text-muted-foreground">
              / {max}
            </span>
          </div>
        </div>

        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out bg-teal-400"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }

  // reason이 있으면 아코디언으로 렌더링
  return (
    <Accordion.Item
      value={value || label}
      className="border border-slate-100 rounded-lg md:rounded-xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
    >
      <Accordion.Header>
        <Accordion.Trigger className="group w-full p-3 md:p-4 flex justify-between items-center hover:bg-slate-50 rounded-lg md:rounded-xl transition-colors">
          <div className="flex-1">
            <div className="flex justify-between items-end mb-2">
              <span className="font-bold text-sm md:text-base text-slate-800">
                {label}
              </span>
              <div className="flex items-baseline gap-0.5">
                <span className="text-xl md:text-2xl font-extrabold text-slate-700">
                  {score}
                </span>
                <span className="text-sm md:text-base font-medium text-muted-foreground">
                  / {max}
                </span>
              </div>
            </div>

            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out bg-teal-400"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          <ChevronDown className="ml-3 md:ml-4 h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </Accordion.Trigger>
      </Accordion.Header>

      <Accordion.Content className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
        <div className="px-3 md:px-4 pb-3 md:pb-4 pt-1 md:pt-2">
          <p className="text-xs md:text-sm leading-relaxed text-muted-foreground">
            {reason}
          </p>
        </div>
      </Accordion.Content>
    </Accordion.Item>
  );
}

export default MetricItem;
