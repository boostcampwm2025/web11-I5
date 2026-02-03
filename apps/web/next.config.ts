import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "kr.object.ncloudstorage.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  org: "malmanhae",
  project: "javascript-nextjs",
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // Sentry에 클라이언트 번들 파일을 더 많이 보내서 에러 추적시 에러가 발생한 정확한 코드라인 추적 가능
  // 빌드 시간이 증가하는 요인점.
  // 에러 네이밍 구체화로 관리하고 빌드 시간 줄이기 -> false로 처리
  widenClientFileUpload: false,

  // sentry 자체 로거 비활성화. -> Sentry 측에서 전송하는 디버깅 문구 차단
  disableLogger: true,

  // ad block같은 확장 프로그램에 의해 Sentry로 요청이 차단되는 것을 방지
  // /monitoring로 에러 데이터를 전송하고, Next.js 서버가 해당 요청을 받아 Sentry로 프록시 역할함
  // 같은 도메인으로의 요청이기에 확장프로그램이 Sentry로 요청을 차단하는 것을 방지함.
  tunnelRoute: "/monitoring",

  webpack: {
    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
