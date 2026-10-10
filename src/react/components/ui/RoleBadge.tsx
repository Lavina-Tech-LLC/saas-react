import { Badge } from '@mantine/core';

import { useColorVariant } from './useColorVariant';

const COLORS: Record<string, string> = { owner: 'violet', admin: 'blue' };

/** Role key decides the color (owner violet, admin blue, others gray); `label` is what is shown. */
export function RoleBadge({ role, label }: { role: string; label?: string }) {
  const variant = useColorVariant();
  return (
    <Badge size="md" variant={variant} color={COLORS[role] ?? 'gray'}>
      {label || role}
    </Badge>
  );
}
