import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '../button';

import { Tooltip } from './tooltip';

const meta: Meta<typeof Tooltip> = { title: 'Components/Tooltip', component: Tooltip, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Top: Story = { render: () => <Tooltip content="Tooltip text"><Button>Hover me</Button></Tooltip> };
export const Bottom: Story = { render: () => <Tooltip content="Below" position="bottom"><Button>Hover</Button></Tooltip> };
