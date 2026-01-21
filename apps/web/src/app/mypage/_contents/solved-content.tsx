async function SolvedContent() {
  return (
    <>
      <div className="flex py-8 justify-between items-center">
        <div className="flex flex-col justify-start gap-2">
          <span className="text-lg font-bold text-slate-900">
            내가 푼 문제 리스트{" "}
          </span>
          <span className="text-sm font-medium text-slate-500">
            어떤 문제를 풀었는지 확인할 수 있습니다.
          </span>
        </div>
      </div>
    </>
  );
}

export default SolvedContent;
