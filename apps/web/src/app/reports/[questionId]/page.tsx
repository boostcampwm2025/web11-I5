import { notFound } from "next/navigation";
import Header from "@/components/header/header";
import ReportHeader from "./_components/report-header";
import CollapsibleHistory from "./_components/history/collapsible-history";
import { getReportPageData } from "./_lib/services/page-data";
import ReportRefresh from "./_components/report-refresh";
import ReportTabs from "./_components/report-tabs";

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
      <main className="w-full max-w-4xl mx-auto px-4 md:px-8 py-6 md:py-15 flex gap-4 lg:gap-8 min-h-main">
        <div className="flex flex-col flex-1 min-w-0">
          <div className="mb-8 md:mb-14">
            <ReportHeader question={question} highestScore={highestScore} />
          </div>

          <ReportTabs
            selectedAttempt={selectedAttempt}
            evaluation={evaluation}
            question={question}
            submissionGraph={submissionGraph}
            fullGraphForQuestion={fullGraphForQuestion}
          />

          <ReportRefresh
            pendingSubmissionIds={history
              .filter((h) => h.status === "PENDING")
              .map((h) => h.submissionId)}
          />
          <div data-boostad-zone className="h-20 overflow-x-hidden"></div>
        </div>

        <CollapsibleHistory
          history={history}
          selectedId={selectedAttempt.submissionId}
        />
      </main>
    </>
  );
}

export default ReportPage;
