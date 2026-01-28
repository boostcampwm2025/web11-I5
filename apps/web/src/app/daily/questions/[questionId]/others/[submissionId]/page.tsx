import { User } from "lucide-react";
import { notFound } from "next/navigation";
import { fetchOthersSubmission } from "../_lib/fetch-others-submission";
import formatSubmittedAt from "../_lib/format-submitted-at";

const parseIntOrNull = (value: string | undefined): number | null => {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

interface OthersSubmissionDetailPageProps {
  params: Promise<{ questionId: string; submissionId: string }>;
}

async function OthersDetailPage({ params }: OthersSubmissionDetailPageProps) {
  const { questionId, submissionId } = await params;

  const parsedQuestionId = parseIntOrNull(questionId);
  const parsedSubmissionId = parseIntOrNull(submissionId);

  if (!parsedQuestionId || !parsedSubmissionId) {
    return notFound();
  }

  const othersSubmissionData = await fetchOthersSubmission({
    questionId: parsedQuestionId,
    submissionId: parsedSubmissionId,
  });

  return (
    <main className="w-full max-w-4xl mx-auto px-8 py-15 space-y-8 min-h-main">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-base text-muted-foreground mb-2">
          <span className="font-medium">
            {othersSubmissionData.question.category?.parent?.name}
          </span>
          <span>/</span>
          <span className="text-base font-medium">
            {othersSubmissionData.question.category?.name}
          </span>
        </div>
        <h1 className="text-2xl font-bold mb-2">
          {othersSubmissionData.question.title}
        </h1>
        <p className="text-muted-foreground">
          {othersSubmissionData.question.content}
        </p>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-9 bg-white">
          <div className="flex mb-10 justify-between items-center">
            <div className="flex gap-3">
              <div className="rounded-full bg-slate-50 border-neutral-200 w-14 h-14 flex items-center justify-center border inset-shadow-2xs">
                <User className="w-8 h-8" stroke="#CBD5E1" />
              </div>
              <div className="flex flex-col">
                <div className="text-lg font-semibold">
                  {othersSubmissionData.nickname}
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                  제출 일시:{" "}
                  {formatSubmittedAt(
                    othersSubmissionData.submission.submittedAt,
                  )}
                </div>
              </div>
            </div>
            <div className="px-4 py-2 rounded-md bg-teal-50 border border-teal-100 text-teal-500 font-semibold gap-1 text-2xl">
              <span className="font-extrabold">
                {othersSubmissionData.submission.totalScore}
              </span>
              점
            </div>
          </div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-[1.125rem] font-bold text-slate-900">
                답변 원문
              </h3>
            </div>
          </div>
          {othersSubmissionData.submission.answerContent ? (
            <p className="text-base leading-relaxed text-slate-700 whitespace-pre-wrap border-y border-slate-200 py-6">
              {othersSubmissionData.submission.answerContent}
            </p>
          ) : (
            <p className="py-4 text-sm text-center text-slate-400">
              저장된 답변이 없습니다.
            </p>
          )}

          {othersSubmissionData.keywords.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold text-sm text-slate-400 uppercase tracking-wider mb-3">
                CORE KEYWORDS
              </h4>
              <div className="flex flex-wrap items-center gap-2">
                {othersSubmissionData.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-2 py-1.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-md"
                  >
                    <span className="text-slate-400 font-semibold">#</span>{" "}
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default OthersDetailPage;
