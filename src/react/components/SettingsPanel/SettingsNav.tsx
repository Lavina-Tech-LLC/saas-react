import { Badge, Box, Divider, NavLink, ScrollArea, Stack } from '@mantine/core';
import type { ReactNode } from 'react';

import type { TranslationKey } from '../../../i18n';
import { useT } from '../../context';
import type { SettingsTab } from './SettingsPanel';

export interface SettingsNavItem {
  key: SettingsTab;
  label: TranslationKey;
  icon: ReactNode;
}

interface SettingsNavProps {
  items: SettingsNavItem[];
  active: SettingsTab;
  onSelect: (tab: SettingsTab) => void;
  invites: number;
  /** Below md the nav hides behind the header's menu toggle */
  opened: boolean;
}

// LM3 §12 — settings sidebar: NavLink items flush with the left edge (right padding only), 240px from md.
// Below md it stacks above the content at full width and shows only while the header toggle has it open; the divider
// follows it — beside it on wide screens, under it on narrow ones.
export function SettingsNav({ items, active, onSelect, invites, opened }: SettingsNavProps) {
  const t = useT();
  return (
    <>
      <Box
        component="nav"
        aria-label={t('settings.menu')}
        w={{ base: '100%', md: 240 }}
        display={{ base: opened ? 'block' : 'none', md: 'block' }}
        style={{ flexShrink: 0 }}
      >
        <ScrollArea h="100%" scrollbars="y">
          <Stack gap={4} pr="sm" py="sm">
            {items.map((item) => (
              <NavLink
                key={item.key}
                component="button"
                label={t(item.label)}
                leftSection={item.icon}
                active={item.key === active}
                aria-current={item.key === active ? 'page' : undefined}
                onClick={() => onSelect(item.key)}
                rightSection={
                  item.key === 'invites' && invites > 0 ? (
                    <Badge size="sm" circle color="red">
                      {invites}
                    </Badge>
                  ) : null
                }
              />
            ))}
          </Stack>
        </ScrollArea>
        <Divider hiddenFrom="md" />
      </Box>
      <Divider orientation="vertical" visibleFrom="md" />
    </>
  );
}
