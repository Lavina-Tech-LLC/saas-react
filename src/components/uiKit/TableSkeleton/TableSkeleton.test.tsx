import { Table } from '@mantine/core';

import { render, screen } from '@/test/index';

import { TableSkeleton } from './TableSkeleton';

describe('TableSkeleton', () => {
  it('fills the body with the given rows and columns under the real header', () => {
    render(
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Total</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <TableSkeleton columns={3} rows={4} />
      </Table>,
    );
    expect(screen.getByRole('columnheader', { name: 'Status' })).toBeInTheDocument();
    const rows = screen.getAllByRole('row').slice(1);
    expect(rows).toHaveLength(4);
    expect(rows[0].querySelectorAll('td')).toHaveLength(3);
  });
});
