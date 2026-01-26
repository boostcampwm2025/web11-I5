// 이 파일은 클라이언트에서 Sentry 초기화를 설정합니다.
// 여기에 추가된 설정은 사용자가 브라우저에서 페이지를 로드할 때마다 사용됩니다.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  enabled: process.env.NEXT_PUBLIC_SENTRY_ENABLED === "true",

  // 추가 기능을 위한 선택적 통합을 추가합니다
  integrations: [Sentry.replayIntegration()],

  // 트레이스가 샘플링될 확률을 정의합니다. 프로덕션에서 이 값을 조정하거나 더 많은 제어를 위해 tracesSampler를 사용합니다.
  tracesSampleRate: 1,
  // 로그를 Sentry로 전송하도록 활성화합니다
  enableLogs: true,

  // Replay 이벤트가 샘플링될 확률을 정의합니다.
  // 이는 샘플링 비율을 10%로 설정합니다. 개발 중에는 100%로 설정하고
  // 프로덕션에서는 낮은 비율로 샘플링할 수 있습니다
  replaysSessionSampleRate: 0.1,

  // 에러 발생 시 Replay 이벤트가 샘플링될 확률을 정의합니다.
  replaysOnErrorSampleRate: 1.0,

  // 사용자 개인정보(PII) 전송을 활성화 여부 판단
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: false,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
