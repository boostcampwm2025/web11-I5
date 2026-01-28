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
      "ml-5 inline-flex h-12.5 items-center justify-center rounded-lg gap-2 text-zinc-500",
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
      "inline-flex items-center justify-center whitespace-nowrap rounded-t-xl px-5 py-3 text-base font-semibold ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-slate-100 text-slate-400  data-[state=active]:border-t-slate-200 data-[state=active]:border-x-slate-200 data-[state=active]:border-b-white data-[state=active]:shadow-[0px_1px_0px_0px_#FFFFFFFF] border-slate-100  data-[state=active]:bg-white border data-[state=active]:text-teal-500 data-[state=inactive]:hover:bg-slate-100/70",
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
      "group ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 bg-white rounded-xl border border-slate-200",
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
