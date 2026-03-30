import { useRef, useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { resolveTheme, generateCSS } from '../styles/theme'
import type { Appearance } from '../core/types'

interface ShadowHostProps {
  children: ReactNode
  appearance?: Appearance
}

export function ShadowHost({ children, appearance }: ShadowHostProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [shadowRoot, setShadowRoot] = useState<ShadowRoot | null>(null)

  useEffect(() => {
    if (!hostRef.current || hostRef.current.shadowRoot) {
      setShadowRoot(hostRef.current?.shadowRoot ?? null)
      return
    }

    const shadow = hostRef.current.attachShadow({ mode: 'open' })

    // Inject Google Fonts into document.head (not shadow root — @font-face
    // must be registered at document level for browsers to resolve them).
    if (appearance?.fontUrl !== null) {
      const href = appearance?.fontUrl ??
        'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@400;500;600&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap'
      if (!document.querySelector(`link[href="${href}"]`)) {
        const fontLink = document.createElement('link')
        fontLink.rel = 'stylesheet'
        fontLink.href = href
        document.head.appendChild(fontLink)
      }
    }

    const theme = resolveTheme(appearance)
    const style = document.createElement('style')
    style.textContent = generateCSS(theme)
    shadow.appendChild(style)

    const container = document.createElement('div')
    shadow.appendChild(container)

    setShadowRoot(shadow)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Update styles when appearance changes.
  useEffect(() => {
    if (!shadowRoot) return
    const style = shadowRoot.querySelector('style')
    if (style) {
      const theme = resolveTheme(appearance)
      style.textContent = generateCSS(theme)
    }
  }, [appearance, shadowRoot])

  const container = shadowRoot?.querySelector('div') ?? null

  return (
    <div ref={hostRef} style={{ display: 'contents' }}>
      {container && createPortal(children, container)}
    </div>
  )
}
