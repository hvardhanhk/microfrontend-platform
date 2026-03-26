import type { Meta, StoryObj } from '@storybook/react';

import { Avatar } from './avatar';

const meta: Meta<typeof Avatar> = { title: 'Components/Avatar', component: Avatar, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof Avatar>;

export const WithImage: Story = { args: { name: 'Jane Doe', src: 'https://picsum.photos/seed/av/100/100', size: 'md' } };
export const Fallback: Story = { args: { name: 'Jane Doe', size: 'lg' } };
export const Small: Story = { args: { name: 'JD', size: 'sm' } };
