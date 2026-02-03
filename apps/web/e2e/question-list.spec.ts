import { test, expect } from "@playwright/test";

test.describe("문제 리스트 페이지", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/daily/questions");
  });

  test("페이지 제목이 표시되어야 한다", async ({ page }) => {
    const heading = page.getByRole("heading", { name: "문제 리스트" });
    await expect(heading).toBeVisible();
  });

  test("카테고리 필터에 All 버튼이 있어야 한다", async ({ page }) => {
    const allButton = page.getByRole("button", { name: "All" });
    await expect(allButton).toBeVisible();
  });

  test("검색 입력창이 표시되어야 한다", async ({ page }) => {
    const searchInput = page.getByPlaceholder("문제 제목 검색");
    await expect(searchInput).toBeVisible();
  });

  test("풀이 상태 필터가 표시되어야 한다", async ({ page }) => {
    await expect(page.getByText("풀이 상태")).toBeVisible();
    await expect(
      page.getByRole("tab", { name: "푼 문제", exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("tab", { name: "안 푼 문제" })).toBeVisible();
  });

  test("중요도 필터가 표시되어야 한다", async ({ page }) => {
    await expect(
      page.getByRole("columnheader", { name: "중요도" }),
    ).toBeVisible();
    await expect(page.getByRole("tab", { name: "4.0 이상" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "3.5 이상" })).toBeVisible();
  });

  test("테이블 헤더가 올바르게 표시되어야 한다", async ({ page }) => {
    await expect(
      page.getByRole("columnheader", { name: "카테고리" }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "문제 제목" }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "중요도" }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "점수" }),
    ).toBeVisible();
  });

  test("검색어 입력 시 URL에 search 파라미터가 추가되어야 한다", async ({
    page,
  }) => {
    const searchInput = page.getByPlaceholder("문제 제목 검색");
    await searchInput.fill("테스트");

    // debounce 대기 후 URL 변경 확인
    await page.waitForURL(/search=/);
    expect(page.url()).toContain("search=");
  });

  test("All 버튼 클릭 시 전체 카테고리 안내 문구가 표시되어야 한다", async ({
    page,
  }) => {
    const allButton = page.getByRole("button", { name: "All" });
    await allButton.click();

    await expect(
      page.getByText("전체 카테고리의 문제를 조회합니다."),
    ).toBeVisible();
  });

  test("mock된 카테고리 버튼들이 표시되어야 한다", async ({ page }) => {
    await expect(page.getByRole("button", { name: "네트워크" })).toBeVisible();
    await expect(page.getByRole("button", { name: "운영체제" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "데이터베이스" }),
    ).toBeVisible();
  });

  test("mock된 문제 목록이 테이블에 표시되어야 한다", async ({ page }) => {
    await expect(
      page.getByText("TCP와 UDP의 차이점을 설명하세요"),
    ).toBeVisible();
    await expect(
      page.getByText("HTTP와 HTTPS의 차이점은 무엇인가요?"),
    ).toBeVisible();
  });
});
