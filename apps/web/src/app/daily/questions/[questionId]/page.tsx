import { notFound } from "next/navigation";
import QuestionCard from "./_components/question-card";
import RecordingSection from "./_components/recording-section";
import { getQuestion } from "./_lib/question-api";

interface DailyQuestionPageProps {
  params: Promise<{
    questionId: string;
  }>;
}

async function DailyQuestionPage({ params }: DailyQuestionPageProps) {
  const { questionId } = await params;
  const question = await getQuestion(questionId);

  if (!question) {
    notFound();
  }

  return (
    <main className="max-w-4xl mx-auto px-8 py-15 space-y-8 min-h-screen">
      <QuestionCard
        title={question.title}
        content={question.content}
        categoryName={question.category?.name}
        parentCategoryName={question.category?.parent?.name}
      />
      <RecordingSection questionId={question.id} />
    </main>
  );
}

export default DailyQuestionPage;
