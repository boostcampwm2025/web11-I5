import {
  CoreConceptEval,
  CoverageEval,
  LogicEval,
  DepthEval,
} from '../../answer-evaluation/answer-evaluation.constants';

export const EVALUATION_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    core_concept_level: {
      type: 'string',
      description:
        '핵심 개념의 정확성. CORRECT: 개념이 정확, MINOR_ERROR: 용어 혼동/작은 실수, WRONG: 개념 자체가 틀림. (내부 계산용)',
      enum: Object.values(CoreConceptEval),
    },
    core_concept_reason: {
      type: 'string',
      description:
        "답변의 핵심 개념이 정확한지 평가하고, 개념적으로 잘못 이해한 지점을 구체적으로 설명하십시오. '점수', '등급' 등의 표현은 사용하지 마십시오.",
    },
    coverage_level: {
      type: 'string',
      description:
        '설명의 완성도/범위. 모범답안의 내용을 얼마나 포함했는가. COMPLETE: 주요 포인트 대부분, ADEQUATE: 핵심만, MINIMAL: 최소한만. (내부 계산용)',
      enum: Object.values(CoverageEval),
    },
    coverage_reason: {
      type: 'string',
      description:
        '답변이 모범답안의 내용을 얼마나 포함했는지 평가하고, 추가로 언급하면 좋을 내용을 제안하십시오.',
    },
    logic_level: {
      type: 'string',
      description:
        '설명의 구조적 완결성과 논리 흐름에 대한 평가. 정확성과는 독립적으로 판단함. (내부 계산용)',
      enum: Object.values(LogicEval),
    },
    logic_reason: {
      type: 'string',
      description:
        '설명 순서, 인과 관계, 문장 연결 측면에서 개선하면 더 명확해질 부분을 구체적으로 제안하십시오. 평가 등급이나 비교 표현은 사용하지 마십시오.',
    },
    depth_level: {
      type: 'string',
      description:
        '지식의 깊이 평가 (보통 신입 vs 최상 신입의 구분선). ADVANCED: 원리(How)/이유(Why)/비교/적용 중 2개 이상 명확히 설명. BASIC: 정의 수준 + 하나의 요소만 언급. NONE: 단순 정의만 나열. (내부 계산용)',
      enum: Object.values(DepthEval),
    },
    depth_reason: {
      type: 'string',
      description:
        '답변의 깊이를 평가하고, 더 발전시키기 위해 추가로 고민해볼 원리, 실무 맥락, 비교 관점을 제안하십시오. 정답을 직접 제시하지 마십시오.',
    },

    mentoring_feedback: {
      type: 'string',
      description:
        '전체적인 총평. 정확성, 논리, 깊이를 종합하여 강점과 개선 방향을 함께 제시하십시오. 격려를 포함하되 정답을 직접 알려주지는 마십시오.',
    },

    extracted_keywords: {
      type: 'array',
      description:
        '사용자 답변에 실제로 등장한 핵심 기술 키워드. AI가 추론하여 새로운 개념을 추가하지 마십시오. 최대 5개.',
      items: {
        type: 'string',
      },
      maxItems: 5,
    },
  },

  required: [
    'core_concept_level',
    'core_concept_reason',
    'coverage_level',
    'coverage_reason',
    'logic_level',
    'logic_reason',
    'depth_level',
    'depth_reason',
    'mentoring_feedback',
    'extracted_keywords',
  ],
};
