import { cn } from "@/lib/cn";

interface CategoryBadgeProps {
  category?: string | null;
  subCategory?: string | null;
  className?: string;
  orientation?: "horizontal" | "vertical";
}

function CategoryBadge({
  category,
  subCategory,
  className,
  orientation = "horizontal",
}: CategoryBadgeProps) {
  if (!category && !subCategory) return null;

  const isVertical = orientation === "vertical";

  return (
    <div
      className={cn(
        "flex gap-1",
        isVertical ? "flex-col items-start gap-0.5" : "items-center flex-wrap",
        className,
      )}
    >
      {category && (
        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-md">
          {category}
        </span>
      )}
      {!isVertical && category && subCategory && (
        <span className="text-slate-300 text-xs">/</span>
      )}
      {subCategory && (
        <span
          className={cn(
            "inline-flex items-center px-2 py-0.5 text-xs font-medium bg-teal-50 text-teal-600 rounded-md",
            isVertical && "max-w-28 truncate",
          )}
        >
          {subCategory}
        </span>
      )}
    </div>
  );
}

export { CategoryBadge };
