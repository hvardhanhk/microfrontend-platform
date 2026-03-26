import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '../button';

import { Toast, ToastProvider, useToast } from './toast';

const meta: Meta<typeof Toast> = { title: 'Components/Toast', component: Toast, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof Toast>;

const Demo = () => {
  const { showToast } = useToast();
  return (
    <div className="flex gap-2">
      <Button onClick={() => showToast({ type: 'success', message: 'Item saved!' })}>Success</Button>
      <Button onClick={() => showToast({ type: 'error', message: 'Something failed' })} variant="destructive">Error</Button>
      <Button onClick={() => showToast({ type: 'info', message: 'New version available' })} variant="secondary">Info</Button>
    </div>
  );
};

export const Default: Story = {
  render: () => <ToastProvider><Demo /></ToastProvider>,
};
