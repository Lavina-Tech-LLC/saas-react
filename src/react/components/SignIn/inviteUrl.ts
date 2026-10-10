import type { InviteInfo } from '../../../auth/types';
import type { Translate } from '../../../i18n';

const INVITE_PARAM = 'invite_code';

/** The invite code from the prop, else from `?invite_code=` in the URL. */
export function resolveInitialInviteCode(explicit?: string): string | null {
  if (explicit) return explicit;
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get(INVITE_PARAM);
}

/** Removes `invite_code` from the address bar without a reload. */
export function clearInviteFromUrl(): void {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams(window.location.search);
  if (!params.has(INVITE_PARAM)) return;
  params.delete(INVITE_PARAM);
  const search = params.toString();
  const { pathname, hash } = window.location;
  window.history.replaceState(null, '', pathname + (search ? `?${search}` : '') + hash);
}

/** Inviter's name, else the local part of their email, else "Someone". */
export function formatInviterName(info: InviteInfo, t: Translate): string {
  if (info.inviterName?.trim()) return info.inviterName.trim();
  if (info.inviterEmail) return info.inviterEmail.split('@')[0];
  return t('invite.someone');
}
