import { ReportHistoryItem } from "../../_types/report-detail";
import HistoryItem from "./history-item";

interface HistoryListProps {
  history: ReportHistoryItem[];
  selectedId: number;
}

function HistoryList({ history, selectedId }: HistoryListProps) {
  return (
    <div className="w-60 flex flex-col bg-white rounded-2xl border border-slate-200">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center shrink-0">
        <span className="font-bold text-sm text-slate-900">시도 히스토리</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {history.map((item) => (
          <HistoryItem
            key={item.submissionId}
            index={item.displayIndex}
            item={item}
            isSelected={selectedId === item.submissionId}
            href={`?attempt=${item.submissionId}`}
          />
        ))}
      </div>
    </div>
  );
}

export default HistoryList;
