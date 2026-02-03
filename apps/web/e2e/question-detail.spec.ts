import { test, expect } from "@playwright/test";

test.describe("문제 상세 페이지", () => {
  test.describe("페이지 렌더링", () => {
    test("문제 제목과 내용이 표시되어야 한다", async ({ page }) => {
      await page.goto("/daily/questions/1");

      await expect(
        page.getByRole("heading", {
          name: "TCP와 UDP의 차이점을 설명하세요",
        }),
      ).toBeVisible();

      await expect(
        page.getByText(
          "TCP와 UDP는 전송 계층의 프로토콜입니다. 두 프로토콜의 특징과 차이점, 그리고 각각 어떤 상황에서 사용되는지 설명해주세요.",
        ),
      ).toBeVisible();
    });

    test("카테고리 뱃지가 표시되어야 한다", async ({ page }) => {
      await page.goto("/daily/questions/1");

      await expect(page.getByText("네트워크")).toBeVisible();
      await expect(page.getByText("TCP/IP")).toBeVisible();
    });

    test("음성/텍스트 입력 탭이 표시되어야 한다", async ({ page }) => {
      await page.goto("/daily/questions/1");

      await expect(
        page.getByRole("tab", { name: "음성 답변하기" }),
      ).toBeVisible();
      await expect(
        page.getByRole("tab", { name: "텍스트 답변하기" }),
      ).toBeVisible();
    });
  });

  test.describe("문제 토글 기능", () => {
    test("문제 숨기기 버튼을 클릭하면 문제가 숨겨져야 한다", async ({
      page,
    }) => {
      await page.goto("/daily/questions/1");

      const hideButton = page.getByRole("button", { name: "문제 숨기기" });
      await expect(hideButton).toBeVisible();

      await hideButton.click();

      await expect(page.getByText("문제가 숨겨져 있습니다")).toBeVisible();
      await expect(
        page.getByRole("heading", {
          name: "TCP와 UDP의 차이점을 설명하세요",
        }),
      ).not.toBeVisible();
    });

    test("문제 보기 버튼을 클릭하면 문제가 다시 표시되어야 한다", async ({
      page,
    }) => {
      await page.goto("/daily/questions/1");

      const hideButton = page.getByRole("button", { name: "문제 숨기기" });
      await hideButton.click();

      const showButton = page.getByRole("button", { name: "문제 보기" });
      await expect(showButton).toBeVisible();

      await showButton.click();

      await expect(
        page.getByRole("heading", {
          name: "TCP와 UDP의 차이점을 설명하세요",
        }),
      ).toBeVisible();
      await expect(page.getByText("문제가 숨겨져 있습니다")).not.toBeVisible();
    });
  });

  test.describe("입력 모드 전환", () => {
    test("기본 모드는 음성 답변이어야 한다", async ({ page }) => {
      await page.goto("/daily/questions/1");

      const voiceTab = page.getByRole("tab", { name: "음성 답변하기" });
      await expect(voiceTab).toHaveAttribute("data-state", "active");

      await expect(page.getByText("답변 시작")).toBeVisible();
      await expect(
        page.getByText("버튼을 눌러 녹음을 시작하세요."),
      ).toBeVisible();
    });

    test("mode=text 파라미터로 접근하면 텍스트 모드가 활성화되어야 한다", async ({
      page,
    }) => {
      await page.goto("/daily/questions/1?mode=text");

      const textTab = page.getByRole("tab", { name: "텍스트 답변하기" });
      await expect(textTab).toHaveAttribute("data-state", "active");

      await expect(
        page.getByPlaceholder(
          "면접 질문에 답하듯이 지식을 논리적으로 작성해 보세요.",
        ),
      ).toBeVisible();
    });

    test("mode=voice 파라미터로 접근하면 음성 모드가 활성화되어야 한다", async ({
      page,
    }) => {
      await page.goto("/daily/questions/1?mode=voice");

      const voiceTab = page.getByRole("tab", { name: "음성 답변하기" });
      await expect(voiceTab).toHaveAttribute("data-state", "active");
    });

    test("잘못된 mode 파라미터는 기본값(voice)으로 처리되어야 한다", async ({
      page,
    }) => {
      await page.goto("/daily/questions/1?mode=invalid");

      const voiceTab = page.getByRole("tab", { name: "음성 답변하기" });
      await expect(voiceTab).toHaveAttribute("data-state", "active");
    });

    test("탭을 클릭하면 입력 모드가 전환되어야 한다", async ({ page }) => {
      await page.goto("/daily/questions/1");

      const textTab = page.getByRole("tab", { name: "텍스트 답변하기" });
      await textTab.click();

      await expect(textTab).toHaveAttribute("data-state", "active");
      await expect(
        page.getByPlaceholder(
          "면접 질문에 답하듯이 지식을 논리적으로 작성해 보세요.",
        ),
      ).toBeVisible();

      const voiceTab = page.getByRole("tab", { name: "음성 답변하기" });
      await voiceTab.click();

      await expect(voiceTab).toHaveAttribute("data-state", "active");
      await expect(page.getByText("답변 시작")).toBeVisible();
    });
  });

  test.describe("텍스트 입력", () => {
    test("텍스트 입력창에 글자를 입력하면 글자 수가 표시되어야 한다", async ({
      page,
    }) => {
      await page.goto("/daily/questions/1?mode=text");

      // 초기 글자 수 확인
      await expect(page.getByText("0 / 5,000자")).toBeVisible();

      const textarea = page.getByPlaceholder(
        "면접 질문에 답하듯이 지식을 논리적으로 작성해 보세요.",
      );

      // 텍스트 입력 (type 사용으로 React 상태 업데이트 보장)
      await textarea.click();
      await textarea.pressSequentially("테스트");

      // 글자 수 업데이트 확인 (3자)
      await expect(page.getByText("3 / 5,000자")).toBeVisible();
    });

    test("텍스트가 비어있으면 제출 버튼이 비활성화되어야 한다", async ({
      page,
    }) => {
      await page.goto("/daily/questions/1?mode=text");

      const submitButton = page.getByRole("button", { name: "답변 제출" });
      await expect(submitButton).toBeDisabled();
    });

    test("텍스트를 입력하면 제출 버튼이 활성화되어야 한다", async ({
      page,
    }) => {
      await page.goto("/daily/questions/1?mode=text");

      const textarea = page.getByPlaceholder(
        "면접 질문에 답하듯이 지식을 논리적으로 작성해 보세요.",
      );
      await textarea.fill("테스트 답변입니다.");

      const submitButton = page.getByRole("button", { name: "답변 제출" });
      await expect(submitButton).toBeEnabled();
    });

    test("공백만 입력하면 제출 버튼이 비활성화되어야 한다", async ({
      page,
    }) => {
      await page.goto("/daily/questions/1?mode=text");

      const textarea = page.getByPlaceholder(
        "면접 질문에 답하듯이 지식을 논리적으로 작성해 보세요.",
      );
      await textarea.fill("   ");

      const submitButton = page.getByRole("button", { name: "답변 제출" });
      await expect(submitButton).toBeDisabled();
    });
  });

  test.describe("음성 입력", () => {
    test("녹음 버튼이 표시되어야 한다", async ({ page }) => {
      await page.goto("/daily/questions/1");

      const recordButton = page.getByRole("button", { name: "녹음 시작" });
      await expect(recordButton).toBeVisible();
    });
  });

  test.describe("다른 문제 조회", () => {
    test("다른 문제 ID로 접근하면 해당 문제가 표시되어야 한다", async ({
      page,
    }) => {
      await page.goto("/daily/questions/2");

      await expect(
        page.getByRole("heading", {
          name: "HTTP와 HTTPS의 차이점은 무엇인가요?",
        }),
      ).toBeVisible();

      await expect(
        page.getByText(
          "HTTP와 HTTPS의 차이점과 HTTPS가 보안을 제공하는 방법에 대해 설명해주세요.",
        ),
      ).toBeVisible();
    });
  });

  test.describe("에러 처리", () => {
    test("존재하지 않는 문제 ID로 접근하면 404 페이지가 표시되어야 한다", async ({
      page,
    }) => {
      const response = await page.goto("/daily/questions/999");

      expect(response?.status()).toBe(404);
    });

    test("잘못된 형식의 문제 ID로 접근하면 404 페이지가 표시되어야 한다", async ({
      page,
    }) => {
      const response = await page.goto("/daily/questions/invalid");

      expect(response?.status()).toBe(404);
    });
  });
});
