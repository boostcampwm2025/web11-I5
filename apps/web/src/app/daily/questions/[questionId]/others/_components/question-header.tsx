import { CategoryBadge } from "@/components/category-badge/category-badge";

interface QuestionHeaderProps {
  category?: string | null;
  subCategory?: string | null;
  title: string;
  totalCount: number;
}

function QuestionHeader({
  category,
  subCategory,
  title,
  totalCount,
}: QuestionHeaderProps) {
  return (
    <div className="mb-8">
      <CategoryBadge
        category={category}
        subCategory={subCategory}
        className="mb-2"
      />
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <p className="text-muted-foreground">
        총 <span className="font-semibold text-teal-600">{totalCount}</span>
        명이 이 문제를 풀었습니다.
      </p>
    </div>
  );
}

export { QuestionHeader };
