import { useState, useEffect, useCallback, useRef } from 'react'
import { useSaaSContext } from '../../react/context'
import type { AuthResult, OAuthProvider, Org, Member, PendingInvite, MyPendingInvite, Role, InviteLink, InviteLinkInfo, UseInviteLinkResult, InviteInfo, AcceptInviteByCodeResult } from '../types'

export function useAuth() {
  const { client, user, isLoaded } = useSaaSContext()

  return {
    isLoaded,
    isSignedIn: !!user,
    user,
    signOut: useCallback(() => client.auth.signOut(), [client]),
    getToken: useCallback(() => client.auth.getToken(), [client]),
    refreshUser: useCallback(() => client.auth.refreshUser(), [client]),
  }
}

export function useUser() {
  const { user, isLoaded } = useSaaSContext()
  return { user, isLoaded }
}

export function useSignIn() {
  const { client } = useSaaSContext()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthResult | null> => {
      setIsLoading(true)
      setError(null)
      try {
        return await client.auth.signIn(email, password)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Sign in failed')
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [client],
  )

  const signInWithOAuth = useCallback(
    async (provider: OAuthProvider) => {
      setIsLoading(true)
      setError(null)
      try {
        return await client.auth.signInWithOAuth(provider)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'OAuth sign in failed')
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [client],
  )

  const submitMfaCode = useCallback(
    async (mfaToken: string, code: string) => {
      setIsLoading(true)
      setError(null)
      try {
        return await client.auth.submitMfaCode(mfaToken, code)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'MFA verification failed')
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [client],
  )

  return { signIn, signInWithOAuth, submitMfaCode, isLoading, error, setError }
}

export function useSignUp() {
  const { client } = useSaaSContext()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const signUp = useCallback(
    async (email: string, password: string, inviteCode?: string) => {
      setIsLoading(true)
      setError(null)
      try {
        return await client.auth.signUp(email, password, inviteCode)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Sign up failed')
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [client],
  )

  return { signUp, isLoading, error, setError }
}

export function useOrg() {
  const { client, user, isLoaded } = useSaaSContext()
  const [orgs, setOrgs] = useState<Org[]>([])
  const [selectedOrg, setSelectedOrg] = useState<Org | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [invites, setInvites] = useState<PendingInvite[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const initialSelectDone = useRef(false)

  const refreshRoles = useCallback(async () => {
    try {
      const list = await client.auth.listRoles()
      setRoles(list)
    } catch { /* best-effort */ }
  }, [client])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [list] = await Promise.all([client.auth.listOrgs(), refreshRoles()])
      setOrgs(list)

      // Keep selectedOrg in sync with fresh data (e.g. after rename).
      setSelectedOrg((prev) => {
        if (!prev) return prev
        const fresh = list.find((o) => o.id === prev.id)
        return fresh ?? null
      })

      if (!initialSelectDone.current && list.length > 0) {
        // Try to restore the last-used org from localStorage.
        const savedOrgId = typeof window !== 'undefined' ? localStorage.getItem('ss_selected_org') : null
        const savedOrg = savedOrgId ? list.find((o) => o.id === savedOrgId) : null
        // Fall back to auto-selecting if there's only one org.
        const orgToSelect = savedOrg ?? (list.length === 1 ? list[0] : null)

        if (orgToSelect) {
          initialSelectDone.current = true
          setSelectedOrg(orgToSelect)
          if (typeof window !== 'undefined') {
            localStorage.setItem('ss_selected_org', orgToSelect.id)
          }
          try {
            const m = await client.auth.listMembers(orgToSelect.id)
            setMembers(m)
          } catch { /* best-effort */ }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load organizations')
    } finally {
      setIsLoading(false)
    }
  }, [client])

  useEffect(() => { if (isLoaded && user) refresh() }, [isLoaded, user, refresh])

  const selectOrg = useCallback(async (orgId: string) => {
    try {
      setInviteLinks([])
      const org = await client.auth.getOrg(orgId)
      setSelectedOrg(org)
      if (typeof window !== 'undefined') {
        localStorage.setItem('ss_selected_org', orgId)
      }
      const m = await client.auth.listMembers(orgId)
      setMembers(m)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load organization')
    }
  }, [client])

  const createOrg = useCallback(async (name: string, slug: string) => {
    try {
      const org = await client.auth.createOrg(name, slug)
      setOrgs((prev) => [...prev, org])
      return org
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create organization')
      return null
    }
  }, [client])

  const updateOrg = useCallback(async (orgId: string, params: { name?: string; avatarUrl?: string }) => {
    try {
      const updated = await client.auth.updateOrg(orgId, params)
      setOrgs((prev) => prev.map((o) => (o.id === orgId ? updated : o)))
      if (selectedOrg?.id === orgId) setSelectedOrg(updated)
      return updated
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update organization')
      return null
    }
  }, [client, selectedOrg])

  const deleteOrg = useCallback(async (orgId: string) => {
    try {
      await client.auth.deleteOrg(orgId)
      setOrgs((prev) => prev.filter((o) => o.id !== orgId))
      if (selectedOrg?.id === orgId) {
        setSelectedOrg(null)
        setMembers([])
        setInvites([])
        if (typeof window !== 'undefined') {
          localStorage.removeItem('ss_selected_org')
        }
      }
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete organization')
      return false
    }
  }, [client, selectedOrg])

  const sendInvite = useCallback(async (orgId: string, email: string, role?: string, roleId?: string) => {
    try {
      const invite = await client.auth.sendInvite(orgId, email, role, roleId)
      return invite
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invite')
      return null
    }
  }, [client])

  const refreshInvites = useCallback(async (orgId: string) => {
    try {
      const list = await client.auth.listInvites(orgId)
      setInvites(list)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invites')
    }
  }, [client])

  const revokeInvite = useCallback(async (orgId: string, inviteId: string) => {
    try {
      await client.auth.revokeInvite(orgId, inviteId)
      setInvites((prev) => prev.filter((i) => i.id !== inviteId))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke invite')
      return false
    }
  }, [client])

  const updateMemberRole = useCallback(async (orgId: string, userId: string, role?: string, roleId?: string) => {
    try {
      await client.auth.updateMemberRole(orgId, userId, role, roleId)
      // Refresh members to get accurate role data from the server.
      const m = await client.auth.listMembers(orgId)
      setMembers(m)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update member role')
      return false
    }
  }, [client])

  const removeMember = useCallback(async (orgId: string, userId: string) => {
    try {
      await client.auth.removeMember(orgId, userId)
      setMembers((prev) => prev.filter((m) => m.userId !== userId))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member')
      return false
    }
  }, [client])

  const refreshMembers = useCallback(async (orgId: string) => {
    try {
      const m = await client.auth.listMembers(orgId)
      setMembers(m)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load members')
    }
  }, [client])

  const uploadOrgAvatar = useCallback(async (orgId: string, imageBlob: Blob) => {
    try {
      const result = await client.auth.uploadOrgAvatar(orgId, imageBlob)
      setOrgs((prev) => prev.map((o) => (o.id === orgId ? { ...o, avatarUrl: result.avatarUrl } : o)))
      if (selectedOrg?.id === orgId) setSelectedOrg((prev) => prev ? { ...prev, avatarUrl: result.avatarUrl } : prev)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload org avatar')
      return null
    }
  }, [client, selectedOrg])

  // --- Invite Links ---

  const [inviteLinks, setInviteLinks] = useState<InviteLink[]>([])

  const createInviteLink = useCallback(async (orgId: string, role?: string, roleId?: string, maxUses?: number) => {
    try {
      const link = await client.auth.createInviteLink(orgId, role, roleId, maxUses)
      setInviteLinks((prev) => [link, ...prev])
      return link
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create invite link')
      return null
    }
  }, [client])

  const refreshInviteLinks = useCallback(async (orgId: string) => {
    try {
      const list = await client.auth.listInviteLinks(orgId)
      setInviteLinks(list)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invite links')
    }
  }, [client])

  const revokeInviteLink = useCallback(async (orgId: string, linkId: string) => {
    try {
      await client.auth.revokeInviteLink(orgId, linkId)
      setInviteLinks((prev) => prev.filter((l) => l.id !== linkId))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke invite link')
      return false
    }
  }, [client])

  const getInviteLinkUrl = useCallback((link: { code: string; url?: string }) => {
    // Prefer the backend-built URL. Absolute values are returned as-is; a
    // relative value (starts with `?`) is resolved against the current
    // origin+pathname so the copied string is usable.
    if (link.url) {
      if (link.url.startsWith('http://') || link.url.startsWith('https://')) {
        return link.url
      }
      if (typeof window !== 'undefined') {
        return window.location.origin + window.location.pathname + link.url
      }
      return link.url
    }
    if (typeof window === 'undefined') return ''
    return `${window.location.origin}/login?invite_code=${link.code}`
  }, [])

  return {
    orgs, selectedOrg, members, invites, inviteLinks, roles, isLoading, error, setError,
    refresh, selectOrg, createOrg, updateOrg, deleteOrg,
    sendInvite, refreshInvites, revokeInvite,
    createInviteLink, refreshInviteLinks, revokeInviteLink, getInviteLinkUrl,
    updateMemberRole, removeMember, refreshMembers, refreshRoles, uploadOrgAvatar,
  }
}

export function useDeleteAccount() {
  const { client } = useSaaSContext()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deleteAccount = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      await client.auth.deleteAccount()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [client])

  return { deleteAccount, isLoading, error, setError }
}

export function useProfile() {
  const { client, user } = useSaaSContext()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const updateProfile = useCallback(
    async (params: { name?: string; avatarUrl?: string; metadata?: Record<string, unknown> }) => {
      setIsLoading(true)
      setError(null)
      setSuccess(null)
      try {
        const updated = await client.auth.updateProfile(params)
        setSuccess('Profile updated')
        return updated
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update profile')
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [client],
  )

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      setIsLoading(true)
      setError(null)
      setSuccess(null)
      try {
        await client.auth.changePassword(currentPassword, newPassword)
        setSuccess('Password changed successfully')
        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to change password')
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [client],
  )

  const uploadAvatar = useCallback(
    async (imageBlob: Blob) => {
      setIsLoading(true)
      setError(null)
      setSuccess(null)
      try {
        const result = await client.auth.uploadAvatar(imageBlob)
        setSuccess('Avatar updated')
        return result
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to upload avatar')
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [client],
  )

  return { user, updateProfile, uploadAvatar, changePassword, isLoading, error, success, setError, setSuccess }
}

export function useInvites() {
  const { client, user, isLoaded } = useSaaSContext()
  const [invites, setInvites] = useState<MyPendingInvite[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const list = await client.auth.listMyInvites()
      setInvites(list)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invites')
    } finally {
      setIsLoading(false)
    }
  }, [client])

  useEffect(() => { if (isLoaded && user) refresh() }, [isLoaded, user, refresh])

  const accept = useCallback(async (inviteId: string) => {
    try {
      const result = await client.auth.acceptInviteById(inviteId)
      setInvites((prev) => prev.filter((i) => i.id !== inviteId))
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept invite')
      return null
    }
  }, [client])

  const decline = useCallback(async (inviteId: string) => {
    try {
      await client.auth.declineInvite(inviteId)
      setInvites((prev) => prev.filter((i) => i.id !== inviteId))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to decline invite')
      return false
    }
  }, [client])

  return { invites, isLoading, error, setError, refresh, accept, decline }
}

export function useInviteLink() {
  const { client, user, isLoaded } = useSaaSContext()
  const [info, setInfo] = useState<InviteLinkInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchInfo = useCallback(async (code: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await client.auth.getInviteLinkInfo(code)
      setInfo(result)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid or expired invite link')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [client])

  const use = useCallback(async (code: string): Promise<UseInviteLinkResult | null> => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await client.auth.useInviteLink(code)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join organization')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [client])

  return { info, isLoading, error, setError, fetchInfo, use, isAuthenticated: !!user, isLoaded }
}

/**
 * Unified invite hook. Works for both per-email `AuthInvite` raw tokens and
 * reusable `AuthInviteLink` codes under a single `?invite_code=` URL param.
 *
 * `fetchInfo(code)` hits the public info endpoint — no auth required, safe to
 * call on the login screen before the user has a session.
 *
 * `accept(code)` hits the authenticated accept endpoint — requires a session.
 */
export function useInvite() {
  const { client, user, isLoaded } = useSaaSContext()
  const [info, setInfo] = useState<InviteInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchInfo = useCallback(async (code: string): Promise<InviteInfo | null> => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await client.auth.getInviteInfo(code)
      setInfo(result)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid or expired invite')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [client])

  const accept = useCallback(async (code: string): Promise<AcceptInviteByCodeResult | null> => {
    setIsLoading(true)
    setError(null)
    try {
      return await client.auth.acceptInviteByCode(code)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept invite')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [client])

  return { info, isLoading, error, setError, fetchInfo, accept, isAuthenticated: !!user, isLoaded }
}
