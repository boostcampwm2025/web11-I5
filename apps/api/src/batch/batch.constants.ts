/**
 * 타임아웃 기준
 * 10분 = 10 * 60 * 1000
 */
export const TIMEOUT_THRESHOLD_MS = 10 * 60 * 1000;

/**
 * CRON 실행 주기
 * 0분, 30분마다 실행
 */
export const TIMEOUT_CLEANUP_CRON = '0 0,30 * * * *';
