import React from "react";

export default function PrivacyPage() {
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
      </div>
    </div>
  );
}
