import { useContext } from 'react';

import { OrgContext } from '../sharedState';

/** Organizations the user belongs to, the selected one, and everything managed inside it. Shared app-wide. */
export function useOrg() {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error('useOrg must be used within a <SaaSProvider>');
  return ctx;
}
