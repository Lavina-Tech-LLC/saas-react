import {
  Avatar,
  Badge,
  Group,
  Indicator,
  Menu,
  NavLink,
  Stack,
  Text,
  UnstyledButton,
  type MantineSize,
  type NavLinkProps,
} from '@mantine/core';
import { ChevronsUpDown, LogOut, Settings } from 'lucide-react';
import { useState } from 'react';

import type { Org } from '../../../auth/types';
import { useT } from '../../context';
import { useAuth } from '../../hooks/useAuth';
import { useInvites } from '../../hooks/useInvites';
import { useOrg } from '../../hooks/useOrg';
import type { SettingsTab } from '../SettingsPanel/SettingsPanel';
import { userInitial } from '../ui/initials';
import { LazySettingsPanel, preloadSettingsPanel } from './LazySettingsPanel';
import { OrgMenuSection } from './OrgMenuSection';
import { PreferencesMenuSection } from './PreferencesMenuSection';

export interface UserButtonProps {
  /** Full-page redirect after sign-out. Omit and react to the signed-out state with your router instead. */
  afterSignOutUrl?: string;
  afterDeleteAccountUrl?: string;
  showOrgSwitcher?: boolean;
  onOrgChange?: (org: Org) => void;
  /** Adds an "Organization settings" item that calls this for the selected org. */
  onOrgSettingsClick?: (org: Org) => void;
  /** Called after sign-out completes. */
  onSignOut?: () => void;
  /** Just the avatar — for a navigation rail or a tight header. The menu is the same. */
  compact?: boolean;
  /**
   * Restyles the sidebar row to fit the host's design: Mantine style props, `className`, `classNames`, `styles`. Each
   * one replaces the SDK's default for it (`h="100%"`, `px="md"`, `styles={{ root: { borderRadius: 0 } }}`). Not used
   * when `compact`.
   */
  navLinkProps?: UserButtonNavLinkProps;
  /** The avatar's size, in the row and when `compact`: a Mantine size or px. */
  avatarSize?: MantineSize | number;
}

/** The row's own content (avatar, name, organization, ⇅) stays the SDK's; everything else about the NavLink is open. */
export type UserButtonNavLinkProps = Omit<
  NavLinkProps,
  'label' | 'description' | 'leftSection' | 'rightSection' | 'children'
>;

export function UserButton({
  afterSignOutUrl,
  afterDeleteAccountUrl,
  showOrgSwitcher = true,
  onOrgChange,
  onOrgSettingsClick,
  onSignOut,
  compact = false,
  navLinkProps,
  avatarSize = 'md',
}: UserButtonProps) {
  const t = useT();
  const { user, signOut } = useAuth();
  const { selectedOrg, selectOrg, refresh: refreshOrgs } = useOrg();
  const { invites } = useInvites();
  const [opened, setOpened] = useState(false);
  // The tab Settings opens on; null while it is closed
  const [settingsTab, setSettingsTab] = useState<SettingsTab | null>(null);
  // The panel mounts on its first open and then stays, so closing it keeps its transition
  const [settingsMounted, setSettingsMounted] = useState(false);
  const openSettings = (tab: SettingsTab) => {
    setSettingsMounted(true);
    setSettingsTab(tab);
  };
  const toggleMenu = (next: boolean) => {
    if (next) preloadSettingsPanel();
    setOpened(next);
  };
  if (!user) return null;

  const name = user.name || user.email || user.phone;
  const avatar = (
    <Avatar src={user.avatarUrl} size={avatarSize} radius="xl" color="initials" name={name}>
      {userInitial(user)}
    </Avatar>
  );
  // Pending invites show as a count on the avatar
  const badgedAvatar = (
    <Indicator label={invites.length} disabled={invites.length === 0}>
      {avatar}
    </Indicator>
  );

  const choose = async (org: Org) => {
    setOpened(false);
    await selectOrg(org.id);
    onOrgChange?.(org);
  };

  const handleSignOut = async () => {
    await signOut();
    onSignOut?.();
    if (afterSignOutUrl) window.location.href = afterSignOutUrl;
  };

  return (
    <>
      <Menu opened={opened} onChange={toggleMenu} position="bottom-end" width={300} withinPortal>
        <Menu.Target>
          {compact ? (
            <UnstyledButton aria-label={t('user.menu')} bdrs="xl" display="flex">
              {badgedAvatar}
            </UnstyledButton>
          ) : (
            // The sidebar footer row (LM3 §12): the host theme's NavLink hover, focus and type, stretched over the whole
            // footer it sits in (the 60px row) with square corners. Avatar and name on the left, the chevron pushed
            // to the right edge; name and org truncate to the space it is given. navLinkProps restyle it for the host.
            <NavLink
              component="button"
              aria-label={t('user.menu')}
              label={name}
              description={selectedOrg?.name}
              leftSection={badgedAvatar}
              // Signals a menu: theme, language, organizations and sign-out are all inside
              rightSection={<ChevronsUpDown size={18} color="var(--mantine-color-dimmed)" />}
              noWrap
              h="100%"
              px="md"
              styles={{ root: { borderRadius: 0 } }}
              {...navLinkProps}
            />
          )}
        </Menu.Target>
        <Menu.Dropdown>
          <Group gap="sm" px="sm" py="xs" wrap="nowrap">
            {avatar}
            <Stack gap={0} miw={0}>
              {user.name && (
                <Text fz="sm" fw={600} truncate>
                  {user.name}
                </Text>
              )}
              <Text fz="xs" c="dimmed" truncate>
                {user.email || user.phone}
              </Text>
            </Stack>
          </Group>
          {showOrgSwitcher && (
            <>
              <Menu.Divider />
              <OrgMenuSection
                onSelect={choose}
                onManage={() => openSettings('organization')}
                onOrgSettingsClick={onOrgSettingsClick}
              />
            </>
          )}
          <Menu.Divider />
          <Menu.Item
            leftSection={<Settings size={20} />}
            rightSection={
              invites.length > 0 ? (
                <Badge size="sm" circle color="red" aria-label={t('settings.tab.invites')}>
                  {invites.length}
                </Badge>
              ) : null
            }
            onClick={() => openSettings('profile')}
          >
            {t('user.settings')}
          </Menu.Item>
          <Menu.Divider />
          <PreferencesMenuSection />
          <Menu.Divider />
          <Menu.Item leftSection={<LogOut size={20} />} onClick={handleSignOut}>
            {t('user.signOut')}
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
      {settingsMounted && (
        <LazySettingsPanel
          opened={settingsTab !== null}
          onClose={() => setSettingsTab(null)}
          defaultTab={settingsTab ?? 'profile'}
          afterDeleteAccountUrl={afterDeleteAccountUrl}
          onOrgDeleted={refreshOrgs}
          onOrgUpdated={refreshOrgs}
        />
      )}
    </>
  );
}
