import type { SubmissionDTO } from "@/app/reports/[questionId]/_types/submission-dto";
import type { EvaluationDTO } from "@/app/reports/[questionId]/_types/evaluation-dto";

export const mockSubmissions: SubmissionDTO[] = [
  // 1. 평가 완료 - 높은 점수 (85점) - VOICE 입력
  {
    id: 1,
    questionId: 1,
    submittedAt: "2024-01-29T10:30:00Z",
    duration: 180,
    answerContent:
      "TCP는 연결 지향적이고 신뢰성 있는 프로토콜입니다. 3-way handshake를 통해 연결을 수립하고, 데이터 전송 시 순서를 보장하며 오류를 검출하고 재전송합니다. 반면 UDP는 비연결형 프로토콜로 빠른 전송이 가능하지만 신뢰성을 보장하지 않습니다.",
    evaluationStatus: "COMPLETED",
    sttStatus: "DONE",
    inputType: "VOICE",
    totalScore: 85,
    audioAssetId: 1,
  },
  // 2. 평가 완료 - 낮은 점수 (25점) - TEXT 입력 (코어 키워드 미표시)
  {
    id: 2,
    questionId: 1,
    submittedAt: "2024-01-26T14:20:00Z",
    duration: 120,
    answerContent: "TCP는 연결형이고 UDP는 비연결형입니다.",
    evaluationStatus: "COMPLETED",
    sttStatus: "DONE",
    inputType: "TEXT",
    totalScore: 25,
    audioAssetId: null,
  },
  // 3. 평가 진행 중 - STT 진행 중
  {
    id: 3,
    questionId: 1,
    submittedAt: "2024-01-28T09:15:00Z",
    duration: 150,
    answerContent: "",
    evaluationStatus: "PENDING",
    sttStatus: "IN_PROGRESS",
    inputType: "VOICE",
    totalScore: null,
    audioAssetId: 2,
  },
  // 4. 평가 진행 중 - 채점 진행 중
  {
    id: 4,
    questionId: 1,
    submittedAt: "2024-01-28T11:00:00Z",
    duration: 200,
    answerContent:
      "TCP는 전송 제어 프로토콜로 연결 지향적이며 신뢰성을 보장합니다.",
    evaluationStatus: "PENDING",
    sttStatus: "DONE",
    inputType: "TEXT",
    totalScore: null,
    audioAssetId: null,
  },
  // 5. 평가 실패 - STT 실패
  {
    id: 5,
    questionId: 1,
    submittedAt: "2024-01-25T16:45:00Z",
    duration: 100,
    answerContent: "",
    evaluationStatus: "PENDING",
    sttStatus: "FAILED",
    inputType: "VOICE",
    totalScore: null,
    audioAssetId: 3,
  },
  // 6. 평가 실패 - 채점 실패
  {
    id: 6,
    questionId: 1,
    submittedAt: "2024-01-24T13:30:00Z",
    duration: 160,
    answerContent: "TCP와 UDP는 전송 계층 프로토콜입니다.",
    evaluationStatus: "FAILED",
    sttStatus: "DONE",
    inputType: "TEXT",
    totalScore: null,
    audioAssetId: null,
  },
];

// Mock Evaluations
export const mockEvaluations: Record<number, EvaluationDTO> = {
  // Submission ID 1의 평가 결과 (85점)
  1: {
    id: 1,
    submissionId: 1,
    feedbackMessage:
      "TCP와 UDP의 핵심 차이점을 잘 설명했습니다. 연결 지향성, 신뢰성, 3-way handshake 등 중요한 개념을 정확하게 다뤘습니다. 다만 흐름 제어나 혼잡 제어 등의 추가적인 차이점을 언급했다면 더 완벽했을 것입니다.",
    coreConceptEval: "CORRECT",
    coverageEval: "COMPLETE",
    logicEval: "CLEAR",
    depthEval: "ADVANCED",
    detailAnalysis: {
      coreConcept:
        "TCP의 연결 지향성과 신뢰성, UDP의 비연결형 특성을 정확하게 설명했습니다. 3-way handshake, 순서 보장, 오류 검출 등 핵심 메커니즘을 구체적으로 언급했습니다.",
      coverage:
        "주요 차이점인 연결 방식, 신뢰성, 속도, 오류 처리를 모두 다뤘습니다. 실무에서 필요한 핵심 내용을 충분히 커버했습니다.",
      logic:
        "TCP와 UDP를 대조하며 각각의 특징을 논리적으로 설명했습니다. 연결성 → 신뢰성 → 성능 순서로 자연스럽게 전개되었습니다.",
      depth:
        "단순 나열을 넘어 3-way handshake, 순서 보장, 재전송 등 구체적인 메커니즘을 언급하여 깊이 있는 이해를 보여줬습니다.",
    },
    scoreDetails: {
      coreConcept: 45,
      coverage: 18,
      logic: 9,
      depth: 13,
    },
    extractedKeywords: [
      "TCP",
      "UDP",
      "연결 지향",
      "신뢰성",
      "3-way handshake",
      "순서 보장",
      "오류 검출",
      "재전송",
      "비연결형",
      "빠른 전송",
    ],
    createdAt: "2024-01-27T10:31:00Z",
  },
  // Submission ID 2의 평가 결과 (25점)
  2: {
    id: 2,
    submissionId: 2,
    feedbackMessage:
      "TCP와 UDP의 가장 기본적인 차이점만 언급했습니다. 연결형과 비연결형이라는 구분은 맞지만, 왜 그런 차이가 있는지, 각각 어떤 상황에서 사용되는지에 대한 설명이 부족합니다. 좀 더 구체적인 메커니즘과 사용 사례를 추가하면 좋겠습니다.",
    coreConceptEval: "MINOR_ERROR",
    coverageEval: "MINIMAL",
    logicEval: "WEAK",
    depthEval: "NONE",
    detailAnalysis: {
      coreConcept:
        "연결형과 비연결형이라는 기본 구분은 정확하지만, 신뢰성, 순서 보장, 오류 처리 등 핵심 차이점이 누락되었습니다.",
      coverage:
        "가장 기본적인 차이점만 언급했습니다. 신뢰성, 속도, 헤더 구조, 사용 사례 등 중요한 내용이 빠져있습니다.",
      logic: "단순히 두 프로토콜을 구분만 했을 뿐, 논리적인 설명이 부족합니다.",
      depth:
        "표면적인 차이만 언급했습니다. 구체적인 메커니즘이나 원리에 대한 설명이 없습니다.",
    },
    scoreDetails: {
      coreConcept: 15,
      coverage: 5,
      logic: 3,
      depth: 2,
    },
    extractedKeywords: [],
    createdAt: "2024-01-26T14:21:00Z",
  },
};

// Mock Question (리포트 페이지에서 사용)
export const mockReportQuestion = {
  id: 1,
  title: "TCP와 UDP의 차이점을 설명하세요",
  content:
    "네트워크 프로토콜인 TCP와 UDP의 차이점을 설명해주세요. 각각의 특징과 사용 사례를 포함하여 답변해주세요.",
  categoryId: 11,
  category: {
    id: 11,
    name: "TCP/IP",
    depth: 1,
    parentId: 1,
    parent: {
      id: 1,
      name: "네트워크",
      depth: 0,
      parentId: null,
    },
  },
  avgScore: 75,
  avgImportance: 4.5,
  ttsUrl: null,
};
