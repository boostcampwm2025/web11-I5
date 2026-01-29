interface AiFeedbackProps {
  feedback: string;
}

function AiFeedback({ feedback }: AiFeedbackProps) {
  return (
    <div className="bg-slate-50 rounded-xl md:rounded-2xl p-4 md:p-6 mb-6 md:mb-8 border border-slate-50">
      <div className="flex text-xs font-semibold text-slate-400 mb-1.5 md:mb-2 uppercase">
        <span>AI MENTOR&apos;S FEEDBACK</span>
      </div>
      <p className="text-sm md:text-base font-medium leading-relaxed text-slate-700 m-0">
        {feedback}
      </p>
    </div>
  );
}

export default AiFeedback;
