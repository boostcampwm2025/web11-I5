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

// 로그인
async function login(email: string, password?: string) {
  const finalPassword = password ?? "test123";

  try {
    const response = await fetch(`${API_BASE_URL}/api/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password: finalPassword }),
    });

    if (!response.ok) {
      throw new Error("로그인에 실패했습니다.");
    }

    const data = await response.json();
    const { accessToken } = data;

    if (!accessToken) {
      throw new Error("Access Token을 받지 못했습니다.");
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
  } catch (error) {
    throw error;
  }
}

// 로그아웃
async function logout() {
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

//회원가입(임시)
async function signup(nickname: string, email: string, password: string) {
  let signupSuccess = false;

  try {
    //TODO: 비밀번호 해싱
    const response = await fetch(`${API_BASE_URL}/api/users/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nickname,
        email,
        password, // TODO: 해싱된 비밀번호 변환 필요
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "회원가입에 실패했습니다.");
    }
    signupSuccess = true;
  } catch (error) {
    console.error("Signup Error:", error);
    throw error;
  }

  if (signupSuccess) {
    redirect("/login");
  }
}

export { getCurrentUser, getTestUsers, login, logout, signup };
