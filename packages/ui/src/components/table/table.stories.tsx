import type { Meta, StoryObj } from '@storybook/react';

import { Table, TableHead, TableBody, TableRow, TableCell } from './table';

const meta: Meta<typeof Table> = {
  title: 'Components/Table',
  component: Table,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Table>;

export const Default: Story = {
  render: () => (
    <Table striped>
      <TableHead>
        <TableRow>
          <TableCell as="th">Name</TableCell>
          <TableCell as="th">Email</TableCell>
          <TableCell as="th">Role</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {['Alice', 'Bob', 'Charlie'].map((name) => (
          <TableRow key={name}>
            <TableCell>{name}</TableCell>
            <TableCell>{name.toLowerCase()}@example.com</TableCell>
            <TableCell>User</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};
