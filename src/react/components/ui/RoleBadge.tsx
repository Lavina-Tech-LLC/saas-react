import { Badge } from '@mantine/core';

import type { Translate, TranslationKey } from '../../../i18n';
import { useT } from '../../context';

const COLORS: Record<string, string> = { owner: 'violet', admin: 'blue' };
const BUILT_IN: Record<string, TranslationKey> = { owner: 'role.owner', admin: 'role.admin', member: 'role.member' };

/** A role's name: a built-in role's translated name, any other role's key as it is. */
export const roleLabel = (t: Translate, role: string) => (BUILT_IN[role] ? t(BUILT_IN[role]) : role);

/** LM3 §22 — a role as a tonal badge: the key decides the color (owner violet, admin blue, others gray); without a
 *  `label`, a built-in role shows its translated name. */
export function RoleBadge({ role, label }: { role: string; label?: string }) {
  const t = useT();
  return (
    <Badge variant="light" color={COLORS[role] ?? 'gray'}>
      {label || roleLabel(t, role)}
    </Badge>
  );
}
