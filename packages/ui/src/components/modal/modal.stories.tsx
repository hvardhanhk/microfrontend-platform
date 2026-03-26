import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '../button';

import { Modal } from './modal';

const meta: Meta<typeof Modal> = { title: 'Components/Modal', component: Modal, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Modal</Button>
        <Modal isOpen={open} onClose={() => setOpen(false)} title="Example Modal">
          <p>This is a modal with focus trap and Escape to close.</p>
          <div className="mt-4 flex justify-end">
            <Button onClick={() => setOpen(false)}>Close</Button>
          </div>
        </Modal>
      </>
    );
  },
};
