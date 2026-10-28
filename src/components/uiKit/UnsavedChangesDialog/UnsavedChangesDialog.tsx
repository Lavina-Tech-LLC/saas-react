import { useTranslation } from 'react-i18next';

import { ConfirmDialog } from '@/components/uiKit/ConfirmDialog';

interface UnsavedChangesDialogProps {
  opened: boolean;
  onStay: () => void;
  onLeave: () => void;
  /** Defaults to "Leave without saving?". */
  title?: string;
  /** What exactly gets lost; defaults to a generic sentence. */
  description?: string;
}

// LM3 §20 — asked before navigating away from unsaved edits (pair it with useBlocker)
export function UnsavedChangesDialog({ opened, onStay, onLeave, title, description }: UnsavedChangesDialogProps) {
  const { t } = useTranslation();
  return (
    <ConfirmDialog
      opened={opened}
      onClose={onStay}
      onConfirm={onLeave}
      title={title ?? t('common.leaveTitle')}
      description={description ?? t('common.leaveDescription')}
      cancelLabel={t('common.stay')}
      confirmLabel={t('common.leave')}
    />
  );
}
