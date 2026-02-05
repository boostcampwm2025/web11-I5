interface KeywordsSectionProps {
  keywords: string[];
}

function KeywordsSection({ keywords }: KeywordsSectionProps) {
  if (keywords.length === 0) {
    return null;
  }

  return (
    <div data-testid="keywords-section" className="mt-6">
      <h4 className="font-semibold text-sm text-slate-400 uppercase tracking-wider mb-3">
        CORE KEYWORDS
      </h4>
      <div className="flex flex-wrap items-center gap-2">
        {keywords.map((keyword, index) => (
          <span
            key={index}
            data-testid="keyword-badge"
            className="px-2 py-1.5 bg-slate-100 text-slate-700 text-xs md:text-sm font-medium rounded-md"
          >
            <span className="text-slate-400 font-semibold">#</span> {keyword}
          </span>
        ))}
      </div>
    </div>
  );
}

export { KeywordsSection };
