"use server";

import { apiClient, apiGet, apiPost } from "@/lib/api-client";
import { ApiError } from "@/lib/api-error";
import { logger } from "@sentry/nextjs";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_BASE_URL = process.env.API_URL || "http://localhost:8000";

export interface User {
  id: number;
  email: string | null;
  nickname: string | null;
  password: string | null;
  totalPoint: number | null;
  totalScore: number | null;
  createdAt: string;
}

// 로그인 여부 확인 (쿠키 존재 여부만 확인, API 호출 없음)
async function hasAccessToken(): Promise<boolean> {
  const cookieStore = await cookies();
  return !!cookieStore.get("accessToken")?.value;
}

// 현재 사용자 정보 가져오기 (실패 시 쿠키 삭제)
async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return null;
  }

  try {
    return await apiGet<User>(`/api/users/me`);
  } catch (error) {
    // 401 Unauthorized일 때만 쿠키 삭제
    if (error instanceof ApiError && error.status === 401) {
      cookieStore.delete("accessToken");
    }
    return null;
  }
}

// 테스트 유저 목록 가져오기 (인증 불필요)
async function getTestUsers(): Promise<User[]> {
  try {
    return await apiGet<User[]>(`/api/users/test-users`);
  } catch {
    return [];
  }
}

export interface LoginState {
  success: boolean;
  error?: string;
}

// 로그인
async function loginAction(
  _prevState: LoginState | undefined,
  formData: FormData,
): Promise<LoginState | undefined> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  let error = "";
  let success = true;

  try {
    const response = await fetch(`${API_BASE_URL}/api/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      const backendErrorMessage = errorData.message || "로그인에 실패했습니다.";

      const finalErrorMessage = Array.isArray(backendErrorMessage)
        ? backendErrorMessage.join(", ")
        : backendErrorMessage;

      return { success: false, error: finalErrorMessage };
    }

    const data = await response.json();
    const { accessToken } = data;

    if (!accessToken) {
      success = false;
      error = "Access Token을 받지 못했습니다.";
    }

    // Access Token을 HttpOnly 쿠키로 저장
    // (현재 Access Token 자체 만료를 제거했으므로 쿠키도 15분 제한을 두지 않음.)
    const cookieStore = await cookies();
    cookieStore.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7일
    });
  } catch {
    success = false;
    error = "로그인 중 오류가 발생했습니다.";
  }

  if (success) {
    revalidatePath("/");
    redirect("/");
  } else {
    return { success, error };
  }
}

// 로그아웃
async function logoutAction() {
  try {
    await apiClient("/api/users/logout", {
      method: "POST",
    });

    // Access Token 쿠키 삭제
    const cookieStore = await cookies();
    cookieStore.delete("accessToken");

    revalidatePath("/");
    redirect("/");
  } catch (error) {
    throw error;
  }
}

export interface SignupState {
  success: boolean;
  error?: string;
  errors?: {
    nickname?: string[];
    email?: string[];
    password?: string[];
  };
}

// 회원가입
async function signupAction(
  _prevState: SignupState | undefined,
  formData: FormData,
): Promise<SignupState | undefined> {
  const nickname = formData.get("nickname") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const response = await fetch(`${API_BASE_URL}/api/users/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nickname, email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const messages = errorData.message;

      const mappedErrors: Record<string, string> = {};

      if (Array.isArray(messages)) {
        messages.forEach((msg: string) => {
          if (msg.includes("email"))
            mappedErrors.email = "올바른 이메일 형식이 아닙니다.";
          if (msg.includes("nickname"))
            mappedErrors.nickname = "닉네임 형식을 확인해주세요.";
          if (msg.includes("password"))
            mappedErrors.password = "비밀번호가 너무 짧습니다.";
        });
      }
      return {
        success: false,
        error:
          typeof messages === "string" ? messages : "입력 정보를 확인해주세요.",
        errors: mappedErrors,
      };
    }
  } catch {
    return { success: false, error: "회원가입 중 오류가 발생했습니다." };
  }

  const cookieStore = await cookies();
  cookieStore.set("saved_email", email, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 10,
    path: "/login",
  });

  redirect("/login");
}

async function sendVerifyMail(email: string) {
  try {
    return await apiPost<{ message: string }>("/api/users/mail-verification", {
      email,
    });
  } catch (error) {
    logger.error("인증 메일 보내기 요청 실패", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

export interface VerifyCodeState {
  success: boolean;
  message?: string;
  error?: string;
}

// 인증 코드 확인 액션
async function verifyCodeAction(
  _prevState: VerifyCodeState | undefined,
  formData: FormData,
): Promise<VerifyCodeState> {
  const email = formData.get("email") as string;
  const code = formData.get("code") as string;

  if (!code || code.length !== 6) {
    return { success: false, error: "6자리 인증 코드를 입력해주세요." };
  }

  try {
    const result = await apiPost<{ message: string }>(
      "/api/users/verification-check",
      { email, code },
    );
    return {
      success: true,
      message: result.message || "인증이 완료되었습니다.",
    };
  } catch (error) {
    logger.error("인증 코드 확인 요청 실패", {
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "인증에 실패했습니다. 코드를 확인해주세요.",
    };
  }
}

export {
  getCurrentUser,
  getTestUsers,
  hasAccessToken,
  loginAction,
  logoutAction,
  sendVerifyMail,
  signupAction,
  verifyCodeAction,
};
