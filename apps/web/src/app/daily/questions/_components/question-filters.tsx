"use client";

import { Button } from "@/components/button/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/input-group/input-group";
import { SegmentedControl } from "@/components/segmented-control/segmented-control";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { Category } from "../_types/types";

interface QuestionFiltersProps {
  categories: Category[];
  subCategories: Category[];
  selectedCategoryId: number | null;
  selectedSubCategoryId: number | null;
  searchQuery: string;
  selectedSolvedStatus: string | null;
  selectedMinImportance: number | null;
}

function QuestionFilters({
  categories,
  subCategories,
  selectedCategoryId,
  selectedSubCategoryId,
  searchQuery,
  selectedSolvedStatus,
  selectedMinImportance,
}: QuestionFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = React.useState(searchQuery);

  const updateSearchParams = React.useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      params.delete("page");

      router.push(`/daily/questions?${params.toString()}`);
    },
    [searchParams, router],
  );

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== searchQuery) {
        updateSearchParams({ search: searchInput || null });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, searchQuery, updateSearchParams]);

  const handleCategoryChange = (categoryId: number | null) => {
    updateSearchParams({
      categoryId: categoryId?.toString() ?? null,
      subCategoryId: null,
    });
  };

  const handleSubCategoryChange = (subCategoryId: number | null) => {
    updateSearchParams({
      subCategoryId: subCategoryId?.toString() ?? null,
    });
  };

  return (
    <div className="bg-white p-7 border rounded-xl">
      <div className="flex gap-4 pb-7 border-b">
        <Button
          variant={selectedCategoryId === null ? "default" : "secondary"}
          onClick={() => handleCategoryChange(null)}
        >
          All
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={
              selectedCategoryId === category.id ? "default" : "secondary"
            }
            onClick={() => handleCategoryChange(category.id)}
          >
            {category.name}
          </Button>
        ))}
      </div>
      {selectedCategoryId === null ? (
        <div className="text-muted-foreground mt-7 mb-6 text-sm">
          · 전체 카테고리의 문제를 조회합니다.
        </div>
      ) : (
        <div className="flex items-center gap-3 mt-7 mb-6 flex-wrap">
          <div className="text-muted-foreground text-sm font-medium">
            세부 주제
          </div>
          <Button
            variant={selectedSubCategoryId === null ? "default" : "secondary"}
            onClick={() => handleSubCategoryChange(null)}
          >
            전체
          </Button>
          {subCategories.map((subCategory) => (
            <Button
              key={subCategory.id}
              variant={
                subCategory.id === selectedSubCategoryId
                  ? "default"
                  : "secondary"
              }
              onClick={() => handleSubCategoryChange(subCategory.id)}
            >
              {subCategory.name}
            </Button>
          ))}
        </div>
      )}
      <div className="pb-7 border-b">
        <InputGroup>
          <InputGroupInput
            placeholder="문제 제목 검색"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
        </InputGroup>
      </div>
      <div className="mt-7 flex gap-12">
        <div className="flex gap-3 items-center">
          <div className="text-muted-foreground text-sm font-medium">
            풀이 상태
          </div>
          <SegmentedControl
            options={[
              { label: "전체", value: "" },
              { label: "푼 문제", value: "SOLVED" },
              { label: "안 푼 문제", value: "UNSOLVED" },
            ]}
            value={selectedSolvedStatus ?? ""}
            onChange={(value) =>
              updateSearchParams({
                solvedStatus: value || null,
              })
            }
          />
        </div>
        <div className="flex gap-3 items-center">
          <div className="text-muted-foreground text-sm font-medium">
            중요도
          </div>
          <SegmentedControl
            options={[
              { label: "전체", value: "" },
              { label: "4.0 이상", value: "4" },
              { label: "3.5 이상", value: "3.5" },
            ]}
            value={selectedMinImportance?.toString() ?? ""}
            onChange={(value) =>
              updateSearchParams({
                minImportance: value || null,
              })
            }
          />
        </div>
      </div>
    </div>
  );
}

export default QuestionFilters;
