function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      <h1 className="text-2xl font-bold mb-6">서비스 이용약관</h1>

      <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            제 1 조 (목적)
          </h2>
          <p>
            본 약관은 회사가 제공하는 CS 지식 학습 및 음성 기반 말하기 연습
            서비스(이하 &quot;말만해&quot;)의 이용과 관련하여 회사와 회원의
            권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            제 2 조 (서비스의 제공)
          </h2>
          <p>
            회사는 다음과 같은 서비스를 제공합니다.
            <br />
            1. CS(Computer Science) 지식 학습 콘텐츠 제공
            <br />
            2. 사용자 음성 녹음 및 텍스트 변환(STT) 기능을 활용한 말하기 연습
            기능
            <br />
            3. 학습 기록 저장 및 피드백 서비스
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            제 3 조 (음성 데이터의 활용)
          </h2>
          <p>
            1. 서비스 내에서 사용자가 학습을 위해 녹음한 음성 데이터는 사용자의
            학습 피드백 및 서비스 품질 향상을 위해 서버에 저장될 수 있습니다.
            <br />
            2. 회원은 언제든지 본인의 학습 기록 및 음성 데이터 삭제를 요청할 수
            있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            제 4 조 (저작권 및 이용 제한)
          </h2>
          <p>
            서비스에서 제공하는 모든 학습 자료의 저작권은 &quot;말만해&quot;에
            있으며, 사용자는 이를 무단으로 복제, 배포하거나 상업적으로 이용할 수
            없습니다.
          </p>
        </section>
      </div>
    </div>
  );
}

export default TermsPage;
