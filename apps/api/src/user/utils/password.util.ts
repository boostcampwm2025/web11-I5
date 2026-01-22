import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

const PASSWORD_HASH_PREFIX = 'scrypt';
const SALT_BYTE_LENGTH = 16;
const SCRYPT_KEY_LENGTH = 64;

/**
 * 비밀번호를 단방향 해시로 변환합니다.
 * - 알고리즘: scrypt
 * - 저장 포맷: scrypt:<saltHex>:<hashHex>
 */
export function hashPassword(plainPassword: string): string {
  const saltHex = randomBytes(SALT_BYTE_LENGTH).toString('hex');
  const hashHex = scryptSync(
    plainPassword,
    saltHex,
    SCRYPT_KEY_LENGTH,
  ).toString('hex');
  return `${PASSWORD_HASH_PREFIX}:${saltHex}:${hashHex}`;
}

export function isHashedPassword(storedPassword: string): boolean {
  return storedPassword.startsWith(`${PASSWORD_HASH_PREFIX}:`);
}

/**
 * 저장된 해시(또는 레거시 평문)와 입력 비밀번호를 비교합니다.
 */
export function verifyPassword(
  plainPassword: string,
  storedPassword: string,
): boolean {
  // 레거시(평문) 지원: 기존 데이터가 남아있을 수 있으므로 호환
  if (!isHashedPassword(storedPassword)) {
    return storedPassword === plainPassword;
  }

  const parts = storedPassword.split(':');
  if (parts.length !== 3) return false;

  const [, saltHex, storedHashHex] = parts;
  const derived = scryptSync(plainPassword, saltHex, SCRYPT_KEY_LENGTH);
  const stored = Buffer.from(storedHashHex, 'hex');

  if (stored.length !== derived.length) return false;
  return timingSafeEqual(derived, stored);
}
