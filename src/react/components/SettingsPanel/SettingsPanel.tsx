import { ActionIcon, Box, Burger, Flex, Group, Modal, ScrollArea, type ModalProps } from '@mantine/core';
import { ArrowLeft, Building2, CreditCard, KeyRound, Mail, User, Users } from 'lucide-react';
import { useState, type ReactNode } from 'react';

import { useSaaSContext } from '../../context';
import { useInvites } from '../../hooks/useInvites';
import { useOrg } from '../../hooks/useOrg';
import { ApiKeysSection } from './sections/ApiKeys/ApiKeysSection';
import { BillingSection } from './sections/BillingSection';
import { InvitesSection } from './sections/InvitesSection';
import { OrganizationSection } from './sections/Organization/OrganizationSection';
import { PeopleSection } from './sections/People/PeopleSection';
import { ProfileSection } from './sections/Profile/ProfileSection';
import { SettingsNav, type SettingsNavItem } from './SettingsNav';

export type SettingsTab = 'profile' | 'organization' | 'people' | 'apiKeys' | 'invites' | 'billing';

export interface SettingsPanelProps {
  opened: boolean;
  onClose: () => void;
  /** Full-page redirect after the account is deleted and signed out. */
  afterDeleteAccountUrl?: string;
  /** Tab to open on. Role-gated tabs open as soon as the user's role in the selected org is known. */
  defaultTab?: SettingsTab;
  onOrgDeleted?: () => void;
  onOrgUpdated?: () => void;
}

type Role = 'any' | 'admin' | 'owner';
const TABS: (SettingsNavItem & { role: Role })[] = [
  { key: 'profile', label: 'settings.tab.profile', icon: <User size={18} />, role: 'any' },
  { key: 'organization', label: 'settings.tab.organization', icon: <Building2 size={18} />, role: 'any' },
  { key: 'people', label: 'settings.tab.people', icon: <Users size={18} />, role: 'admin' },
  { key: 'apiKeys', label: 'settings.tab.apiKeys', icon: <KeyRound size={18} />, role: 'admin' },
  { key: 'invites', label: 'settings.tab.invites', icon: <Mail size={18} />, role: 'any' },
  { key: 'billing', label: 'settings.tab.billing', icon: <CreditCard size={18} />, role: 'owner' },
];

// The theme centres a modal title; a page header reads left to right, so the title starts at the back arrow.
// It is a page, not a floating modal, so it sits on the page background (LM3 §10 AppShell) instead of the modal's
// surface. Content and body become a column so the sidebar and the section fill the screen under the header.
const PAGE_BG = 'var(--mantine-color-body)';
const PAGE_STYLES: ModalProps['styles'] = {
  header: { backgroundColor: PAGE_BG },
  title: { textAlign: 'start', paddingLeft: 0 },
  content: { display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: PAGE_BG },
  body: { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' },
};

// The full-screen settings page (LM3 §20 modal chrome + §12 settings sidebar): header with back, the nav toggle below
// md, the title and the theme's round ✕; the sidebar on the left and the section in a centered 720px column that
// scrolls on its own. No footer — every section saves on its own.
export function SettingsPanel({
  opened,
  onClose,
  afterDeleteAccountUrl,
  defaultTab = 'profile',
  onOrgDeleted,
  onOrgUpdated,
}: SettingsPanelProps) {
  const { t, user } = useSaaSContext();
  const { selectedOrg, members } = useOrg();
  const { invites } = useInvites();
  const [activeTab, setActiveTab] = useState<SettingsTab>(defaultTab);
  const [navOpen, setNavOpen] = useState(false);
  // Each time the panel opens it starts on defaultTab (e.g. "Manage organizations" opens Organization)
  const [wasOpened, setWasOpened] = useState(opened);
  if (opened !== wasOpened) {
    setWasOpened(opened);
    if (opened) {
      setActiveTab(defaultTab);
      setNavOpen(false);
    }
  }

  const myRole = selectedOrg?.role ?? members.find((m) => m.userId === user?.id)?.role;
  const allowed = (role: Role) => role === 'any' || myRole === 'owner' || (role === 'admin' && myRole === 'admin');
  const tabs = TABS.filter((tab) => allowed(tab.role));
  // Keep the requested tab; show Profile until the role that unlocks it is known
  const shownTab = tabs.some((tab) => tab.key === activeTab) ? activeTab : 'profile';

  const sections: Record<SettingsTab, ReactNode> = {
    profile: <ProfileSection afterDeleteAccountUrl={afterDeleteAccountUrl} />,
    organization: <OrganizationSection onOrgDeleted={onOrgDeleted} onOrgUpdated={onOrgUpdated} />,
    people: <PeopleSection />,
    apiKeys: <ApiKeysSection />,
    invites: <InvitesSection />,
    billing: <BillingSection />,
  };

  const select = (tab: SettingsTab) => {
    setActiveTab(tab);
    setNavOpen(false);
  };

  const title = (
    <Group gap="xs" wrap="nowrap">
      <ActionIcon variant="subtle" color="gray" size="lg" aria-label={t('common.back')} onClick={onClose}>
        <ArrowLeft size={18} />
      </ActionIcon>
      <Burger
        size="sm"
        hiddenFrom="md"
        opened={navOpen}
        onClick={() => setNavOpen((open) => !open)}
        aria-label={t('settings.menu')}
        aria-expanded={navOpen}
      />
      <span>{t('settings.title')}</span>
    </Group>
  );

  return (
    <Modal opened={opened} onClose={onClose} title={title} fullScreen styles={PAGE_STYLES}>
      <Flex direction={{ base: 'column', md: 'row' }} flex={1} mih={0}>
        <SettingsNav items={tabs} active={shownTab} onSelect={select} invites={invites.length} opened={navOpen} />
        <ScrollArea flex={1} mih={0} scrollbars="y">
          <Box maw={720} mx="auto" px={{ base: 'md', md: 'xl' }} py={{ base: 'md', md: 'xl' }}>
            {sections[shownTab]}
          </Box>
        </ScrollArea>
      </Flex>
    </Modal>
  );
}
