import { Text, Tooltip } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import { formatDateTime, formatRelative } from '@/utils/format';

// LM3 §14 — a timestamp cell: "2 days ago", the exact date and time on hover
export function RelativeTime({ value }: { value: string }) {
  const { i18n } = useTranslation();
  return (
    <Tooltip label={formatDateTime(value)}>
      <Text component="time" dateTime={value} fz="sm" style={{ whiteSpace: 'nowrap' }}>
        {formatRelative(value, i18n.language)}
      </Text>
    </Tooltip>
  );
}
