import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import FeedbackSection from "./feedback-section";
import { ReportDetail } from "../../_types/report-detail";
import { Question } from "@/app/daily/questions/_types/types";

const MOCK_QUESTION: Question = {
  id: 1,
  title: "React의 가상 DOM",
  content:
    "React에서 가상 DOM이 무엇인지 설명하고, 왜 사용하는지 말씀해 주세요.",
  ttsUrl: null,
  avgScore: 85,
  avgImportance: 4,
  categoryId: 101,
};

const meta = {
  title: "Report/FeedbackSection",
  component: FeedbackSection,
  parameters: {
    layout: "centered",
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-200 p-6 bg-slate-50">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FeedbackSection>;

export default meta;
type Story = StoryObj<typeof meta>;

// 1. 채점 완료 (성공) 케이스
export const Success: Story = {
  args: {
    attempt: 1,
    status: "COMPLETED",
    question: MOCK_QUESTION,
    data: {
      submissionId: 2,
      questionId: 1,
      date: "2024-01-08 14:30:00",
      status: "COMPLETED",
      sttStatus: "DONE",
      evaluationStatus: "COMPLETED",
      duration: "01:20",
      answerContent: "React는 가상 DOM을 사용하여...",
      totalScore: 90,
      feedback: {
        accuracyReason:
          "핵심 원리인 Reconciliation 과정을 정확하게 기술했습니다.",
        logicReason: "서론-본론-결론의 흐름이 매우 매끄럽습니다.",
        depthReason:
          "단순 정의를 넘어 내부 동작 원리까지 깊이 있게 다루었습니다.",
        feedbackMessage:
          "완벽에 가까운 답변입니다! 특히 Diffing 알고리즘 예시가 좋았습니다.",
        scoreDetails: {
          accuracy: 35,
          logic: 30,
          depth: 20,
          completeness: 5,
          application: 5,
        },
        extractedKeywords: ["가상DOM", "Reconciliation", "Diffing", "렌더링"],
      },
    } satisfies ReportDetail,
  },
};

// 2. STT 진행 중 케이스
export const SttPending: Story = {
  args: {
    attempt: 2,
    status: "PENDING",
    question: MOCK_QUESTION,
    data: {
      submissionId: 3,
      questionId: 1,
      date: "2024-01-09 10:00:00",
      status: "PENDING",
      sttStatus: "PENDING",
      evaluationStatus: "PENDING",
      duration: "00:45",
      answerContent: "",
      totalScore: null,
    } satisfies ReportDetail,
  },
};

// 3. 채점 진행 중 케이스
export const EvaluationPending: Story = {
  args: {
    attempt: 2,
    status: "PENDING",
    question: MOCK_QUESTION,
    data: {
      submissionId: 3,
      questionId: 1,
      date: "2024-01-09 10:05:00",
      status: "PENDING",
      sttStatus: "DONE",
      evaluationStatus: "PENDING",
      duration: "00:45",
      answerContent: "가상 DOM은 실제 DOM의 복사본으로...",
      totalScore: null,
    } satisfies ReportDetail,
  },
};

// 4. STT 실패 케이스
export const SttFailed: Story = {
  args: {
    attempt: 3,
    status: "FAILED",
    question: MOCK_QUESTION,
    data: {
      submissionId: 4,
      questionId: 1,
      date: "2024-01-10 11:00:00",
      status: "FAILED",
      sttStatus: "FAILED",
      evaluationStatus: "PENDING",
      duration: "00:10",
      answerContent: "",
      totalScore: null,
    } satisfies ReportDetail,
  },
};

// 5. 채점 실패 케이스
export const EvaluationFailed: Story = {
  args: {
    attempt: 4,
    status: "FAILED",
    question: MOCK_QUESTION,
    data: {
      submissionId: 5,
      questionId: 1,
      date: "2024-01-11 12:00:00",
      status: "FAILED",
      sttStatus: "DONE",
      evaluationStatus: "FAILED",
      duration: "00:30",
      answerContent: "잘 기억이 나지 않습니다.",
      totalScore: null,
    } satisfies ReportDetail,
  },
};
