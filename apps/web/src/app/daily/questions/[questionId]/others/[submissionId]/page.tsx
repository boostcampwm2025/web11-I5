import { User } from "lucide-react";

const selectedAttempt = {
  answerContent:
    "브라우저 주소창에 www.google.com을 입력하고 엔터를 누르면 먼저 브라우저는 URL을 해석해 프로토콜과 호스트를 분리하고, 로컬 캐시·OS 캐시·라우터 캐시·DNS 서버 순으로 도메인에 대한 IP 주소를 질의해 DNS 해석을 수행한 뒤 해당 IP로 TCP 3-way 핸드셰이크를 맺고 HTTPS인 경우 TLS 핸드셰이크로 암호화 채널을 수립하며, 이후 HTTP 요청을 전송하면 서버는 HTML 문서를 응답으로 반환하고 브라우저는 이를 수신하는 즉시 HTML을 위에서 아래로 파싱하면서 DOM 트리를 구성하고 동시에 CSS를 다운로드·파싱해 CSSOM을 만들며, DOM과 CSSOM이 결합되어 렌더 트리가 생성된 다음 레이아웃 단계에서 각 노드의 위치와 크기를 계산하고 페인팅 단계에서 픽셀로 그린 뒤, 자바스크립트가 있다면 파싱·실행되면서 DOM이나 스타일을 변경할 수 있어 필요 시 리플로우와 리페인트가 발생하고, 이 모든 과정이 메인 스레드와 보조 스레드에서 병렬적으로 처리되며 최종적으로 사용자가 화면을 보게 됩니다.",
};

const question = {
  category: {
    name: "Browser Rendering",
    parent: {
      name: "Web",
    },
  },
  title: "웹 페이지 로딩의 여정",
  description:
    "브라우저 주소창에 www.google.com을 입력하고 엔터를 쳤을 때, 화면이 렌더링되기까지의 과정을 네트워크와 브라우저 렌더링 관점에서 설명해주세요.",
};

const keywords = ["hello", "world"];

function OthersDetailPage() {
  return (
    <main className="w-full max-w-4xl mx-auto px-8 py-15 space-y-8 min-h-main">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-base text-muted-foreground mb-2">
          <span className="font-medium">{question.category.parent.name}</span>
          <span>/</span>
          <span className="text-base font-medium">
            {question.category.name}
          </span>
        </div>
        <h1 className="text-2xl font-bold mb-2">{question.title}</h1>
        <p className="text-muted-foreground">{question.description}</p>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-9 bg-white">
          <div className="flex mb-10 justify-between items-center">
            <div className="flex gap-3">
              <div className="rounded-full bg-slate-50 border-neutral-200 w-14 h-14 flex items-center justify-center border inset-shadow-2xs">
                <User className="w-8 h-8" stroke="#CBD5E1" />
              </div>
              <div className="flex flex-col">
                <div className="text-lg font-semibold">user_1002</div>
                <div className="text-sm font-medium text-muted-foreground">
                  제출 일시: 2025년 10월 20일
                </div>
              </div>
            </div>
            <div className="px-4 py-2 rounded-md bg-teal-50 border border-teal-100 text-teal-500 font-semibold gap-1 text-2xl">
              <span className="font-extrabold">60</span>점
            </div>
          </div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-[1.125rem] font-bold text-slate-900">
                답변 원문
              </h3>
            </div>
          </div>
          {selectedAttempt.answerContent ? (
            <p className="text-base leading-relaxed text-slate-700 whitespace-pre-wrap border-y border-slate-200 py-6">
              {selectedAttempt.answerContent}
            </p>
          ) : (
            <p className="py-4 text-sm text-center text-slate-400">
              저장된 답변이 없습니다.
            </p>
          )}

          {keywords.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold text-sm text-slate-400 uppercase tracking-wider mb-3">
                CORE KEYWORDS
              </h4>
              <div className="flex flex-wrap items-center gap-2">
                {keywords.map((keyword, index) => (
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
