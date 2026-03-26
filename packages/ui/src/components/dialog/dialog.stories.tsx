import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '../button';

import { Dialog } from './dialog';

const meta: Meta<typeof Dialog> = { title: 'Components/Dialog', component: Dialog, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof Dialog>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Delete Item</Button>
        <Dialog
          isOpen={open}
          onClose={() => setOpen(false)}
          onConfirm={() => { console.log('confirmed'); setOpen(false); }}
          title="Delete Item?"
          description="This action cannot be undone."
          variant="destructive"
          confirmLabel="Delete"
        />
      </>
    );
  },
};
