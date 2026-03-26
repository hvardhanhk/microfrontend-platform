import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Switch } from './switch';

const meta: Meta<typeof Switch> = { title: 'Components/Switch', component: Switch, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  render: () => {
    const [on, setOn] = useState(false);
    return <Switch checked={on} onChange={setOn} label="Enable notifications" />;
  },
};
export const Disabled: Story = { args: { checked: true, onChange: () => {}, disabled: true, label: 'Locked' } };
