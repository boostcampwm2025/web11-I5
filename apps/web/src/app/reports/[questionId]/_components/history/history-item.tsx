import Link from "next/link";
import { AlertCircle, ChevronRight } from "lucide-react";
import { Spinner } from "@/components/spinner/spinner";
import { ReportHistoryItem } from "../../_types/report-detail";

interface HistoryItemProps {
  item: ReportHistoryItem;
  isSelected: boolean;
  href: string;
  index: number;
}

function HistoryItem({ item, isSelected, href, index }: HistoryItemProps) {
  const renderStatusIcon = () => {
    switch (item.status) {
      case "COMPLETED":
        return (
          <span className="font-bold text-slate-500">{item.totalScore}</span>
        );
      case "PENDING":
        return <Spinner className="w-4 h-4 text-slate-400" />;
      case "FAILED":
        return <AlertCircle className="w-4 h-4 text-red-300" />;
      default:
        return null;
    }
  };

  return (
    <Link
      href={href}
      scroll={false}
      className={`group block w-full text-left pl-3.5 py-3 pr-2 rounded-lg transition-all duration-200 ${
        isSelected
          ? "bg-teal-50 border-2 border-teal-400"
          : "bg-white border border-slate-200 hover:bg-teal-50/30 hover:border-teal-300"
      }`}
    >
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1 items-start">
          <span
            className={`text-xs font-bold tracking-wide transition-colors ${
              isSelected
                ? "text-teal-600"
                : "text-slate-400 group-hover:text-teal-500"
            }`}
          >
            TRIAL #{index}
          </span>
          <div className="text-xs font-medium text-slate-400">
            {item.date.split(" ")[0]}
          </div>
        </div>
        <div className="flex gap-1 items-center">
          <div className="flex items-center justify-center">
            {renderStatusIcon()}
          </div>
          <ChevronRight
            className={`w-5 h-5 transition-colors ${
              isSelected ? "text-teal-400" : "text-slate-400"
            }`}
          />
        </div>
      </div>
    </Link>
  );
}

export default HistoryItem;
