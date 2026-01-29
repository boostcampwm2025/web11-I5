import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import ErrorBoundary from "./error";
import { ApiError } from "@/lib/api-error";

const meta = {
  title: "Pages/ErrorBoundary",
  component: ErrorBoundary,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
      navigation: {
        push: fn(),
        back: fn(),
      },
    },
  },
  tags: ["autodocs"],
  args: {
    reset: fn(),
  },
} satisfies Meta<typeof ErrorBoundary>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 네트워크 연결 실패 (status 0)
 * 서버와 연결할 수 없는 경우를 표시합니다.
 */
export const NetworkError: Story = {
  args: {
    error: new ApiError(0, "Network Error", "알 수 없는 네트워크 오류"),
  },
};

/**
 * 500 서버 내부 오류
 * 서버 에러를 표시합니다.
 */
export const ServerError: Story = {
  args: {
    error: new ApiError(500, "Internal Server Error", {
      statusCode: 500,
      timestamp: "2026-01-26T10:00:00.000Z",
      path: "/api/questions",
      requestId: "req-123456",
      message: "서버 내부 오류가 발생했습니다.",
    }),
  },
};

/**
 * 503 서비스 이용 불가
 * 서버가 일시적으로 사용 불가능한 상태입니다.
 */
export const ServiceUnavailable: Story = {
  args: {
    error: new ApiError(503, "Service Unavailable", {
      statusCode: 503,
      timestamp: "2026-01-26T10:00:00.000Z",
      path: "/api/questions",
      requestId: "req-789012",
      message: "서비스가 일시적으로 이용 불가능합니다.",
    }),
  },
};

/**
 * 401 인증 에러
 * 로그인이 필요하다는 메시지와 함께 로그인 페이지로 이동하는 버튼을 표시합니다.
 */
export const AuthError: Story = {
  args: {
    error: new ApiError(401, "Unauthorized", {
      statusCode: 401,
      timestamp: "2026-01-26T10:00:00.000Z",
      path: "/api/profile",
      requestId: "req-345678",
      message: "인증이 필요합니다.",
    }),
  },
};

/**
 * 404 Not Found
 * 요청한 리소스를 찾을 수 없습니다.
 */
export const NotFound: Story = {
  args: {
    error: new ApiError(404, "Not Found", {
      statusCode: 404,
      timestamp: "2026-01-26T10:00:00.000Z",
      path: "/api/questions/999999",
      requestId: "req-456789",
      message: "요청하신 리소스를 찾을 수 없습니다.",
    }),
  },
};

/**
 * 400 검증 에러
 * 입력값이 잘못된 경우 상세 검증 에러를 표시합니다.
 */
export const ValidationError: Story = {
  args: {
    error: new ApiError(400, "Bad Request", {
      statusCode: 400,
      timestamp: "2026-01-26T10:00:00.000Z",
      path: "/api/answers",
      requestId: "req-567890",
      message: "입력값을 확인해주세요.",
      details: {
        validation: [
          "이메일 형식이 올바르지 않습니다.",
          "비밀번호는 8자 이상이어야 합니다.",
          "닉네임은 2-10자여야 합니다.",
        ],
      },
    }),
  },
};

/**
 * 400 클라이언트 에러 (검증 에러 없음)
 * 잘못된 요청이지만 구체적인 검증 에러가 없는 경우입니다.
 */
export const ClientError: Story = {
  args: {
    error: new ApiError(400, "Bad Request", {
      statusCode: 400,
      timestamp: "2026-01-26T10:00:00.000Z",
      path: "/api/questions",
      requestId: "req-678901",
      message: "잘못된 요청입니다.",
    }),
  },
};

/**
 * 예상치 못한 에러
 * ApiError가 아닌 일반 Error 객체입니다.
 * 개발 환경에서는 스택 트레이스를 확인할 수 있습니다.
 */
export const UnexpectedError: Story = {
  args: {
    error: Object.assign(new Error("Cannot read property 'map' of undefined"), {
      stack: `Error: Cannot read property 'map' of undefined
    at QuestionList (src/components/QuestionList.tsx:42:15)
    at renderWithHooks (react-dom.js:1234:56)`,
    }),
  },
};
