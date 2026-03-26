import type { Meta, StoryObj } from '@storybook/react';

import { Button } from './button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'outline', 'ghost', 'destructive', 'link'] },
    size: { control: 'select', options: ['sm', 'md', 'lg', 'icon'] },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = { args: { children: 'Button', variant: 'primary' } };
export const Secondary: Story = { args: { children: 'Button', variant: 'secondary' } };
export const Outline: Story = { args: { children: 'Button', variant: 'outline' } };
export const Ghost: Story = { args: { children: 'Button', variant: 'ghost' } };
export const Destructive: Story = { args: { children: 'Delete', variant: 'destructive' } };
export const Loading: Story = { args: { children: 'Saving...', isLoading: true } };
export const Small: Story = { args: { children: 'Small', size: 'sm' } };
export const Large: Story = { args: { children: 'Large', size: 'lg' } };
