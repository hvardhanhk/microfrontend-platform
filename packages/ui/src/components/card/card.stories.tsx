import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '../button';

import { Card, CardHeader, CardBody, CardFooter } from './card';

const meta: Meta<typeof Card> = { title: 'Components/Card', component: Card, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card className="max-w-sm">
      <CardHeader><h3 className="text-lg font-semibold">Card Title</h3></CardHeader>
      <CardBody><p className="text-gray-600">Card content goes here.</p></CardBody>
      <CardFooter><Button size="sm">Action</Button></CardFooter>
    </Card>
  ),
};

export const Elevated: Story = {
  render: () => (
    <Card variant="elevated" className="max-w-sm">
      <CardBody><p>Elevated card with shadow.</p></CardBody>
    </Card>
  ),
};
