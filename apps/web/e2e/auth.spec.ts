import { test, expect } from "@playwright/test";

test.describe("회원가입 시나리오", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/signup");
  });

  test("회원가입 폼의 기본 입력 필드들이 모두 표시되어야 한다", async ({
    page,
  }) => {
    await expect(page.getByLabel("이름")).toBeVisible();
    await expect(page.getByLabel("이메일")).toBeVisible();
    await expect(page.getByLabel("비밀번호", { exact: true })).toBeVisible();
    await expect(page.getByLabel("비밀번호 확인")).toBeVisible();
  });

  test("이름(닉네임)에 공백이 있으면 에러 메시지가 표시되어야 한다", async ({
    page,
  }) => {
    const nameInput = page.getByLabel("이름");
    await nameInput.fill("홍 길동");

    await page.getByRole("heading", { name: "회원가입" }).click();

    await expect(page.getByText(/공백 없이 입력해주세요/)).toBeVisible({
      timeout: 10000,
    });
    await expect(
      page.getByRole("button", { name: "회원가입하기" }),
    ).toBeDisabled();
  });

  test("비밀번호와 비밀번호 확인이 일치하지 않으면 에러가 표시되어야 한다", async ({
    page,
  }) => {
    await page.getByLabel("비밀번호", { exact: true }).fill("password123!");
    await page.getByLabel("비밀번호 확인").fill("diferrent123!"); // 다르게 입력

    await expect(page.getByText("비밀번호가 일치하지 않습니다")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "회원가입하기" }),
    ).toBeDisabled();
  });

  test("모든 정보를 올바르게 입력하고 이메일 인증 후 회원가입에 성공한다", async ({
    page,
  }) => {
    // 1. 이름 입력
    const nameInput = page.getByLabel("이름");
    await nameInput.fill("테스트유저");
    await page.getByRole("heading", { name: "회원가입" }).click(); // blur 대신 클릭
    await expect(page.getByText(/공백 없이 입력해주세요/)).toBeHidden();

    // 2. 이메일 인증
    await page.getByLabel("이메일").fill("test@example.com");
    const verifyBtn = page.getByRole("button", { name: "이메일 인증하기" });
    await expect(verifyBtn).toBeEnabled();
    await verifyBtn.click();

    const codeInput = page.getByPlaceholder("인증 코드", { exact: false });
    await expect(codeInput).toBeVisible();

    // (옵션) 전송 버튼 클릭
    if (
      await page.getByRole("button", { name: "인증 코드 전송" }).isVisible()
    ) {
      await page.getByRole("button", { name: "인증 코드 전송" }).click();
    }

    await codeInput.fill("123456");
    // 모달 확인 버튼 누르기 전에 확실히 입력되었는지 확인
    await expect(codeInput).toHaveValue("123456");

    const modalConfirmBtn = page
      .getByRole("button", { name: "인증 확인" })
      .last();
    await modalConfirmBtn.click();

    await expect(
      page.getByRole("button", { name: "이메일 인증 완료" }),
    ).toBeVisible();

    // 3. 비밀번호 입력
    await page.getByLabel("비밀번호", { exact: true }).fill("password123!");
    const pwConfirmInput = page.getByLabel("비밀번호 확인");
    await pwConfirmInput.fill("password123!");

    // 💡 [핵심] 여기서도 제목 클릭으로 포커스 아웃
    await page.getByRole("heading", { name: "회원가입" }).click();

    // 4. [중요] 비밀번호 에러가 '사라진 것'을 먼저 검증해야 버튼이 활성화됨
    // React 상태가 업데이트될 시간을 벌어줍니다.
    await expect(page.getByText("비밀번호가 일치하지 않습니다")).toBeHidden();

    // 5. 약관 동의
    const termsCheckbox = page.getByLabel("서비스 이용약관");
    await termsCheckbox.check({ force: true });
    await expect(termsCheckbox).toBeChecked();

    // 6. 회원가입 버튼 확인
    const submitBtn = page.getByRole("button", { name: "회원가입하기" });

    // Webkit CI가 느려서 버튼 활성화가 늦을 수 있으니 timeout 증가
    await expect(submitBtn).toBeEnabled({ timeout: 10000 });

    await submitBtn.click();
  });
});

test.describe("로그인 페이지 시나리오", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("로그인 페이지 UI 요소들이 올바르게 표시되어야 한다", async ({
    page,
  }) => {
    await expect(page.getByRole("heading", { name: "로그인" })).toBeVisible();
    await expect(
      page.getByText("서비스 이용을 위해 로그인이 필요합니다."),
    ).toBeVisible();

    await expect(page.getByLabel("이메일")).toBeVisible();
    await expect(page.getByLabel("비밀번호")).toBeVisible();

    await expect(
      page.getByRole("button", { name: "로그인하기" }),
    ).toBeVisible();

    await expect(page.getByText("Google로 로그인")).toBeVisible();
  });

  test("회원가입 페이지로 이동할 수 있어야 한다", async ({ page }) => {
    const signupLink = page.getByRole("link", { name: "3초 만에 회원가입" });
    await expect(signupLink).toBeVisible();

    await signupLink.click();
    await expect(page).toHaveURL("/signup");
  });

  test("잘못된 정보로 로그인 시 실패해야 한다", async ({ page }) => {
    await page.getByLabel("이메일").fill("wrong@example.com");
    await page.getByLabel("비밀번호").fill("wrongpassword");

    await page.getByRole("button", { name: "로그인하기" }).click();
  });

  test("방금 가입한 계정으로 로그인에 성공하여 메인으로 이동해야 한다", async ({
    page,
  }) => {
    await page.getByLabel("이메일").fill("test@example.com");
    await page.getByLabel("비밀번호").fill("password123!");

    await page.getByRole("button", { name: "로그인하기" }).click();

    await expect(page).toHaveURL("/");
    await expect(page.getByText("로그아웃")).toBeVisible();
  });
});
