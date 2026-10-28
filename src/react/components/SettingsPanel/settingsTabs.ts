import type { MantineColor } from '@mantine/core';
import { Building2, CreditCard, KeyRound, Mail, User, Users, type LucideIcon } from 'lucide-react';

import type { TranslationKey } from '../../../i18n';

export type SettingsTab = 'profile' | 'organization' | 'people' | 'apiKeys' | 'invites' | 'billing';
export type SettingsRole = 'any' | 'admin' | 'owner';

export interface SettingsTabItem {
  key: SettingsTab;
  label: TranslationKey;
  icon: LucideIcon;
  /** The icon's tint by meaning (LM3 §13). */
  color: MantineColor;
  /** Who sees it: everyone, admins and owners, or the owner. */
  role: SettingsRole;
}

export const SETTINGS_TABS: SettingsTabItem[] = [
  { key: 'profile', label: 'settings.tab.profile', icon: User, color: 'brand', role: 'any' },
  { key: 'organization', label: 'settings.tab.organization', icon: Building2, color: 'indigo', role: 'any' },
  { key: 'people', label: 'settings.tab.people', icon: Users, color: 'teal', role: 'admin' },
  { key: 'apiKeys', label: 'settings.tab.apiKeys', icon: KeyRound, color: 'orange', role: 'admin' },
  { key: 'invites', label: 'settings.tab.invites', icon: Mail, color: 'violet', role: 'any' },
  { key: 'billing', label: 'settings.tab.billing', icon: CreditCard, color: 'pink', role: 'owner' },
];

/** Whether a member with `myRole` in the selected organization sees a tab for `role`. */
export const canSee = (role: SettingsRole, myRole: string | undefined) =>
  role === 'any' || myRole === 'owner' || (role === 'admin' && myRole === 'admin');
