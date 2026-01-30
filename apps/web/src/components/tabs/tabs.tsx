"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/cn";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "pl-2 sm:pl-3 md:pl-5 inline-flex h-11 sm:h-11 md:h-12 items-center justify-center rounded-lg gap-1 md:gap-1 text-zinc-500",
      className,
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "relative overflow-visible inline-flex items-center justify-center whitespace-nowrap rounded-t-lg sm:rounded-t-lg md:rounded-t-xl px-3.5 sm:px-4 md:px-5 pt-0.5 md:pt-1 text-sm sm:text-sm md:text-base font-semibold ring-offset-white h-full",
      "transition-[transform,background-color,color,border-color] duration-200 ease-out",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",

      "bg-slate-100 text-slate-400 border border-slate-100",
      "data-[state=active]:bg-white data-[state=active]:text-teal-500",
      "data-[state=active]:border-t-slate-200 data-[state=active]:border-x-slate-200 data-[state=active]:border-b-transparent",

      "data-[state=inactive]:hover:bg-slate-100/70",
      "data-[state=inactive]:scale-95",

      // 🔽 핵심
      "after:absolute after:-left-px after:-right-px after:-bottom-0.5 after:h-px",
      "after:bg-white after:opacity-0 after:pointer-events-none",
      "data-[state=active]:after:opacity-100",

      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "group ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 bg-white rounded-lg md:rounded-xl border border-slate-200",
      className,
    )}
    {...props}
  >
    <div
      className={cn(
        // active가 되는 순간 애니메이션
        "duration-400",
        "group-data-[state=active]:animate-in",
        "group-data-[state=active]:fade-in",
        "group-data-[state=active]:slide-in-from-bottom-1",
      )}
    >
      {children}
    </div>
  </TabsPrimitive.Content>
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
