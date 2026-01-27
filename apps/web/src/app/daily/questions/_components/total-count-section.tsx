import { fetchQuestions } from "../_lib/fetch-questions";

interface TotalCountSectionProps {
  selectedCategoryId: number | null;
  selectedSubCategoryId: number | null;
  searchQuery: string;
  selectedSolvedStatus: string | null;
  selectedMinImportance: number | null;
}

async function TotalCountSection({
  selectedCategoryId,
  selectedSubCategoryId,
  searchQuery,
  selectedSolvedStatus,
  selectedMinImportance,
}: TotalCountSectionProps) {
  const questionsData = await fetchQuestions({
    page: 1,
    parentCategoryId: selectedCategoryId ?? undefined,
    categoryId: selectedSubCategoryId ?? undefined,
    search: searchQuery || undefined,
    solvedStatus: selectedSolvedStatus ?? undefined,
    minImportance: selectedMinImportance ?? undefined,
  });

  return (
    <p className="text-muted-foreground">
      총{" "}
      <span className="font-semibold text-teal-600">
        {questionsData.totalCount}
      </span>
      개의 문제가 준비되어 있습니다.
    </p>
  );
}

function TotalCountLoadingFallback() {
  return (
    <p className="text-muted-foreground">
      총 <span className="font-semibold text-teal-600">...</span>
      개의 문제가 준비되어 있습니다.
    </p>
  );
}

export { TotalCountSection, TotalCountLoadingFallback };
