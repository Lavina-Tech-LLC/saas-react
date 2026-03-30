import { useState, useCallback, type FormEvent } from 'react'
import { ShadowHost } from '../../react/ShadowHost'
import { useSaaSContext } from '../../react/context'
import { useSignIn } from './hooks'
import { isMfaRequired } from '../types'
import { GoogleIcon, GitHubIcon, EmailIcon } from '../../styles/icons'
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
  const [mfaMode, setMfaMode] = useState(false)
  const [mfaToken, setMfaToken] = useState('')
  const [mfaCode, setMfaCode] = useState('')
  const [showEmailForm, setShowEmailForm] = useState(false)

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      if (mfaMode) {
        await submitMfaCode(mfaToken, mfaCode)
        return
      }
      const result = await signIn(email, password)
      if (result && isMfaRequired(result)) {
        setMfaToken(result.mfaToken)
        setMfaMode(true)
        setError(null)
      }
    },
    [email, password, mfaMode, mfaToken, mfaCode, signIn, submitMfaCode, setError],
  )

  const handleOAuth = useCallback(
    async (provider: 'google' | 'github') => {
      await signInWithOAuth(provider)
    },
    [signInWithOAuth],
  )

  const hasOAuth = settings?.googleEnabled || settings?.githubEnabled

  return (
    <ShadowHost appearance={appearance}>
      <div className="ss-card">
        <h2 className="ss-title">Sign in</h2>

        {!mfaMode && (
          <>
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

            {hasOAuth && !showEmailForm && <div className="ss-divider">or</div>}

            {hasOAuth && !showEmailForm && (
              <button
                type="button"
                className="ss-btn-social"
                onClick={() => setShowEmailForm(true)}
              >
                <span dangerouslySetInnerHTML={{ __html: EmailIcon }} />
                Login with email
              </button>
            )}

            {hasOAuth && showEmailForm && <div className="ss-divider">or</div>}
          </>
        )}

        {error && <div className="ss-global-error">{error}</div>}

        {(showEmailForm || mfaMode || !hasOAuth) && (
          <form onSubmit={handleSubmit}>
            {mfaMode ? (
              <div className="ss-field">
                <label className="ss-label" htmlFor="ss-mfa-code">
                  Authentication code
                </label>
                <input
                  id="ss-mfa-code"
                  className="ss-input"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="Enter 6-digit code"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  autoFocus
                />
              </div>
            ) : (
              <>
                <div className="ss-field">
                  <label className="ss-label" htmlFor="ss-email">
                    Email
                  </label>
                  <input
                    id="ss-email"
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
                  <label className="ss-label" htmlFor="ss-password">
                    Password
                  </label>
                  <input
                    id="ss-password"
                    className="ss-input"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            <button type="submit" className="ss-btn ss-btn-primary" disabled={isLoading}>
              {isLoading && <span className="ss-spinner" />}
              {mfaMode ? 'Verify' : 'Continue'}
            </button>
          </form>
        )}

        {mfaMode && (
          <div className="ss-footer">
            <span
              className="ss-link"
              onClick={() => {
                setMfaMode(false)
                setMfaCode('')
                setError(null)
              }}
            >
              Back to sign in
            </span>
          </div>
        )}

        {!mfaMode && (
          <div className="ss-footer">
            Don&apos;t have an account?{' '}
            {onSignUp ? (
              <span className="ss-link" onClick={onSignUp}>
                Sign up
              </span>
            ) : signUpUrl ? (
              <a className="ss-link" href={signUpUrl}>
                Sign up
              </a>
            ) : (
              <span className="ss-link">Sign up</span>
            )}
          </div>
        )}
      </div>
    </ShadowHost>
  )
}
