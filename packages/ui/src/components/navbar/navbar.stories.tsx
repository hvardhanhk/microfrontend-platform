import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '../button';

import { Navbar } from './navbar';

const meta: Meta<typeof Navbar> = {
  title: 'Components/Navbar',
  component: Navbar,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Navbar>;

export const Default: Story = {
  render: () => (
    <Navbar
      logo={<span className="text-lg font-bold">Platform</span>}
      actions={<Button size="sm">Sign In</Button>}
      onMenuClick={() => console.log('menu')}
    />
  ),
};
