import { Button, TextInput, type MantineColor } from '@mantine/core';
import type { LucideIcon } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { AppAlert } from '@/components/uiKit/AppAlert';
import { BasicDialog } from '@/components/uiKit/BasicDialog';

interface ConfirmDialogProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  /** What happens and whether it can be undone. */
  description: ReactNode;
  /** Defaults to "Delete". */
  confirmLabel?: string;
  /** Defaults to "Cancel". */
  cancelLabel?: string;
  /** Confirm button color — red by default (a destructive action). */
  color?: MantineColor;
  /** The request is running: the confirm button spins, and Cancel, Esc and the scrim can't close the dialog. */
  loading?: boolean;
  /** Why the request failed — shown above the actions; the dialog stays open and keeps what was typed. */
  error?: ReactNode;
  /** Type-to-confirm: the confirm button stays disabled until this exact text is typed (e.g. the record's name). */
  confirmText?: string;
  /** A tonal tile in `color` before the title (e.g. a trash can). None by default. */
  icon?: LucideIcon;
}

// LM3 §20 — the one confirmation dialog, on BasicDialog. While loading nothing closes it; a failure shows inside it.
export function ConfirmDialog({
  opened,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel,
  color = 'red',
  loading,
  error,
  confirmText,
  icon,
}: ConfirmDialogProps) {
  const { t } = useTranslation();
  const [typed, setTyped] = useState('');
  // Start empty every time the dialog opens (state adjusted during render, not in an effect)
  const [wasOpened, setWasOpened] = useState(opened);
  if (opened !== wasOpened) {
    setWasOpened(opened);
    if (opened) setTyped('');
  }
  const locked = confirmText !== undefined && typed.trim() !== confirmText;

  return (
    <BasicDialog
      opened={opened}
      onClose={onClose}
      busy={loading}
      title={title}
      icon={icon}
      iconColor={color}
      description={description}
      actions={
        <>
          {/* Focus starts on Cancel, the safe choice — or on the field when the name has to be typed */}
          <Button
            variant="default"
            onClick={onClose}
            disabled={loading}
            data-autofocus={confirmText === undefined || undefined}
          >
            {cancelLabel ?? t('common.cancel')}
          </Button>
          {/* A loading Button is disabled, so a second press is ignored */}
          <Button color={color} onClick={onConfirm} loading={loading} disabled={locked}>
            {confirmLabel ?? t('common.delete')}
          </Button>
        </>
      }
    >
      {confirmText !== undefined && (
        // Its floating label says what to type
        <TextInput
          label={t('common.typeToConfirm', { text: confirmText })}
          value={typed}
          onChange={(e) => setTyped(e.currentTarget.value)}
          autoComplete="off"
          data-autofocus
        />
      )}
      {error && <AppAlert severity="error">{error}</AppAlert>}
    </BasicDialog>
  );
}
