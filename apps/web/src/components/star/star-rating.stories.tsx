import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StarRating } from "./star-rating";
import * as React from "react";

const meta: Meta<typeof StarRating> = {
  title: "Components/StarRating",
  component: StarRating,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    value: { control: { type: "number", min: 0, max: 5, step: 0.1 } },
    readOnly: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof StarRating>;

const StarRatingWithState = (args: React.ComponentProps<typeof StarRating>) => {
  const [val, setVal] = React.useState(args.value ?? 0);
  return <StarRating {...args} value={val} onChange={setVal} />;
};

export const Interactive: Story = {
  render: (args) => <StarRatingWithState {...args} />,
  args: {
    max: 5,
    value: 0,
  },
};

export const HighScoreExample: Story = {
  render: (args) => <StarRatingWithState {...args} />,
  args: {
    max: 5,
    value: 4.7,
  },
};
