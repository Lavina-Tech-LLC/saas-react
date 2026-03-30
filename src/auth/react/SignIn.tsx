import { useState, useCallback, useRef, type FormEvent, type KeyboardEvent } from 'react'
import { ShadowHost } from '../../react/ShadowHost'
import { useSaaSContext } from '../../react/context'
import { useSignIn as useSignInHook, useSignUp as useSignUpHook } from './hooks'
import { isMfaRequired } from '../types'
import { GoogleIcon, GitHubIcon, ICONS } from '../../styles/icons'
import type { Appearance } from '../../core/types'

export interface SignInProps {
  appearance?: Appearance
  afterSignInUrl?: string
  afterSignUpUrl?: string
  initialMode?: 'signIn' | 'signUp'
}

export function SignIn({
  appearance: localAppearance,
  afterSignInUrl,
  afterSignUpUrl,
  initialMode = 'signIn',
}: SignInProps) {
  const { appearance: globalAppearance, settings } = useSaaSContext()
  const { signIn, signInWithOAuth, submitMfaCode, isLoading: signInLoading, error: signInError, setError: setSignInError } = useSignInHook()
  const { signUp, isLoading: signUpLoading, error: signUpError, setError: setSignUpError } = useSignUpHook()
  const appearance = localAppearance ?? globalAppearance

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

      await signUp(email, password)
    },
    [email, password, confirmPassword, settings, signUp],
  )

  const handleOAuth = useCallback(
    async (provider: 'google' | 'github') => {
      await signInWithOAuth(provider)
    },
    [signInWithOAuth],
  )

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

  return (
    <ShadowHost appearance={appearance}>
      <div className="ss-auth-card">
        <div className="ss-auth-card-body">
          {/* Header */}
          <div className="ss-auth-header">
            <h1 className="ss-auth-title">
              {isSignIn ? 'Sign in to your account' : 'Create your account'}
            </h1>
            <p className="ss-auth-subtitle">
              {isSignIn ? 'Welcome back to your workspace' : 'Join the ecosystem'}
            </p>
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
          {(!hasOAuth || showEmailForm || mfaMode) && (
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
