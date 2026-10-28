// LM3 §14 — one color per action, so it looks the same wherever it shows; an action not listed takes the brand
export const ACTION_COLOR = {
  /** Run history, open history, last run */
  history: 'brand',
  edit: 'teal',
  /** Duplicate, copy */
  duplicate: 'indigo',
  /** View, view details */
  view: 'green',
  /** Retry, restart */
  retry: 'orange',
  /** Revert unsaved changes — a step back, as retry is */
  revert: 'orange',
  /** Run now */
  run: 'lime',
  /** Send email, message */
  email: 'cyan',
  /** Suspend, pause, block */
  suspend: 'yellow',
  billing: 'violet',
  invoice: 'cyan',
  /** Failures, errors waiting to be looked at — a page header's status action ("12 failed") */
  failures: 'red',
  /** Delete, remove, clear (destructive): always last, after a divider in a ⋯ menu */
  delete: 'red',
  back: 'gray',
  /** Insert a field reference or placeholder */
  insert: 'gray',
} as const;
