import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '../button';
import { Input } from '../input';

import { Form, FormField, FormLabel, FormMessage } from './form';

const meta: Meta<typeof Form> = { title: 'Components/Form', component: Form, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof Form>;

export const Default: Story = {
  render: () => (
    <Form className="max-w-sm">
      <FormField>
        <FormLabel htmlFor="email">Email</FormLabel>
        <Input id="email" type="email" placeholder="you@example.com" />
      </FormField>
      <FormField>
        <FormLabel htmlFor="pw">Password</FormLabel>
        <Input id="pw" type="password" />
        <FormMessage>Password must be 8+ characters</FormMessage>
      </FormField>
      <Button type="submit">Submit</Button>
    </Form>
  ),
};
