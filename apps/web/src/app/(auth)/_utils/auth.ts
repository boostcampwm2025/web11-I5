"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { apiClient, apiGet } from "@/lib/api-client";

const API_BASE_URL = process.env.API_URL || "http://localhost:8000";

export interface User {
  id: number;
  nickname: string | null;
  password: string | null;
  totalPoint: number | null;
  totalScore: number | null;
  createdAt: string;
}

// 현재 사용자 정보 가져오기
async function getCurrentUser(): Promise<User | null> {
  try {
    return await apiGet<User>(`/api/users/me`);
  } catch {
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
  const password = (formData.get("password") as string) || "test123";

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
      return { success: false, error: "로그인에 실패했습니다." };
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

    redirect("/");
  } catch (error) {
    throw error;
  }
}

export interface SignupState {
  success: boolean;
  error?: string;
}

// 회원가입
async function signupAction(
  _prevState: SignupState | undefined,
  formData: FormData,
): Promise<SignupState | undefined> {
  const nickname = formData.get("nickname") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const passwordConfirm = formData.get("passwordConfirm") as string;

  if (password !== passwordConfirm) {
    return { success: false, error: "비밀번호가 일치하지 않습니다." };
  }

  let success = true;
  let error = "";

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
      success = false;
      error = errorData.message || "회원가입에 실패했습니다.";
    }
  } catch {
    success = false;
    error = "회원가입 중 오류가 발생했습니다.";
  }

  if (success) {
    redirect("/login");
  } else {
    return { success, error };
  }
}

export {
  getCurrentUser,
  getTestUsers,
  loginAction,
  logoutAction,
  signupAction,
};
