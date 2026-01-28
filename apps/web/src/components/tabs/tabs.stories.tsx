import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";

const meta = {
  title: "Components/Tabs",
  component: Tabs,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-125">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="tab1" className="w-full">
      <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        <TabsTrigger value="tab3">Tab 3</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <div className="p-4">
          <p>Tab 1 content</p>
        </div>
      </TabsContent>
      <TabsContent value="tab2">
        <div className="p-4">
          <p>Tab 2 content</p>
        </div>
      </TabsContent>
      <TabsContent value="tab3">
        <div className="p-4">
          <p>Tab 3 content</p>
        </div>
      </TabsContent>
    </Tabs>
  ),
};

export const TwoTabs: Story = {
  render: () => (
    <Tabs defaultValue="feedback" className="w-full">
      <TabsList>
        <TabsTrigger value="feedback">분석 리포트</TabsTrigger>
        <TabsTrigger value="answer">답변 스크립트</TabsTrigger>
      </TabsList>
      <TabsContent value="feedback">
        <div className="p-6">
          <h3 className="font-bold mb-2">분석 리포트</h3>
          <p className="text-slate-600">
            답변에 대한 AI 분석 결과가 여기에 표시됩니다.
          </p>
        </div>
      </TabsContent>
      <TabsContent value="answer">
        <div className="p-6">
          <h3 className="font-bold mb-2">답변 스크립트</h3>
          <p className="text-slate-600">
            사용자의 답변 원문이 여기에 표시됩니다.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  ),
};

export const WithDisabled: Story = {
  render: () => (
    <Tabs defaultValue="tab1" className="w-full">
      <TabsList>
        <TabsTrigger value="tab1">활성화</TabsTrigger>
        <TabsTrigger value="tab2" disabled>
          비활성화
        </TabsTrigger>
        <TabsTrigger value="tab3">활성화</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <div className="p-4">
          <p>첫 번째 탭 콘텐츠</p>
        </div>
      </TabsContent>
      <TabsContent value="tab3">
        <div className="p-4">
          <p>세 번째 탭 콘텐츠</p>
        </div>
      </TabsContent>
    </Tabs>
  ),
};
