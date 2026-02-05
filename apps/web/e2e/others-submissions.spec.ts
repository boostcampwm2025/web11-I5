import { test, expect } from "@playwright/test";

test.describe("다른 사람 제출 목록 페이지", () => {
  test.describe("제출 목록이 있는 경우", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/daily/questions/1/others");
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

    test("총 제출자 수가 표시되어야 한다", async ({ page }) => {
      await expect(
        page.getByText(/총.*5.*명이 이 문제를 풀었습니다/),
      ).toBeVisible();
    });

    test("테이블 헤더가 올바르게 표시되어야 한다", async ({ page }) => {
      await expect(
        page.getByRole("columnheader", { name: "사용자" }),
      ).toBeVisible();
      await expect(
        page.getByRole("columnheader", { name: "점수" }),
      ).toBeVisible();
      await expect(
        page.getByRole("columnheader", { name: "상세" }),
      ).toBeVisible();
    });

    test("제출 목록이 테이블에 표시되어야 한다", async ({ page }) => {
      // 마스킹된 닉네임 확인 (김철수 -> 김*수)
      await expect(page.getByText("김*수")).toBeVisible();
      await expect(page.getByText("이*희")).toBeVisible();
      await expect(page.getByText("박*수")).toBeVisible();
    });

    test("점수 뱃지가 표시되어야 한다", async ({ page }) => {
      // 점수가 표시되는지 확인
      await expect(page.getByText("95")).toBeVisible();
      await expect(page.getByText("88")).toBeVisible();
      await expect(page.getByText("72")).toBeVisible();
    });

    test("답변 보기 링크가 있어야 한다", async ({ page }) => {
      const detailLinks = page.getByRole("link", { name: "답변 보기" });
      await expect(detailLinks.first()).toBeVisible();
      expect(await detailLinks.count()).toBe(5);
    });

    test("답변 보기 링크가 올바른 URL을 가리켜야 한다", async ({ page }) => {
      const firstDetailLink = page
        .getByRole("link", { name: "답변 보기" })
        .first();
      await expect(firstDetailLink).toHaveAttribute(
        "href",
        "/daily/questions/1/others/101",
      );
    });

    test("페이지네이션 정보가 표시되어야 한다", async ({ page }) => {
      // 현재 페이지 / 전체 페이지
      await expect(page.getByText("1 / 1")).toBeVisible();
      // 표시 범위
      await expect(page.getByText("1 - 5 / 총 5개")).toBeVisible();
    });

    test("페이지네이션 이전/다음 버튼이 있어야 한다", async ({ page }) => {
      const prevButton = page.getByRole("link", { name: /이전 페이지/ });
      const nextButton = page.getByRole("link", { name: /다음 페이지/ });

      await expect(prevButton).toBeVisible();
      await expect(nextButton).toBeVisible();
    });

    test("첫 페이지에서 이전 버튼이 비활성화되어야 한다", async ({ page }) => {
      const prevButton = page.getByRole("link", { name: /이전 페이지/ });
      await expect(prevButton).toHaveAttribute("aria-disabled", "true");
    });
  });

  test.describe("제출 목록이 없는 경우", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/daily/questions/2/others");
    });

    test("문제 제목이 표시되어야 한다", async ({ page }) => {
      const heading = page.getByRole("heading", {
        name: "HTTP와 HTTPS의 차이점은 무엇인가요?",
      });
      await expect(heading).toBeVisible();
    });

    test("제출자 수가 0명으로 표시되어야 한다", async ({ page }) => {
      await expect(
        page.getByText(/총.*0.*명이 이 문제를 풀었습니다/),
      ).toBeVisible();
    });

    test("빈 상태 메시지가 표시되어야 한다", async ({ page }) => {
      await expect(
        page.getByText("아직 제출된 답변이 없습니다."),
      ).toBeVisible();
    });

    test("표시 범위가 0으로 표시되어야 한다", async ({ page }) => {
      await expect(page.getByText("0 - 0 / 총 0개")).toBeVisible();
    });

    test("페이지네이션 대신 대시가 표시되어야 한다", async ({ page }) => {
      await expect(page.getByText("—")).toBeVisible();
    });
  });

  test.describe("잘못된 questionId", () => {
    test("유효하지 않은 questionId일 경우 404 페이지로 이동해야 한다", async ({
      page,
    }) => {
      const response = await page.goto("/daily/questions/invalid/others");
      expect(response?.status()).toBe(404);
    });
  });
});
