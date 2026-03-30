import type { Appearance } from '../core/types'

export interface ResolvedTheme {
  // Legacy fields (unchanged defaults — used by billing/report .ss-* classes)
  colorPrimary: string
  colorPrimaryHover: string
  colorBackground: string
  colorText: string
  colorTextSecondary: string
  colorInputBackground: string
  colorInputBorder: string
  colorError: string
  colorSuccess: string
  colorWarning: string
  fontFamily: string
  borderRadius: string

  // MD3 auth tokens (used by .ss-auth-* classes)
  authPrimary: string
  authPrimaryContainer: string
  authOnPrimary: string
  authPrimaryFixed: string
  authSurface: string
  authSurfaceContainerLowest: string
  authSurfaceContainerLow: string
  authSurfaceContainer: string
  authSurfaceContainerHigh: string
  authSurfaceContainerHighest: string
  authOnSurface: string
  authOnSurfaceVariant: string
  authOutline: string
  authOutlineVariant: string
  authError: string
  authErrorContainer: string
  authSuccess: string
  authFontHeadline: string
  authFontBody: string
}

const lightDefaults: ResolvedTheme = {
  // Legacy (unchanged)
  colorPrimary: '#6366f1',
  colorPrimaryHover: '#4f46e5',
  colorBackground: '#ffffff',
  colorText: '#1a1a2e',
  colorTextSecondary: '#6b7280',
  colorInputBackground: '#f9fafb',
  colorInputBorder: '#d1d5db',
  colorError: '#ef4444',
  colorSuccess: '#22c55e',
  colorWarning: '#f59e0b',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  borderRadius: '8px',
  // MD3 auth
  authPrimary: '#4648d4',
  authPrimaryContainer: '#6063ee',
  authOnPrimary: '#ffffff',
  authPrimaryFixed: '#e1e0ff',
  authSurface: '#fcf8ff',
  authSurfaceContainerLowest: '#ffffff',
  authSurfaceContainerLow: '#f5f2ff',
  authSurfaceContainer: '#efecff',
  authSurfaceContainerHigh: '#e8e5ff',
  authSurfaceContainerHighest: '#e2e0fc',
  authOnSurface: '#1a1a2e',
  authOnSurfaceVariant: '#464554',
  authOutline: '#767586',
  authOutlineVariant: '#c7c4d7',
  authError: '#ba1a1a',
  authErrorContainer: '#ffdad6',
  authSuccess: '#22c55e',
  authFontHeadline: "'Manrope', sans-serif",
  authFontBody: "'Inter', sans-serif",
}

const darkDefaults: ResolvedTheme = {
  // Legacy (unchanged)
  colorPrimary: '#818cf8',
  colorPrimaryHover: '#6366f1',
  colorBackground: '#1e1e2e',
  colorText: '#e2e8f0',
  colorTextSecondary: '#94a3b8',
  colorInputBackground: '#2a2a3e',
  colorInputBorder: '#3f3f5e',
  colorError: '#f87171',
  colorSuccess: '#4ade80',
  colorWarning: '#fbbf24',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  borderRadius: '8px',
  // MD3 auth
  authPrimary: '#818cf8',
  authPrimaryContainer: '#6063ee',
  authOnPrimary: '#ffffff',
  authPrimaryFixed: '#2a2a3e',
  authSurface: '#1e1e2e',
  authSurfaceContainerLowest: '#161623',
  authSurfaceContainerLow: '#27273a',
  authSurfaceContainer: '#2d2d44',
  authSurfaceContainerHigh: '#363654',
  authSurfaceContainerHighest: '#3f3f61',
  authOnSurface: '#e2e8f0',
  authOnSurfaceVariant: '#94a3b8',
  authOutline: '#464554',
  authOutlineVariant: '#44445a',
  authError: '#f87171',
  authErrorContainer: '#93000a',
  authSuccess: '#4ade80',
  authFontHeadline: "'Manrope', sans-serif",
  authFontBody: "'Inter', sans-serif",
}

export function resolveTheme(appearance?: Appearance): ResolvedTheme {
  const base = appearance?.baseTheme === 'dark' ? darkDefaults : lightDefaults
  const vars = appearance?.variables

  const authPrimary = vars?.colorPrimary ?? base.authPrimary

  return {
    // Legacy
    colorPrimary: vars?.colorPrimary ?? base.colorPrimary,
    colorPrimaryHover: vars?.colorPrimary ? darken(vars.colorPrimary, 10) : base.colorPrimaryHover,
    colorBackground: vars?.colorBackground ?? base.colorBackground,
    colorText: vars?.colorText ?? base.colorText,
    colorTextSecondary: base.colorTextSecondary,
    colorInputBackground: vars?.colorInputBackground ?? base.colorInputBackground,
    colorInputBorder: vars?.colorInputBorder ?? base.colorInputBorder,
    colorError: vars?.colorError ?? base.colorError,
    colorSuccess: vars?.colorSuccess ?? base.colorSuccess,
    colorWarning: vars?.colorWarning ?? base.colorWarning,
    fontFamily: vars?.fontFamily ?? base.fontFamily,
    borderRadius: vars?.borderRadius ?? base.borderRadius,
    // MD3 auth — derive from user overrides where applicable
    authPrimary,
    authPrimaryContainer: vars?.colorPrimary ? lighten(authPrimary, 15) : base.authPrimaryContainer,
    authOnPrimary: base.authOnPrimary,
    authPrimaryFixed: base.authPrimaryFixed,
    authSurface: vars?.colorBackground ?? base.authSurface,
    authSurfaceContainerLowest: base.authSurfaceContainerLowest,
    authSurfaceContainerLow: vars?.colorInputBackground ?? base.authSurfaceContainerLow,
    authSurfaceContainer: base.authSurfaceContainer,
    authSurfaceContainerHigh: base.authSurfaceContainerHigh,
    authSurfaceContainerHighest: base.authSurfaceContainerHighest,
    authOnSurface: vars?.colorText ?? base.authOnSurface,
    authOnSurfaceVariant: base.authOnSurfaceVariant,
    authOutline: base.authOutline,
    authOutlineVariant: vars?.colorInputBorder ?? base.authOutlineVariant,
    authError: vars?.colorError ?? base.authError,
    authErrorContainer: base.authErrorContainer,
    authSuccess: vars?.colorSuccess ?? base.authSuccess,
    authFontHeadline: vars?.fontFamily ?? base.authFontHeadline,
    authFontBody: vars?.fontFamily ?? base.authFontBody,
  }
}

function darken(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.max(0, (num >> 16) - Math.round(2.55 * percent))
  const g = Math.max(0, ((num >> 8) & 0x00ff) - Math.round(2.55 * percent))
  const b = Math.max(0, (num & 0x0000ff) - Math.round(2.55 * percent))
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`
}

function lighten(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, (num >> 16) + Math.round(2.55 * percent))
  const g = Math.min(255, ((num >> 8) & 0x00ff) + Math.round(2.55 * percent))
  const b = Math.min(255, (num & 0x0000ff) + Math.round(2.55 * percent))
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`
}

export function generateCSS(theme: ResolvedTheme): string {
  return `
    :host {
      all: initial;
      font-family: ${theme.fontFamily};
      color: ${theme.colorText};
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    .ss-card {
      background: ${theme.colorBackground};
      border-radius: ${theme.borderRadius};
      padding: 32px;
      width: 100%;
      max-width: 480px;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
      border: 1px solid ${theme.colorInputBorder};
    }

    .ss-card-wide { max-width: 640px; }

    .ss-title {
      font-size: 22px;
      font-weight: 700;
      color: ${theme.colorText};
      text-align: center;
      margin-bottom: 24px;
    }

    .ss-subtitle {
      font-size: 14px;
      color: ${theme.colorTextSecondary};
      text-align: center;
      margin-top: -16px;
      margin-bottom: 24px;
    }

    .ss-field { margin-bottom: 16px; }

    .ss-label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: ${theme.colorText};
      margin-bottom: 6px;
    }

    .ss-input {
      width: 100%;
      padding: 10px 12px;
      font-size: 14px;
      font-family: inherit;
      border: 1px solid ${theme.colorInputBorder};
      border-radius: calc(${theme.borderRadius} - 2px);
      background: ${theme.colorInputBackground};
      color: ${theme.colorText};
      outline: none;
      transition: border-color 0.15s;
    }

    .ss-input:focus {
      border-color: ${theme.colorPrimary};
      box-shadow: 0 0 0 3px ${theme.colorPrimary}22;
    }

    .ss-input.ss-input-error { border-color: ${theme.colorError}; }

    .ss-query-textarea {
      resize: vertical;
      min-height: 60px;
      font-family: monospace;
    }

    .ss-error {
      font-size: 13px;
      color: ${theme.colorError};
      margin-top: 4px;
    }

    .ss-global-error {
      font-size: 13px;
      color: ${theme.colorError};
      background: ${theme.colorError}11;
      border: 1px solid ${theme.colorError}33;
      border-radius: calc(${theme.borderRadius} - 2px);
      padding: 10px 12px;
      margin-bottom: 16px;
      text-align: center;
    }

    .ss-success-msg {
      font-size: 13px;
      color: ${theme.colorSuccess};
      background: ${theme.colorSuccess}11;
      border: 1px solid ${theme.colorSuccess}33;
      border-radius: calc(${theme.borderRadius} - 2px);
      padding: 10px 12px;
      margin-bottom: 16px;
      text-align: center;
    }

    .ss-loading {
      text-align: center;
      padding: 24px;
      color: ${theme.colorTextSecondary};
      font-size: 14px;
    }

    .ss-empty {
      text-align: center;
      padding: 24px;
      color: ${theme.colorTextSecondary};
      font-size: 14px;
    }

    /* Buttons */

    .ss-btn {
      width: 100%;
      padding: 10px 16px;
      font-size: 14px;
      font-weight: 600;
      font-family: inherit;
      border: none;
      border-radius: calc(${theme.borderRadius} - 2px);
      cursor: pointer;
      transition: background 0.15s, opacity 0.15s;
    }

    .ss-btn:disabled { opacity: 0.6; cursor: not-allowed; }

    .ss-btn-primary {
      background: ${theme.colorPrimary};
      color: #fff;
    }

    .ss-btn-primary:hover:not(:disabled) { background: ${theme.colorPrimaryHover}; }

    .ss-btn-danger {
      background: ${theme.colorError};
      color: #fff;
    }

    .ss-btn-danger:hover:not(:disabled) { opacity: 0.9; }

    .ss-btn-current {
      background: ${theme.colorInputBackground};
      color: ${theme.colorTextSecondary};
      border: 1px solid ${theme.colorInputBorder};
    }

    .ss-btn-sm {
      width: auto;
      padding: 6px 12px;
      font-size: 12px;
    }

    .ss-btn-group {
      display: flex;
      gap: 8px;
      margin-top: 16px;
    }

    .ss-btn-group .ss-btn { flex: 1; }

    .ss-btn-org-switcher {
      display: flex;
      align-items: center;
      gap: 8px;
      background: ${theme.colorInputBackground};
      border: 1px solid ${theme.colorInputBorder};
      color: ${theme.colorText};
      padding: 8px 12px;
      font-size: 14px;
      font-family: inherit;
      border-radius: calc(${theme.borderRadius} - 2px);
      cursor: pointer;
      width: auto;
    }

    .ss-chevron { font-size: 10px; }

    .ss-btn-social {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      padding: 10px 16px;
      font-size: 14px;
      font-weight: 500;
      font-family: inherit;
      border: 1px solid ${theme.colorInputBorder};
      border-radius: calc(${theme.borderRadius} - 2px);
      background: ${theme.colorInputBackground};
      color: ${theme.colorText};
      cursor: pointer;
      transition: background 0.15s;
      margin-bottom: 8px;
    }

    .ss-btn-social:hover:not(:disabled) { background: ${theme.colorInputBorder}; }
    .ss-btn-social:disabled { opacity: 0.6; cursor: not-allowed; }
    .ss-btn-social svg { width: 18px; height: 18px; flex-shrink: 0; }

    .ss-divider {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 20px 0;
      color: ${theme.colorTextSecondary};
      font-size: 13px;
    }

    .ss-divider::before,
    .ss-divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: ${theme.colorInputBorder};
    }

    .ss-footer {
      text-align: center;
      margin-top: 20px;
      font-size: 14px;
      color: ${theme.colorTextSecondary};
    }

    .ss-link {
      color: ${theme.colorPrimary};
      text-decoration: none;
      cursor: pointer;
      font-weight: 500;
    }

    .ss-link:hover { text-decoration: underline; }

    .ss-spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top-color: currentColor;
      border-radius: 50%;
      animation: ss-spin 0.6s linear infinite;
      margin-right: 8px;
      vertical-align: middle;
    }

    @keyframes ss-spin { to { transform: rotate(360deg); } }

    /* UserButton / Dropdown */

    .ss-user-btn { position: relative; display: inline-block; }

    .ss-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: ${theme.colorPrimary};
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      font-family: inherit;
      transition: box-shadow 0.15s;
    }

    .ss-avatar:hover { box-shadow: 0 0 0 3px ${theme.colorPrimary}33; }

    .ss-dropdown {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      background: ${theme.colorBackground};
      border: 1px solid ${theme.colorInputBorder};
      border-radius: ${theme.borderRadius};
      padding: 8px 0;
      min-width: 200px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
      z-index: 9999;
    }

    .ss-dropdown-org { left: 0; right: auto; }

    .ss-dropdown-header {
      padding: 8px 16px 12px;
      border-bottom: 1px solid ${theme.colorInputBorder};
      margin-bottom: 4px;
    }

    .ss-dropdown-email {
      font-size: 13px;
      color: ${theme.colorTextSecondary};
      word-break: break-all;
    }

    .ss-dropdown-item {
      display: block;
      width: 100%;
      padding: 8px 16px;
      font-size: 14px;
      font-family: inherit;
      color: ${theme.colorText};
      background: none;
      border: none;
      text-align: left;
      cursor: pointer;
      transition: background 0.1s;
    }

    .ss-dropdown-item:hover { background: ${theme.colorInputBackground}; }
    .ss-dropdown-item-danger { color: ${theme.colorError}; }
    .ss-dropdown-item-active { font-weight: 600; color: ${theme.colorPrimary}; }

    .ss-dropdown-section-title {
      padding: 8px 16px 4px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: ${theme.colorTextSecondary};
    }

    .ss-org-check {
      margin-right: 6px;
      font-size: 12px;
    }

    .ss-danger-zone {
      padding-top: 20px;
      margin-top: 20px;
      border-top: 2px solid ${theme.colorError}33;
    }

    /* Badges */

    .ss-badge {
      display: inline-block;
      padding: 2px 8px;
      font-size: 11px;
      font-weight: 600;
      border-radius: 999px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      background: ${theme.colorInputBackground};
      color: ${theme.colorTextSecondary};
    }

    .ss-badge-active { background: ${theme.colorSuccess}22; color: ${theme.colorSuccess}; }
    .ss-badge-trialing { background: ${theme.colorPrimary}22; color: ${theme.colorPrimary}; }
    .ss-badge-past-due { background: ${theme.colorError}22; color: ${theme.colorError}; }
    .ss-badge-paused { background: ${theme.colorWarning}22; color: ${theme.colorWarning}; }
    .ss-badge-canceled { background: ${theme.colorTextSecondary}22; color: ${theme.colorTextSecondary}; }

    /* Tabs */

    .ss-tab-group {
      display: flex;
      border-bottom: 1px solid ${theme.colorInputBorder};
      margin-bottom: 24px;
    }

    .ss-tab-group-sm { margin-bottom: 16px; }

    .ss-tab {
      padding: 8px 16px;
      font-size: 14px;
      font-weight: 500;
      font-family: inherit;
      color: ${theme.colorTextSecondary};
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      cursor: pointer;
      transition: color 0.15s, border-color 0.15s;
    }

    .ss-tab:hover { color: ${theme.colorText}; }

    .ss-tab-active {
      color: ${theme.colorPrimary};
      border-bottom-color: ${theme.colorPrimary};
    }

    .ss-tab-content .ss-card { box-shadow: none; border: none; padding: 0; }

    /* Tables */

    .ss-table-container { overflow-x: auto; }

    .ss-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }

    .ss-th {
      text-align: left;
      padding: 10px 12px;
      font-weight: 600;
      color: ${theme.colorTextSecondary};
      border-bottom: 2px solid ${theme.colorInputBorder};
      white-space: nowrap;
    }

    .ss-th-sortable { cursor: pointer; user-select: none; }
    .ss-th-sortable:hover { color: ${theme.colorText}; }

    .ss-sort-indicator { font-size: 10px; }
    .ss-sorted-asc, .ss-sorted-desc { color: ${theme.colorPrimary}; }

    .ss-td {
      padding: 10px 12px;
      border-bottom: 1px solid ${theme.colorInputBorder};
      color: ${theme.colorText};
    }

    .ss-tr:hover .ss-td { background: ${theme.colorInputBackground}; }

    .ss-table-footer {
      text-align: center;
      padding: 8px;
      font-size: 12px;
      color: ${theme.colorTextSecondary};
    }

    /* Pricing */

    .ss-pricing-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
    }

    .ss-pricing-card {
      background: ${theme.colorBackground};
      border: 1px solid ${theme.colorInputBorder};
      border-radius: ${theme.borderRadius};
      padding: 24px;
      display: flex;
      flex-direction: column;
    }

    .ss-pricing-card-current { border-color: ${theme.colorPrimary}; }

    .ss-pricing-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }

    .ss-pricing-name {
      font-size: 18px;
      font-weight: 600;
      color: ${theme.colorText};
    }

    .ss-pricing-price { margin-bottom: 12px; }

    .ss-pricing-amount {
      font-size: 32px;
      font-weight: 700;
      color: ${theme.colorText};
    }

    .ss-pricing-interval {
      font-size: 14px;
      color: ${theme.colorTextSecondary};
    }

    .ss-pricing-desc {
      font-size: 14px;
      color: ${theme.colorTextSecondary};
      margin-bottom: 16px;
    }

    .ss-pricing-features {
      list-style: none;
      flex: 1;
      margin-bottom: 20px;
    }

    .ss-pricing-feature {
      font-size: 14px;
      color: ${theme.colorText};
      padding: 4px 0;
    }

    .ss-check { color: ${theme.colorSuccess}; margin-right: 6px; }

    /* Usage / Progress */

    .ss-usage-item { margin-bottom: 16px; }

    .ss-usage-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
    }

    .ss-usage-metric {
      font-size: 14px;
      font-weight: 500;
      color: ${theme.colorText};
    }

    .ss-usage-value {
      font-size: 14px;
      color: ${theme.colorTextSecondary};
    }

    .ss-progress-bar {
      width: 100%;
      height: 8px;
      background: ${theme.colorInputBackground};
      border-radius: 4px;
      overflow: hidden;
    }

    .ss-progress-fill {
      height: 100%;
      background: ${theme.colorPrimary};
      border-radius: 4px;
      transition: width 0.3s;
    }

    .ss-progress-danger { background: ${theme.colorError}; }

    /* Chart */

    .ss-chart-container { text-align: center; }

    .ss-chart-title {
      font-size: 16px;
      font-weight: 600;
      color: ${theme.colorText};
      margin-bottom: 12px;
    }

    /* Dashboard */

    .ss-dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 16px;
    }

    .ss-widget {
      background: ${theme.colorBackground};
      border: 1px solid ${theme.colorInputBorder};
      border-radius: ${theme.borderRadius};
      padding: 16px;
    }

    .ss-widget-header {
      font-size: 14px;
      font-weight: 600;
      color: ${theme.colorText};
      margin-bottom: 12px;
    }

    /* Saved Queries */

    .ss-saved-query-card {
      padding: 12px 16px;
      border: 1px solid ${theme.colorInputBorder};
      border-radius: calc(${theme.borderRadius} - 2px);
      margin-bottom: 8px;
      cursor: pointer;
      transition: border-color 0.15s;
    }

    .ss-saved-query-card:hover { border-color: ${theme.colorPrimary}; }

    .ss-saved-query-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 4px;
    }

    .ss-saved-query-name {
      font-size: 14px;
      font-weight: 600;
      color: ${theme.colorText};
    }

    .ss-saved-query-desc {
      font-size: 13px;
      color: ${theme.colorTextSecondary};
      margin-bottom: 8px;
    }

    .ss-saved-query-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .ss-saved-query-date {
      font-size: 12px;
      color: ${theme.colorTextSecondary};
    }

    /* Modal Overlay */

    .ss-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      animation: ss-fade-in 0.15s ease-out;
    }

    @keyframes ss-fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .ss-modal {
      background: ${theme.colorBackground};
      border-radius: ${theme.borderRadius};
      padding: 32px;
      width: 90%;
      max-width: 480px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 16px 64px rgba(0, 0, 0, 0.2);
      border: 1px solid ${theme.colorInputBorder};
      animation: ss-scale-in 0.15s ease-out;
    }

    @keyframes ss-scale-in {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    .ss-modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
    }

    .ss-modal-title {
      font-size: 18px;
      font-weight: 700;
      color: ${theme.colorText};
    }

    .ss-modal-close {
      background: none;
      border: none;
      font-size: 20px;
      color: ${theme.colorTextSecondary};
      cursor: pointer;
      padding: 4px;
      line-height: 1;
      border-radius: 4px;
      transition: background 0.15s;
      font-family: inherit;
    }

    .ss-modal-close:hover {
      background: ${theme.colorInputBackground};
      color: ${theme.colorText};
    }

    .ss-modal-section {
      padding-top: 20px;
      margin-top: 20px;
      border-top: 1px solid ${theme.colorInputBorder};
    }

    .ss-modal-section-title {
      font-size: 15px;
      font-weight: 600;
      color: ${theme.colorText};
      margin-bottom: 16px;
    }

    .ss-avatar-preview {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: ${theme.colorPrimary};
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 16px;
      overflow: hidden;
    }

    .ss-avatar-preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    /* Avatar hover overlay */
    .ss-avatar-hoverable {
      position: relative;
      cursor: pointer;
      transition: filter 0.15s;
    }

    .ss-avatar-overlay {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.15s;
      color: #fff;
    }

    .ss-avatar-hoverable:hover .ss-avatar-overlay {
      opacity: 1;
    }

    /* Avatar cropper */
    .ss-avatar-cropper {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .ss-avatar-canvas {
      border-radius: ${theme.borderRadius};
      background: #111;
      touch-action: none;
      max-width: 100%;
    }

    .ss-avatar-zoom {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
    }

    .ss-avatar-zoom-label {
      font-size: 13px;
      color: ${theme.colorTextSecondary};
      flex-shrink: 0;
    }

    .ss-avatar-zoom-slider {
      flex: 1;
      height: 4px;
      -webkit-appearance: none;
      appearance: none;
      background: ${theme.colorInputBorder};
      border-radius: 2px;
      outline: none;
    }

    .ss-avatar-zoom-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: ${theme.colorPrimary};
      cursor: pointer;
    }

    .ss-avatar-zoom-slider::-moz-range-thumb {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: ${theme.colorPrimary};
      cursor: pointer;
      border: none;
    }

    /* Dropzone */
    .ss-avatar-dropzone {
      border: 2px dashed ${theme.colorInputBorder};
      border-radius: ${theme.borderRadius};
      padding: 40px 24px;
      text-align: center;
      cursor: pointer;
      transition: border-color 0.15s, background 0.15s;
      color: ${theme.colorTextSecondary};
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    .ss-avatar-dropzone:hover,
    .ss-avatar-dropzone-active {
      border-color: ${theme.colorPrimary};
      background: ${theme.colorPrimary}08;
    }

    .ss-avatar-dropzone svg {
      opacity: 0.5;
    }

    .ss-input-readonly {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* Inline form (for org creation in dropdown) */

    .ss-dropdown-divider {
      height: 1px;
      background: ${theme.colorInputBorder};
      margin: 4px 0;
    }

    .ss-inline-form {
      padding: 12px 16px;
    }

    .ss-inline-form .ss-field {
      margin-bottom: 8px;
    }

    .ss-inline-form .ss-input {
      font-size: 13px;
      padding: 6px 10px;
    }

    .ss-inline-form .ss-btn {
      font-size: 13px;
      padding: 6px 12px;
    }

    /* ====================== AUTH COMPONENTS ====================== */

    .material-symbols-outlined {
      font-family: 'Material Symbols Outlined';
      font-weight: normal;
      font-style: normal;
      font-size: 24px;
      line-height: 1;
      letter-spacing: normal;
      text-transform: none;
      display: inline-block;
      white-space: nowrap;
      word-wrap: normal;
      direction: ltr;
      -webkit-font-feature-settings: 'liga';
      font-feature-settings: 'liga';
      -webkit-font-smoothing: antialiased;
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
      vertical-align: middle;
    }

    /* Auth Card */
    .ss-auth-card {
      background: ${theme.authSurfaceContainerLowest};
      border-radius: 12px;
      border: 1px solid ${theme.authOutlineVariant}26;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
      width: 100%;
      max-width: 520px;
      overflow: hidden;
    }

    .ss-auth-card-wide { max-width: 640px; }

    .ss-auth-card-body { padding: 32px; }

    /* Auth Header */
    .ss-auth-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .ss-auth-brand-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: ${theme.authPrimary}1a;
      margin-bottom: 16px;
    }

    .ss-auth-brand-icon .material-symbols-outlined {
      color: ${theme.authPrimary};
      font-size: 28px;
    }

    .ss-auth-brand-icon-gradient {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: linear-gradient(135deg, ${theme.authPrimary}, ${theme.authPrimaryContainer});
      box-shadow: 0 8px 24px ${theme.authPrimary}33;
      margin-bottom: 16px;
    }

    .ss-auth-brand-icon-gradient .material-symbols-outlined {
      color: ${theme.authOnPrimary};
      font-size: 24px;
    }

    /* Auth Typography */
    .ss-auth-title {
      font-family: ${theme.authFontHeadline};
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: ${theme.authOnSurface};
      margin: 0;
      line-height: 1.2;
    }

    .ss-auth-title-lg { font-size: 28px; }

    .ss-auth-subtitle {
      font-family: ${theme.authFontBody};
      font-size: 14px;
      color: ${theme.authOnSurfaceVariant};
      margin-top: 8px;
    }

    .ss-auth-label {
      display: block;
      font-family: ${theme.authFontHeadline};
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: ${theme.authOnSurfaceVariant};
      margin-bottom: 6px;
      padding-left: 2px;
    }

    /* Auth Input */
    .ss-auth-input {
      width: 100%;
      padding: 12px 16px;
      font-size: 14px;
      font-family: ${theme.authFontBody};
      background: ${theme.authSurfaceContainerLow};
      border: none;
      border-radius: 8px;
      color: ${theme.authOnSurface};
      outline: none;
      box-shadow: 0 0 0 1px ${theme.authOutlineVariant}4d;
      transition: box-shadow 0.15s, background 0.15s;
    }

    .ss-auth-input::placeholder { color: ${theme.authOnSurfaceVariant}80; }

    .ss-auth-input:focus {
      box-shadow: 0 0 0 2px ${theme.authPrimary};
    }

    .ss-auth-input-error {
      box-shadow: 0 0 0 1px ${theme.authError};
    }

    .ss-auth-input-readonly {
      background: ${theme.authSurfaceContainer}80;
      color: ${theme.authOnSurfaceVariant};
      cursor: not-allowed;
    }

    .ss-auth-input-with-icon { padding-left: 40px; }

    .ss-auth-field { margin-bottom: 16px; }
    .ss-auth-field-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }

    .ss-auth-field-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: ${theme.authOnSurfaceVariant};
      font-size: 18px;
    }

    .ss-auth-visibility-toggle {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: ${theme.authOnSurfaceVariant};
      cursor: pointer;
      padding: 0;
      display: flex;
      font-size: 20px;
    }

    .ss-auth-visibility-toggle:hover { color: ${theme.authOnSurface}; }

    /* Auth Buttons */
    .ss-auth-btn-primary {
      width: 100%;
      padding: 14px 24px;
      font-size: 14px;
      font-weight: 700;
      font-family: ${theme.authFontHeadline};
      color: ${theme.authOnPrimary};
      background: linear-gradient(135deg, ${theme.authPrimary}, ${theme.authPrimaryContainer});
      border: none;
      border-radius: 8px;
      cursor: pointer;
      box-shadow: 0 4px 16px ${theme.authPrimary}33;
      transition: box-shadow 0.2s, transform 0.1s, opacity 0.15s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .ss-auth-btn-primary:hover:not(:disabled) {
      box-shadow: 0 6px 24px ${theme.authPrimary}4d;
      transform: translateY(-1px);
    }

    .ss-auth-btn-primary:active:not(:disabled) {
      transform: scale(0.98);
    }

    .ss-auth-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

    .ss-auth-btn-primary .material-symbols-outlined { font-size: 18px; }

    .ss-auth-btn-ghost {
      padding: 10px 24px;
      font-size: 14px;
      font-weight: 700;
      font-family: ${theme.authFontHeadline};
      color: ${theme.authOnSurfaceVariant};
      background: transparent;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
    }

    .ss-auth-btn-ghost:hover { background: ${theme.authSurfaceContainer}; color: ${theme.authOnSurface}; }

    .ss-auth-btn-danger {
      padding: 10px 24px;
      font-size: 14px;
      font-weight: 700;
      font-family: ${theme.authFontHeadline};
      color: ${theme.authError};
      background: transparent;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.15s;
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
    }

    .ss-auth-btn-danger:hover { background: ${theme.authErrorContainer}33; }

    .ss-auth-btn-outline {
      padding: 10px 24px;
      font-size: 14px;
      font-weight: 700;
      font-family: ${theme.authFontHeadline};
      color: ${theme.authOnSurfaceVariant};
      background: transparent;
      border: 1px solid ${theme.authOutlineVariant}4d;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
    }

    .ss-auth-btn-outline:hover { background: ${theme.authSurfaceContainer}; color: ${theme.authOnSurface}; }

    .ss-auth-btn-social {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 16px;
      font-size: 14px;
      font-weight: 600;
      font-family: ${theme.authFontBody};
      color: ${theme.authOnSurface};
      background: ${theme.authSurfaceContainerLow};
      border: 1px solid ${theme.authOutlineVariant}1a;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.15s;
    }

    .ss-auth-btn-social:hover { background: ${theme.authSurfaceContainerHigh}; }
    .ss-auth-btn-social:disabled { opacity: 0.6; cursor: not-allowed; }
    .ss-auth-btn-social svg { width: 20px; height: 20px; flex-shrink: 0; }
    .ss-auth-btn-social svg path[fill="currentColor"] { fill: ${theme.authOnSurface}; }

    .ss-auth-btn-sm {
      width: auto;
      padding: 8px 16px;
      font-size: 12px;
    }

    /* OAuth Grid */
    .ss-auth-oauth-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 24px;
    }

    /* Auth Divider */
    .ss-auth-divider {
      display: flex;
      align-items: center;
      gap: 16px;
      margin: 24px 0;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: ${theme.authOnSurfaceVariant};
    }

    .ss-auth-divider::before,
    .ss-auth-divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: ${theme.authOutlineVariant}33;
    }

    /* Auth Error Message */
    .ss-auth-error {
      padding: 12px;
      background: ${theme.authError}1a;
      border: 1px solid ${theme.authError}33;
      border-radius: 8px;
      margin-bottom: 16px;
      display: flex;
      align-items: flex-start;
      gap: 8px;
      font-size: 13px;
      color: ${theme.authError};
    }

    .ss-auth-error .material-symbols-outlined { font-size: 18px; flex-shrink: 0; margin-top: 1px; }

    /* MFA Digit Inputs */
    .ss-auth-mfa-group {
      display: flex;
      justify-content: space-between;
      gap: 8px;
    }

    .ss-auth-mfa-digit {
      width: 48px;
      height: 56px;
      text-align: center;
      font-size: 20px;
      font-weight: 700;
      font-family: ${theme.authFontBody};
      background: ${theme.authSurfaceContainerHigh};
      border: none;
      border-radius: 8px;
      color: ${theme.authOnSurface};
      outline: none;
      box-shadow: 0 0 0 1px ${theme.authOutlineVariant}1a;
      transition: box-shadow 0.15s;
    }

    .ss-auth-mfa-digit:focus {
      box-shadow: 0 0 0 2px ${theme.authPrimary};
    }

    .ss-auth-mfa-hint {
      font-size: 11px;
      color: ${theme.authOnSurfaceVariant}99;
      text-align: center;
      margin-top: 12px;
    }

    .ss-auth-mfa-divider {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 16px 0 12px;
    }

    .ss-auth-mfa-divider::before,
    .ss-auth-mfa-divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: ${theme.authOutlineVariant}33;
    }

    .ss-auth-mfa-divider span {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      color: ${theme.authOutline};
    }

    /* Footer Link */
    .ss-auth-footer {
      text-align: center;
      margin-top: 32px;
      font-size: 14px;
      color: ${theme.authOnSurfaceVariant};
      font-family: ${theme.authFontBody};
    }

    .ss-auth-footer a,
    .ss-auth-link {
      color: ${theme.authPrimary};
      text-decoration: none;
      font-weight: 600;
      cursor: pointer;
    }

    .ss-auth-footer a:hover,
    .ss-auth-link:hover { text-decoration: underline; }

    /* Glass Panel (dropdown) */
    .ss-auth-glass-panel {
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      background: ${theme.authSurfaceContainerLowest}e6;
      border-radius: 12px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
      border: 1px solid ${theme.authOutlineVariant}1a;
      overflow: hidden;
    }

    /* User Trigger (avatar + org name pill) */
    .ss-auth-user-trigger {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 4px 12px 4px 4px;
      border-radius: 999px;
      border: 1px solid ${theme.authOutlineVariant}33;
      background: ${theme.authSurfaceContainerLow};
      cursor: pointer;
      transition: background 0.15s, box-shadow 0.15s;
      font-family: ${theme.authFontBody};
      max-width: 200px;
    }

    .ss-auth-user-trigger:hover {
      background: ${theme.authSurfaceContainer};
      box-shadow: 0 0 0 2px ${theme.authPrimary}33;
    }

    .ss-auth-user-trigger:active { transform: scale(0.98); }

    .ss-auth-trigger-org-name {
      font-size: 13px;
      font-weight: 600;
      color: ${theme.authOnSurface};
      max-width: 140px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      letter-spacing: -0.01em;
    }

    /* Avatar Trigger */
    .ss-auth-avatar-trigger {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 2px solid ${theme.authPrimary};
      overflow: visible;
      transition: transform 0.15s, box-shadow 0.15s;
      padding: 0;
      background: none;
      flex-shrink: 0;
      position: relative;
    }

    .ss-auth-invite-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      min-width: 18px;
      height: 18px;
      border-radius: 9px;
      font-size: 10px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      background: ${theme.authError || '#ef4444'};
      color: #fff;
      padding: 0 4px;
      line-height: 1;
      pointer-events: none;
    }

    .ss-auth-avatar-trigger img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
    }

    /* Large Avatar (UserProfile) */
    .ss-auth-avatar-lg {
      width: 128px;
      height: 128px;
      border-radius: 16px;
      overflow: hidden;
      border: 4px solid ${theme.authSurfaceContainer};
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      position: relative;
      cursor: pointer;
      flex-shrink: 0;
    }

    .ss-auth-avatar-lg img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s;
    }

    .ss-auth-avatar-lg:hover img { transform: scale(1.1); }

    .ss-auth-avatar-overlay {
      position: absolute;
      inset: 0;
      background: ${theme.authPrimary}99;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.2s;
      border-radius: 16px;
    }

    .ss-auth-avatar-lg:hover .ss-auth-avatar-overlay { opacity: 1; }

    .ss-auth-avatar-overlay .material-symbols-outlined {
      color: #fff;
      font-size: 28px;
      margin-bottom: 4px;
    }

    .ss-auth-avatar-overlay span:last-child {
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      font-family: ${theme.authFontHeadline};
    }

    /* Auth Sections */
    .ss-auth-section {
      padding-top: 32px;
      margin-top: 32px;
      border-top: 1px solid ${theme.authOutlineVariant}1a;
    }

    .ss-auth-section-title {
      font-family: ${theme.authFontHeadline};
      font-size: 16px;
      font-weight: 700;
      color: ${theme.authOnSurface};
      letter-spacing: -0.01em;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .ss-auth-section-title .material-symbols-outlined {
      color: ${theme.authPrimary};
      font-size: 20px;
    }

    .ss-auth-section-desc {
      font-size: 12px;
      color: ${theme.authOnSurfaceVariant};
      margin-top: 4px;
    }

    .ss-auth-section-label {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: ${theme.authOnSurfaceVariant}99;
      padding: 8px 16px 4px;
    }

    /* Sign Out Section */
    .ss-auth-signout-section {
      background: ${theme.authError}0d;
      border-top: 1px solid ${theme.authOutlineVariant}1a;
      padding: 8px;
    }

    /* Org Items */
    .ss-auth-org-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 16px;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
      background: none;
      border: none;
      width: 100%;
      font-family: ${theme.authFontBody};
      font-size: 14px;
      color: ${theme.authOnSurfaceVariant};
      text-align: left;
    }

    .ss-auth-org-item:hover {
      background: ${theme.authSurfaceContainerLow};
      color: ${theme.authOnSurface};
    }

    .ss-auth-org-item-active {
      background: ${theme.authPrimaryFixed}4d;
      color: ${theme.authPrimary};
      font-weight: 600;
    }

    .ss-auth-org-item-active:hover {
      background: ${theme.authPrimaryFixed}4d;
    }

    .ss-auth-org-item-inner {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .ss-auth-org-avatar {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      background: linear-gradient(135deg, ${theme.authPrimary}, ${theme.authPrimaryContainer});
      color: ${theme.authOnPrimary};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 800;
      flex-shrink: 0;
    }

    .ss-auth-org-avatar-inactive {
      background: ${theme.authSurfaceContainerHigh};
      color: ${theme.authOnSurfaceVariant};
    }

    .ss-auth-org-check {
      color: ${theme.authPrimary};
      font-variation-settings: 'FILL' 1;
    }

    /* Plan Badge */
    .ss-auth-plan-badge {
      display: inline-block;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 2px 8px;
      border-radius: 999px;
      background: ${theme.authPrimary}1a;
      color: ${theme.authPrimary};
      border: 1px solid ${theme.authPrimary}33;
      margin-left: auto;
      white-space: nowrap;
      flex-shrink: 0;
      font-family: ${theme.authFontBody};
    }

    /* Modal Overlay */
    .ss-auth-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      padding: 16px;
      animation: ss-auth-fade-in 0.2s ease-out;
    }

    @keyframes ss-auth-fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .ss-auth-modal {
      background: ${theme.authSurfaceContainer};
      border-radius: 12px;
      width: 100%;
      max-width: 560px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 24px 64px rgba(0, 0, 0, 0.3);
      animation: ss-auth-scale-in 0.2s ease-out;
    }

    @keyframes ss-auth-scale-in {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    .ss-auth-modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24px 32px;
      background: ${theme.authSurfaceContainerHigh}80;
    }

    .ss-auth-modal-header h2 {
      font-family: ${theme.authFontHeadline};
      font-size: 20px;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: ${theme.authOnSurface};
      margin: 0;
    }

    .ss-auth-modal-close {
      background: none;
      border: none;
      color: ${theme.authOnSurfaceVariant};
      cursor: pointer;
      padding: 4px;
      border-radius: 50%;
      transition: color 0.15s, background 0.15s;
      display: flex;
    }

    .ss-auth-modal-close:hover { color: ${theme.authOnSurface}; background: ${theme.authSurfaceContainerHigh}; }

    .ss-auth-modal-body { padding: 32px; }

    .ss-auth-modal-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 32px;
      border-top: 1px solid ${theme.authOutlineVariant}4d;
    }

    /* Profile Header (gradient bg) */
    .ss-auth-profile-header {
      padding: 32px;
      padding-bottom: 16px;
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 32px;
      border-bottom: 1px solid ${theme.authOutlineVariant}1a;
      background: linear-gradient(135deg, ${theme.authSurfaceContainerHigh}, ${theme.authSurface});
    }

    .ss-auth-profile-info { flex: 1; }

    .ss-auth-profile-name {
      font-family: ${theme.authFontHeadline};
      font-size: 22px;
      font-weight: 800;
      color: ${theme.authOnSurface};
      letter-spacing: -0.02em;
      margin: 0;
    }

    .ss-auth-profile-desc {
      font-size: 13px;
      color: ${theme.authOnSurfaceVariant};
      margin-top: 4px;
      line-height: 1.5;
    }

    /* Auth Badge */
    .ss-auth-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 10px;
      border-radius: 999px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      background: ${theme.authPrimary}33;
      color: ${theme.authPrimary};
      border: 1px solid ${theme.authPrimary}4d;
      margin-left: 8px;
      vertical-align: middle;
    }

    .ss-auth-badge-success {
      background: ${theme.authSuccess}1a;
      color: ${theme.authSuccess};
      border-color: ${theme.authSuccess}4d;
    }

    /* Profile Grid */
    .ss-auth-profile-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    .ss-auth-profile-grid-full { grid-column: 1 / -1; }

    /* Password Grid */
    .ss-auth-password-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 16px;
    }

    /* Info Box */
    .ss-auth-info-box {
      background: ${theme.authSurfaceContainerLowest}66;
      border-radius: 8px;
      padding: 12px 16px;
      border: 1px solid ${theme.authOutlineVariant}33;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      font-size: 11px;
      line-height: 1.6;
      color: ${theme.authOnSurfaceVariant};
    }

    .ss-auth-info-box .material-symbols-outlined {
      font-size: 16px;
      color: ${theme.authPrimary};
      flex-shrink: 0;
      margin-top: 1px;
    }

    /* Upload Grid (2-column) */
    .ss-auth-upload-grid {
      display: grid;
      grid-template-columns: 7fr 5fr;
      gap: 32px;
      align-items: start;
    }

    /* Dropzone */
    .ss-auth-dropzone {
      border: 2px dashed ${theme.authOutlineVariant};
      border-radius: 12px;
      padding: 32px 24px;
      text-align: center;
      cursor: pointer;
      transition: border-color 0.15s, background 0.15s;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      min-height: 200px;
      justify-content: center;
    }

    .ss-auth-dropzone:hover,
    .ss-auth-dropzone-active {
      border-color: ${theme.authPrimary};
      background: ${theme.authSurfaceContainerLow};
    }

    .ss-auth-dropzone-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: ${theme.authPrimaryContainer}33;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;
      transition: transform 0.15s;
    }

    .ss-auth-dropzone:hover .ss-auth-dropzone-icon { transform: scale(1.1); }

    .ss-auth-dropzone-icon .material-symbols-outlined {
      color: ${theme.authPrimary};
      font-size: 24px;
    }

    .ss-auth-dropzone-title {
      font-family: ${theme.authFontHeadline};
      font-size: 14px;
      font-weight: 700;
      color: ${theme.authOnSurface};
    }

    .ss-auth-dropzone-desc {
      font-size: 12px;
      color: ${theme.authOnSurfaceVariant};
      line-height: 1.5;
    }

    .ss-auth-dropzone-btn {
      margin-top: 8px;
      padding: 8px 16px;
      font-size: 12px;
      font-weight: 600;
      background: ${theme.authSurfaceContainerHighest};
      color: ${theme.authOnSurfaceVariant};
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
    }

    .ss-auth-dropzone-btn:hover {
      background: ${theme.authPrimary};
      color: ${theme.authOnPrimary};
    }

    /* Zoom Controls */
    .ss-auth-zoom-control {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: ${theme.authSurfaceContainer};
      border-radius: 8px;
    }

    .ss-auth-zoom-control .material-symbols-outlined {
      color: ${theme.authOnSurfaceVariant};
      font-size: 20px;
    }

    .ss-auth-zoom-slider {
      flex: 1;
      height: 6px;
      -webkit-appearance: none;
      appearance: none;
      background: ${theme.authOutlineVariant}4d;
      border-radius: 3px;
      outline: none;
    }

    .ss-auth-zoom-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: ${theme.authPrimary};
      cursor: pointer;
      border: 2px solid ${theme.authSurfaceContainerLowest};
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
    }

    .ss-auth-zoom-slider::-moz-range-thumb {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: ${theme.authPrimary};
      cursor: pointer;
      border: 2px solid ${theme.authSurfaceContainerLowest};
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
    }

    /* Crop Area */
    .ss-auth-crop-area {
      width: 320px;
      max-width: 100%;
      aspect-ratio: 1;
      background: ${theme.authSurfaceContainerLowest};
      border-radius: 8px;
      overflow: hidden;
      position: relative;
      touch-action: none;
    }

    .ss-auth-crop-size-badge {
      position: absolute;
      bottom: 12px;
      left: 12px;
      background: ${theme.authSurfaceContainerHighest}cc;
      backdrop-filter: blur(8px);
      padding: 4px 12px;
      border-radius: 999px;
      border: 1px solid ${theme.authOutlineVariant}4d;
      font-size: 11px;
      font-weight: 600;
      color: ${theme.authOnSurfaceVariant};
    }

    /* Dropdown for UserButton / OrgSwitcher */
    .ss-auth-dropdown {
      position: absolute;
      top: calc(100% + 12px);
      right: 0;
      z-index: 99999;
      min-width: 320px;
    }

    .ss-auth-dropdown-left { left: 0; right: auto; }

    .ss-auth-dropdown-header {
      padding: 20px 24px;
      display: flex;
      align-items: center;
      gap: 16px;
      border-bottom: 1px solid ${theme.authOutlineVariant}1a;
      background: ${theme.authSurfaceContainerLow}80;
    }

    .ss-auth-dropdown-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: 2px solid ${theme.authPrimaryContainer};
      overflow: hidden;
      flex-shrink: 0;
    }

    .ss-auth-dropdown-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .ss-auth-dropdown-name {
      font-family: ${theme.authFontHeadline};
      font-size: 14px;
      font-weight: 800;
      color: ${theme.authOnSurface};
      letter-spacing: -0.01em;
    }

    .ss-auth-dropdown-email {
      font-size: 13px;
      color: ${theme.authOnSurfaceVariant};
    }

    .ss-auth-dropdown-action {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 16px;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.15s;
      background: none;
      border: none;
      width: 100%;
      font-family: ${theme.authFontBody};
      font-size: 14px;
      font-weight: 600;
      color: ${theme.authOnSurface};
      text-align: left;
      text-decoration: none;
    }

    .ss-auth-dropdown-action:hover { background: ${theme.authSurfaceContainer}; }

    .ss-auth-dropdown-action .material-symbols-outlined {
      color: ${theme.authPrimary};
      font-size: 20px;
      transition: transform 0.15s;
    }

    .ss-auth-dropdown-action:hover .material-symbols-outlined { transform: scale(1.1); }

    /* OrgSwitcher Trigger */
    .ss-auth-org-trigger {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: ${theme.authSurfaceContainerLowest};
      border: 1px solid transparent;
      border-radius: 8px;
      cursor: pointer;
      transition: border-color 0.15s, box-shadow 0.15s;
      width: 100%;
      font-family: ${theme.authFontBody};
    }

    .ss-auth-org-trigger:hover {
      border-color: ${theme.authOutlineVariant}4d;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }

    .ss-auth-org-trigger-inner {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .ss-auth-org-trigger-label {
      font-size: 11px;
      font-weight: 700;
      color: ${theme.authPrimary};
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 2px;
    }

    .ss-auth-org-trigger-name {
      font-family: ${theme.authFontHeadline};
      font-size: 14px;
      font-weight: 700;
      color: ${theme.authOnSurface};
    }

    .ss-auth-org-trigger .material-symbols-outlined {
      color: ${theme.authOnSurfaceVariant};
      transition: color 0.15s;
    }

    .ss-auth-org-trigger:hover .material-symbols-outlined { color: ${theme.authPrimary}; }

    /* OrgSwitcher Create Section */
    .ss-auth-org-create {
      background: ${theme.authSurfaceContainerLow}80;
      padding: 16px;
    }

    .ss-auth-org-create-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: ${theme.authOnSurfaceVariant};
    }

    .ss-auth-org-create-header .material-symbols-outlined {
      color: ${theme.authPrimary};
      font-size: 16px;
    }

    .ss-auth-org-create .ss-auth-input {
      font-size: 13px;
      padding: 10px 12px;
    }

    .ss-auth-org-slug-prefix {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 12px;
      color: ${theme.authOutline};
      font-weight: 500;
    }

    /* Inline Create (UserButton dropdown) */
    .ss-auth-inline-create {
      padding: 12px 16px;
      border-top: 1px solid ${theme.authOutlineVariant}1a;
    }

    .ss-auth-inline-create-input {
      position: relative;
    }

    .ss-auth-inline-create-input .ss-auth-input {
      padding-right: 40px;
      font-size: 13px;
    }

    .ss-auth-inline-create-btn {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: ${theme.authPrimary};
      cursor: pointer;
      padding: 4px;
      border-radius: 6px;
      display: flex;
      transition: background 0.15s;
    }

    .ss-auth-inline-create-btn:hover { background: ${theme.authPrimary}1a; }

    /* Signout row in profile */
    .ss-auth-signout-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .ss-auth-signout-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .ss-auth-signout-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: ${theme.authError}1a;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .ss-auth-signout-icon .material-symbols-outlined {
      color: ${theme.authError};
      font-size: 20px;
    }

    .ss-auth-signout-title {
      font-family: ${theme.authFontHeadline};
      font-size: 14px;
      font-weight: 700;
      color: ${theme.authOnSurface};
    }

    .ss-auth-signout-desc {
      font-size: 12px;
      color: ${theme.authOnSurfaceVariant};
    }

    /* Auth Spinner */
    .ss-auth-spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid ${theme.authOnPrimary}4d;
      border-top-color: ${theme.authOnPrimary};
      border-radius: 50%;
      animation: ss-spin 0.6s linear infinite;
    }

    /* Settings Panel (full page) */
    .ss-auth-settings-page {
      position: fixed;
      inset: 0;
      z-index: 99999;
      display: flex;
      flex-direction: column;
      background: ${theme.authSurface};
      animation: ss-auth-fade-in 0.2s ease-out;
    }

    .ss-auth-settings-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 32px;
      border-bottom: 1px solid ${theme.authOutlineVariant}1a;
      background: ${theme.authSurfaceContainerHigh}80;
      flex-shrink: 0;
    }

    .ss-auth-settings-header h2 {
      font-family: ${theme.authFontHeadline};
      font-size: 20px;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: ${theme.authOnSurface};
      margin: 0;
    }

    .ss-auth-settings-back {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      border: none;
      background: none;
      cursor: pointer;
      color: ${theme.authOnSurfaceVariant};
      transition: background 0.15s, color 0.15s;
    }
    .ss-auth-settings-back:hover {
      background: ${theme.authSurfaceContainer};
      color: ${theme.authOnSurface};
    }
    .ss-auth-settings-back .material-symbols-outlined { font-size: 22px; }

    .ss-auth-settings-layout {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    .ss-auth-settings-nav {
      width: 220px;
      padding: 16px;
      border-right: 1px solid ${theme.authOutlineVariant}1a;
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex-shrink: 0;
      background: ${theme.authSurfaceContainerLow};
    }

    .ss-auth-settings-nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
      background: none;
      border: none;
      width: 100%;
      font-family: ${theme.authFontBody};
      font-size: 14px;
      font-weight: 500;
      color: ${theme.authOnSurfaceVariant};
      text-align: left;
    }

    .ss-auth-settings-nav-item:hover {
      background: ${theme.authSurfaceContainer};
      color: ${theme.authOnSurface};
    }

    .ss-auth-settings-nav-item-active {
      background: ${theme.authPrimaryFixed}4d;
      color: ${theme.authPrimary};
      font-weight: 600;
    }

    .ss-auth-settings-nav-item-active:hover {
      background: ${theme.authPrimaryFixed}4d;
    }

    .ss-auth-settings-nav-item .material-symbols-outlined {
      font-size: 20px;
    }

    .ss-auth-settings-content {
      flex: 1;
      overflow-y: auto;
      padding: 32px;
      max-width: 720px;
      margin: 0 auto;
      width: 100%;
    }

    .ss-auth-settings-content h3 {
      font-family: ${theme.authFontHeadline};
      font-size: 18px;
      font-weight: 700;
      color: ${theme.authOnSurface};
      letter-spacing: -0.01em;
      margin: 0 0 24px 0;
    }

    .ss-auth-settings-card {
      background: ${theme.authSurfaceContainer};
      border: 1px solid ${theme.authOutlineVariant}1a;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
    }

    .ss-auth-settings-card h4 {
      font-family: ${theme.authFontHeadline};
      font-size: 15px;
      font-weight: 700;
      color: ${theme.authOnSurface};
      margin: 0 0 16px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .ss-auth-settings-card h4 .material-symbols-outlined {
      color: ${theme.authPrimary};
      font-size: 20px;
    }

    /* Settings Table */
    .ss-auth-settings-table {
      width: 100%;
      border-collapse: collapse;
      font-family: ${theme.authFontBody};
      font-size: 14px;
    }

    .ss-auth-settings-table th {
      text-align: left;
      padding: 8px 12px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: ${theme.authOnSurfaceVariant};
      border-bottom: 1px solid ${theme.authOutlineVariant}33;
    }

    .ss-auth-settings-table td {
      padding: 10px 12px;
      color: ${theme.authOnSurface};
      border-bottom: 1px solid ${theme.authOutlineVariant}1a;
    }

    .ss-auth-settings-table tr:last-child td {
      border-bottom: none;
    }

    .ss-auth-settings-table tr:hover td {
      background: ${theme.authSurfaceContainerLow};
    }

    /* Settings Role Badges */
    .ss-auth-role-badge {
      display: inline-block;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 2px 8px;
      border-radius: 999px;
      font-family: ${theme.authFontBody};
    }

    .ss-auth-role-badge-owner {
      background: #8b5cf633;
      color: #8b5cf6;
      border: 1px solid #8b5cf64d;
    }

    .ss-auth-role-badge-admin {
      background: #3b82f633;
      color: #3b82f6;
      border: 1px solid #3b82f64d;
    }

    .ss-auth-role-badge-member {
      background: ${theme.authOnSurfaceVariant}1a;
      color: ${theme.authOnSurfaceVariant};
      border: 1px solid ${theme.authOutlineVariant}33;
    }

    /* Settings icon buttons */
    .ss-auth-icon-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      border-radius: 6px;
      color: ${theme.authOnSurfaceVariant};
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s, color 0.15s;
    }

    .ss-auth-icon-btn:hover {
      background: ${theme.authSurfaceContainerHigh};
      color: ${theme.authOnSurface};
    }

    .ss-auth-icon-btn-danger:hover {
      background: ${theme.authError}1a;
      color: ${theme.authError};
    }

    .ss-auth-icon-btn .material-symbols-outlined {
      font-size: 18px;
    }

    /* Settings Empty State */
    .ss-auth-settings-empty {
      text-align: center;
      padding: 40px 20px;
      color: ${theme.authOnSurfaceVariant};
      font-size: 14px;
    }

    .ss-auth-settings-empty .material-symbols-outlined {
      font-size: 40px;
      margin-bottom: 12px;
      opacity: 0.4;
    }

    /* Settings action row */
    .ss-auth-settings-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Settings Danger Card */
    .ss-auth-settings-danger {
      border-color: ${theme.authError}33;
    }

    .ss-auth-settings-danger h4 {
      color: ${theme.authError};
    }

    /* Responsive overrides */
    @media (max-width: 640px) {
      .ss-auth-profile-header {
        flex-direction: column;
        text-align: center;
      }

      .ss-auth-profile-grid { grid-template-columns: 1fr; }
      .ss-auth-password-grid { grid-template-columns: 1fr; }
      .ss-auth-upload-grid { grid-template-columns: 1fr; }

      .ss-auth-signout-row { flex-direction: column; text-align: center; }
      .ss-auth-signout-info { flex-direction: column; }

      .ss-auth-settings-nav { width: 180px; padding: 12px; }
      .ss-auth-settings-content { padding: 24px; }
      .ss-auth-trigger-org-name { display: none; }
      .ss-auth-user-trigger { padding: 0; border: none; background: none; }
    }
  `
}
