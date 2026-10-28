import { Button, Group, Modal, ScrollArea } from '@mantine/core';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { BODY_WITH_ACTIONS, mainActionProps, type AppModalAction } from './appModalParts';
import classes from './Dialog.module.css';
import { useScrollEdges } from './useScrollEdges';

const SURFACE = 'var(--mantine-color-body)';
// M3: the top bar takes the container tone once content scrolls under it
const SCROLLED = 'var(--m3-surface-container)';
// M3 full-screen dialog: slides up with the emphasized-decelerate curve
const SLIDE_UP = { transition: 'slide-up', duration: 250, timingFunction: 'cubic-bezier(0.05, 0.7, 0.1, 1)' } as const;

// A 56px top bar: the ✕ first (Mantine pushes it to the end), the title in M3 title large (22px) on one line, then the
// main action
const FULL_SCREEN = {
  content: { backgroundColor: SURFACE, '--fl-bg': SURFACE },
  header: {
    backgroundColor: SURFACE,
    minHeight: 56,
    padding: '0 var(--mantine-spacing-xs) 0 4px',
    gap: 4,
    transition: 'background-color 200ms linear',
  },
  title: {
    flex: 1,
    minWidth: 0,
    fontSize: '1.375rem',
    lineHeight: '1.75rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  close: { marginInlineStart: 0 },
} as const;

interface AppModalFullScreenProps {
  opened: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  mainAction?: AppModalAction;
  /** A row under the content: the actions other than the main one and cancel (the ✕ is the cancel here). */
  footer?: ReactNode;
}

// LM3 §20 — AppModal on phones: the M3 full-screen dialog. Its bottom row holds only actions beyond the main one.
export function AppModalFullScreen({ opened, onClose, title, children, mainAction, footer }: AppModalFullScreenProps) {
  const { t } = useTranslation();
  const [scrollRef, edges] = useScrollEdges<HTMLDivElement>();
  const header = { ...FULL_SCREEN.header, backgroundColor: edges.above ? SCROLLED : SURFACE };
  return (
    <Modal.Root
      opened={opened}
      onClose={onClose}
      fullScreen
      radius={0}
      transitionProps={SLIDE_UP}
      className={classes.fullScreen}
      styles={{ ...FULL_SCREEN, ...BODY_WITH_ACTIONS, header }}
    >
      <Modal.Content>
        <Modal.Header>
          {/* Mantine gives the ✕ no name */}
          <Modal.CloseButton aria-label={t('common.close')} />
          <Modal.Title>{title}</Modal.Title>
          {mainAction && <Button {...mainActionProps(mainAction)}>{mainAction.label}</Button>}
        </Modal.Header>
        <Modal.Body>
          {/* DialogScroll's ScrollArea, with the edges kept here: the top bar's tone shows the scroll instead of a line */}
          <ScrollArea
            type="auto"
            scrollbars="y"
            viewportRef={scrollRef}
            classNames={{ root: classes.scroll, viewport: classes.viewport }}
            data-below={(footer && edges.below) || undefined}
          >
            <div className={classes.content}>{children}</div>
          </ScrollArea>
          {footer && (
            <Group justify="flex-end" gap="sm" className={`${classes.footer} ${classes.actions}`}>
              {footer}
            </Group>
          )}
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
}
