import type { MouseEvent } from 'react';

// The row's own controls, its menus and dialogs when they are not in a portal, and cells marked `data-row-controls` (the
// checkbox and actions cells, so a near miss on a checkbox or a button doesn't open the row)
const CONTROLS = [
  'a, button, input, select, textarea, label',
  '[role="button"], [role="checkbox"], [role="menu"], [role="menuitem"], [role="dialog"]',
  '[data-row-controls]',
].join(', ');

/**
 * A press on a row itself runs its main action. Presses on the row's controls, modified clicks (new tab, select),
 * other mouse buttons, the end of a text selection and clicks inside the row's portals (its menu, a dialog it opened —
 * React bubbles those through the row) keep their usual behavior.
 */
export function isRowPress(event: MouseEvent<Element>) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
    return false;
  const { target, currentTarget } = event;
  if (!(target instanceof Element) || !currentTarget.contains(target)) return false;
  // Only controls inside the row count: a row in a modal sits under the modal's own role="dialog"
  const control = target.closest(CONTROLS);
  if (control && control !== currentTarget && currentTarget.contains(control)) return false;
  return window.getSelection()?.isCollapsed !== false;
}

/**
 * LM3 §14 — spread on a `Table.Tr` so a press on the row runs `onPress`. The row is not a tab stop: keep the same
 * action on a link or button inside it, the keyboard path.
 */
export function rowPressProps(onPress: () => void) {
  return {
    'data-pressable': true,
    onClick: (event: MouseEvent<HTMLTableRowElement>) => {
      if (isRowPress(event)) onPress();
    },
  } as const;
}
