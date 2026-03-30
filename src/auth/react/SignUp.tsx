import { useState, useCallback, type FormEvent } from 'react'
import { ShadowHost } from '../../react/ShadowHost'
import { useSaaSContext } from '../../react/context'
import { useSignUp as useSignUpHook, useSignIn } from './hooks'
import { GoogleIcon, GitHubIcon, ICONS } from '../../styles/icons'
import type { Appearance } from '../../core/types'

export interface SignUpProps {
  appearance?: Appearance
  signInUrl?: string
  afterSignUpUrl?: string
  onSignIn?: () => void
}

export function SignUp({ appearance: localAppearance, signInUrl, onSignIn }: SignUpProps) {
  const { appearance: globalAppearance, settings } = useSaaSContext()
  const { signUp, isLoading, error, setError } = useSignUpHook()
  const { signInWithOAuth } = useSignIn()
  const appearance = localAppearance ?? globalAppearance

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleSubmit = useCallback(
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

  const hasOAuth = settings?.googleEnabled || settings?.githubEnabled
  const displayError = validationError || error

  return (
    <ShadowHost appearance={appearance}>
      {/* Brand icon above card */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '520px' }}>
        <div className="ss-auth-header">
          <div className="ss-auth-brand-icon-gradient">
            <span className="material-symbols-outlined">{ICONS.autoAwesome}</span>
          </div>
          <h1 className="ss-auth-title ss-auth-title-lg">Create your account</h1>
          <p className="ss-auth-subtitle">Join the ecosystem</p>
        </div>

        <div className="ss-auth-card">
          <div className="ss-auth-card-body">
            {/* OAuth */}
            {hasOAuth && (
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
                <div className="ss-auth-divider">or sign up with email</div>
              </>
            )}

            {/* Error */}
            {displayError && (
              <div className="ss-auth-error">
                <span className="material-symbols-outlined">{ICONS.errorOutline}</span>
                <span>{displayError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
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

            {/* Footer */}
            <div className="ss-auth-footer">
              Already have an account?{' '}
              {onSignIn ? (
                <span className="ss-auth-link" onClick={onSignIn}>Sign in</span>
              ) : signInUrl ? (
                <a className="ss-auth-link" href={signInUrl}>Sign in</a>
              ) : (
                <span className="ss-auth-link">Sign in</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </ShadowHost>
  )
}
