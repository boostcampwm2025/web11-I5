import Header from "@/components/header/header";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/breadcrumb/breadcrumb";
import { notFound } from "next/navigation";
import { fetchOthersSubmission } from "../_lib/fetch-others-submission";
import { CategoryBadge } from "@/components/category-badge/category-badge";
import parseIntOrNull from "@/lib/parse-int-or-null";
import { SubmissionCard } from "../_components/submission-card";

interface OthersSubmissionDetailPageProps {
  params: Promise<{ questionId: string; submissionId: string }>;
}

async function OthersDetailPage({ params }: OthersSubmissionDetailPageProps) {
  const { questionId, submissionId } = await params;

  const parsedQuestionId = parseIntOrNull(questionId);
  const parsedSubmissionId = parseIntOrNull(submissionId);

  if (parsedQuestionId === null || parsedSubmissionId === null) {
    return notFound();
  }

  const othersSubmissionData = await fetchOthersSubmission({
    questionId: parsedQuestionId,
    submissionId: parsedSubmissionId,
  });

  return (
    <>
      <Header />
      <main className="w-full max-w-4xl mx-auto px-4 md:px-8 pt-6 md:pt-8 pb-8 md:pb-15 space-y-6 md:space-y-8 min-h-main">
        <Breadcrumb className="md:-ml-1.5 mb-4 md:mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/reports/${questionId}`}>
                나의 리포트
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/daily/questions/${questionId}/others`}>
                다른 사람 답변
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>답변 상세</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mb-8">
          <CategoryBadge
            category={othersSubmissionData.question.category?.parent?.name}
            subCategory={othersSubmissionData.question.category?.name}
            className="mb-2"
          />
          <h1 className="text-2xl font-bold mb-2">
            {othersSubmissionData.question.title}
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            {othersSubmissionData.question.content}
          </p>
        </div>

        <SubmissionCard
          nickname={othersSubmissionData.nickname}
          submittedAt={othersSubmissionData.submission.submittedAt}
          totalScore={othersSubmissionData.submission.totalScore}
          answerContent={othersSubmissionData.submission.answerContent}
          keywords={othersSubmissionData.keywords}
        />
      </main>
    </>
  );
}

export default OthersDetailPage;
