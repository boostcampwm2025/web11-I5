import { test, expect } from "@playwright/test";

test.describe("리포트 페이지", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/reports/1");
  });

  // 에러 처리
  test("존재하지 않는 리포트에 접근하는 경우 404 에러 페이지가 표시되어야 한다.", async ({
    page,
  }) => {
    // 존재하지 않는 questionId로 접근
    await page.goto("/reports/99999", { waitUntil: "domcontentloaded" });

    // not-found.tsx 페이지 내용 확인
    await expect(page.getByText("404")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "요청하신 리포트를 찾을 수 없습니다" }),
    ).toBeVisible();

    // 안내 문구 확인
    await expect(
      page.getByText(
        "존재하지 않는 문제이거나, 유효하지 않은 제출 기록입니다. URL을 다시 확인해 주세요.",
      ),
    ).toBeVisible();

    // 버튼 확인
    await expect(
      page.getByRole("link", { name: "문제 목록으로 가기" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "홈으로 돌아가기" }),
    ).toBeVisible();
  });

  // 페이지 헤더
  test("페이지 상단에서 문제 정보를 확인할 수 있어야 한다.", async ({
    page,
  }) => {
    // 문제 제목 확인
    await expect(
      page.getByRole("heading", { name: "TCP와 UDP의 차이점을 설명하세요" }),
    ).toBeVisible();

    // 문제 내용 확인
    await expect(
      page.getByText("TCP와 UDP는 전송 계층의 프로토콜입니다."),
    ).toBeVisible();
  });

  test("페이지 상단에서 나의 최고 점수를 확인할 수 있어야 한다.", async ({
    page,
  }) => {
    // 최고 점수 표시 확인 (mockSubmissions 중 최고 점수는 85점)
    await expect(page.getByText(/나의 최고 점수.*85점/)).toBeVisible();
  });

  test("다른 사람 답변 보기 버튼을 클릭하면 다른 사람 답변 리스트 페이지로 이동해야 한다.", async ({
    page,
  }) => {
    // 버튼 확인 (반응형: sm 이상에서 "다른 사람 답변", 미만에서 "다른 답변")
    const othersButton = page.getByRole("link", {
      name: /다른.*답변/,
    });
    await expect(othersButton).toBeVisible();

    // 올바른 href 속성을 가지고 있는지 확인
    await expect(othersButton).toHaveAttribute(
      "href",
      "/daily/questions/1/others",
    );
  });

  test("다시 도전하기 버튼을 클릭하면 문제 풀이 모달이 열려야 한다.", async ({
    page,
  }) => {
    // 버튼 확인 및 클릭
    const retryButton = page.getByRole("button", { name: "다시 도전하기" });
    await expect(retryButton).toBeVisible();
    await retryButton.click();

    // QuestionModal이 열렸는지 확인
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  // 분석 리포트 탭 - 기본 정보
  test("리포트 상단에 TRIAL # 시도 번호가 표시되어야 한다.", async ({
    page,
  }) => {
    // TRIAL # 형식으로 표시 (메인 콘텐츠 영역)
    await expect(
      page
        .getByRole("tabpanel", { name: "분석 리포트" })
        .getByText(/TRIAL #\d+/),
    ).toBeVisible();
  });

  test("리포트 상단에 제출 완료 날짜가 표시되어야 한다.", async ({ page }) => {
    // 완료 텍스트가 포함된 날짜 표시 확인
    await expect(page.getByText(/완료/)).toBeVisible();
  });

  test("평가 완료 시 원형 점수 게이지가 표시되어야 한다.", async ({ page }) => {
    // SVG 게이지가 표시되는지 확인
    const scoreGauge = page.locator("svg").first();
    await expect(scoreGauge).toBeVisible();
  });

  // 분석 리포트 탭 - 평가 완료
  test("평가가 완료된 경우 리포트 페이지 하단에서 분석 리포트를 확인할 수 있어야 한다.", async ({
    page,
  }) => {
    // 분석 리포트 제목 확인
    await expect(
      page.getByRole("heading", { name: "분석 리포트" }),
    ).toBeVisible();

    // "성취도 상세 분석" 섹션 확인
    await expect(
      page.getByRole("heading", { name: "성취도 상세 분석" }),
    ).toBeVisible();
  });

  test("평가 완료 시 AI MENTOR'S FEEDBACK 섹션이 표시되어야 한다.", async ({
    page,
  }) => {
    // AI MENTOR'S FEEDBACK 라벨 확인
    await expect(page.getByText("AI MENTOR'S FEEDBACK")).toBeVisible();

    // 피드백 메시지 확인 (mock 데이터의 일부)
    await expect(
      page.getByText(/TCP와 UDP의 핵심 차이점을 잘 설명했습니다/),
    ).toBeVisible();
  });

  test("성취도 상세 분석에서 핵심 개념, 완성도, 심층성, 논리성 항목이 모두 표시되어야 한다.", async ({
    page,
  }) => {
    // 4가지 평가 항목 확인
    await expect(page.getByText("핵심 개념")).toBeVisible();
    await expect(page.getByText("완성도")).toBeVisible();
    await expect(page.getByText("심층성")).toBeVisible();
    await expect(page.getByText("논리성")).toBeVisible();

    // 점수 표시 확인
    await expect(page.getByText("45")).toBeVisible();
    await expect(page.getByText("18")).toBeVisible();
  });

  // 분석 리포트 탭 - 평가 진행 중
  test("평가가 진행 중인 경우 리포트 페이지 하단에서 로딩 스피너가 표시되어야 한다.", async ({
    page,
  }) => {
    // STT 진행 중인 submission으로 접근
    await page.goto("/reports/1?attempt=3");

    // 로딩 스피너 확인 (메인 콘텐츠의 것만)
    const spinner = page
      .locator('[role="status"][aria-label="분석 중"]')
      .first();
    await expect(spinner).toBeVisible();
  });

  test("STT 진행 중일 때 '음성을 텍스트로 변환하고 있습니다' 메시지가 표시되어야 한다.", async ({
    page,
  }) => {
    // STT 진행 중인 submission
    await page.goto("/reports/1?attempt=3");

    // STT 진행 중 메시지 확인
    await expect(
      page.getByRole("heading", { name: "음성을 텍스트로 변환하고 있습니다" }),
    ).toBeVisible();

    await expect(page.getByText("음성 인식 중입니다.")).toBeVisible();
  });

  test("채점 진행 중일 때 '답변을 분석하고 있습니다' 메시지가 표시되어야 한다.", async ({
    page,
  }) => {
    // 채점 진행 중인 submission
    await page.goto("/reports/1?attempt=4");

    // 채점 진행 중 메시지 확인
    await expect(
      page.getByRole("heading", { name: "답변을 분석하고 있습니다" }),
    ).toBeVisible();

    await expect(
      page.getByText("AI 면접관이 5가지 핵심 지표를 기반으로 채점 중 입니다."),
    ).toBeVisible();
  });

  test("평가 진행 중일 때 '약 5~10초 소요' 안내 문구가 표시되어야 한다.", async ({
    page,
  }) => {
    // 채점 진행 중인 submission
    await page.goto("/reports/1?attempt=4");

    // 예상 시간 안내 확인
    await expect(
      page.getByText("잠시만 기다려주세요. (약 5~10초 소요)"),
    ).toBeVisible();
  });

  // 분석 리포트 탭 - 평가 실패
  test("채점이 실패하는 경우 '채점 다시하기' 버튼을 통해서 재채점 요청을 보낼 수 있어야 한다.", async ({
    page,
  }) => {
    // 채점 실패한 submission
    await page.goto("/reports/1?attempt=6");

    // 실패 메시지 확인
    await expect(
      page.getByRole("heading", { name: "채점에 실패했습니다" }),
    ).toBeVisible();

    await expect(
      page.getByText("채점 처리 중 오류가 발생했습니다. 다시 시도해주세요."),
    ).toBeVisible();

    // 채점 다시하기 버튼 확인 및 클릭
    const reEvaluateButton = page.getByRole("button", {
      name: /채점 다시하기/,
    });
    await expect(reEvaluateButton).toBeVisible();
    await reEvaluateButton.click();

    // URL이 변경되지 않았는지 확인 (같은 페이지)
    await expect(page).toHaveURL("/reports/1?attempt=6");
  });

  test("음성 인식에 실패하는 경우 '재시도하기' 버튼을 통해서 다시 도전할 수 있어야 한다.", async ({
    page,
  }) => {
    // STT 실패한 submission
    await page.goto("/reports/1?attempt=5");

    // 실패 메시지 확인
    await expect(
      page.getByRole("heading", { name: "음성 인식에 실패했습니다" }),
    ).toBeVisible();

    await expect(
      page.getByText("오디오 파일 형식이 손상되어 분석할 수 없습니다."),
    ).toBeVisible();

    // 다시 도전하기 버튼 확인 (실패 섹션 내의 것)
    const retryButton = page
      .getByRole("tabpanel", { name: "분석 리포트" })
      .getByRole("button", { name: /다시 도전하기/ });
    await expect(retryButton).toBeVisible();

    // 버튼 클릭 시 모달 열림
    await retryButton.click();
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  // 탭 전환
  test("분석 리포트 탭과 답변 스크립트 탭 간 전환이 정상 동작해야 한다.", async ({
    page,
  }) => {
    // 초기: 분석 리포트 탭 활성화
    const feedbackTab = page.getByRole("tab", { name: /분석 리포트/ });
    const answerTab = page.getByRole("tab", { name: /답변 스크립트/ });

    await expect(feedbackTab).toHaveAttribute("data-state", "active");
    await expect(answerTab).toHaveAttribute("data-state", "inactive");

    // 분석 리포트 내용 확인
    await expect(
      page.getByRole("heading", { name: "분석 리포트" }),
    ).toBeVisible();

    // 답변 스크립트 탭 클릭
    await answerTab.click();

    // 탭 상태 변경 확인
    await expect(feedbackTab).toHaveAttribute("data-state", "inactive");
    await expect(answerTab).toHaveAttribute("data-state", "active");

    // 답변 스크립트 내용 확인
    await expect(
      page.getByRole("heading", { name: "나의 답변 원문" }),
    ).toBeVisible();

    // 다시 분석 리포트 탭으로 전환
    await feedbackTab.click();

    await expect(feedbackTab).toHaveAttribute("data-state", "active");
    await expect(
      page.getByRole("heading", { name: "분석 리포트" }),
    ).toBeVisible();
  });

  // 답변 스크립트 탭
  test("답변 스크립트 탭에서 내가 제출한 답변 스크립트를 확인할 수 있어야 한다.", async ({
    page,
  }) => {
    // 답변 스크립트 탭 클릭
    await page.getByRole("tab", { name: /답변 스크립트/ }).click();

    // 나의 답변 원문 제목 확인
    await expect(
      page.getByRole("heading", { name: "나의 답변 원문" }),
    ).toBeVisible();

    // 답변 내용 확인 (mock 데이터: Submission ID 1)
    await expect(
      page.getByText(/TCP는 연결 지향적이고 신뢰성 있는 프로토콜입니다/),
    ).toBeVisible();
  });

  test("음성 입력으로 제출한 경우 'AI 음성 복원 완료' 배지가 표시되어야 한다.", async ({
    page,
  }) => {
    // 답변 스크립트 탭 클릭
    await page.getByRole("tab", { name: /답변 스크립트/ }).click();

    // VOICE 입력 제출 (Submission ID 1)이므로 배지 확인
    await expect(page.getByText("AI 음성 복원 완료")).toBeVisible();
  });

  test("점수가 30점 이상인 경우 답변 스크립트 탭의 하단에서 코어 키워드를 확인할 수 있어야 한다.", async ({
    page,
  }) => {
    // 답변 스크립트 탭 클릭
    await page.getByRole("tab", { name: /답변 스크립트/ }).click();

    // CORE KEYWORDS 섹션 확인
    await expect(page.getByText("CORE KEYWORDS")).toBeVisible();

    // 키워드 태그 확인 (mock 데이터의 extractedKeywords)
    await expect(page.getByText(/# TCP/)).toBeVisible();
    await expect(page.getByText(/# UDP/)).toBeVisible();
    await expect(page.getByText(/# 연결 지향/)).toBeVisible();
  });

  test("점수가 30점 미만인 경우 코어 키워드가 표시되지 않아야 한다.", async ({
    page,
  }) => {
    // 25점 제출 (Submission ID 2)로 이동
    await page.goto("/reports/1?attempt=2");

    // 답변 스크립트 탭 클릭
    await page.getByRole("tab", { name: /답변 스크립트/ }).click();

    // CORE KEYWORDS 섹션이 표시되지 않아야 함
    await expect(page.getByText("CORE KEYWORDS")).not.toBeVisible();
  });

  // 시도 히스토리 사이드바
  test("리포트 페이지 사이드에서 문제 시도 히스토리를 확인할 수 있어야 한다.", async ({
    page,
  }) => {
    // 히스토리 아코디언 열기
    const accordionTrigger = page.getByRole("button", { name: /내 제출/ });
    await accordionTrigger.click();

    // 히스토리 항목들이 표시되는지 확인
    await expect(page.getByText(/TRIAL #\d+/).first()).toBeVisible();

    // 여러 TRIAL 항목 확인
    const trialItems = page.getByText(/TRIAL #\d+/);
    const count = await trialItems.count();
    expect(count).toBeGreaterThan(0);
  });

  test("히스토리에서 완료된 시도는 점수를, 진행 중인 시도는 스피너를, 실패한 시도는 에러 아이콘을 표시해야 한다.", async ({
    page,
  }) => {
    // 히스토리 아코디언 열기 (기본 닫힘 상태일 수 있음)
    const accordionTrigger = page.getByRole("button", { name: /내 제출/ });
    await accordionTrigger.click();

    // 완료된 시도 - 점수 표시 (Submission ID 1: 85점)
    await expect(page.getByText("85점").first()).toBeVisible();

    // 진행 중인 시도 - "분석 중" 텍스트 (Submission ID 3, 4)
    const pendingCount = await page.getByText("분석 중").count();
    expect(pendingCount).toBeGreaterThan(0);

    // 실패한 시도 - "실패" 텍스트 (Submission ID 5, 6)
    const failedCount = await page.getByText("실패").count();
    expect(failedCount).toBeGreaterThan(0);
  });

  test("문제 시도 히스토리에서 특정 기록을 클릭하면 해당 리포트 페이지로 이동해야 한다.", async ({
    page,
  }) => {
    // 명시적으로 첫 번째 submission으로 이동
    await page.goto("/reports/1?attempt=1");
    await page.waitForLoadState("networkidle");

    // 현재 URL 확인
    expect(page.url()).toContain("attempt=1");

    // 히스토리 아코디언 열기
    const accordionTrigger = page.getByRole("button", { name: /내 제출/ });
    await accordionTrigger.click();

    // 히스토리에서 다른 TRIAL 항목 찾기 (두 번째 항목)
    const historyLinks = page.getByRole("link", { name: /TRIAL #/ });
    const secondTrial = historyLinks.nth(1);

    // 클릭하고 URL 변경 대기
    await secondTrial.click();
    await page.waitForURL(/\?attempt=(?!1\b)\d+/);

    // URL이 변경되었는지 확인 (attempt=1이 아닌 다른 값)
    const currentUrl = page.url();
    expect(currentUrl).toContain("attempt=");
    expect(currentUrl).not.toContain("attempt=1");
  });
});
