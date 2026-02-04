import { http, HttpResponse } from "msw";

const BACKEND_URL = process.env.API_URL || "http://localhost:8000";

export const authHandlers = [
  http.post(`${BACKEND_URL}/api/users/signup`, async ({ request }) => {
    const body = (await request.json()) as { email: string; nickname: string };
    if (body.email === "duplicate@example.com") {
      return HttpResponse.json(
        {
          success: false,
          message: "이미 가입된 이메일입니다.",
        },
        { status: 409 }, // Conflict
      );
    }

    return HttpResponse.json(
      {
        success: true,
        message: "회원가입이 완료되었습니다.",
        user: { id: 1, email: body.email, nickname: body.nickname },
      },
      { status: 201 },
    );
  }),

  http.post(`${BACKEND_URL}/api/users/mail-verification`, async () => {
    return HttpResponse.json({
      success: true,
      message: "인증 코드가 전송되었습니다. (MSW)",
    });
  }),

  http.post(
    `${BACKEND_URL}/api/users/verification-check`,
    async ({ request }) => {
      const body = (await request.json()) as { code: string; email: string };

      // '123456'을 입력하면 성공, 그 외에는 실패 처리
      if (body.code === "123456") {
        return HttpResponse.json({
          success: true,
          message: "인증이 완료되었습니다. (MSW)",
        });
      }

      return HttpResponse.json(
        { success: false, message: "인증 코드가 일치하지 않습니다." },
        { status: 400 },
      );
    },
  ),

  http.post(`${BACKEND_URL}/api/users/login`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };

    if (body.email === "test@example.com" && body.password === "password123!") {
      return HttpResponse.json({
        success: true,
        message: "로그인 성공",
        accessToken: "fake-jwt-token",
        user: { id: 1, email: body.email, nickname: "테스트유저" },
      });
    }

    return HttpResponse.json(
      { success: false, message: "이메일 또는 비밀번호가 일치하지 않습니다." },
      { status: 401 },
    );
  }),
];
