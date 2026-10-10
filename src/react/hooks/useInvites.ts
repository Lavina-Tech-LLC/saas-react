import { useContext } from 'react';

import { InvitesContext } from '../sharedState';

/** The current user's pending invitations. Shared app-wide. */
export function useInvites() {
  const ctx = useContext(InvitesContext);
  if (!ctx) throw new Error('useInvites must be used within a <SaaSProvider>');
  return ctx;
}
