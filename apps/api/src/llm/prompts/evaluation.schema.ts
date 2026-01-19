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
      enum: Object.values(AccuracyEval),
      description:
        '최우선 순위. 키워드 부재/왜곡은 WRONG, 사소한 혼동은 MINOR_ERROR.',
    },
    accuracy_reason: {
      type: 'string',
      description:
        '사용자 답변 중 어떤 문구가 Golden Standard의 키워드와 일치하거나 어긋나는지 구체적 명시.',
    },
    logic_level: {
      type: 'string',
      enum: Object.values(LogicEval),
      description: '인과관계 존재 시 CLEAR, 단순 나열은 NONE.',
    },
    logic_reason: {
      type: 'string',
      description: '인과관계가 드러난 연결 고리 분석.',
    },
    depth_level: {
      type: 'string',
      enum: Object.values(DepthEval),
      description:
        'How/Why/비교 설명 중 하나라도 있으면 DEEP, 정의만 있으면 BASIC.',
    },
    depth_reason: {
      type: 'string',
      description: '동작 원리나 이유를 설명한 문구 인용.',
    },
    is_complete_sentence: {
      type: 'boolean',
      description: '마침표나 종결 어미가 포함된 문장이 하나라도 있는가?',
    },
    has_application: {
      type: 'boolean',
      description: '실무/프로젝트 적용 경험이나 실제 사례 언급 시에만 true.',
    },
    mentoring_feedback: {
      type: 'string',
      description: '지적+개선방향+격려. 학습 키워드를 제시할 것.',
    },
    extracted_keywords: {
      type: 'array',
      items: {
        type: 'string',
      },
      description:
        '사용자 답변에서 추출한 핵심 기술 키워드 목록 (영어).' +
        'Golden Standard의 key terminology 외에도 문제 맥락과 직접적으로 관련된 중요한 개념을 포함할 수 있음.' +
        '사용자가 실제로 언급한 개념만 추출하며, 추론이나 보강은 금지.',
    },
  },
  required: [
    'accuracy_level',
    'accuracy_reason',
    'logic_level',
    'logic_reason',
    'depth_level',
    'depth_reason',
    'is_complete_sentence',
    'has_application',
    'mentoring_feedback',
  ],
};
