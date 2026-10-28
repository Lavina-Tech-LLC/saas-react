import { Button, Group, Modal, type ModalProps } from '@mantine/core';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { useScreen } from '@/hooks/useScreen';

import { AppModalFullScreen } from './AppModalFullScreen';
import { BODY_WITH_ACTIONS, mainActionProps, type AppModalAction } from './appModalParts';
import classes from './Dialog.module.css';
import { DialogScroll, OwnScroll } from './DialogScroll';

export type { AppModalAction } from './appModalParts';

interface AppModalProps {
  opened: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** The main action (Save, Create), last in the action row; on phones it sits in the top bar and the ✕ cancels. */
  mainAction?: AppModalAction;
  /** Cancel's label beside `mainAction` (default "Cancel"); it closes the modal. */
  cancelLabel?: string;
  /** With `mainAction`: other actions, before Cancel. Without it: the whole action row (outlined buttons, Cancel first,
   *  the main action last and filled). Omit both for a read-only modal. */
  footer?: ReactNode;
  /** md 440 for details · lg 620 (default) for forms and long content · xl 780 */
  size?: ModalProps['size'];
}

// LM3 §20 — a modal for forms and content; on phones the full-screen dialog (AppModalFullScreen). Short decisions use
// BasicDialog / ConfirmDialog.
export function AppModal({
  opened,
  onClose,
  title,
  children,
  mainAction,
  cancelLabel,
  footer,
  size = 'lg',
}: AppModalProps) {
  const { t } = useTranslation();
  const { isMobile } = useScreen();

  if (isMobile) {
    return (
      <AppModalFullScreen opened={opened} onClose={onClose} title={title} mainAction={mainAction} footer={footer}>
        {children}
      </AppModalFullScreen>
    );
  }

  const actions = mainAction ? (
    <>
      {footer}
      <Button variant="default" onClick={onClose} disabled={mainAction.loading}>
        {cancelLabel ?? t('common.cancel')}
      </Button>
      <Button {...mainActionProps(mainAction)}>{mainAction.label}</Button>
    </>
  ) : (
    footer
  );

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title}
      size={size}
      // Mantine gives the ✕ no name
      closeButtonProps={{ 'aria-label': t('common.close') }}
      styles={actions ? BODY_WITH_ACTIONS : undefined}
      // With actions it lays out its own scroller between the title and the action row
      scrollAreaComponent={actions ? OwnScroll : undefined}
    >
      {actions ? (
        <>
          <DialogScroll className={classes.content}>{children}</DialogScroll>
          <Group justify="flex-end" gap="xs" className={`${classes.footer} ${classes.actions}`}>
            {actions}
          </Group>
        </>
      ) : (
        children
      )}
    </Modal>
  );
}
