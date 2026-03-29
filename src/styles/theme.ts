import type { Appearance } from '../core/types'

export interface ResolvedTheme {
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
}

const lightDefaults: ResolvedTheme = {
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
}

const darkDefaults: ResolvedTheme = {
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
}

export function resolveTheme(appearance?: Appearance): ResolvedTheme {
  const base = appearance?.baseTheme === 'dark' ? darkDefaults : lightDefaults
  const vars = appearance?.variables

  return {
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
  }
}

function darken(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.max(0, (num >> 16) - Math.round(2.55 * percent))
  const g = Math.max(0, ((num >> 8) & 0x00ff) - Math.round(2.55 * percent))
  const b = Math.max(0, (num & 0x0000ff) - Math.round(2.55 * percent))
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
      max-width: 400px;
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
  `
}
