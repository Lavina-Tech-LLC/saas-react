import { useState, useEffect, useCallback, useRef, type FormEvent, type KeyboardEvent } from 'react'
import { ShadowHost } from '../../react/ShadowHost'
import { useSaaSContext } from '../../react/context'
import { useSignIn as useSignInHook, useSignUp as useSignUpHook, useInvite, useAuth } from './hooks'
import { isMfaRequired } from '../types'
import type { InviteInfo } from '../types'
import { GoogleIcon, GitHubIcon, ICONS } from '../../styles/icons'
import type { Appearance } from '../../core/types'

export interface SignInProps {
  appearance?: Appearance
  afterSignInUrl?: string
  afterSignUpUrl?: string
  initialMode?: 'signIn' | 'signUp'
  /**
   * Explicit invite code. When omitted, the component reads `?invite_code=`
   * from `window.location.search` on mount. If a code is present (from either
   * source), the component enters invite-landing mode instead of the normal
   * sign-in UI.
   */
  inviteCode?: string
}

/**
 * Strip `invite_code` from the current URL without reloading. Called after a
 * successful accept/sign-up so the consumer's existing "redirect when user is
 * set" effects fire with a clean URL.
 */
function clearInviteFromUrl() {
  if (typeof window === 'undefined') return
  const params = new URLSearchParams(window.location.search)
  if (!params.has('invite_code')) return
  params.delete('invite_code')
  const search = params.toString()
  window.history.replaceState(
    null,
    '',
    window.location.pathname + (search ? '?' + search : '') + window.location.hash,
  )
}

function resolveInitialInviteCode(explicit?: string): string | null {
  if (explicit) return explicit
  if (typeof window === 'undefined') return null
  return new URLSearchParams(window.location.search).get('invite_code')
}

function formatInviterName(info: InviteInfo): string {
  if (info.inviterName && info.inviterName.trim() !== '') return info.inviterName
  if (info.inviterEmail) return info.inviterEmail.split('@')[0]
  return 'Someone'
}

export function SignIn({
  appearance: localAppearance,
  afterSignInUrl,
  afterSignUpUrl,
  initialMode = 'signIn',
  inviteCode: explicitInviteCode,
}: SignInProps) {
  const { appearance: globalAppearance, settings } = useSaaSContext()
  const { signIn, signInWithOAuth, submitMfaCode, isLoading: signInLoading, error: signInError, setError: setSignInError } = useSignInHook()
  const { signUp, isLoading: signUpLoading, error: signUpError, setError: setSignUpError } = useSignUpHook()
  const { isSignedIn, refreshUser } = useAuth()
  const { info: inviteInfo, isLoading: inviteLoading, error: inviteError, setError: setInviteError, fetchInfo: fetchInviteInfo, accept: acceptInvite } = useInvite()
  const appearance = localAppearance ?? globalAppearance

  // Invite-flow state. `code` tracks the active invite code; clearing it exits
  // invite mode and falls through to the normal sign-in UI.
  const [code, setCode] = useState<string | null>(() => resolveInitialInviteCode(explicitInviteCode))
  // When true, the signed-out user has clicked "Accept" and we're showing the
  // sign-up form (still within the invite context) so they can create an account.
  const [showSignUpForInvite, setShowSignUpForInvite] = useState(false)
  const [acceptError, setAcceptError] = useState<string | null>(null)
  const [isAccepting, setIsAccepting] = useState(false)

  // Fetch invite info whenever `code` is set. Clearing `code` exits invite
  // mode and falls through to the normal sign-in UI.
  useEffect(() => {
    if (!code) return
    if (inviteInfo || inviteLoading || inviteError) return
    void fetchInviteInfo(code)
  }, [code, inviteInfo, inviteLoading, inviteError, fetchInviteInfo])

  const [mode, setMode] = useState<'signIn' | 'signUp'>(initialMode)

  // Shared fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Sign-up fields
  const [confirmPassword, setConfirmPassword] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  // Email form visibility (collapsed when OAuth is available)
  const [showEmailForm, setShowEmailForm] = useState(false)

  // MFA fields
  const [mfaMode, setMfaMode] = useState(false)
  const [mfaToken, setMfaToken] = useState('')
  const [mfaDigits, setMfaDigits] = useState<string[]>(['', '', '', '', '', ''])
  const digitRefs = useRef<(HTMLInputElement | null)[]>([])

  const isLoading = mode === 'signIn' ? signInLoading : signUpLoading
  const error = mode === 'signIn' ? signInError : (validationError || signUpError)

  const switchMode = useCallback((newMode: 'signIn' | 'signUp') => {
    setMode(newMode)
    setSignInError(null)
    setSignUpError(null)
    setValidationError(null)
    setMfaMode(false)
    setMfaDigits(['', '', '', '', '', ''])
  }, [setSignInError, setSignUpError])

  const handleSignInSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      if (mfaMode) {
        await submitMfaCode(mfaToken, mfaDigits.join(''))
        return
      }
      const result = await signIn(email, password)
      if (result && isMfaRequired(result)) {
        setMfaToken(result.mfaToken)
        setMfaMode(true)
        setSignInError(null)
      }
    },
    [email, password, mfaMode, mfaToken, mfaDigits, signIn, submitMfaCode, setSignInError],
  )

  const handleSignUpSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      setValidationError(null)

      if (password !== confirmPassword) {
        setValidationError('Passwords do not match')
        return
      }

      const minLen = settings?.passwordMinLength ?? 8
      if (password.length < minLen) {
        setValidationError(`Password must be at least ${minLen} characters`)
        return
      }

      // If this submit is part of an invite flow, strip the code from the URL
      // *before* awaiting so the consumer's redirect effect reads a clean URL
      // once the user state transitions on success.
      if (showSignUpForInvite && code) {
        clearInviteFromUrl()
      }
      await signUp(email, password, showSignUpForInvite && code ? code : undefined)
      if (showSignUpForInvite) {
        setCode(null)
        setShowSignUpForInvite(false)
      }
    },
    [email, password, confirmPassword, settings, signUp, showSignUpForInvite, code],
  )

  const handleOAuth = useCallback(
    async (provider: 'google' | 'github') => {
      await signInWithOAuth(provider)
    },
    [signInWithOAuth],
  )

  const handleAccept = useCallback(async () => {
    if (!code) return
    setAcceptError(null)
    if (isSignedIn) {
      // Signed-in user: accept directly, then let the consumer's redirect fire
      // when `refreshUser()` updates the user reference.
      setIsAccepting(true)
      try {
        const result = await acceptInvite(code)
        if (!result) {
          setAcceptError(inviteError || 'Failed to accept invite')
          return
        }
        clearInviteFromUrl()
        setCode(null)
        await refreshUser()
      } finally {
        setIsAccepting(false)
      }
    } else {
      // Guest: reveal the sign-up form, pre-fill email if the invite targets one.
      if (inviteInfo?.type === 'email' && inviteInfo.targetEmail) {
        setEmail(inviteInfo.targetEmail)
      }
      setMode('signUp')
      setShowSignUpForInvite(true)
    }
  }, [code, isSignedIn, acceptInvite, inviteError, refreshUser, inviteInfo])

  const handleDigitChange = useCallback((index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const digit = value.slice(-1)
    setMfaDigits((prev) => {
      const next = [...prev]
      next[index] = digit
      return next
    })
    if (digit && index < 5) {
      digitRefs.current[index + 1]?.focus()
    }
  }, [])

  const handleDigitKeyDown = useCallback((index: number, e: KeyboardEvent) => {
    if (e.key === 'Backspace' && !mfaDigits[index] && index > 0) {
      digitRefs.current[index - 1]?.focus()
    }
  }, [mfaDigits])

  const hasOAuth = settings?.googleEnabled || settings?.githubEnabled
  const isSignIn = mode === 'signIn'

  // Invite-landing: while fetching info.
  if (code && inviteLoading && !inviteInfo) {
    return (
      <ShadowHost appearance={appearance}>
        <div className="ss-auth-card">
          <div className="ss-auth-card-body">
            <div className="ss-auth-header">
              <div className="ss-auth-spinner" style={{ margin: '0 auto' }} />
              <p className="ss-auth-subtitle" style={{ marginTop: 16 }}>Loading invite…</p>
            </div>
          </div>
        </div>
      </ShadowHost>
    )
  }

  // Invite-landing: fetch failed (expired / invalid / revoked).
  if (code && inviteError && !inviteInfo) {
    return (
      <ShadowHost appearance={appearance}>
        <div className="ss-auth-card">
          <div className="ss-auth-card-body">
            <div className="ss-auth-header">
              <h1 className="ss-auth-title">Invite unavailable</h1>
              <p className="ss-auth-subtitle">{inviteError}</p>
            </div>
            <div className="ss-auth-footer">
              <span
                className="ss-auth-link"
                onClick={() => {
                  setInviteError(null)
                  clearInviteFromUrl()
                  setCode(null)
                }}
              >
                Back to sign in
              </span>
            </div>
          </div>
        </div>
      </ShadowHost>
    )
  }

  // Invite-landing: info loaded, show the Accept card (no login / no OAuth).
  if (code && inviteInfo && !showSignUpForInvite) {
    return (
      <ShadowHost appearance={appearance}>
        <div className="ss-auth-card">
          <div className="ss-auth-card-body">
            <div className="ss-auth-header">
              {inviteInfo.orgAvatarUrl ? (
                <img
                  src={inviteInfo.orgAvatarUrl}
                  alt={inviteInfo.orgName}
                  className="ss-auth-org-avatar"
                />
              ) : (
                <div className="ss-auth-org-avatar ss-auth-org-avatar-fallback">
                  {inviteInfo.orgName.charAt(0).toUpperCase()}
                </div>
              )}
              <h1 className="ss-auth-title">
                {formatInviterName(inviteInfo)} invites you to {inviteInfo.orgName}
              </h1>
              <p className="ss-auth-subtitle">
                Join as <strong>{inviteInfo.roleName || inviteInfo.role}</strong>
              </p>
            </div>
            {(acceptError || inviteError) && (
              <div className="ss-auth-error">
                <span className="material-symbols-outlined">{ICONS.errorOutline}</span>
                <span>{acceptError || inviteError}</span>
              </div>
            )}
            <button
              type="button"
              className="ss-auth-btn-primary"
              onClick={handleAccept}
              disabled={isAccepting || inviteLoading}
            >
              {isAccepting && <span className="ss-auth-spinner" />}
              Accept invite
              {!isAccepting && (
                <span className="material-symbols-outlined">{ICONS.arrowForward}</span>
              )}
            </button>
            <div className="ss-auth-footer">
              <span
                className="ss-auth-link"
                onClick={() => {
                  clearInviteFromUrl()
                  setCode(null)
                  setInviteError(null)
                }}
              >
                Not now
              </span>
            </div>
          </div>
        </div>
      </ShadowHost>
    )
  }

  return (
    <ShadowHost appearance={appearance}>
      <div className="ss-auth-card">
        <div className="ss-auth-card-body">
          {/* Header */}
          <div className="ss-auth-header">
            {showSignUpForInvite && inviteInfo ? (
              <>
                {inviteInfo.orgAvatarUrl ? (
                  <img
                    src={inviteInfo.orgAvatarUrl}
                    alt={inviteInfo.orgName}
                    className="ss-auth-org-avatar"
                  />
                ) : (
                  <div className="ss-auth-org-avatar ss-auth-org-avatar-fallback">
                    {inviteInfo.orgName.charAt(0).toUpperCase()}
                  </div>
                )}
                <h1 className="ss-auth-title">Join {inviteInfo.orgName}</h1>
                <p className="ss-auth-subtitle">
                  Invited by {formatInviterName(inviteInfo)} as{' '}
                  <strong>{inviteInfo.roleName || inviteInfo.role}</strong>
                </p>
              </>
            ) : (
              <>
                <h1 className="ss-auth-title">
                  {isSignIn ? 'Sign in to your account' : 'Create your account'}
                </h1>
                <p className="ss-auth-subtitle">
                  {isSignIn ? 'Welcome back to your workspace' : 'Join the ecosystem'}
                </p>
              </>
            )}
          </div>

          {/* OAuth */}
          {!mfaMode && hasOAuth && !showSignUpForInvite && (
            <>
              <div className="ss-auth-oauth-grid">
                {settings?.googleEnabled && (
                  <button
                    type="button"
                    className="ss-auth-btn-social"
                    onClick={() => handleOAuth('google')}
                    disabled={isLoading}
                  >
                    <span dangerouslySetInnerHTML={{ __html: GoogleIcon }} />
                    Google
                  </button>
                )}
                {settings?.githubEnabled && (
                  <button
                    type="button"
                    className="ss-auth-btn-social"
                    onClick={() => handleOAuth('github')}
                    disabled={isLoading}
                  >
                    <span dangerouslySetInnerHTML={{ __html: GitHubIcon }} />
                    GitHub
                  </button>
                )}
              </div>
              {!showEmailForm ? (
                <div className="ss-auth-divider">
                  <span
                    className="ss-auth-link"
                    onClick={() => setShowEmailForm(true)}
                  >
                    {isSignIn ? 'or sign in with email' : 'or sign up with email'}
                  </span>
                </div>
              ) : (
                <div className="ss-auth-divider">
                  {isSignIn ? 'or continue with' : 'or sign up with email'}
                </div>
              )}
            </>
          )}

          {/* Email/password forms (hidden behind spoiler when OAuth is available) */}
          {(!hasOAuth || showEmailForm || mfaMode || showSignUpForInvite) && (
            <>
          {/* Error */}
          {error && (
            <div className="ss-auth-error">
              <span className="material-symbols-outlined">{ICONS.errorOutline}</span>
              <span>{error}</span>
            </div>
          )}

          {/* Sign In Form */}
          {isSignIn && (
            <form onSubmit={handleSignInSubmit}>
              {mfaMode ? (
                <>
                  <div className="ss-auth-mfa-divider">
                    <span>Verification Required</span>
                  </div>
                  <div className="ss-auth-field">
                    <label className="ss-auth-label">6-Digit Code</label>
                    <div className="ss-auth-mfa-group">
                      {mfaDigits.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => { digitRefs.current[i] = el }}
                          className="ss-auth-mfa-digit"
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleDigitChange(i, e.target.value)}
                          onKeyDown={(e) => handleDigitKeyDown(i, e)}
                          autoFocus={i === 0}
                        />
                      ))}
                    </div>
                    <p className="ss-auth-mfa-hint">We sent a 6-digit code to your registered email.</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="ss-auth-field">
                    <label className="ss-auth-label" htmlFor="ss-email">Email Address</label>
                    <input
                      id="ss-email"
                      className="ss-auth-input"
                      type="email"
                      autoComplete="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="ss-auth-field">
                    <div className="ss-auth-field-row">
                      <label className="ss-auth-label" htmlFor="ss-password" style={{ marginBottom: 0 }}>Password</label>
                      <span className="ss-auth-link" style={{ fontSize: '12px' }}>Forgot?</span>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="ss-password"
                        className="ss-auth-input"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="ss-auth-visibility-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <span className="material-symbols-outlined">
                          {showPassword ? ICONS.visibilityOff : ICONS.visibility}
                        </span>
                      </button>
                    </div>
                  </div>
                </>
              )}

              <button type="submit" className="ss-auth-btn-primary" disabled={isLoading}>
                {isLoading && <span className="ss-auth-spinner" />}
                {mfaMode ? 'Verify' : 'Sign in'}
                {!isLoading && (
                  <span className="material-symbols-outlined">{ICONS.arrowForward}</span>
                )}
              </button>
            </form>
          )}

          {/* Sign Up Form */}
          {!isSignIn && (
            <form onSubmit={handleSignUpSubmit}>
              <div className="ss-auth-field">
                <label className="ss-auth-label" htmlFor="ss-signup-email">Email</label>
                <input
                  id="ss-signup-email"
                  className="ss-auth-input"
                  type="email"
                  autoComplete="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="ss-auth-field">
                <label className="ss-auth-label" htmlFor="ss-signup-password">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="ss-signup-password"
                    className="ss-auth-input"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setValidationError(null)
                    }}
                    required
                  />
                  <button
                    type="button"
                    className="ss-auth-visibility-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? ICONS.visibilityOff : ICONS.visibility}
                    </span>
                  </button>
                </div>
              </div>

              <div className="ss-auth-field">
                <label className="ss-auth-label" htmlFor="ss-signup-confirm">Confirm Password</label>
                <input
                  id="ss-signup-confirm"
                  className="ss-auth-input"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    setValidationError(null)
                  }}
                  required
                />
              </div>

              <button type="submit" className="ss-auth-btn-primary" disabled={isLoading}>
                {isLoading && <span className="ss-auth-spinner" />}
                Sign up
                {!isLoading && (
                  <span className="material-symbols-outlined">{ICONS.arrowForward}</span>
                )}
              </button>
            </form>
          )}
            </>
          )}

          {/* Legal Links */}
          {(settings?.privacyPolicyUrl || settings?.termsOfServiceUrl) && (
            <div className="ss-auth-legal-links">
              {settings.privacyPolicyUrl && (
                <a href={settings.privacyPolicyUrl} target="_blank" rel="noopener noreferrer">Privacy Policy</a>
              )}
              {settings.privacyPolicyUrl && settings.termsOfServiceUrl && <span> · </span>}
              {settings.termsOfServiceUrl && (
                <a href={settings.termsOfServiceUrl} target="_blank" rel="noopener noreferrer">Terms of Service</a>
              )}
            </div>
          )}

          {/* Footer */}
          {mfaMode ? (
            <div className="ss-auth-footer">
              <span
                className="ss-auth-link"
                onClick={() => {
                  setMfaMode(false)
                  setMfaDigits(['', '', '', '', '', ''])
                  setSignInError(null)
                }}
              >
                Back to sign in
              </span>
            </div>
          ) : showSignUpForInvite ? (
            <div className="ss-auth-footer">
              <span
                className="ss-auth-link"
                onClick={() => {
                  clearInviteFromUrl()
                  setCode(null)
                  setShowSignUpForInvite(false)
                  setInviteError(null)
                }}
              >
                Cancel
              </span>
            </div>
          ) : isSignIn ? (
            <div className="ss-auth-footer">
              Don&apos;t have an account?{' '}
              <span className="ss-auth-link" onClick={() => switchMode('signUp')}>Sign up</span>
            </div>
          ) : (
            <div className="ss-auth-footer">
              Already have an account?{' '}
              <span className="ss-auth-link" onClick={() => switchMode('signIn')}>Sign in</span>
            </div>
          )}
        </div>
      </div>
    </ShadowHost>
  )
}
