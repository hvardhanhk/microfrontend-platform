import type { Meta, StoryObj } from '@storybook/react';

import { Skeleton } from './skeleton';

const meta: Meta<typeof Skeleton> = {
  title: 'Components/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Text: Story = { args: { variant: 'text', width: 200 } };
export const Circular: Story = { args: { variant: 'circular', width: 48, height: 48 } };
export const Rectangular: Story = { args: { variant: 'rectangular', width: 300, height: 200 } };
