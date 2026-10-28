import { Skeleton, Table } from '@mantine/core';

// Varied bar widths so the placeholder reads like real cells, not a grid of equal blocks
const WIDTHS = ['70%', '45%', '85%', '55%', '35%', '65%'];

interface TableSkeletonProps {
  /** Number of columns — match the table's header. */
  columns: number;
  /** Placeholder rows; default 5. */
  rows?: number;
}

// LM3 §14 — a loading table: put it in place of Table.Tbody, under the real Table.Thead, so the header and the
// column widths are already there and nothing jumps when the data arrives
export function TableSkeleton({ columns, rows = 5 }: TableSkeletonProps) {
  return (
    <Table.Tbody aria-busy="true">
      {Array.from({ length: rows }, (_, r) => (
        <Table.Tr key={r}>
          {Array.from({ length: columns }, (_, c) => (
            <Table.Td key={c}>
              <Skeleton h={12} radius="xl" w={WIDTHS[(r + c) % WIDTHS.length]} my={6} />
            </Table.Td>
          ))}
        </Table.Tr>
      ))}
    </Table.Tbody>
  );
}
