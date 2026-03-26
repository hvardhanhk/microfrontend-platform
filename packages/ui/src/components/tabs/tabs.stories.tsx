import type { Meta, StoryObj } from '@storybook/react';

import { Tabs, TabList, Tab, TabPanel } from './tabs';

const meta: Meta<typeof Tabs> = { title: 'Components/Tabs', component: Tabs, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: () => (
    <Tabs defaultIndex={0}>
      <TabList>
        <Tab>Tab 1</Tab>
        <Tab>Tab 2</Tab>
        <Tab>Tab 3</Tab>
      </TabList>
      <TabPanel>
        <div className="p-4">Content for Tab 1</div>
      </TabPanel>
      <TabPanel>
        <div className="p-4">Content for Tab 2</div>
      </TabPanel>
      <TabPanel>
        <div className="p-4">Content for Tab 3</div>
      </TabPanel>
    </Tabs>
  ),
};
