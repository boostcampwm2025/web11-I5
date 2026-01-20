"use server";

import { cookies } from "next/headers";

const API_BASE_URL = process.env.API_URL || "http://localhost:8000";

/**
 * BFF 공통 API 클라이언트
 * 쿠키에서 Access Token을 읽어 Authorization Bearer 헤더로 변환
 */
export async function apiClient(
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Access Token이 있으면 Authorization Bearer 헤더 추가
  if (accessToken) {
    (headers as Record<string, string>)["Authorization"] =
      `Bearer ${accessToken}`;
  }

  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;

  // 디버깅용 로그 (개발 환경에서만)
  if (process.env.NODE_ENV === "development") {
    console.log(`[apiClient] ${options.method || "GET"} ${url}`);
    console.log(
      `[apiClient] Authorization: ${accessToken ? "Bearer ***" : "없음"}`,
    );
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });
}

/**
 * GET 요청 헬퍼
 */
export async function apiGet<T>(endpoint: string): Promise<T> {
  const response = await apiClient(endpoint, { method: "GET" });

  if (!response.ok) {
    throw new Error(`API 요청 실패: ${response.statusText}`);
  }

  return response.json();
}

/**
 * POST 요청 헬퍼
 */
export async function apiPost<T>(endpoint: string, body?: unknown): Promise<T> {
  const response = await apiClient(endpoint, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`API 요청 실패: ${response.statusText}`);
  }

  return response.json();
}

/**
 * PUT 요청 헬퍼
 */
export async function apiPut<T>(endpoint: string, body?: unknown): Promise<T> {
  const response = await apiClient(endpoint, {
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`API 요청 실패: ${response.statusText}`);
  }

  return response.json();
}

/**
 * DELETE 요청 헬퍼
 */
export async function apiDelete<T>(endpoint: string): Promise<T> {
  const response = await apiClient(endpoint, { method: "DELETE" });

  if (!response.ok) {
    throw new Error(`API 요청 실패: ${response.statusText}`);
  }

  return response.json();
}
