import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '../button';

import { Dropdown } from './dropdown';

const meta: Meta<typeof Dropdown> = { title: 'Components/Dropdown', component: Dropdown, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof Dropdown>;

export const Default: Story = {
  render: () => (
    <Dropdown
      trigger={<Button variant="outline">Options</Button>}
      items={[
        { label: 'Edit', onClick: () => console.log('edit') },
        { label: 'Duplicate', onClick: () => console.log('dup') },
        { label: 'Delete', onClick: () => console.log('del') },
      ]}
    />
  ),
};
