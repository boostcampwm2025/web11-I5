import { test, expect } from "@playwright/test";

test.describe("홈페이지", () => {
  test('페이지 타이틀이 "말만해"를 포함해야 한다', async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/말만해/);
  });

  test("헤더의 로고와 타이틀이 표시되어야 한다", async ({ page }) => {
    await page.goto("/");

    // 헤더 영역의 로고 이미지
    const logo = page.locator('img[alt="logo"]').first();
    await expect(logo).toBeVisible();

    // 헤더의 "말만해" 타이틀
    const headerTitle = page.locator("text=말만해").first();
    await expect(headerTitle).toBeVisible();
  });

  test("로그인 버튼이 표시되어야 한다 (비로그인 상태)", async ({ page }) => {
    await page.goto("/");

    const loginButton = page.getByRole("link", { name: "로그인" });
    await expect(loginButton).toBeVisible();
  });

  test("메인 콘텐츠 영역이 표시되어야 한다", async ({ page }) => {
    await page.goto("/");

    const main = page.locator("main");
    await expect(main).toBeVisible();
  });

  test("문제 리스트 링크가 존재해야 한다", async ({ page }) => {
    await page.goto("/");

    const questionListLink = page.getByRole("link", { name: "문제 리스트" });
    await expect(questionListLink).toBeVisible();
  });
});
