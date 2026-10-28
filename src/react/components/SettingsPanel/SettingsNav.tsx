import { Badge, Box, NavLink, Stack, ThemeIcon } from '@mantine/core';
import { ChevronRight } from 'lucide-react';

import { ListItem } from '@/components/uiKit/List';
import { SegmentedList } from '@/components/uiKit/SegmentedList';

import { useT } from '../../context';
import type { SettingsTab, SettingsTabItem } from './settingsTabs';

interface SettingsNavProps {
  items: SettingsTabItem[];
  active: SettingsTab;
  onSelect: (tab: SettingsTab) => void;
  /** Invitations waiting: a count on Invites. */
  invites: number;
}

const count = (key: SettingsTab, invites: number) =>
  key === 'invites' && invites > 0 ? (
    <Badge size="sm" circle color="red">
      {invites}
    </Badge>
  ) : null;

/** LM3 §12 — the sections beside the open one (from sm 840): navigation-drawer rows, the open one lit. */
export function SettingsNav({ items, active, onSelect, invites }: SettingsNavProps) {
  const t = useT();
  return (
    <Box component="nav" aria-label={t('settings.menu')} w={256} py="xs" pr="sm" style={{ flexShrink: 0 }}>
      <Stack gap={2}>
        {items.map(({ key, label, icon: Icon }) => (
          <NavLink
            key={key}
            component="button"
            label={t(label)}
            leftSection={<Icon size={20} />}
            rightSection={count(key, invites)}
            active={key === active}
            aria-current={key === active ? 'page' : undefined}
            onClick={() => onSelect(key)}
          />
        ))}
      </Stack>
    </Box>
  );
}

/** LM3 §13 — the sections on phones, before one opens: a separated list, each a tonal icon and a chevron. */
export function SettingsSectionList({ items, onSelect, invites }: Omit<SettingsNavProps, 'active'>) {
  const t = useT();
  return (
    <SegmentedList aria-label={t('settings.menu')}>
      {items.map(({ key, label, icon: Icon, color }) => (
        <ListItem
          key={key}
          headline={t(label)}
          leadingType="avatar"
          leading={
            <ThemeIcon variant="light" color={color}>
              <Icon />
            </ThemeIcon>
          }
          trailing={
            <>
              {count(key, invites)}
              <ChevronRight size={20} />
            </>
          }
          onClick={() => onSelect(key)}
        />
      ))}
    </SegmentedList>
  );
}
