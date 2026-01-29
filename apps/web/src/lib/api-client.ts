"use server";

import * as Sentry from "@sentry/nextjs";
import { cookies } from "next/headers";
import { ApiError } from "./api-error";
import { logger } from "./sentry-logger";

const API_BASE_URL = process.env.API_URL || "http://localhost:8000";

async function handleErrorResponse(response: Response): Promise<never> {
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    // JSON 파싱 실패 시 body는 undefined
  }
  const error = new ApiError(response.status, response.statusText, body);

  Sentry.captureException(error, {
    tags: {
      error_type: error.getErrorType(),
      status_code: response.status,
    },
    contexts: {
      response: {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        request_id: error.getRequestId(),
      },
    },
  });

  throw error;
}

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

  const headers = new Headers(options.headers);
  if (
    !headers.has("Content-Type") &&
    options.body &&
    !(options.body instanceof FormData)
  ) {
    headers.set("Content-Type", "application/json");
  }

  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;

  const apiOrigins = new URL(API_BASE_URL).origin;
  const targetOrigin = new URL(url).origin;
  if (accessToken && targetOrigin === apiOrigins) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  try {
    return await fetch(url, {
      cache: "no-store",
      ...options,
      headers,
      credentials: "include",
    });
  } catch (error) {
    // 네트워크 에러는 Sentry(captureException)로 이미 보고됨 — apiClient 호출부에서 throw 시 전파
    throw new ApiError(
      0,
      "Network Error",
      error instanceof Error ? error.message : "알 수 없는 네트워크 오류",
    );
  }
}

/**
 * GET 요청 헬퍼
 */
export async function apiGet<T>(endpoint: string): Promise<T> {
  if (process.env.NODE_ENV === "development") {
    logger.info(`GET ${endpoint} API 호출`);
  }
  const response = await apiClient(endpoint, { method: "GET" });

  if (!response.ok) {
    await handleErrorResponse(response);
  }

  return response.json();
}

/**
 * POST 요청 헬퍼
 */
export async function apiPost<T>(endpoint: string, body?: unknown): Promise<T> {
  if (process.env.NODE_ENV === "development") {
    logger.info(`POST ${endpoint} API 호출`);
  }
  const response = await apiClient(endpoint, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    await handleErrorResponse(response);
  }

  return response.json();
}

/**
 * PUT 요청 헬퍼
 */
export async function apiPut<T>(endpoint: string, body?: unknown): Promise<T> {
  if (process.env.NODE_ENV === "development") {
    logger.info(`PUT ${endpoint} API 호출`);
  }
  const response = await apiClient(endpoint, {
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    await handleErrorResponse(response);
  }

  return response.json();
}

/**
 * PATCH 요청 헬퍼
 */
export async function apiPatch<T>(
  endpoint: string,
  body?: unknown,
): Promise<T> {
  if (process.env.NODE_ENV === "development") {
    logger.info(`PATCH ${endpoint} API 호출`);
  }
  const response = await apiClient(endpoint, {
    method: "PATCH",
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    await handleErrorResponse(response);
  }

  return response.json();
}

/**
 * DELETE 요청 헬퍼
 */
export async function apiDelete<T>(endpoint: string): Promise<T> {
  if (process.env.NODE_ENV === "development") {
    logger.info(`DELETE ${endpoint} API 호출`);
  }
  const response = await apiClient(endpoint, { method: "DELETE" });

  if (!response.ok) {
    await handleErrorResponse(response);
  }

  return response.json();
}

/**
 * BFF 요청시 인증된 유저인지 확인하는 헬퍼
 */
export async function checkAuthUser(): Promise<boolean> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  return !!accessToken;
}
