import { Box, Button, Group, Modal, Text } from '@mantine/core';
import type { ReactNode } from 'react';

import { useT } from '../../context';

interface ConfirmModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  loading?: boolean;
}

// LM3 §20 — destructive confirmation: centered on every screen, Cancel left, red confirm right
export function ConfirmModal({
  opened,
  onClose,
  onConfirm,
  title,
  children,
  confirmLabel,
  loading,
}: ConfirmModalProps) {
  const t = useT();
  return (
    <Modal opened={opened} onClose={onClose} title={title}>
      <Box p="md">
        <Text fz="sm">{children}</Text>
        <Group justify="flex-end" mt="lg">
          <Button variant="default" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button color="red" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </Group>
      </Box>
    </Modal>
  );
}
