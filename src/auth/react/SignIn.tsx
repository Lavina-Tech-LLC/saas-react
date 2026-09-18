import { useState, useEffect, useCallback, useRef, type FormEvent, type KeyboardEvent } from 'react'
import { ShadowHost } from '../../react/ShadowHost'
import { useSaaSContext } from '../../react/context'
import { useSignIn as useSignInHook, useSignUp as useSignUpHook, useInvite, useAuth, usePhoneOtp, useFace } from './hooks'
import { FaceScanner } from './FaceScanner'
import { isMfaRequired, isFaceRequired } from '../types'
import type { InviteInfo, FaceRequiredResult, FaceSample } from '../types'
import type { FacePose } from '../face/engine'
import type { IdentifierKind } from '../identifier'
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

/** Capture sequence used when the server does not send one. */
const DEFAULT_FACE_POSES: FacePose[] = ['center', 'left', 'right', 'up', 'down']

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
  const { isSignedIn, refreshUser, user: authUser } = useAuth()
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

  // Once the guest becomes authenticated while in invite-reveal mode (sign-up,
  // sign-in, or OAuth completion), auto-accept the invite. Sign-up already
  // attached the membership server-side in `Register`, so this call will 409
  // for that path — `useInvite` turns that into an error we intentionally
  // swallow. Sign-in/OAuth paths need this call to create the membership.
  useEffect(() => {
    if (!showSignUpForInvite || !code || !isSignedIn) return
    let cancelled = false
    ;(async () => {
      await acceptInvite(code)
      if (cancelled) return
      clearInviteFromUrl()
      setCode(null)
      setShowSignUpForInvite(false)
      await refreshUser()
    })()
    return () => { cancelled = true }
  }, [showSignUpForInvite, code, isSignedIn, acceptInvite, refreshUser])

  const [mode, setMode] = useState<'signIn' | 'signUp'>(initialMode)

  // Self-service sign-up can be switched off per project. Registration through
  // an invite stays open, so the invite flow ignores the flag. Settings may not
  // have loaded yet — assume open until we know otherwise.
  const canSignUp = (settings?.registrationEnabled ?? true) || showSignUpForInvite
  const isSignIn = canSignUp ? mode === 'signIn' : true

  // Shared fields. `identifier` holds either an email address or a phone
  // number — which one is decided by `identifierKind`.
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // A project may accept email, phone, or both. Default to email when it is
  // available; fall back to phone for phone-only projects.
  const emailAuthEnabled = settings?.emailAuthEnabled ?? settings?.emailEnabled ?? true
  const phoneAuthEnabled = settings?.phoneAuthEnabled ?? false
  const showIdentifierToggle = emailAuthEnabled && phoneAuthEnabled
  const [identifierKind, setIdentifierKind] = useState<IdentifierKind>('email')

  // Settings arrive asynchronously; snap to the only supported kind once known.
  useEffect(() => {
    if (!emailAuthEnabled && phoneAuthEnabled) setIdentifierKind('phone')
    if (emailAuthEnabled && !phoneAuthEnabled) setIdentifierKind('email')
  }, [emailAuthEnabled, phoneAuthEnabled])

  const isPhoneMode = identifierKind === 'phone'
  const identifierLabel = isPhoneMode ? 'Phone Number' : 'Email Address'
  // What the credentials form actually accepts, so a phone-only project never
  // offers to "sign in with email".
  const credentialsLabel = showIdentifierToggle
    ? 'email or phone'
    : phoneAuthEnabled
      ? 'phone number'
      : 'email'
  const identifierPlaceholder = isPhoneMode
    ? `${settings?.defaultPhoneCountryCode || '+992'} 90 111 22 33`
    : 'name@company.com'

  // Sign-up fields
  const [confirmPassword, setConfirmPassword] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  // Credentials form visibility (collapsed when OAuth is available)
  const [showCredentialsForm, setShowCredentialsForm] = useState(false)

  // MFA fields
  const [mfaMode, setMfaMode] = useState(false)
  const [mfaToken, setMfaToken] = useState('')
  const [mfaDigits, setMfaDigits] = useState<string[]>(['', '', '', '', '', ''])
  const digitRefs = useRef<(HTMLInputElement | null)[]>([])

  // Face control. `faceChallenge` holds the second step of a sign-in;
  // `faceEnrollAfterSignUp` covers the other entry point, where registration
  // already handed out a session and the user still has to scan.
  const face = useFace()
  const [faceChallenge, setFaceChallenge] = useState<FaceRequiredResult | null>(null)
  const [faceEnrollAfterSignUp, setFaceEnrollAfterSignUp] = useState(false)

  // SMS verification of a phone sign-up. Only reached when the project both
  // asks for verification and has a working SMS provider — `phoneOtpRequired`
  // already accounts for that.
  const phoneOtp = usePhoneOtp()
  const [otpStep, setOtpStep] = useState(false)
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', ''])
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  const isLoading = isSignIn ? signInLoading : signUpLoading
  const error = isSignIn ? signInError : (validationError || signUpError)

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
      const result = mfaMode
        ? await submitMfaCode(mfaToken, mfaDigits.join(''))
        : await signIn(identifier, password, identifierKind)
      if (!result) return

      if (isMfaRequired(result)) {
        setMfaToken(result.mfaToken)
        setMfaMode(true)
        setSignInError(null)
        return
      }
      // Password (and TOTP, when enabled) accepted — the face step is what is
      // left between the user and a session.
      if (isFaceRequired(result)) {
        setFaceChallenge(result)
        setMfaMode(false)
        setSignInError(null)
      }
    },
    [identifier, identifierKind, password, mfaMode, mfaToken, mfaDigits, signIn, submitMfaCode, setSignInError],
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

      // A phone sign-up may have to confirm the number by SMS first. If the
      // project turns out to have no SMS provider the request comes back
      // "unavailable" and registration continues without a code.
      if (isPhoneMode && settings?.phoneOtpRequired && !phoneOtp.otpToken) {
        const outcome = await phoneOtp.send(identifier, 'register')
        if (outcome.status === 'sent') {
          setOtpStep(true)
          return
        }
        if (outcome.status === 'error') return
      }

      // If this submit is part of an invite flow, strip the code from the URL
      // *before* awaiting so the consumer's redirect effect reads a clean URL
      // once the user state transitions on success.
      if (showSignUpForInvite && code) {
        clearInviteFromUrl()
      }
      const result = await signUp(identifier, password, {
        inviteCode: showSignUpForInvite && code ? code : undefined,
        kind: identifierKind,
        otpToken: phoneOtp.otpToken ?? undefined,
      })
      if (result?.faceEnrollmentRequired) {
        setFaceEnrollAfterSignUp(true)
      }
      if (showSignUpForInvite) {
        setCode(null)
        setShowSignUpForInvite(false)
      }
    },
    [identifier, identifierKind, isPhoneMode, password, confirmPassword, settings, signUp, showSignUpForInvite, code, phoneOtp],
  )

  // Confirms the SMS code, then replays the sign-up with the proof token.
  const handleOtpSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      const verified = await phoneOtp.verify(identifier, otpDigits.join(''), 'register')
      if (!verified) return

      if (showSignUpForInvite && code) {
        clearInviteFromUrl()
      }
      const result = await signUp(identifier, password, {
        inviteCode: showSignUpForInvite && code ? code : undefined,
        kind: 'phone',
        otpToken: verified.otpToken,
      })
      if (result?.faceEnrollmentRequired) {
        setFaceEnrollAfterSignUp(true)
      }
      setOtpStep(false)
      setOtpDigits(['', '', '', '', '', ''])
      if (showSignUpForInvite) {
        setCode(null)
        setShowSignUpForInvite(false)
      }
    },
    [phoneOtp, identifier, otpDigits, password, signUp, showSignUpForInvite, code],
  )

  const handleFaceEnroll = useCallback(
    async (samples: FaceSample[]) => {
      // With a face token this also completes the sign-in; without one the user
      // already holds a session from registration.
      const result = await face.enroll(samples, { faceToken: faceChallenge?.faceToken })
      if (!result) return
      setFaceChallenge(null)
      setFaceEnrollAfterSignUp(false)
      await refreshUser()
    },
    [face, faceChallenge, refreshUser],
  )

  const handleFaceVerify = useCallback(
    async (samples: FaceSample[]) => {
      if (!faceChallenge || samples.length === 0) return
      const result = await face.verify(faceChallenge.faceToken, samples[0].descriptor)
      if (!result) return
      setFaceChallenge(null)
    },
    [face, faceChallenge],
  )

  const handleOAuth = useCallback(
    async (provider: 'google' | 'github') => {
      // Carry the invite code into the OAuth exchange so the backend keeps the
      // sign-up on the invite path (invited org only, no personal org).
      const result = await signInWithOAuth(provider, showSignUpForInvite && code ? code : undefined)
      // OAuth does not skip face control: the project may answer with a
      // challenge here just as it does for password sign-in.
      if (result && isFaceRequired(result)) {
        setFaceChallenge(result)
      }
    },
    [signInWithOAuth, showSignUpForInvite, code],
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
      // Guest: reveal the full standard SignIn UI (OAuth + email form + sign-in/
      // sign-up toggle). Keep the invite context in state so the post-auth effect
      // can auto-accept once the user is authenticated. Pre-fill email for
      // per-email invites so the target user doesn't need to retype it.
      if (inviteInfo?.type === 'email' && inviteInfo.targetEmail) {
        setIdentifier(inviteInfo.targetEmail)
        setIdentifierKind('email')
      }
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

  const handleOtpDigitChange = useCallback((index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const digit = value.slice(-1)
    setOtpDigits((prev) => {
      const next = [...prev]
      next[index] = digit
      return next
    })
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }, [])

  const handleOtpDigitKeyDown = useCallback((index: number, e: KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }, [otpDigits])

  const switchIdentifierKind = useCallback((kind: IdentifierKind) => {
    setIdentifierKind(kind)
    setIdentifier('')
    setSignInError(null)
    setSignUpError(null)
    setValidationError(null)
  }, [setSignInError, setSignUpError])

  // Rendered in both the sign-in and the sign-up form, which need distinct
  // input ids so their labels stay correctly associated.
  const identifierField = (inputId: string) => (
    <div className="ss-auth-field">
      {showIdentifierToggle ? (
        <div className="ss-auth-field-row">
          <label className="ss-auth-label" htmlFor={inputId} style={{ marginBottom: 0 }}>
            {identifierLabel}
          </label>
          <div className="ss-auth-identifier-toggle">
            <button
              type="button"
              className={`ss-auth-identifier-option${!isPhoneMode ? ' ss-auth-identifier-option-active' : ''}`}
              onClick={() => switchIdentifierKind('email')}
            >
              Email
            </button>
            <button
              type="button"
              className={`ss-auth-identifier-option${isPhoneMode ? ' ss-auth-identifier-option-active' : ''}`}
              onClick={() => switchIdentifierKind('phone')}
            >
              Phone
            </button>
          </div>
        </div>
      ) : (
        <label className="ss-auth-label" htmlFor={inputId}>{identifierLabel}</label>
      )}
      <input
        id={inputId}
        className="ss-auth-input"
        type={isPhoneMode ? 'tel' : 'email'}
        inputMode={isPhoneMode ? 'tel' : 'email'}
        autoComplete={isPhoneMode ? 'tel' : 'email'}
        placeholder={identifierPlaceholder}
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        required
      />
    </div>
  )

  const hasOAuth = settings?.googleEnabled || settings?.githubEnabled

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
              {isSignedIn
                ? `Accept as ${authUser?.name || authUser?.email || ''}`
                : 'Accept invite'}
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

  // Face control: either the second step of a sign-in, or the capture wizard
  // right after registration.
  if (faceChallenge || faceEnrollAfterSignUp) {
    const enrolling = faceEnrollAfterSignUp || !faceChallenge?.enrolled
    const poses = (enrolling
      ? ((faceChallenge?.poses as FacePose[] | undefined) ?? DEFAULT_FACE_POSES)
      : (['center'] as FacePose[]))

    return (
      <ShadowHost appearance={appearance}>
        <div className="ss-auth-card">
          <FaceScanner
            poses={poses}
            title={enrolling ? 'Set up face verification' : 'Face verification'}
            subtitle={
              enrolling
                ? 'Follow the prompts so we can recognise you next time you sign in.'
                : 'Look at the camera to finish signing in.'
            }
            consentText={
              enrolling
                ? 'Your camera is used to build a face signature. The video never leaves this device — only the signature is stored, encrypted, and you can delete it at any time from your account settings.'
                : undefined
            }
            confirmLabel={enrolling ? 'Allow camera and start' : 'Start camera'}
            modelUrl={settings?.faceModelUrl}
            isSubmitting={face.isLoading}
            error={face.error}
            onComplete={enrolling ? handleFaceEnroll : handleFaceVerify}
            onCancel={() => {
              // Cancelling a sign-in challenge drops back to the form; cancelling
              // the post-registration wizard just postpones it to the next login.
              setFaceChallenge(null)
              setFaceEnrollAfterSignUp(false)
              face.setError(null)
            }}
          />
        </div>
      </ShadowHost>
    )
  }

  // SMS confirmation of a phone sign-up.
  if (otpStep) {
    return (
      <ShadowHost appearance={appearance}>
        <div className="ss-auth-card">
          <div className="ss-auth-card-body">
            <div className="ss-auth-header">
              <h1 className="ss-auth-title">Confirm your number</h1>
              <p className="ss-auth-subtitle">We sent a 6-digit code to {identifier}</p>
            </div>

            {phoneOtp.error && (
              <div className="ss-auth-error">
                <span className="material-symbols-outlined">{ICONS.errorOutline}</span>
                <span>{phoneOtp.error}</span>
              </div>
            )}

            <form onSubmit={handleOtpSubmit}>
              <div className="ss-auth-field">
                <label className="ss-auth-label">Verification Code</label>
                <div className="ss-auth-mfa-group">
                  {otpDigits.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el }}
                      className="ss-auth-mfa-digit"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpDigitKeyDown(i, e)}
                      autoFocus={i === 0}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="ss-auth-btn-primary"
                disabled={phoneOtp.isLoading || signUpLoading || otpDigits.some((d) => d === '')}
              >
                {(phoneOtp.isLoading || signUpLoading) && <span className="ss-auth-spinner" />}
                Confirm and sign up
                {!phoneOtp.isLoading && !signUpLoading && (
                  <span className="material-symbols-outlined">{ICONS.arrowForward}</span>
                )}
              </button>
            </form>

            <div className="ss-auth-footer">
              {phoneOtp.resendAfterSeconds > 0 ? (
                <span>Resend available in {phoneOtp.resendAfterSeconds}s</span>
              ) : (
                <span
                  className="ss-auth-link"
                  onClick={() => { void phoneOtp.send(identifier, 'register') }}
                >
                  Send a new code
                </span>
              )}
              <div style={{ marginTop: 8 }}>
                <span
                  className="ss-auth-link"
                  onClick={() => {
                    setOtpStep(false)
                    setOtpDigits(['', '', '', '', '', ''])
                    phoneOtp.reset()
                  }}
                >
                  Change number
                </span>
              </div>
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
          {!mfaMode && hasOAuth && (
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
              {!showCredentialsForm ? (
                <div className="ss-auth-divider">
                  <span
                    className="ss-auth-link"
                    onClick={() => setShowCredentialsForm(true)}
                  >
                    {isSignIn
                      ? `or sign in with ${credentialsLabel}`
                      : `or sign up with ${credentialsLabel}`}
                  </span>
                </div>
              ) : (
                <div className="ss-auth-divider">
                  {isSignIn
                    ? `or continue with ${credentialsLabel}`
                    : `or sign up with ${credentialsLabel}`}
                </div>
              )}
            </>
          )}

          {/* Email/password forms (hidden behind spoiler when OAuth is available) */}
          {(!hasOAuth || showCredentialsForm || mfaMode || showSignUpForInvite) && (
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
                    <p className="ss-auth-mfa-hint">Enter the 6-digit code from your authenticator app.</p>
                  </div>
                </>
              ) : (
                <>
                  {identifierField('ss-identifier')}
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
              {identifierField('ss-signup-identifier')}

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
              {isSignIn ? (
                <>
                  Don&apos;t have an account?{' '}
                  <span className="ss-auth-link" onClick={() => switchMode('signUp')}>Sign up</span>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <span className="ss-auth-link" onClick={() => switchMode('signIn')}>Sign in</span>
                </>
              )}
              <div style={{ marginTop: 8 }}>
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
            </div>
          ) : isSignIn ? (
            canSignUp && (
              <div className="ss-auth-footer">
                Don&apos;t have an account?{' '}
                <span className="ss-auth-link" onClick={() => switchMode('signUp')}>Sign up</span>
              </div>
            )
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
