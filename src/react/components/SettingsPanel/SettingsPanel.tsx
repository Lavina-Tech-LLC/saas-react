import { ActionIcon, Box, Flex, Modal, ScrollArea, Title, Tooltip } from '@mantine/core';
import { ArrowLeft } from 'lucide-react';
import { useState, type ReactNode } from 'react';

import { useBelow } from '@/hooks/useScreen';
import { PAGE_PADDING_X } from '@/styles/spacing';

import { useSaaSContext } from '../../context';
import { useInvites } from '../../hooks/useInvites';
import { useOrg } from '../../hooks/useOrg';
import { ApiKeysSection } from './sections/ApiKeys/ApiKeysSection';
import { BillingSection } from './sections/BillingSection';
import { InvitesSection } from './sections/InvitesSection';
import { OrganizationSection } from './sections/Organization/OrganizationSection';
import { PeopleSection } from './sections/People/PeopleSection';
import { ProfileSection } from './sections/Profile/ProfileSection';
import { SettingsNav, SettingsSectionList } from './SettingsNav';
import { canSee, SETTINGS_TABS, type SettingsTab } from './settingsTabs';

export type { SettingsTab } from './settingsTabs';

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

const SURFACE = 'var(--mantine-color-body)';
// M3 full-screen dialog in the page tone: a 64px top bar — ✕ (or ←) first, then the title (M3 title large, one line)
const SCREEN = {
  // A page, not a floating panel: its tiles take the card tone, as on a page (SegmentedList)
  content: { backgroundColor: SURFACE, '--fl-bg': SURFACE, '--segment-dialog-bg': 'var(--m3-surface)' },
  header: { backgroundColor: SURFACE, minHeight: 64, padding: '0 var(--mantine-spacing-md) 0 8px', gap: 4 },
  title: {
    flex: 1,
    minWidth: 0,
    fontSize: '1.375rem',
    lineHeight: '1.75rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  close: { marginInlineStart: 0 },
  body: { flex: 1, minHeight: 0, display: 'flex', overflow: 'hidden', padding: 0 },
} as const;
// M3 emphasized decelerate, as the kit's full-screen dialog
const SLIDE_UP = { transition: 'slide-up', duration: 250, timingFunction: 'cubic-bezier(0.05, 0.7, 0.1, 1)' } as const;

/**
 * LM3 — the account settings: an M3 full-screen window. From sm 840 the sections are listed beside the open one; on
 * phones one pane at a time — the list, then a section under ←. Every section saves on its own.
 */
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
  const onePane = useBelow('sm');
  const [activeTab, setActiveTab] = useState<SettingsTab>(defaultTab);
  // Phones: a section is open (a tab asked for opens straight away)
  const [inSection, setInSection] = useState(defaultTab !== 'profile');
  // Each time the panel opens it starts on defaultTab (e.g. "Manage organizations" opens Organization)
  const [wasOpened, setWasOpened] = useState(opened);
  if (opened !== wasOpened) {
    setWasOpened(opened);
    if (opened) {
      setActiveTab(defaultTab);
      setInSection(defaultTab !== 'profile');
    }
  }

  const myRole = selectedOrg?.role ?? members.find((m) => m.userId === user?.id)?.role;
  const tabs = SETTINGS_TABS.filter((tab) => canSee(tab.role, myRole));
  // Keep the requested tab; show Profile until the role that unlocks it is known
  const shown = tabs.find((tab) => tab.key === activeTab) ?? tabs[0];
  const showList = onePane && !inSection;

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
    setInSection(true);
  };
  const back = t('common.back');

  return (
    <Modal.Root opened={opened} onClose={onClose} fullScreen radius={0} transitionProps={SLIDE_UP} styles={SCREEN}>
      <Modal.Content>
        <Modal.Header>
          {onePane && inSection ? (
            <Tooltip label={back}>
              <ActionIcon variant="standard" size="input-sm" aria-label={back} onClick={() => setInSection(false)}>
                <ArrowLeft size={22} />
              </ActionIcon>
            </Tooltip>
          ) : (
            <Modal.CloseButton aria-label={t('common.close')} />
          )}
          <Modal.Title>{onePane && inSection ? t(shown.label) : t('settings.title')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Flex flex={1} miw={0}>
            {!onePane && <SettingsNav items={tabs} active={shown.key} onSelect={select} invites={invites.length} />}
            <ScrollArea flex={1} miw={0} scrollbars="y" type="auto">
              <Box maw={720} mx="auto" px={PAGE_PADDING_X} pt={onePane ? 'xs' : 'md'} pb="xl">
                {showList ? (
                  <SettingsSectionList items={tabs} onSelect={select} invites={invites.length} />
                ) : (
                  <>
                    {!onePane && (
                      <Title order={2} size="h3" mb="lg">
                        {t(shown.label)}
                      </Title>
                    )}
                    {sections[shown.key]}
                  </>
                )}
              </Box>
            </ScrollArea>
          </Flex>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
}
