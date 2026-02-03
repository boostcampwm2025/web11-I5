function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      <h1 className="text-2xl font-bold mb-6">개인정보 처리방침</h1>

      <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
        <p>
          본 서비스는 정보통신망 이용촉진 및 정보보호 등에 관한 법률을 준수하며,
          회원의 개인정보를 소중히 다루고 있습니다.
        </p>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            1. 수집하는 개인정보 항목
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>필수항목: 이메일, 비밀번호, 닉네임(이름)</li>
            <li>
              <strong>
                선택/생성 항목: 서비스 이용 기록, 학습 진행 데이터, 사용자의
                음성 녹음 데이터
              </strong>
            </li>
            <li>
              서비스 이용 과정에서 자동으로 수집되는 항목: IP 주소,
              쿠키(Cookie), 접속 로그, 서비스 이용 기록, 기기정보(기기종류,
              OS버전 등)
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            2. 개인정보의 수집 및 이용 목적
          </h2>
          <p>
            수집한 개인정보는 다음의 목적을 위해 활용합니다.
            <br />
            - 회원 가입 및 관리
            <br />-{" "}
            <strong>CS 지식 말하기 연습 기능 제공 및 AI 내용 분석</strong>
            <br />- 서비스 개선 및 신규 서비스 개발
            <br />- 서비스 내 맞춤형 정보 제공 및 광고 게재 (문맥 기반 광고
            포함)
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            3. 개인정보의 보유 및 이용 기간
          </h2>
          <p>
            원칙적으로 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를
            지체 없이 파기합니다. 단, 관계 법령에 의해 보존할 필요가 있는 경우
            일정 기간 보관합니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            4. 개인정보 파기 절차
          </h2>
          <p>
            회원은 언제든지 회원 탈퇴를 통해 개인정보 수집 이용 동의를 철회할 수
            있으며, 이 경우 저장된 음성 데이터를 포함한 모든 정보는 파기됩니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-3">
            5. 개인정보 처리 업무의 위탁
          </h2>
          <p className="mb-4">
            회사는 원활한 서비스 제공 및 광고 송출을 위해 다음과 같이 개인정보
            처리 업무를 위탁하고 있습니다.
          </p>

          <div className="overflow-hidden rounded-lg border border-slate-200 mb-4">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">수탁업체</th>
                  <th className="p-3 border-l border-slate-200">
                    위탁 업무 내용
                  </th>
                  <th className="p-3 border-l border-slate-200">공유 정보</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                <tr>
                  <td className="p-3 font-medium align-top">[BoostAd]</td>
                  <td className="p-3 border-l border-slate-200 align-top">
                    서비스 내 광고 지면 제공 및 운영
                  </td>
                  <td className="p-3 border-l border-slate-200 text-slate-500 align-top">
                    맞춤형 광고 제공을 위해 다음 정보를 수집합니다:
                    <ul className="list-disc pl-4 mt-1 space-y-1">
                      <li>페이지 URL 및 콘텐츠 정보 (제목, 태그)</li>
                      <li>
                        페이지 내 행동 데이터 (스크롤, 체류시간, 복사, 클릭)
                      </li>
                      <li>
                        쿠키를 통한 방문자 식별 정보(광고 노출 및 클릭 중복 방지
                        목적)
                      </li>
                    </ul>
                    <p className="mt-2 text-[11px] leading-snug">
                      * 수집된 정보는 개인을 직접 식별하지 않으며, 광고 최적화
                      목적으로만 사용됩니다.
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-xs text-slate-500">
            * 위탁 계약 시 개인정보보호의 안전을 기하기 위하여 개인정보보호 관련
            법규의 준수, 개인정보에 관한 제3자 제공 금지 및 사고시의 책임부담
            등을 명확히 규정하고 있습니다.
          </p>
        </section>
      </div>
    </div>
  );
}

export default PrivacyPage;
