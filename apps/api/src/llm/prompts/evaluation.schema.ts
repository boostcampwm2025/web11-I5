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
      description: '핵심 개념의 정확성 평가 등급. (내부 계산용)',
      enum: Object.values(AccuracyEval),
    },
    accuracy_reason: {
      type: 'string',
      description:
        "지원자에게 전하는 팩트 피드백. (주의: '점수', '등급', '감점' 등을 절대 언급하지 말고, 어떤 기술적 내용이 정확했고 어떤 부분이 보완되어야 하는지 구체적인 용어로 조언할 것)",
    },
    logic_level: {
      type: 'string',
      description: '논리적 구조와 문장 완결성 평가 등급. (내부 계산용)',
      enum: Object.values(LogicEval),
    },
    logic_reason: {
      type: 'string',
      description:
        "지원자에게 전하는 논리/구조 피드백. (주의: 'FLAWLESS에 미달하여' 같은 평가 근거를 설명하지 말고, 문장의 연결이나 설명 순서를 어떻게 고치면 더 설득력이 생길지 구체적으로 제안할 것)",
    },
    depth_level: {
      type: 'string',
      description: '지식의 깊이와 응용력 평가 등급. (내부 계산용)',
      enum: Object.values(DepthEval),
    },
    depth_reason: {
      type: 'string',
      description:
        '지원자에게 전하는 심화 학습 가이드. (주의: 등급 비교 금지. 실무 적용 사례나 동작 원리(How/Why) 중 어떤 내용을 더 공부하면 시니어급 답변이 될지 추천할 것)',
    },
    mentoring_feedback: {
      type: 'string',
      description:
        '종합적인 총평. (지적 + 개선 방향 + 격려). 정답을 직접 알려주기보다는 학습 방향성을 제시할 것.',
    },
    extracted_keywords: {
      type: 'array',
      description:
        '사용자 답변에서 추출한 핵심 기술 키워드. (고유 명사는 영어 원문, 일반 개념은 통용되는 표기법 사용. 최대 5개)',
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
