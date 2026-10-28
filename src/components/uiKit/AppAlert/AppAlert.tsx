import { Alert, Box, Group } from '@mantine/core';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { AlertActionButton } from './AlertActionButton';
import { SEVERITY, type AlertAction, type AlertSeverity } from './severity';

export type { AlertAction, AlertSeverity };

interface AppAlertProps {
  /** Sets the color and the icon; defaults to info. */
  severity?: AlertSeverity;
  title?: string;
  children: ReactNode;
  /** Replaces the severity's icon. */
  icon?: LucideIcon;
  /** One action, on the right of the text (under it when there is no room). */
  action?: AlertAction;
  /** Shows a ✕ that calls it. */
  onClose?: () => void;
}

// LM3 §24 — Material alert. The theme styles the box, so a plain Mantine Alert looks the same; the action sits beside
// the text instead of on a row of its own.
export function AppAlert({ severity = 'info', title, children, icon, action, onClose }: AppAlertProps) {
  const { t } = useTranslation();
  const { color, icon: SeverityIcon } = SEVERITY[severity];
  const Icon = icon ?? SeverityIcon;
  return (
    <Alert
      color={color}
      icon={<Icon size={18} />}
      title={title}
      withCloseButton={!!onClose}
      onClose={onClose}
      closeButtonLabel={t('common.close')}
    >
      {action ? (
        <Group gap="xs" justify="space-between" align="center">
          <Box flex="1 1 240px" miw={0}>
            {children}
          </Box>
          <AlertActionButton action={action} color={color} />
        </Group>
      ) : (
        children
      )}
    </Alert>
  );
}
