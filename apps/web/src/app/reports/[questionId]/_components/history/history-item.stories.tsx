import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import HistoryItem from "./history-item";
import { ReportHistoryItem } from "../../_types/report-detail";

const MOCK_COMPLETED_ITEM: ReportHistoryItem = {
  submissionId: 1,
  questionId: 101,
  date: "2023-10-27 14:30:00",
  duration: "35s",
  answerContent: "HTTP는 평문 통신이고 HTTPS는 TLS로 암호화된 통신입니다.",
  status: "COMPLETED",
  sttStatus: "DONE",
  evaluationStatus: "COMPLETED",
  totalScore: 85,
  displayIndex: 1,
};

const MOCK_PENDING_ITEM: ReportHistoryItem = {
  submissionId: 2,
  questionId: 101,
  date: "2023-10-27 15:45:00",
  duration: "45s",
  answerContent: "REST API는 자원을 이름으로 구분하여...",
  status: "PENDING",
  sttStatus: "DONE",
  evaluationStatus: "PENDING",
  totalScore: null,
  displayIndex: 2,
};

const MOCK_FAILED_ITEM: ReportHistoryItem = {
  submissionId: 3,
  questionId: 101,
  date: "2023-10-27 16:10:00",
  duration: "10s",
  answerContent: "잘 모르겠습니다.",
  status: "FAILED",
  sttStatus: "FAILED",
  evaluationStatus: "FAILED",
  totalScore: null,
  displayIndex: 3,
};

const meta: Meta<typeof HistoryItem> = {
  title: "Report/HistoryItem",
  component: HistoryItem,
  tags: ["autodocs"],
  argTypes: {
    isSelected: {
      control: "boolean",
    },
    index: {
      control: "number",
    },
  },
  decorators: [
    (Story) => (
      <div className="w-80 p-4 bg-slate-50">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof HistoryItem>;

// 기본 (완료 상태)
export const Default: Story = {
  args: {
    item: MOCK_COMPLETED_ITEM,
    isSelected: false,
    href: "?attempt=1",
    index: 1,
  },
};

// 선택된 상태
export const Selected: Story = {
  args: {
    item: MOCK_COMPLETED_ITEM,
    isSelected: true,
    href: "?attempt=1",
    index: 1,
  },
};

// 채점 대기 중 (Pending)
export const Pending: Story = {
  args: {
    item: MOCK_PENDING_ITEM,
    isSelected: false,
    href: "?attempt=2",
    index: 2,
  },
};

// 채점 실패 (Failed)
export const Failed: Story = {
  args: {
    item: MOCK_FAILED_ITEM,
    isSelected: false,
    href: "?attempt=3",
    index: 3,
  },
};

export const LongHistory: Story = {
  decorators: [
    (Story) => (
      <div className="flex flex-col gap-2 w-[320px] p-4 bg-slate-50">
        <Story />
        <HistoryItem
          item={{ ...MOCK_COMPLETED_ITEM, displayIndex: 2 }}
          isSelected={false}
          href="?attempt=2"
          index={2}
        />
        <HistoryItem
          item={{ ...MOCK_PENDING_ITEM, displayIndex: 3 }}
          isSelected={false}
          href="?attempt=3"
          index={3}
        />
      </div>
    ),
  ],
  args: {
    item: MOCK_COMPLETED_ITEM,
    isSelected: true,
    href: "?attempt=1",
    index: 1,
  },
};
