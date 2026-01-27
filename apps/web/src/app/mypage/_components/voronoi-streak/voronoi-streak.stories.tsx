import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { YearlyAnswerSubmissions } from "../../_types/streak";
import VoronoiStreak from "./voronoi-streak";

function generateMockSubmissions(count: number): YearlyAnswerSubmissions[] {
  const titles = [
    "두 수의 합",
    "배열 뒤집기",
    "문자열 정렬",
    "이진 탐색",
    "DFS와 BFS",
    "최단 경로",
    "동적 프로그래밍",
    "그리디 알고리즘",
    "스택과 큐",
    "해시맵 활용",
  ];

  return Array.from({ length: count }, (_, i) => {
    const date = new Date(2025, 0, 1);
    date.setDate(date.getDate() + i);
    return {
      id: i + 1,
      submittedAt: date.toISOString(),
      questionid: i + 100,
      title: titles[i % titles.length],
    };
  });
}

const meta = {
  title: "Components/VoronoiStreak",
  component: VoronoiStreak,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    imageSrc: {
      control: "text",
      description: "배경 이미지 URL",
    },
    streakCount: {
      control: { type: "range", min: 0, max: 365, step: 1 },
      description: "제출한 문제 수 (0-365)",
    },
    yearlyAnswerSubmissions: {
      control: false,
      description: "연간 문제 제출 내역",
    },
  },
  args: {
    imageSrc: "/starry-night.jpg",
    streakCount: 0,
    yearlyAnswerSubmissions: [],
  },
  decorators: [
    (Story) => (
      <div className="w-150 h-100">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof VoronoiStreak>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Day1: Story = {
  args: {
    streakCount: 1,
    yearlyAnswerSubmissions: generateMockSubmissions(1),
  },
};

export const Day30: Story = {
  args: {
    streakCount: 30,
    yearlyAnswerSubmissions: generateMockSubmissions(30),
  },
};

export const Day180: Story = {
  args: {
    streakCount: 180,
    yearlyAnswerSubmissions: generateMockSubmissions(180),
  },
};

export const Day365: Story = {
  args: {
    streakCount: 365,
    yearlyAnswerSubmissions: generateMockSubmissions(365),
  },
};
