import type { Meta, StoryObj } from '@storybook/react';

import { Accordion, AccordionItem } from './accordion';

const meta: Meta<typeof Accordion> = { title: 'Components/Accordion', component: Accordion, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof Accordion>;

export const Default: Story = {
  render: () => (
    <Accordion>
      <AccordionItem title="Section 1" defaultOpen>Content for section 1</AccordionItem>
      <AccordionItem title="Section 2">Content for section 2</AccordionItem>
      <AccordionItem title="Section 3">Content for section 3</AccordionItem>
    </Accordion>
  ),
};
