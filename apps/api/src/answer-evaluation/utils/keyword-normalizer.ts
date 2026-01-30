/**
 * LLM이 추출한 키워드를 일관된 형식으로 정규화하여 그래프 생성 시 중복 방지
 *
 * 규칙:
 * 1. 소문자 변환으로 대소문자 통일
 * 2. 공백/하이픈 제거로 띄어쓰기 변형 통일
 * 3. 정규화된 형태를 키로 사용하여 중복 제거
 * 4. 표시용 키워드는 원본 중 첫 번째 형태 사용
 */

// 키워드 배열을 정규화
export function normalizeKeywords(keywords: string[]): string[] {
  if (!keywords || keywords.length === 0) {
    return [];
  }

  // 정규화된 키워드 -> 원본 키워드 맵
  const normalizedMap = new Map<string, string>();

  for (const keyword of keywords) {
    const trimmed = keyword.trim();
    if (!trimmed) continue;

    // 정규화된 형태 생성 (비교/중복 제거용)
    const normalizedForm = normalizeForComparison(trimmed);

    // 같은 정규화 형태가 없으면 첫 번째 원본 사용
    if (!normalizedMap.has(normalizedForm)) {
      normalizedMap.set(normalizedForm, formatKeyword(trimmed));
    }
  }

  return Array.from(normalizedMap.values());
}

// 키워드를 비교용 정규화 형태로 변환
function normalizeForComparison(keyword: string): string {
  return keyword
    .toLowerCase() // 소문자 변환
    .replace(/[\s_-]/g, '') // 공백, 언더스코어, 하이픈 제거
    .trim();
}

// 키워드를 표시용으로 포맷팅
function formatKeyword(keyword: string): string {
  const trimmed = keyword.trim();

  // 영어만 포함된 경우 Title Case 적용
  if (/^[a-zA-Z\s-]+$/.test(trimmed)) {
    return toTitleCase(trimmed);
  }

  return keyword;
}

// 문자열을 Title Case로 변환
function toTitleCase(str: string): string {
  if (!str) return '';

  // 하이픈으로 구분된 경우
  if (str.includes('-')) {
    return str
      .split('-')
      .map((word) => capitalize(word))
      .join('-');
  }

  // 공백으로 구분된 경우
  if (str.includes(' ')) {
    return str
      .split(' ')
      .map((word) => capitalize(word))
      .join(' ');
  }

  // 단일 단어
  return capitalize(str);
}

// 단어의 첫 글자를 대문자로 (약어는 대문자 유지)
function capitalize(word: string): string {
  if (!word) return '';

  // 전체가 대문자이고 2-6자인 경우 약어로 판단
  if (word === word.toUpperCase() && word.length >= 2 && word.length <= 6) {
    return word;
  }

  // 일반 단어는 Title Case
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}
