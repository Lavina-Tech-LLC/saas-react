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

// The Google Account rail: a tonal icon circle and the name; the open section sits on a pill in the card tone
const navStyles = (active: boolean) => ({
  root: {
    width: 'fit-content',
    maxWidth: '100%',
    minHeight: 52,
    borderRadius: 999,
    padding: '6px 20px 6px 6px',
    '--nl-bg': 'var(--m3-surface)',
    '--nl-color': 'var(--mantine-color-text)',
  },
  section: { marginInlineEnd: 12 },
  label: { fontWeight: active ? 600 : 500 },
});

/** The sections beside the open one (from sm 840), as on myaccount.google.com. */
export function SettingsNav({ items, active, onSelect, invites }: SettingsNavProps) {
  const t = useT();
  return (
    <Box component="nav" aria-label={t('settings.menu')} w={280} px="md" pt="md" style={{ flexShrink: 0 }}>
      <Stack gap={4} align="flex-start">
        {items.map(({ key, label, icon: Icon, color }) => (
          <NavLink
            key={key}
            component="button"
            label={t(label)}
            leftSection={
              <ThemeIcon variant="light" color={color} size={40} radius="xl">
                <Icon size={20} />
              </ThemeIcon>
            }
            rightSection={count(key, invites)}
            active={key === active}
            aria-current={key === active ? 'page' : undefined}
            onClick={() => onSelect(key)}
            styles={navStyles(key === active)}
          />
        ))}
      </Stack>
    </Box>
  );
}

/** The sections on phones, before one opens: a separated list — a tonal icon, the name and what it holds. */
export function SettingsSectionList({ items, onSelect, invites }: Omit<SettingsNavProps, 'active'>) {
  const t = useT();
  return (
    <SegmentedList aria-label={t('settings.menu')}>
      {items.map(({ key, label, hint, icon: Icon, color }) => (
        <ListItem
          key={key}
          headline={t(label)}
          supportingText={t(hint)}
          wrapText
          leadingType="avatar"
          leading={
            <ThemeIcon variant="light" color={color} size={40} radius="xl">
              <Icon size={20} />
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
