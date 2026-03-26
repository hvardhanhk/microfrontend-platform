import type { Meta, StoryObj } from '@storybook/react';

import { Sidebar } from './sidebar';

const meta: Meta<typeof Sidebar> = { title: 'Components/Sidebar', component: Sidebar, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof Sidebar>;

export const Default: Story = {
  render: () => (
    <div className="relative h-96">
      <Sidebar
        isOpen
        items={[
          { label: 'Home', href: '/', isActive: true },
          { label: 'Products', href: '/products' },
          { label: 'Cart', href: '/cart' },
          { label: 'Dashboard', href: '/dashboard' },
        ]}
      />
    </div>
  ),
};
