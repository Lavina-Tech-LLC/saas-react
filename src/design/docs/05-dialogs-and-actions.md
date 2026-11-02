# LM3 — Dialogs and actions (§20–21)

Part of the LM3 design system — start at [README.md](README.md). Section numbers (§) run across all its files, so "LM3 §14" names one section wherever it is cited.

---

## 20. Dialogs, Modals & Sheets

Two different things, never mixed: **dialogs** are a short decision or a one- or two-field form; **modals** hold longer forms and content; **sheets** hold things to read and act on.

**Which one, by what it holds (every screen):** a decision, or a form of one or two fields or selects (a name, a timezone, a location to move to) → `BasicDialog` / `ConfirmDialog`, a small centered dialog on phones too; three fields or more, or a list picker with a search → `AppModal`, full screen on phones; a record's details or a short list of actions with **no field or select** → `BottomSheet` on phones and tablets (the modal on desktop). A sheet never holds a field or select: a list opening in a sheet and the phone's keyboard fight the sheet for the screen.

**One header for every dialog and modal** (theme `Modal`): 28px corners on the dialog surface (`--m3-dialog`), the title 24px in with 16px above it and the ✕ 12px from the edge, a **start-aligned title** in the headings face (24px, 500), in `BasicDialog` and `ConfirmDialog` an optional **icon tile** before it (`ThemeIcon variant="tile"`, §4: 30px, 8px corners, the tonal edge — `AppModal` has none), and **a plain ✕** — an M3 standard icon button, 40px with a 24px icon, no fill or outline (`globals.css`). Actions follow Android 16: the **dismissive one outlined** (`variant="default"`, the thin gray M3 outline) first, the **confirming one filled** last (`color="red"` when destructive), right-aligned; on a narrow screen they wrap and stay right-aligned. A dialog with a single way out (Done, Close) fills it; other actions (Back, Copy link) are outlined. Never text buttons, and never Mantine's `variant="outline"` (its border takes the brand color).

### ConfirmDialog — L3 · `uiKit/ConfirmDialog/`

- **Use when:** confirming a destructive or irreversible action (delete, disconnect, cancel a run, revoke).
- **Built from:** `BasicDialog` + Mantine `Button`, `TextInput`, `AppAlert`.
- **API:** `opened`, `onClose`, `onConfirm`, `title`, `description` (what happens, whether it can be undone), `confirmLabel?` ("Delete"), `cancelLabel?` ("Cancel"), `color?` (red), `loading?`, `error?` (why it failed — shown in it as an error alert; the dialog stays open), `confirmText?` (type-to-confirm), `icon?` (a tonal tile; none by default).
- **Rules:** `loading` while the request runs — then Cancel, Esc, the scrim and the ✕ can't close it and confirm can't be pressed twice; close on success; `confirmText` (the record's name) for deleting something big for good. Focus starts on Cancel (or on the type-to-confirm field).
- **Content:** the title is a question ("Delete this template?"); the description states the consequence; the confirm label repeats the verb ("Delete", "Cancel run") — never "OK" or "Yes".
- **A11y:** focus is trapped; Esc, the ✕ and Cancel close it.
- **Do:** A title that asks one specific question ("Delete this template?") (M3); the confirm label repeating the verb; type-to-confirm only for losing something big for good.
- **Don't:** "OK" or "Yes"; M3: an unclear Cancel; a confirm dialog for an action that can be undone — a snackbar with Undo; opening another dialog from the confirming action (M3).
- **Demo:** `BasicDialog, DialogList, ConfirmDialog, UnsavedChangesDialog` (Delete report); a table row's Remove (`TableScroll, SortableTh, CellName, TableActions, TableSelectionBar`).

### BasicDialog — L3 · `uiKit/BasicDialog/`

- **Use when:** a short decision with custom actions (discard a draft, pick one of a few settings with `Radio.Group` in `children`), or a form of one or two fields or selects: the fields in `children`, in a `<form id>`, and the submit in `actions` with `form="…"`.
- **API:** `opened`, `onClose`, `title`, `icon?` / `iconColor?` (a tonal tile before the title), `description?` (in on-surface-variant), `children?`, `actions` (the dismissive button outlined first, the action filled last), `busy?` (nothing closes it while a request runs), `onExitTransitionEnd?` (reset a form after it closes).
- **List dialog:** `DialogList` (`maxHeight?` 280, `ref?` its scroll viewport for a windowed list) runs a kit `List` edge to edge between a hairline under the text and one over the actions, the rows' content on the dialog's 24px inset (lined up with its title and fields), scrolling in a `ScrollArea` (never the browser's scrollbar).
- **Look:** the shared header, 440px (`size="md"`); it stays a small centered dialog on phones.
- **Do:** Dialogs only for decisions that block the task (M3); one action only when it is an acknowledgement (Got it) (M3); the confirming action off until a choice is made; the dismissive one never off (M3).
- **Don't:** A dialog for low- or medium-priority news — a snackbar (M3); a form of three fields or more, or long content (→ `AppModal`); the dismissive action after the confirming one (M3).
- **Demo:** `BasicDialog, DialogList, ConfirmDialog, UnsavedChangesDialog`.

### UnsavedChangesDialog — L3 · `uiKit/UnsavedChangesDialog/`

- **Use when:** navigating away from unsaved edits — pair it with the router's `useBlocker` (`useSaveBar` does both).
- **API:** `opened`, `onStay`, `onLeave`, `title?`, `description?`. Stay first, Leave in red.
- **Do:** A basic dialog to confirm discarding unsaved changes (M3).
- **Don't:** Leaving silently with unsaved edits.
- **Demo:** `BasicDialog, DialogList, ConfirmDialog, UnsavedChangesDialog` (Unsaved changes); `SaveBar, useSaveBar` asks it on leaving.

### AppModal — L3 · `uiKit/AppModal/`

- **Use when:** a form of three fields or more (create / edit), a list picker with a search (the kit's list dialog — `FilterChipDialog`), long content, or read-only details.
- **Not when:** a yes/no decision → a dialog; content that should sit beside the page → `SideSheet`.
- **Built from:** Mantine `Modal` (the shared header, the scrim, the pop transition) + `AppModalFullScreen` on phones.
- **API:**
  - `opened`, `onClose`, `title`, `children`.
  - `mainAction?`: `{ label, onClick?, form?, loading?, disabled? }` — Save, Create; `form="…"` submits that form from outside it. `cancelLabel?` (Cancel closes the modal).
  - `footer?`: with `mainAction`, extra actions before Cancel; without it, the whole action row. Omit both for read-only.
  - `size?`: md 440 details · **lg 620 default** · xl 780.
  - `busy?`: work that closing would cut short (an image cropping).
- **Behavior:** the actions sit right-aligned under the content — extras and Cancel outlined, the main action filled and last; while the main action is `loading` or the modal is `busy`, nothing closes it (Cancel, the ✕, Esc, the scrim); long content scrolls in a `ScrollArea` between the title and the actions (`DialogScroll`, the dialog's `scrollAreaComponent` set to `OwnScroll`), with a **divider under the title once it has scrolled and one above the actions while more is below** (`useScrollEdges`). **Every AppModal is full screen on phones** (the M3 full-screen dialog), a form or a window of details alike: it slides up, a 56px top bar holds ✕ · title (22px) · the main action as a filled button, the bar takes the container tone once content scrolls under it, extra actions in a row at the bottom.
- **Do:** Field errors under their fields; an error about the whole form as an alert in the modal (M3); a short title in the phones' full-screen bar — a long one goes in the content (M3).
- **Don't:** The confirming action closing a full-screen dialog without doing its job (M3); a modal opened from a modal.
- **In code, don't:** A raw Mantine `Modal` with a hand-built header or footer; `overlayProps`, `centered`, `radius` (theme).
- **Demo:** `AppModal`.

### SideSheet — L3 · `uiKit/Sheets/`

- **Use when:** content read beside the page (a record's details while the list stays in view). A form goes in `BasicDialog` (one or two fields) or `AppModal`.
- **Built from:** Mantine `Drawer` (right) + `DialogScroll`; its look is the theme's `Drawer` (`themeOverlays.ts`) — the component only lays out its column.
- **API:** Drawer props + `title`, `onBack?` (back arrow for a sheet opened from a sheet), `actions?` (a bar pinned at the bottom over a divider, start-aligned: the main action filled first, then Cancel outlined, `variant="default"`, 8px apart), `width?` (400).
- **Look:** the M3 modal side sheet — the surface container low, 400px (full width on phones), 16px corners on its open edge, a 24px headline-small title 24px in and the plain ✕; the body scrolls in a `ScrollArea`, a line under the title once it has scrolled.
- **Do:** On the right edge, scrolling inside when its content is long (M3); content read beside the page.
- **Don't:** Content that scrolls sideways in it (M3); a form in it — `BasicDialog` or `AppModal`.
- **Demo:** `BottomSheet, SideSheet` (a team member's details).

### BottomSheet — L3 · `uiKit/Sheets/`

- **Use when:** content to read and act on with no field or select: a record's details, a short list of actions (share, open with). A sheet on phones and tablets (below md), where it suits tall and small screens and a side sheet would squeeze the page; **on desktop (md up) the same component is the modal** (`AppModal`, the `actions` in its footer, the ✕ in its header) — a sheet sliding up a wide screen reads as mobile.
- **Built from:** Mantine `Drawer` (bottom) + `DialogScroll` + `hooks/useSwipeToClose` below md; `AppModal` from md up (`useScreen`).
- **API:** Drawer props + `title?`, `actions?` (a row pinned under the content, right-aligned: Cancel outlined, the main action filled and last, 8px apart), `width?` (640 — on desktop ≤ 480 gives the md modal, wider the lg one), `onExitTransitionEnd?` on both.
- **Look:** the M3 modal bottom sheet — 640px max and centered, the surface container low with 28px top corners, the 32 × 4 drag handle (also a button) in a 48px row, a 24px headline-small title, up to the screen's height less a 56px top margin; the content scrolls in a `ScrollArea` with M3's lines under the top and above the actions. Swipe the top down to close. No ✕.
- **Do:** One task per sheet: details or a list of actions; the main action filled and last in `actions`.
- **Don't:** A field or select in a sheet — `BasicDialog` for one or two, `AppModal` for more; a sheet opened from a sheet; a ✕ — the handle, a swipe, the scrim and Esc close it.
- **Demo:** `BottomSheet, SideSheet` (a share list).

### Modal · Drawer — L2 · theme

The theme sets Mantine `Modal` and `Drawer` defaults (scrim, header, title font, ✕, transition) so the kit pieces inherit them. **Every dialog scrolls in Mantine's `ScrollArea`:** a plain modal through the theme's `scrollAreaComponent: ScrollArea.Autosize` (the title sticks at the top); one with a pinned action row through `DialogScroll` between the title and the actions. Built from compound parts (`Modal.Root` — the date picker, the phones' search screen), a dialog lays out its own Mantine `ScrollArea`: compound parts don't take the theme's `Modal` defaults. Never the browser's own scrollbar (`styles/dialogScroll.test.tsx`). Scrolling inside a dialog stops dead at its edge — no bounce or glow, nothing carried on to the page (`overscroll-behavior: none` on the content box from the theme and on the dialog's own viewport in `globals.css`; scroll areas nested inside still hand the scroll on to the dialog). Custom sheet scroll bodies do the same. **Don't use them directly** — use the kit components above.

- **Do:** The kit's dialogs and sheets.
- **Don't:** The browser's own scrollbar in a dialog.
- **In code, don't:** `Modal` or `Drawer` directly in a screen.

---

## 21. Buttons & Actions

### Button · ActionIcon — L2 · theme `Button`, `ActionIcon` + `theme.ts` + `buttons.css` + `stateLayers.css` + `lib/ripple.ts`

- **Built from:** Mantine. The theme makes them pills on the control scale (§9) with 500 labels, adds the `standard` icon-button variant (M3: no container or outline, only the state layers; the icon in on-surface-variant, or its own color when it has one) and the `adaptive` button variant (light in light, filled in dark, via CSS `light-dark()`), lays hover and press layers over the resting fill, turns off the press nudge, and the ripple answers every press. Disabled is M3 grey for every variant.
- **Variants:**

  | Action | Variant |
  |---|---|
  | Page header actions and the main action | `PageLayout overflowActions` / `fab` — **filled**, styled by the header (§11); only the ⋮ is tonal |
  | Primary on a page (Save, Create) | default `filled` |
  | Secondary on a page, toolbars | tonal `variant="light"` or outlined `variant="default"` |
  | Dialog, modal and sheet actions | Cancel outlined `variant="default"`, the confirm filled (§20) |
  | Low-emphasis (Discard, Add filter, Clear all) | `variant="subtle"` |
  | Row actions | `TableActions` — filled, each in its action color (§14) |
  | Icon buttons in toolbars, menu triggers, back, ☰, ⓘ | `variant="standard"` |
  | Destructive | `color="red"` |
  | Tonal in light, filled in dark (optional, nowhere by default) | `variant="adaptive"` |

- **Icon buttons:** `size="input-sm"` (40px, level with a button and a field) or another `input-*` size; the glyph is half the button. Tonal, outlined and filled give more weight than standard. Every icon button has `aria-label` and a Tooltip.
- **Tooltips** (L2, theme): the inverse surface, 4px corners, 15px 500 text with 8×12px padding.
- **Rules:** `loading` while working; icons via `leftSection` (sized from the button's height); tonal buttons, badges and alerts keep their thin own-color edge.
- **Content:** a verb, sentence case, two or three words ("New automation", "Export CSV").
- **Do:** One emphasized action per area — filled for it, tonal or outlined for the rest (M3); a verb in sentence case on one line (M3); the icon before the label, one icon at most (M3); an icon button with a name and a Tooltip.
- **Don't:** Too many buttons — move the rarely used ones into a ⋮ (M3); a wrapped label, or a button narrower than its label (M3); an outlined button where it could read as a chip (M3); a toggle icon button for an action with no on state (a ⋮) (M3).
- **In code, don't:** `radius` (theme); an icon button without `aria-label` and a Tooltip.
- **Demo:** `Button`; `ActionIcon`.

### AdaptiveButton — L3 · `uiKit/AdaptiveButton/`

- **Use when:** a labeled action that must fit on one line on small screens.
- **API:** `icon`, `label`, `ariaLabel?`, `tooltip?`, `iconPosition?` (`'end'` for Next →), `collapseBelow?` (md), `iconOnly?`, `size?` (sm), `variant?`, `color?`, `loading?`, `disabled?`, `onClick?`, `renderRoot?`.
- **Behavior:** icon and label from `collapseBelow` up; below it the same action as an icon button of the same variant and color, named by its label and showing it in a tooltip. Without a variant it takes the Button default where it is rendered (filled in the page header). The header's action icons are `AdaptiveButton iconOnly`.
- **Do:** A label that still reads well in its tooltip once it folds to an icon.
- **Don't:** Two adaptive buttons with the same icon.
- **Demo:** `AdaptiveButton`.

### SplitButton — L3 · `uiKit/SplitButton/`

- **Use when:** a main action with related variants (New automation ▾ Import · From template; Export PDF ▾ Send by email).
- **Not when:** unrelated actions → separate buttons; more than ~5 related actions → reconsider.
- **Built from:** Mantine `Button`, `Group`, `Menu` + `SplitButton.module.css`.
- **API:** `children` (main label), `onClick`, `leftSection?`, `menu` (`Menu.Item` elements), `menuLabel` (the chevron's accessible name), `variant?`, `color?`, `size?`, `disabled?`, `loading?`, `menuPosition?`.
- **Look:** the main action and the chevron 2px apart; inner corners 4px, rounding out on hover; the chevron becomes a full circle while its menu is open.
- **Do:** The menu's items as variants of the main action (M3); a short main label.
- **Don't:** A long label, or another icon in place of the chevron (M3); unrelated actions in its menu.
- **Demo:** `SplitButton`.

### ButtonGroup — L3 · `uiKit/ButtonGroup/`

- **Use when:** a few related actions side by side (Copy · Share · Download), or a toggle set (Bold · Italic · Underline) — M3 Expressive's button group.
- **Not when:** one main action with variants → `SplitButton`; switching views → `SegmentedControl`.
- **Built from:** a `div` (`role="group"`) + `ButtonGroup.module.css` around Mantine `Button`s and `ActionIcon`s; it gives spacing and shape, no colors.
- **API:** `children`, `variant?` (`standard` — 12px apart, the pressed button widens and its neighbours give way · `connected` — 2px apart with 8px inner corners, the selected one a full pill), `fullWidth?`, `aria-label`.
- **Rules:** the page picks each button's variant — tonal (`light`) at rest, filled for a selected toggle (with `aria-pressed`); one size for the whole group.
- **Do:** The same shape for every button in a group; width and color may change (M3); a connected group for two opposite choices.
- **Don't:** Mixed color styles in a connected group (M3); more than about five buttons — a ⋮ for the rest.
- **Demo:** `ButtonGroup`.

### FabMenu — L3 · `uiKit/FabMenu/`

- **Use when:** a page's main action opens a few related ones (Create → Order · Customer · Invoice), mostly on phones.
- **Not when:** a single main action → `PageLayout fab`; unrelated actions → a `Menu`.
- **Built from:** Mantine `UnstyledButton`, `useDisclosure`, `useClickOutside` + `FabMenu.module.css` — not Mantine's `Menu`: the M3 FAB menu is pill buttons stacked on the FAB, not a menu panel, and on `Menu` each would undo the theme's M3 menu look. The FAB shares `PageFab`'s size (`--m3-fab-size`) and corners.
- **API:** `icon`, `label` (the FAB's and the menu's name), `items: { label, icon, onClick }[]` (up to six).
- **Behavior:** the M3 Expressive FAB menu — the 56px FAB turns into a ✕ and the items rise above it as primary-container pills, right-aligned, the first at the top; a menu to the keyboard (WAI-ARIA): the arrows, Home and End move between them, Esc closes it with the focus back on the FAB, and moving the focus away (Tab) or a press outside closes it.
- **Do:** 2 to 6 related actions, each with its icon and label (M3); on the page's main action, bottom right.
- **Don't:** A FAB menu with one item (→ the FAB itself) (M3); removing labels, or changing the items' shape or size (M3); a FAB menu with a toolbar or a navigation rail on the same screen (M3).
- **Demo:** `FabMenu`.

### SegmentedControl — L2 · theme `SegmentedControl` + `selection.css`

- **Use when:** switching between 2–5 views of the same content (Bar / Line, Login / Register).
- **Not when:** switching whole page sections → tabs (§26); a list page's views with counts (All / My tasks / New) → `ScrollerTabs` with `count`, under the filters (§26).
- **Built from:** Mantine; theme + CSS give the M3 segmented button — a pill with an `--m3-outline` border and dividers, the selected segment tonal with a ✓ of the size's icon, as tall as a button of its size.
- **Motion:** the tonal fill slides to the picked segment (Mantine's indicator, 200ms ease) while its ✓ grows in and the old one folds away; none with reduced motion.
- **Do:** 2 to 5 short, consistent labels (M3); icons or text — one kind for every segment (M3).
- **Don't:** More than five segments (→ chips) (M3); a segmented control across the full width of a large screen (M3); labels that wrap (M3).
- **In code, don't:** `radius` or colors.
- **Demo:** `SegmentedControl`.

### Chip — L2 · theme `Chip` + `selection.css` + `sizes.css`

- **Use when:** a few on/off choices inside content (Unread · Starred · Attachments), or one of a few views (All · Favorites).
- **Not when:** filtering a list → `FilterGroup` (§17).
- **Built from:** Mantine; the M3 filter chip — `size="sm"` (32px), 8px corners, 500 labels, 16px each side. Unselected: a 1px outline-variant edge on a see-through fill, the label in on-surface-variant. Selected: the secondary container, no edge, an 18px outlined ✓ (theme `icon`) 8px in. Hover and press lay M3's state layer over either.
- **Do:** Chips in a set, with short labels (under 20 characters) (M3); chips for options beside the content, buttons for the next step (M3).
- **Don't:** A single chip on its own (M3); chips that finish or move a task on (→ buttons) (M3); an elevated chip on the page (M3).
- **Demo:** `Chip`.

### Menu — L2 · theme `Menu`, `Popover`, `HoverCard` + `globals.css`

- **Use when:** a list of actions behind a button (row menus, "more", user menu).
- **Built from:** Mantine. The theme gives the M3 menu: one panel in the menu tone with `MENU_BORDER`, `shadow="md"`, 12px corners, 8px above and below, 112–280px wide; rows edge to edge and square, 48px (40 with a mouse), 12px in from the sides, a 20px leading icon 12px from the label, trailing text (a shortcut) after it, an 8% hover and 10% press; the same panel for submenus.
- **Rules:** `Menu.Divider` between groups; `Menu.Label` is the group's subheader; destructive items `color="red"` (label and icon) and last, after a divider; one-of / many-of choices as `Menu.RadioItem` / `Menu.CheckboxItem`. A trigger outside the page header and table rows is a standard icon button.
- **Content:** items are verbs ("Edit", "Duplicate", "Delete").
- **Do:** Verbs as items, grouped by dividers; the destructive item last and red; a ⋮ trigger for the rarely used actions.
- **Don't:** More than about 7 items without groups; a menu with one item (→ a button); nested menus more than one level deep.
- **Demo:** `Menu`.

### RichTooltip — L3 · `uiKit/RichTooltip/`

- **Use when:** a control needs more than a name — a short explanation, optionally with a link-like next step (what a setting does, "Learn more").
- **Not when:** just naming an icon button → a plain `Tooltip`; help on a field → `FieldHelp` (§18).
- **Built from:** Mantine `Popover`, `Button`, `useTimeout`.
- **API:** `children` (one button-like trigger), `title?` (the subhead), `text`, `actions?` (up to two: `{ label, onClick }`), `position?`.
- **Behavior:** the M3 rich tooltip — a card in the menu tone with a subhead, a line or two of text and up to two text actions. Hover opens it after a short delay and it stays while the pointer is on the trigger or the card; pressing the trigger (or Enter) pins it with the focus inside; Esc or a press outside closes it.
- **Do:** Extra information or a new feature's explanation, with up to two actions (M3).
- **Don't:** Critical information only in a tooltip (M3); a rich tooltip pinned open on an icon button (M3); more than one tooltip open at a time (M3).
- **Demo:** `RichTooltip`.
