"use client";

import * as React from "react";
import { Button } from "@/components/button/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/input-group/input-group";
import { SegmentedControl } from "@/components/segmented-control/segmented-control";
import { Search } from "lucide-react";

export function QuestionFilters() {
  const [solveStatus, setSolveStatus] = React.useState("all");
  const [importance, setImportance] = React.useState("all");

  return (
    <div className="bg-white p-7 border rounded-xl">
      <div className="flex gap-4 pb-7 border-b">
        <Button>All</Button>
        <Button variant="ghost">Database</Button>
        <Button variant="ghost">Database</Button>
        <Button variant="ghost">Database</Button>
        <Button variant="ghost">Database</Button>
        <Button variant="ghost">Database</Button>
      </div>
      <div className="text-muted-foreground mt-7 mb-6 text-sm">
        · 전체 카테고리의 문제를 조회합니다.
      </div>
      <div className="pb-7 border-b">
        <InputGroup>
          <InputGroupInput placeholder="문제 제목 검색" />
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
              { label: "전체", value: "all" },
              { label: "푼 문제", value: "solved" },
              { label: "안 푼 문제", value: "unsolved" },
            ]}
            value={solveStatus}
            onChange={setSolveStatus}
          />
        </div>
        <div className="flex gap-3 items-center">
          <div className="text-muted-foreground text-sm font-medium">
            중요도
          </div>
          <SegmentedControl
            options={[
              { label: "전체", value: "all" },
              { label: "4.0 이상", value: "4.0" },
              { label: "3.5 이상", value: "3.5" },
            ]}
            value={importance}
            onChange={setImportance}
          />
        </div>
      </div>
    </div>
  );
}
