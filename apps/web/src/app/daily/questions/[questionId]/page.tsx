import { notFound } from "next/navigation";
import QuestionCard from "./_components/question-card";
import { getQuestion } from "./_lib/question-api";
import InputSection from "./_components/input-section";

interface DailyQuestionPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  params: Promise<{
    questionId: string;
  }>;
}

async function DailyQuestionPage({
  params,
  searchParams,
}: DailyQuestionPageProps) {
  const { questionId } = await params;
  const { mode: modeParam } = await searchParams;
  const question = await getQuestion(questionId);

  const mode =
    modeParam === "voice" || modeParam === "text" ? modeParam : "voice";

  if (!question) {
    notFound();
  }

  return (
    <main className="w-full max-w-4xl mx-auto px-8 py-15 space-y-8 min-h-screen">
      <QuestionCard
        title={question.title}
        content={question.content}
        categoryName={question.category?.name}
        parentCategoryName={question.category?.parent?.name}
      />
      <InputSection initialInputMode={mode} questionId={question.id} />
      <div data-boostad-zone className="h-20"></div>
    </main>
  );
}

export default DailyQuestionPage;
