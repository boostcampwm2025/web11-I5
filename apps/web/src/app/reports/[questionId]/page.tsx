import { notFound } from "next/navigation";
import Header from "@/components/header/header";
import ReportHeader from "./_components/report-header";
import HistoryAccordion from "./_components/history/history-accordion";
import { getReportPageData } from "./_lib/services/page-data";
import ReportRefresh from "./_components/report-refresh";
import ReportTabs from "./_components/report-tabs";
import { ReportStatusProvider } from "./_context/report-status-context";

interface ReportPageProps {
  params: Promise<{ questionId: string }>;
  searchParams: Promise<{ attempt?: string }>;
}

async function ReportPage({ params, searchParams }: ReportPageProps) {
  const { questionId } = await params;
  const { attempt: submissionIdParam } = await searchParams;

  const parsedSubmissionId = submissionIdParam
    ? Number(submissionIdParam)
    : undefined;
  const validSubmissionId = Number.isFinite(parsedSubmissionId)
    ? parsedSubmissionId
    : undefined;

  const {
    question,
    history,
    evaluation,
    highestScore,
    submissionGraph,
    fullGraphForQuestion,
  } = await getReportPageData(Number(questionId), validSubmissionId);

  // submissionId가 없거나 유효하지 않으면 최신 submission으로 fallback
  const selectedAttempt = validSubmissionId
    ? history.find((h) => h.submissionId === validSubmissionId)
    : history[history.length - 1];

  if (!question || !history.length || !selectedAttempt || !evaluation) {
    notFound();
  }

  return (
    <>
      <Header />
      <main className="w-full max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-15 min-h-main">
        {/* 문제 헤더 */}
        <div className="mb-8 md:mb-10">
          <ReportHeader question={question} highestScore={highestScore} />
        </div>

        <ReportStatusProvider
          initialHistory={history}
          initialEvaluation={evaluation}
          selectedSubmissionId={selectedAttempt.submissionId}
          question={question}
        >
          {/* 메인 레이아웃: 콘텐츠 + 히스토리 사이드바 */}
          <div className="flex flex-col xl:flex-row-reverse xl:gap-8">
            {/* 히스토리 사이드바: xl 이상에서 오른쪽 고정 */}
            <aside className="mb-6 xl:mb-0 xl:w-72 xl:shrink-0 xl:sticky xl:top-24 xl:self-start">
              <HistoryAccordion />
            </aside>

            {/* 메인 콘텐츠 */}
            <div
              key={selectedAttempt.submissionId}
              className="flex-1 min-w-0 animate-in fade-in duration-200"
            >
              <ReportTabs
                submissionGraph={submissionGraph}
                fullGraphForQuestion={fullGraphForQuestion}
              />
            </div>
          </div>

          <ReportRefresh />
        </ReportStatusProvider>
        <div data-boostad-zone className="h-20 overflow-x-hidden"></div>
      </main>
    </>
  );
}

export default ReportPage;
