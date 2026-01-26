import * as Sentry from "@sentry/nextjs";

type LogContext = Record<string, unknown>;

/**
 * Sentry 로거 래퍼. trace, debug, info, warn, error 레벨의 로깅을 제공합니다.
 * @example logger.info('User logged in', { userId: 123 })
 */
export const logger = {
  trace: (message: string, context?: LogContext) =>
    Sentry.logger.trace(message, context),

  debug: (message: string, context?: LogContext) =>
    Sentry.logger.debug(message, context),

  info: (message: string, context?: LogContext) =>
    Sentry.logger.info(message, context),

  warn: (message: string, context?: LogContext) =>
    Sentry.logger.warn(message, context),

  error: (message: string, context?: LogContext) =>
    Sentry.logger.error(message, context),
} as const;
