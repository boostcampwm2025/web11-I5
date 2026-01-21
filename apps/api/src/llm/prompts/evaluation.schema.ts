import {
  AccuracyEval,
  LogicEval,
  DepthEval,
} from '../../answer-evaluation/answer-evaluation.constants';

export const EVALUATION_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    accuracy_level: {
      type: 'string',
      description:
        '핵심 개념의 정확성 평가. (PERFECT: 완벽, GOOD: 사소한 실수, MIXED: 정답과 오답 혼재, WRONG: 개념 오류/할루시네이션)',
      enum: Object.values(AccuracyEval),
    },
    accuracy_reason: {
      type: 'string',
      description:
        "팩트 검증 결과. (주의: '모범 답안'이나 'PERFECT'라는 단어를 쓰지 말고, '기술적 사실'이나 '공식 문서'의 내용과 비교하여 설명할 것)",
    },
    logic_level: {
      type: 'string',
      description:
        '논리적 구조와 문장 완결성 평가. (FLAWLESS: 완벽한 구조, COHERENT: 이해 가능하나 투박함, WEAK: 논리 비약, NONE: 비문/키워드 나열)',
      enum: Object.values(LogicEval),
    },
    logic_reason: {
      type: 'string',
      description:
        "논리적 구조에 대한 피드백. (주의: 'FLAWLESS', 'WEAK' 등 내부 등급명을 절대 텍스트에 포함하지 말고, 구체적인 문장 흐름에 대해 조언할 것)",
    },
    depth_level: {
      type: 'string',
      description:
        '지식의 깊이와 응용력 평가. (EXPERT: 원리+실무적용, ADVANCED: 동작원리 설명, BASIC: 단순 정의, NONE: 동문서답)',
      enum: Object.values(DepthEval),
    },
    depth_reason: {
      type: 'string',
      description:
        "지식의 깊이에 대한 피드백. (주의: 'BASIC', 'EXPERT' 등 내부 용어를 쓰지 말고, 어떤 원리나 사례가 부족한지 자연스럽게 설명할 것)",
    },
    mentoring_feedback: {
      type: 'string',
      description:
        '지적 + 개선 방향 + 격려. 정답을 직접 알려주기보다 학습해야 할 키워드를 제시.',
    },
    extracted_keywords: {
      type: 'array',
      description:
        '사용자 답변에서 추출한 핵심 기술 키워드(영어). 명명된 기술 엔티티(Named Entity)만 추출.',
      items: {
        type: 'string',
      },
    },
  },
  required: [
    'accuracy_level',
    'accuracy_reason',
    'logic_level',
    'logic_reason',
    'depth_level',
    'depth_reason',
    'mentoring_feedback',
    'extracted_keywords',
  ],
};
