import { Group, Modal, Stack, Text, ThemeIcon, type MantineColor } from '@mantine/core';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import classes from '@/components/uiKit/AppModal/Dialog.module.css';
import { tonalEdge } from '@/styles/tonalEdge';

// The tile gets the tonal buttons' thin edge, so it holds its shape on the dialog surface like a tonal button does
const ICON_EDGE = tonalEdge('ti', ['light'], 'filled');

interface BasicDialogProps {
  opened: boolean;
  onClose: () => void;
  title: string;
  /** A tonal tile in `iconColor` before the title (e.g. a trash can on a delete). */
  icon?: LucideIcon;
  /** The tile's color (e.g. red on a delete); the primary color by default. */
  iconColor?: MantineColor;
  description?: ReactNode;
  /** Extra content between the text and the actions: a field, a choice list. */
  children?: ReactNode;
  /** The dismissive button outlined (`variant="default"`) first, the confirming one filled last (red when destructive). */
  actions: ReactNode;
  /** A request is running: Esc, the scrim and the ✕ stop closing the dialog (disable its buttons too). */
  busy?: boolean;
}

// LM3 §20 — a dialog for a short decision; it stays small and centered on phones. Forms and content go in AppModal.
export function BasicDialog({
  opened,
  onClose,
  title,
  icon: Icon,
  iconColor,
  description,
  children,
  actions,
  busy,
}: BasicDialogProps) {
  const { t } = useTranslation();
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="md"
      closeOnEscape={!busy}
      closeOnClickOutside={!busy}
      // Mantine gives the ✕ no name
      closeButtonProps={{ 'aria-label': t('common.close'), disabled: busy }}
      // The title names the dialog (aria-labelledby); the tile is decoration
      title={
        Icon ? (
          <Group component="span" gap="sm" wrap="nowrap">
            <ThemeIcon
              component="span"
              variant="light"
              color={iconColor}
              size={30}
              radius="sm"
              vars={ICON_EDGE}
              aria-hidden
            >
              <Icon size={17} />
            </ThemeIcon>
            <span>{title}</span>
          </Group>
        ) : (
          title
        )
      }
    >
      <Stack gap="md">
        {description && (
          <Text fz="sm" lh={1.6} c="dimmed" style={{ overflowWrap: 'anywhere' }}>
            {description}
          </Text>
        )}
        {children}
        <Group justify="flex-end" gap="xs" pt="xs" className={classes.actions}>
          {actions}
        </Group>
      </Stack>
    </Modal>
  );
}
