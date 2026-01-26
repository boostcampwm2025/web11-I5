import { notFound } from "next/navigation";
import ReportHeader from "./_components/report-header";
import HistoryList from "./_components/history/history-list";
import { getReportPageData } from "./_lib/services/page-data";
import ReportRefresh from "./_components/report-refresh";
import ReportTabs from "./_components/report-tabs";

interface ReportPageProps {
  params: Promise<{ questionId: string }>;
  searchParams: Promise<{ attempt?: string }>;
}

async function ReportPage({ params, searchParams }: ReportPageProps) {
  const { questionId } = await params;
  const { attempt: submissionId } = await searchParams;

  if (!submissionId) {
    notFound();
  }

  const { question, history, evaluation, highestScore } =
    await getReportPageData(Number(questionId), Number(submissionId));
  const selectedAttempt = history.find(
    (h) => h.submissionId === Number(submissionId),
  );

  if (!question || !history || !selectedAttempt || !evaluation) {
    notFound();
  }

  return (
    <main className="w-full max-w-4xl mx-auto px-8 py-15 flex gap-8">
      <div className="flex flex-col flex-1">
        <div className="mb-14">
          <ReportHeader question={question} highestScore={highestScore} />
        </div>

        <ReportTabs
          selectedAttempt={selectedAttempt}
          evaluation={evaluation}
          question={question}
        />

        <ReportRefresh
          pendingSubmissionIds={history
            .filter((h) => h.status === "PENDING")
            .map((h) => h.submissionId)}
        />
        <div data-boostad-zone></div>
      </div>

      <div className="sticky top-22 self-start">
        <HistoryList
          history={history}
          selectedId={selectedAttempt.submissionId}
        />
      </div>
    </main>
  );
}

export default ReportPage;
