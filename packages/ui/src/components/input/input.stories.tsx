import type { Meta, StoryObj } from '@storybook/react';

import { Input } from './input';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = { args: { placeholder: 'Enter text...' } };
export const WithLabel: Story = {
  args: { label: 'Email', placeholder: 'you@example.com', type: 'email' },
};
export const WithError: Story = {
  args: { label: 'Email', value: 'bad', error: 'Invalid email address' },
};
export const WithHint: Story = {
  args: { label: 'Password', type: 'password', hint: 'Must be 8+ characters' },
};
export const Disabled: Story = { args: { label: 'Disabled', value: 'Read only', disabled: true } };
