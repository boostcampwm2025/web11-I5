interface AnswerContentProps {
  content: string | null;
}

function AnswerContent({ content }: AnswerContentProps) {
  if (!content) {
    return (
      <p
        data-testid="no-answer-message"
        className="py-4 text-sm text-center text-slate-400"
      >
        저장된 답변이 없습니다.
      </p>
    );
  }

  return (
    <p
      data-testid="answer-content"
      className="text-sm md:text-base leading-relaxed text-slate-700 whitespace-pre-wrap border-y border-slate-200 py-6"
    >
      {content}
    </p>
  );
}

export { AnswerContent };
