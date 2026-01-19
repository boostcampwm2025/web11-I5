import { RotateCcw } from "lucide-react";

interface ReportHeaderProps {
  title: string;
  description: string;
  category: string;
  subcategory: string;
  highestScore?: number;
}

function ReportHeader({
  title,
  description,
  category,
  subcategory,
  highestScore,
}: ReportHeaderProps) {
  return (
    <section className="bg-white border border-gray-200 rounded-xl p-9">
      <p className="text-gray-500 text-xs mb-3">
        {category} {subcategory && `| ${subcategory}`}
      </p>
      <h2 className="text-xl font-bold mb-3">{title}</h2>
      <p className="text-gray-600 leading-relaxed mb-6">{description}</p>
      <hr className="border-gray-200 mb-6" />
      <div className="flex items-center gap-3">
        <div className="bg-teal-50 border border-teal-100 text-teal-600 px-4 py-2.5 rounded-xl text-sm font-bold">
          나의 최고 점수 : {highestScore ?? 0}점
        </div>
        <button className="flex items-center gap-2.5 bg-teal-400 hover:bg-teal-500 text-white font-bold px-4 py-2.5 rounded-xl transition-colors text-sm">
          <RotateCcw className="w-4 h-4" />
          <span>다시 도전하기</span>
        </button>
      </div>
    </section>
  );
}

export default ReportHeader;
