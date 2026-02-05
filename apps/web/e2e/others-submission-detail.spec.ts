import { test, expect } from "@playwright/test";

test.describe("다른 사람 제출 상세 페이지", () => {
  test.describe("답변이 있는 경우", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/daily/questions/1/others/101");
    });

    test("페이지 헤더가 표시되어야 한다", async ({ page }) => {
      const logo = page.locator('img[alt="logo"]').first();
      await expect(logo).toBeVisible();
    });

    test("문제 카테고리 경로가 표시되어야 한다", async ({ page }) => {
      await expect(page.getByText("네트워크")).toBeVisible();
      await expect(page.getByText("TCP/IP")).toBeVisible();
    });

    test("문제 제목이 표시되어야 한다", async ({ page }) => {
      const heading = page.getByRole("heading", {
        name: "TCP와 UDP의 차이점을 설명하세요",
      });
      await expect(heading).toBeVisible();
    });

    test("문제 내용이 표시되어야 한다", async ({ page }) => {
      await expect(
        page.getByText(/TCP와 UDP의 주요 차이점에 대해/),
      ).toBeVisible();
    });

    test("마스킹된 닉네임이 표시되어야 한다", async ({ page }) => {
      // 김철수 -> 김*수
      await expect(page.getByText("김*수")).toBeVisible();
    });

    test("제출 일시가 표시되어야 한다", async ({ page }) => {
      await expect(page.getByText(/제출 일시:/)).toBeVisible();
    });

    test("점수 게이지가 표시되어야 한다", async ({ page }) => {
      await expect(page.getByText("95")).toBeVisible();
    });

    test("답변 원문 섹션이 표시되어야 한다", async ({ page }) => {
      await expect(
        page.getByRole("heading", { name: "답변 원문" }),
      ).toBeVisible();
    });

    test("답변 내용이 표시되어야 한다", async ({ page }) => {
      const answerContent = page.getByTestId("answer-content");
      await expect(answerContent).toBeVisible();
      await expect(answerContent).toContainText("TCP는 연결 지향 프로토콜로");
      await expect(answerContent).toContainText("3-way handshake");
    });

    test("키워드 섹션이 표시되어야 한다", async ({ page }) => {
      const keywordsSection = page.getByTestId("keywords-section");
      await expect(keywordsSection).toBeVisible();
      await expect(keywordsSection).toContainText("CORE KEYWORDS");
    });

    test("키워드들이 표시되어야 한다", async ({ page }) => {
      const keywordBadges = page.getByTestId("keyword-badge");
      await expect(keywordBadges).toHaveCount(5);

      // 키워드 뱃지 내에 특정 텍스트가 있는지 확인
      await expect(keywordBadges.filter({ hasText: "TCP" })).toHaveCount(1);
      await expect(keywordBadges.filter({ hasText: "UDP" })).toHaveCount(1);
      await expect(
        keywordBadges.filter({ hasText: "비연결 지향" }),
      ).toHaveCount(1);
    });
  });

  test.describe("답변이 없는 경우", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/daily/questions/1/others/102");
    });

    test("마스킹된 닉네임이 표시되어야 한다", async ({ page }) => {
      // 이영희 -> 이*희
      await expect(page.getByText("이*희")).toBeVisible();
    });

    test("답변 없음 메시지가 표시되어야 한다", async ({ page }) => {
      const noAnswerMessage = page.getByTestId("no-answer-message");
      await expect(noAnswerMessage).toBeVisible();
      await expect(noAnswerMessage).toHaveText("저장된 답변이 없습니다.");
    });

    test("키워드 섹션이 표시되지 않아야 한다", async ({ page }) => {
      await expect(page.getByTestId("keywords-section")).toHaveCount(0);
    });
  });

  test.describe("잘못된 파라미터", () => {
    test("유효하지 않은 questionId일 경우 404 페이지로 이동해야 한다", async ({
      page,
    }) => {
      const response = await page.goto("/daily/questions/invalid/others/101");
      expect(response?.status()).toBe(404);
    });

    test("유효하지 않은 submissionId일 경우 404 페이지로 이동해야 한다", async ({
      page,
    }) => {
      const response = await page.goto("/daily/questions/1/others/invalid");
      expect(response?.status()).toBe(404);
    });
  });
});
