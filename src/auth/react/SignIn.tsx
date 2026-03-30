import { useState, useCallback, useRef, type FormEvent, type KeyboardEvent } from 'react'
import { ShadowHost } from '../../react/ShadowHost'
import { useSaaSContext } from '../../react/context'
import { useSignIn } from './hooks'
import { isMfaRequired } from '../types'
import { GoogleIcon, GitHubIcon, ICONS } from '../../styles/icons'
import type { Appearance } from '../../core/types'

export interface SignInProps {
  appearance?: Appearance
  signUpUrl?: string
  afterSignInUrl?: string
  onSignUp?: () => void
}

export function SignIn({ appearance: localAppearance, signUpUrl, onSignUp }: SignInProps) {
  const { appearance: globalAppearance, settings } = useSaaSContext()
  const { signIn, signInWithOAuth, submitMfaCode, isLoading, error, setError } = useSignIn()
  const appearance = localAppearance ?? globalAppearance

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [mfaMode, setMfaMode] = useState(false)
  const [mfaToken, setMfaToken] = useState('')
  const [mfaDigits, setMfaDigits] = useState<string[]>(['', '', '', '', '', ''])
  const digitRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleSubmit = useCallback(
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
        setError(null)
      }
    },
    [email, password, mfaMode, mfaToken, mfaDigits, signIn, submitMfaCode, setError],
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

  return (
    <ShadowHost appearance={appearance}>
      <div className="ss-auth-card">
        <div className="ss-auth-card-body">
          {/* Header */}
          <div className="ss-auth-header">
            <div className="ss-auth-brand-icon">
              <span className="material-symbols-outlined">{ICONS.token}</span>
            </div>
            <h1 className="ss-auth-title">Sign in to your account</h1>
            <p className="ss-auth-subtitle">Welcome back to your workspace</p>
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
              <div className="ss-auth-divider">or continue with</div>
            </>
          )}

          {/* Error */}
          {error && (
            <div className="ss-auth-error">
              <span className="material-symbols-outlined">{ICONS.errorOutline}</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
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

          {/* Footer */}
          {mfaMode ? (
            <div className="ss-auth-footer">
              <span
                className="ss-auth-link"
                onClick={() => {
                  setMfaMode(false)
                  setMfaDigits(['', '', '', '', '', ''])
                  setError(null)
                }}
              >
                Back to sign in
              </span>
            </div>
          ) : (
            <div className="ss-auth-footer">
              Don&apos;t have an account?{' '}
              {onSignUp ? (
                <span className="ss-auth-link" onClick={onSignUp}>Sign up</span>
              ) : signUpUrl ? (
                <a className="ss-auth-link" href={signUpUrl}>Sign up</a>
              ) : (
                <span className="ss-auth-link">Sign up</span>
              )}
            </div>
          )}
        </div>
      </div>
    </ShadowHost>
  )
}
