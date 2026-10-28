import { ActionIcon, Drawer, Group, Text, type DrawerProps } from '@mantine/core';
import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { DialogScroll, OwnScroll } from '@/components/uiKit/AppModal';

import classes from './Sheets.module.css';

interface SideSheetProps extends Omit<DrawerProps, 'position' | 'title' | 'size'> {
  title: string;
  /** Back arrow before the title — for a sheet that opened from another sheet. */
  onBack?: () => void;
  /** Action bar pinned to the bottom, start-aligned (M3): the main action first, then Cancel outlined (variant="default"). */
  actions?: ReactNode;
  /** Width on wide screens — 400 (M3) by default; phones always get the full width. */
  width?: number;
}

const SURFACE = 'var(--m3-surface-container-low)';
// M3 modal side sheet: the surface container low with 16px corners on its open edge (theme radius), a 24px headline
// small title 24px in, the ✕ at the end; a column of the header, the scroller and the action bar
const LAYOUT = {
  content: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    backgroundColor: SURFACE,
    '--fl-bg': SURFACE,
  },
  header: { flexShrink: 0, backgroundColor: SURFACE, padding: '16px 12px 8px var(--mantine-spacing-lg)' },
  title: { fontSize: '1.5rem', lineHeight: '2rem', fontWeight: 500 },
  body: { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', padding: 0 },
} as const;

/**
 * LM3 §20 — M3 modal side sheet. The kit prefers a BottomSheet for filters and short forms on every screen; a side
 * sheet is for content read beside the page. Drawer props come last, so a caller can still replace `styles`.
 */
export function SideSheet({
  title,
  onBack,
  actions,
  width = 400,
  closeButtonProps,
  children,
  ...props
}: SideSheetProps) {
  const { t } = useTranslation();

  return (
    <Drawer
      position="right"
      size={`min(${width}px, 100vw)`}
      // Mantine gives the ✕ no name
      closeButtonProps={{ 'aria-label': t('common.close'), ...closeButtonProps }}
      title={
        <Group gap="xs" wrap="nowrap">
          {onBack && (
            <ActionIcon variant="standard" size="input-sm" aria-label={t('common.back')} onClick={onBack}>
              <ArrowLeft size={20} />
            </ActionIcon>
          )}
          <Text inherit truncate>
            {title}
          </Text>
        </Group>
      }
      styles={LAYOUT}
      // The body lays out its own scroller (DialogScroll) above the action bar
      scrollAreaComponent={OwnScroll}
      {...props}
    >
      <DialogScroll className={classes.body} noLineBelow>
        {children}
      </DialogScroll>
      {actions && (
        <Group gap="sm" className={classes.actions}>
          {actions}
        </Group>
      )}
    </Drawer>
  );
}
