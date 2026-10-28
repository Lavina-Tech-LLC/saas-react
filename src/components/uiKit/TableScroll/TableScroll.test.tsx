import { Table } from '@mantine/core';

import { render, screen } from '@/test/index';

import { TableScroll } from './TableScroll';

function Demo({ loading }: { loading?: boolean }) {
  return (
    <TableScroll minWidth={480} loading={loading}>
      <Table>
        <Table.Tbody>
          <Table.Tr>
            <Table.Td>Aziz Karimov</Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>
    </TableScroll>
  );
}

describe('TableScroll', () => {
  it('makes the scroll area a named region keyboard users can focus', () => {
    render(<Demo />);
    const region = screen.getByRole('region', { name: 'Table content' });

    expect(region).toHaveAttribute('tabindex', '0');
    expect(region).toContainElement(screen.getByText('Aziz Karimov'));
  });

  it('takes its own region name', () => {
    render(
      <TableScroll minWidth={480} label="Orders">
        <Table />
      </TableScroll>,
    );
    expect(screen.getByRole('region', { name: 'Orders' })).toBeInTheDocument();
  });

  it('marks the table busy with the loading bar while new rows load', () => {
    const { rerender } = render(<Demo loading />);
    const frame = screen.getByRole('region').closest<HTMLElement>('[aria-busy]')!;

    expect(frame).toHaveAttribute('aria-busy', 'true');
    expect(frame).toHaveAttribute('data-loading');
    expect(frame.querySelector(':scope > [aria-hidden]')).toBeInTheDocument();

    rerender(<Demo />);
    expect(frame).not.toHaveAttribute('aria-busy');
    expect(frame.querySelector(':scope > [aria-hidden]')).not.toBeInTheDocument();
  });
});
