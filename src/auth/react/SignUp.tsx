import { useState, useCallback, type FormEvent } from 'react'
import { ShadowHost } from '../../react/ShadowHost'
import { useSaaSContext } from '../../react/context'
import { useSignUp as useSignUpHook, useSignIn } from './hooks'
import { GoogleIcon, GitHubIcon } from '../../styles/icons'
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
      <div className="ss-card">
        <h2 className="ss-title">Create account</h2>

        {settings?.googleEnabled && (
          <button
            type="button"
            className="ss-btn-social"
            onClick={() => handleOAuth('google')}
            disabled={isLoading}
          >
            <span dangerouslySetInnerHTML={{ __html: GoogleIcon }} />
            Continue with Google
          </button>
        )}

        {settings?.githubEnabled && (
          <button
            type="button"
            className="ss-btn-social"
            onClick={() => handleOAuth('github')}
            disabled={isLoading}
          >
            <span dangerouslySetInnerHTML={{ __html: GitHubIcon }} />
            Continue with GitHub
          </button>
        )}

        {hasOAuth && <div className="ss-divider">or</div>}

        {displayError && <div className="ss-global-error">{displayError}</div>}

        <form onSubmit={handleSubmit}>
          <div className="ss-field">
            <label className="ss-label" htmlFor="ss-signup-email">
              Email
            </label>
            <input
              id="ss-signup-email"
              className="ss-input"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="ss-field">
            <label className="ss-label" htmlFor="ss-signup-password">
              Password
            </label>
            <input
              id="ss-signup-password"
              className="ss-input"
              type="password"
              autoComplete="new-password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setValidationError(null)
              }}
              required
            />
          </div>

          <div className="ss-field">
            <label className="ss-label" htmlFor="ss-signup-confirm">
              Confirm password
            </label>
            <input
              id="ss-signup-confirm"
              className="ss-input"
              type="password"
              autoComplete="new-password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                setValidationError(null)
              }}
              required
            />
          </div>

          <button type="submit" className="ss-btn ss-btn-primary" disabled={isLoading}>
            {isLoading && <span className="ss-spinner" />}
            Create account
          </button>
        </form>

        <div className="ss-footer">
          Already have an account?{' '}
          {onSignIn ? (
            <span className="ss-link" onClick={onSignIn}>
              Sign in
            </span>
          ) : signInUrl ? (
            <a className="ss-link" href={signInUrl}>
              Sign in
            </a>
          ) : (
            <span className="ss-link">Sign in</span>
          )}
        </div>
      </div>
    </ShadowHost>
  )
}
