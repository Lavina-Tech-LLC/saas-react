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
