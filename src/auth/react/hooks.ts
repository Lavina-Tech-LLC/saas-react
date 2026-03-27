import { useState, useEffect, useCallback } from 'react'
import { useSaaSContext } from '../../react/context'
import type { AuthResult, OAuthProvider, Org, Member } from '../types'

export function useAuth() {
  const { client, user, isLoaded } = useSaaSContext()

  return {
    isLoaded,
    isSignedIn: !!user,
    user,
    signOut: useCallback(() => client.auth.signOut(), [client]),
    getToken: useCallback(() => client.auth.getToken(), [client]),
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
    async (email: string, password: string) => {
      setIsLoading(true)
      setError(null)
      try {
        return await client.auth.signUp(email, password)
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
  const { client } = useSaaSContext()
  const [orgs, setOrgs] = useState<Org[]>([])
  const [selectedOrg, setSelectedOrg] = useState<Org | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const list = await client.auth.listOrgs()
      setOrgs(list)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load organizations')
    } finally {
      setIsLoading(false)
    }
  }, [client])

  useEffect(() => { refresh() }, [refresh])

  const selectOrg = useCallback(async (orgId: string) => {
    try {
      const org = await client.auth.getOrg(orgId)
      setSelectedOrg(org)
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

  return { orgs, selectedOrg, members, isLoading, error, refresh, selectOrg, createOrg }
}
