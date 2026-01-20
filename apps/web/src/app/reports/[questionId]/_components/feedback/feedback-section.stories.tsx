import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import FeedbackSection from "./feedback-section";
import { ReportDetail } from "../../_types/report-detail";

const meta = {
  title: "Report/FeedbackSection",
  component: FeedbackSection,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof FeedbackSection>;

export default meta;
type Story = StoryObj<typeof meta>;

// 1. 채점 완료 (성공) 케이스
export const Success: Story = {
  args: {
    attempt: 1,
    status: "COMPLETED",
    data: {
      submissionId: 2,
      questionId: 1,
      date: "2024-01-08",
      status: "COMPLETED",
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

// 2. 채점 진행 중 (Pending) 케이스
export const Pending: Story = {
  args: {
    attempt: 1,
    status: "PENDING",
    data: {
      submissionId: 3,
      questionId: 1,
      date: "2024-01-09",
      status: "PENDING",
      duration: "00:00",
      answerContent: "React는 가상 DOM을 사용하여...",
      totalScore: null,
    } satisfies ReportDetail,
  },
};

// 3. 채점 실패 (Error) 케이스
export const Failed: Story = {
  args: {
    attempt: 1,
    status: "FAILED",
    data: {
      submissionId: 1,
      questionId: 1,
      date: "2024-01-06",
      status: "FAILED",
      duration: "00:00",
      answerContent: "React는 가상 DOM을 사용하여...",
      totalScore: null,
      reason: "STT 변환 서버 응답 지연으로 인해 채점에 실패했습니다.",
    } satisfies ReportDetail,
  },
};
