/**
 * 닉네임 중간 부분을 마스킹합니다.
 * 익명성 보장을 위해 목록 등에서 사용합니다.
 *
 * 마스킹 규칙:
 * - 1글자: 그대로 노출
 * - 2글자: 김수 → 김*
 * - 3글자: 홍길동 → 홍*동
 * - 4글자 이상: developer → de****er (앞 2글자 + 뒤 2글자 노출)
 */
function maskNickname(nickname: string): string {
  const trimmed = nickname.trim();
  if (!trimmed) return nickname;

  const length = trimmed.length;

  if (length === 1) {
    return trimmed;
  }

  if (length === 2) {
    return `${trimmed[0]}*`;
  }

  if (length === 3) {
    return `${trimmed[0]}*${trimmed[2]}`;
  }

  if (length === 4) {
    return `${trimmed[0]}*${trimmed[3]}`;
  }

  // 4글자 이상: 앞 2글자 + 마스킹(고정 4개) + 뒤 2글자
  const MASK_LENGTH = 4;
  const asterisks = "*".repeat(MASK_LENGTH);

  return `${trimmed.slice(0, 2)}${asterisks}${trimmed.slice(-2)}`;
}

export { maskNickname };
