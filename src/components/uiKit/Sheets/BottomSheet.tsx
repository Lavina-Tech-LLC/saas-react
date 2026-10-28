import { Box, Drawer, Group, Title, UnstyledButton, type DrawerProps } from '@mantine/core';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { DialogScroll } from '@/components/uiKit/AppModal';
import { useSwipeToClose } from '@/hooks/useSwipeToClose';

import classes from './Sheets.module.css';

interface BottomSheetProps extends Omit<DrawerProps, 'position' | 'title' | 'size' | 'withCloseButton'> {
  /** Optional heading under the drag handle; it also names the dialog. */
  title?: string;
  /** An action row pinned under the content (the main action filled and last, Cancel outlined before it) — a form or
   *  filters in a sheet. */
  actions?: ReactNode;
  /** The sheet's width on wide screens, px; M3's 640 by default (phones always get the full width). */
  width?: number;
}

// The drawer is a transparent shell (scrim, focus trap, slide-up) as tall as the sheet; it never scrolls or clips,
// so the sheet can follow the finger below the screen edge
const SHELL = {
  content: {
    height: 'auto',
    marginInline: 'auto',
    background: 'none',
    boxShadow: 'none',
    overflow: 'visible',
  },
  body: { padding: 0 },
  // The Drawer's own header only holds the title that names the dialog (aria-labelledby); the sheet shows its own
  header: { display: 'none' },
};

/**
 * LM3 §20 — M3 modal bottom sheet, on every screen: the kit's sheet for actions, pickers, filters and short forms
 * (rather than a side sheet). Swipe the top (handle and title) down to close; no ✕ — the handle, the swipe, the scrim
 * and Esc close it. The content scrolls between the top and the actions.
 */
export function BottomSheet({
  title,
  actions,
  width = 640,
  children,
  onClose,
  onExitTransitionEnd,
  ...props
}: BottomSheetProps) {
  const { t } = useTranslation();
  const swipe = useSwipeToClose(onClose);

  return (
    <Drawer
      position="bottom"
      withCloseButton={false}
      title={title}
      onClose={onClose}
      onExitTransitionEnd={() => {
        swipe.reset();
        onExitTransitionEnd?.();
      }}
      styles={{ ...SHELL, content: { ...SHELL.content, maxWidth: width } }}
      {...props}
    >
      <Box
        data-sheet
        className={classes.sheet}
        style={{
          transform: `translateY(${swipe.offset}px)`,
          transition: swipe.dragging ? 'none' : 'transform 200ms ease',
        }}
      >
        <div className={classes.top} data-dragging={swipe.dragging || undefined} {...swipe.handlers}>
          <UnstyledButton className={classes.handle} aria-label={t('common.close')} onClick={onClose} />
          {title && (
            <Title order={2} className={classes.title}>
              {title}
            </Title>
          )}
        </div>
        <DialogScroll className={classes.sheetBody}>{children}</DialogScroll>
        {actions && (
          <Group justify="flex-end" gap="sm" className={classes.sheetActions}>
            {actions}
          </Group>
        )}
      </Box>
    </Drawer>
  );
}
