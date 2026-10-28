import { Table, type TableScrollContainerProps } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import { LoadingBar } from '@/components/uiKit/LoadingBar';
import { useVerticalWheelPassThrough } from '@/hooks/useVerticalWheelPassThrough';
import { TABLE_SCROLL_AREA } from '@/styles/tableScrollArea';

import classes from './TableScroll.module.css';

interface TableScrollProps extends Omit<TableScrollContainerProps, 'scrollAreaProps' | 'type'> {
  /** New rows are on the way (a refetch after a filter, search, sort or page change): the rows dim under a thin bar. */
  loading?: boolean;
  /** The scroll region's name for screen readers; default "Table content". */
  label?: string;
}

// LM3 §14 — `Table.ScrollContainer` plus what needs script: a named scroll region keyboard users can focus, and
// mostly-vertical wheel gestures over it scroll the page instead of stopping on the table.
export function TableScroll({ loading = false, label, children, ...props }: TableScrollProps) {
  const { t } = useTranslation();
  const viewportRef = useVerticalWheelPassThrough<HTMLDivElement>();
  return (
    <div className={classes.frame} data-loading={loading || undefined} aria-busy={loading || undefined}>
      {loading && <LoadingBar />}
      <Table.ScrollContainer
        {...props}
        scrollAreaProps={{
          ...TABLE_SCROLL_AREA,
          viewportRef,
          viewportProps: { role: 'region', 'aria-label': label ?? t('common.tableContent'), tabIndex: 0 },
        }}
      >
        {children}
      </Table.ScrollContainer>
    </div>
  );
}
