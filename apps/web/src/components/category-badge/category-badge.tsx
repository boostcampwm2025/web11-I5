import { cn } from "@/lib/cn";

interface CategoryBadgeProps {
  category?: string | null;
  subCategory?: string | null;
  className?: string;
}

function CategoryBadge({
  category,
  subCategory,
  className,
}: CategoryBadgeProps) {
  if (!category && !subCategory) return null;

  return (
    <div className={cn("flex items-center gap-1.5 flex-wrap", className)}>
      {category && (
        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-md">
          {category}
        </span>
      )}
      {category && subCategory && (
        <span className="text-slate-300 text-xs">/</span>
      )}
      {subCategory && (
        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-teal-50 text-teal-600 rounded-md">
          {subCategory}
        </span>
      )}
    </div>
  );
}

export { CategoryBadge };
