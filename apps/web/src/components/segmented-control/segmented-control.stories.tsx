import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { SegmentedControl } from "./segmented-control";

const meta = {
  title: "Components/SegmentedControl",
  component: SegmentedControl,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "radio",
      options: ["default", "sm", "lg"],
      description: "컨트롤의 크기를 설정합니다.",
      table: {
        defaultValue: { summary: "default" },
      },
    },
    value: {
      control: "text",
      description: "현재 선택된 값입니다.",
    },
    options: {
      control: "object",
      description: "선택 가능한 옵션 목록입니다.",
    },
    onChange: {
      action: "changed",
      description: "값이 변경될 때 호출되는 함수입니다.",
    },
  },
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

const SegmentedControlWithState = ({
  value: initialValue,
  onChange,
  ...props
}: React.ComponentProps<typeof SegmentedControl>) => {
  const [value, setValue] = useState(initialValue);

  const handleChange = (newValue: string) => {
    setValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  return <SegmentedControl {...props} value={value} onChange={handleChange} />;
};

export const Default: Story = {
  args: {
    size: "default",
    value: "all",
    options: [
      { label: "전체", value: "all" },
      { label: "푼 문제", value: "solved" },
      { label: "안 푼 문제", value: "unsolved" },
    ],
    onChange: () => {},
  },
  render: (args) => <SegmentedControlWithState {...args} />,
};

export const Small: Story = {
  args: {
    ...Default.args,
    size: "sm",
  },
  render: (args) => <SegmentedControlWithState {...args} />,
};

export const Large: Story = {
  args: {
    ...Default.args,
    size: "lg",
  },
  render: (args) => <SegmentedControlWithState {...args} />,
};

export const TwoOptions: Story = {
  args: {
    size: "default",
    value: "daily",
    options: [
      { label: "데일리", value: "daily" },
      { label: "모의면접", value: "mock" },
    ],
    onChange: () => {},
  },
  render: (args) => <SegmentedControlWithState {...args} />,
};

export const FourOptions: Story = {
  args: {
    size: "default",
    value: "frontend",
    options: [
      { label: "Frontend", value: "frontend" },
      { label: "Backend", value: "backend" },
      { label: "Database", value: "database" },
      { label: "Network", value: "network" },
    ],
    onChange: () => {},
  },
  render: (args) => <SegmentedControlWithState {...args} />,
};

export const WithDisabled: Story = {
  args: {
    size: "default",
    value: "all",
    options: [
      { label: "전체", value: "all" },
      { label: "푼 문제", value: "solved" },
      { label: "안 푼 문제", value: "unsolved", disabled: true },
    ],
    onChange: () => {},
  },
  render: (args) => <SegmentedControlWithState {...args} />,
};
