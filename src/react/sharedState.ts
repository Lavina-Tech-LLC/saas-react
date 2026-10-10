import { createContext } from 'react';

import type { useMyInvitesState } from './hooks/useMyInvitesState';
import type { useOrgState } from './hooks/useOrgState';

export type OrgState = ReturnType<typeof useOrgState>;
export type InvitesState = ReturnType<typeof useMyInvitesState>;

// One instance of org and invite state per <SaaSProvider>, so every component sees the same data
export const OrgContext = createContext<OrgState | null>(null);
export const InvitesContext = createContext<InvitesState | null>(null);
