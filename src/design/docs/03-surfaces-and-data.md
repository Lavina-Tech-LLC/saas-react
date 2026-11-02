# LM3 — Surfaces and data (§13–17)

Part of the LM3 design system — start at [README.md](README.md). Section numbers (§) run across all its files, so "LM3 §14" names one section wherever it is cited.

---

## 13. Surfaces: Cards, Lists, Settings

### Paper — L2 · theme `Paper`

- **Use when:** a card — content, forms, tables, chart cards.
- **Built from:** Mantine `Paper`; theme: `radius="md"`, the card tone, `shadow="sm"` and `withBorder` — elevated in light, outlined in dark (`--m3-card-shadow`, `--m3-card-edge`, §5).
- **Types:** the app's card is elevated in light and outlined in dark (the default — pass nothing). An area that should recede and not read as a card: `shadow="none" withBorder={false}` (with `bg="var(--m3-surface-container)"` for a filled one). The Components page shows M3's three pure types side by side.
- **Rules:** content `p={{ base: 'md', xs: 'lg' }}`; lists and tables `p={0}`, edge to edge. A group of cards gets a heading on the page; a single card's title goes in its own header (`FormSection`).
- **Do:** Space between cards and sections; lines only inside a card; one heading for a group of cards, on the page; a full-width line inside a card only where an interactive part meets a static one (M3).
- **Don't:** A card in a card; content forced into cards where space, a heading or a divider would do (M3); a card that scrolls on its own or holds a swipeable carousel (M3); a title and a table in one card (§14).
- **Demo:** `Card`.

### List + ListItem — L3 · `uiKit/List/`

- **Use when:** M3's standard style — a long or open-ended list of one kind of thing: people, files, templates, search results, a pick list in a dialog (pick many with select-all), a timeline (`connected`). On a page edge to edge in a card (`Paper p={0}`, clipping its rows' layers: `overflow: hidden`); in a dialog straight on its surface. Also the rows of every `SegmentedList`.
- **Not when:** settings or a short group of separate items → `SegmentedList`; tabular data with columns → Table (§14).
- **Standard or segmented:** M3 Expressive has both styles with the same behavior; segmented is not the default. Tiles put a gap and corners on every row, which helps a few separate things and slows the scanning of many alike.
- **Built from:** `ul` / `li` + `List.module.css` (the M3 list item); rows have no surface of their own.
- **API:**
  - `List`: `children`, `dividers?` (`inset` from the text, or `full`), `connected?` (a line joins the leading tiles — an activity history; replaces dividers), `subheader?` (also names the list), `size?` (xs dense … xl comfortable; md the M3 56px row), `aria-label?`, `className?`, `style?`, `ref?` (the `ul`).
  - `ListItem`: `headline`, `supportingText?`, `overline?`, `lines?`, `leading?` + `leadingType?` (icon 24 · avatar 40 · image 56 · video 114×64 · control), `trailing?`, `trailingText?`, `selected?`, `disabled?`, `onClick?` (the whole row is a button), `onPress?` (a row with its own controls: a press elsewhere on it runs this, §14 rules), `onLongPress?` (touch: selects, as in Gmail), `renderRoot?` (a router link), `wrapText?`, `color?` (`red` for a destructive row), `children?` (block content under the row).
- **Behavior:** 56 / 72 / 88px rows at md for one to three lines; hover and press layers, the ripple, a focus ring inside the row, the selected tone (the secondary container — a tonal icon circle in it swaps to the row's content color, its glyph to the row's tone, so it doesn't vanish into the row); disabled fades to 38%. ↑ / ↓ / Home / End move between button rows.
- **Do:** One kind of thing per list, rows the same height; the row's picture at its leading edge, of the same type on every row (M3); the main action on the row press; one trailing control at most.
- **Don't:** Several trailing buttons on a row — a ⋯ menu instead; settings or a few separate items in a plain list → `SegmentedList`; dividers in a list that sits in a card — the card and the rows' space are enough (M3).
- **In code, don't:** `onClick` on a row that holds controls (a button in a button) — `onPress`.
- **Demo:** `List, ListItem`; `List connected, ListItem` (a history).

### SegmentedList + SegmentedListItem — L3 · `uiKit/SegmentedList/`

- **Use when:** M3 Expressive's segmented style — settings, and a short group of separate items each managed on its own: connected accounts, API keys, notification channels, schedules; choices in a wizard or sheet; a short list to reorder (spread useRowDrag's `listProps` on it).
- **Not when:** a long or open-ended list of one kind → `List`; tabular data with columns → Table (§14); settings with values → SettingsGroup.
- **Built from:** `List` / `ListItem` + `SegmentedList.module.css` — M3 Expressive's segmented list (Android 16 Settings): every row its own tile in the card tone, 2px apart, 4px corners inside the group and 20px at its two ends; no card around it and no hairlines.
- **API:**
  - `SegmentedList`: `aria-label?`, `children` — `SegmentedListItem` rows, or `ListItem` rows for the rest of a row's slots (overline, trailing text, a leading checkbox or drag handle, `onPress`, `onLongPress`); `className?`, `style?`, `ref?` (where useRowDrag's `listProps` go).
  - `SegmentedList` also takes `size?`: by default M3's touch rows (md: 56/72px, 16px text) below sm and the compact sm rows from sm up (48/64px, 14px text, a 32px leading circle, 12px padding) — the tiles fit a desktop admin.
  - `SegmentedListIcon`: `icon`, `color?` — the leading tonal circle, sized by the row's avatar slot (never a fixed `size={40}`).
  - `SegmentedListItem`: `title`, `description?`, `leading?` (`SegmentedListIcon`, or an Avatar at `size="var(--li-avatar)"`), `trailing?` (chevron, Switch, Badge, meta, a row menu), `onClick?` (the whole row becomes a button), `selected?` (tonal, for single-choice lists).
- **In dialogs:** inside a Modal the tiles take `--m3-dialog-tile` (white on the grey dialog in light, a lighter step on the darker dialog in dark); inside a Drawer (sheets) the highest container.
- **Reorder:** a tile lifted to drag is rounded all round, raised in the high container tone; it settles into its place's corners on drop.
- **A11y:** clickable rows are buttons with keyboard focus.
- **Do:** A few separate things each managed on its own; a tonal icon circle per row, one color per meaning.
- **Don't:** A long list of alike items in tiles (it slows scanning) → `List`; a card around the tiles, or hairlines between them.
- **In code, don't:** An `onClick` row that also holds buttons or switches — actions in `trailing`, the row left unclickable.
- **Demo:** `SegmentedList, SegmentedListItem`; `SegmentedList, useRowDrag, RowDragHandle` (a list to reorder).

### AppAccordion + AppAccordionItem — L3 · `uiKit/Accordion/`

- **Use when:** items that open in place to show more — a run's steps with their input and output, a payload, FAQ answers. M3 Expressive's expandable list (Android 16 Settings, Google Account).
- **Not when:** navigation or a form's sections (→ `FormSection`, `FormTabs`); content everyone needs to see — show it.
- **Built from:** Mantine `Accordion` + `Accordion.module.css`.
- **API:**
  - `AppAccordion`: Mantine's `multiple`, `value` / `defaultValue` / `onChange`, `order` (the headers' heading level, 3 by default), style props; children are `AppAccordionItem`s.
  - `AppAccordionItem`: `value`, `title`, `description?` (a second line, dimmed), `leading?` (a tonal icon circle, an avatar, a step number), `trailing?` (a status badge, meta), `disabled?`, `children` (what opens).
- **Look:** the separated list's tiles — the card tone on a page; 2px apart, 4px corners inside the group and 20px at its ends. In a Modal the tiles take `--m3-dialog-tile`, in a sheet the highest container. The header is an M3 list row: 56px (72px with a description), 16px in, a 16px gap, the title 16px 500 over the description 14px, the 24px expand icon in a 40px circle that turns as it opens. **An open item steps out of the group** — an 8px gap above and below, every corner 20px — and its neighbours round the side facing the gap. Hover and press tint the tile with the primary color, 8% / 10% (a neutral layer vanishes against the light page), and the ripple.
- **Do:** One kind of thing per accordion; the status or count that matters in the header (`trailing`, `description`) so a closed item still says it; one open at a time unless comparing (`multiple`).
- **Don't:** A card around the tiles, or hairlines between them; the primary color on an open item; long headers cut off — they wrap.
- **Demo:** `AppAccordion, AppAccordionItem`.

### SettingsGroup + SettingsRow — L3 · `uiKit/SettingsGroup/`, `uiKit/SettingsRow/`

- **Use when:** a settings page — one row per setting (M3 list rows, as Android Settings).
- **Built from:** an optional heading on the page (h2 at h4, a helper line, 8px above the tiles) over a `SegmentedList` — every `SettingsRow` its own tile, no card around them and no hairlines; each `SettingsRow` is a `ListItem` with a tonal `ThemeIcon` circle. Groups on one page are 24px apart (`SECTION_GAP`).
- **API:**
  - `SettingsGroup`: `title?`, `description?` (a line under the title — a group without a title shows neither), `children`.
  - `SettingsRow`: `icon`, `label`, `value?` (the current value — the row's second line, under the label), `description?` (the second line of a row without a value: what a switch or a page is for), `onClick?` (the whole row opens the setting's sheet or dialog, a chevron at its end), `action?` (a control at the end instead: a Switch named by the row — `action={(aria) => <Switch {...aria} />}` — a ⋮ menu, an icon button such as copy), `disabled?` (fades the row; its second line says why), `danger?` (red label and icon), `color?`.
- **Look:** the setting's name over its value, as M3 lists show it — no value column beside the label, no Edit or Change buttons: the row itself is the button. One icon tone per group (the primary); red only for a danger row; `color` only where a row means something else than its group.
- **Rules:** editing opens `BasicDialog` (one or two fields) or `AppModal` (more) with that setting's fields; destructive rows go last with `danger` and confirm with `ConfirmDialog`.
- **Content:** the label is the setting's name ("Email"); the value its current value, or "Not set"; a disabled row's second line says what to do first.
- **Do:** One setting per row; the row press to change it; destructive rows last, red, and confirmed.
- **Don't:** A form of every setting on one page; a switch and a button on the same row; a row of several colored icons in one group.
- **Demo:** `SettingsGroup, SettingsRow`.

### MediaGrid + MediaViewer — L3 · `uiKit/MediaGrid/`, `uiKit/MediaViewer/`

- **Use when:** pictures by day — a photo library, uploads, attachments (Google Photos).
- **Built from:** `MediaGridSection`, `MediaTile`, `DateScrubber`, `useMediaSelection`, `groupMediaByDay` (`mediaSections.ts`); the viewer is a Mantine `Modal` with `MediaViewerStage`, `MediaViewerInfo` (a categorized list: each detail's `group` its own `List` under its subheader — "Details", "Used in" — of M3 two-line rows: an icon, the value, a line under it, the label for screen readers; a detail with `renderRoot` is a link with a chevron) and `MediaViewerButton`.
- **Behavior:** each day under its header, its pictures in justified rows that fill the width; a dominant-color placeholder until a picture loads; selection by the hover circle, Shift for a range, a day's circle for the whole day (`useMediaSelection`; the page shows the count and the actions in its footer while anything is selected); windowed, so thousands of pictures scroll like a few; the dates as Notion's page outline on the right edge, centred on it (`DateScrubber`, not on phones): a short dash per month, the one in view longer in the indicator color, opening on hover or focus into the list of months — one scrolls there. `fit="contain"` shows each whole picture on the tile's tone instead of cropping it (`cover`, the default, for photos) — for artwork, logos and pictures with transparency. A picture with `selectable: false` (in use, so it can't be deleted) shows its check faint with `lockedReason` on it, and no click, Space, Shift range or day's check takes it; pass `useMediaSelection` the selectable ids only. The viewer: the picture full-bleed on black in both schemes, ← → and swipes to step, zoom and pan, Esc, a swipe down or the bar's ✕ to close — the bar's buttons all on the right, Info, the page's actions, then Close (no Back on the left, where the Info panel opens: a deliberate change from Google Photos) — an Info panel — on the left from xs (600) on its own surface (`surface-container-low`) with a line where it meets the picture, its title first and ✕ at the header's end (on the side away from the picture's Back — a deliberate change from Google Photos), the details as a dense (`sm`) list under category subheaders with no dividers, as Google Photos, open by default on a desktop (from md), a bottom sheet on phones. While the library loads, `MediaGridSkeleton`: day headers and justified rows at the grid's row heights, a light sweeping across them (a slow fade with reduced motion) — never one big block.
- **Do:** Pictures by day with the newest first; the selection's actions in the page footer while anything is selected.
- **Don't:** Captions or buttons on the tiles; a grid of pictures in a card with its own scroll.
- **Demo:** the Gallery page (`/showcase/gallery`): the library by day with the Favorites filter (kept in the address), the viewer, the selection's actions in the footer (`TableSelectionBar`).

---

## 14. Tables

### Table — L2 · theme `Table` + `TableScroll` (L3)

- **Use when:** tabular data with columns.
- **Built from:** Mantine `Table`. The theme sets `highlightOnHover`, compact rows (`verticalSpacing={8}`) with cells 16px in (`horizontalSpacing="md"` — the same left edge as list rows), `stickyHeader`, outline-variant row lines and a **48px header row** in the container tone (container-high in dark) with 14px dimmed 500 labels that **stays in view** while the rows scroll under the page header — `TableScroll` moves it (`useStickyHead`), since the sideways scroller stops CSS sticky — with a hairline under it once it has left its place; cells 500; the last row has no line (the card ends it). `TableScroll` (`uiKit/TableScroll/`) wraps `Table.ScrollContainer`: a named region keyboard users can focus and scroll, mostly-vertical wheel gestures pass to the page, and `loading` dims the rows under a `LoadingBar` on the card's top edge.
- **Structure:** `Paper p={0}` → (`TableSelectionBar`, while rows are selected) → `TableScroll minWidth={480 | 720 | 820–880}` (3–4 / 5–6 / 7+ data columns — the checkbox, № and actions columns don't count) → `Table`. A section table's **title sits outside the card**, on the page: `<Stack component="section" gap={HEADING_GAP}>` → `Title order={2} size="h4"` → the Paper. **The card around a table is flat, with the rows' hairline edge (`--m3-outline-variant`) in both schemes** — not light's elevated white card, whose edge read as a white rim around the header row; `TableScroll`'s stylesheet does this for any Paper holding a table.
- **Scrolling:** one vertical scroller per page — a table never scrolls on its own vertically, only sideways; its 12px scrollbar sticks to the bottom of the screen above the page footer while the table is in view. Cells stay whole and on one line — never wrapped, never cut (`CellText` has no width cap and no "…"): a long value widens its column and the table scrolls sideways.
- **Phones:** the same table, every column (the user hides columns with Columns, never the breakpoint): it scrolls sideways inside its card, as everywhere else; the pager footer stays.
- **Cell patterns:**

  | Content | Pattern |
  |---|---|
  | Selection | first column, `Checkbox size="xs"`, the cell `data-row-controls` |
  | Row number | `№` column, `w={40}`, at every width, continues across pages |
  | Name + detail | `CellName` (picture, name, detail; `onOpen` makes the name the row's keyboard path; `picture` in place of the photo when the record's picture isn't one — a wide logo whole (48px tall, `sm` corners), an icon as the theme's 48px `tile` ThemeIcon (§4) — or `false` for none) or `CellText fw={600}` + `CellSubtext` |
  | Status | `StatusBadge` (§22) |
  | Numbers | `ta="end"` on th and td; digits are already monospace (§3) |
  | Timestamp | `RelativeTime` |
  | Row actions | `TableActions` in a narrow end-aligned last column (`w={1}`, header `ta="end"`), the cell `data-row-controls` |

- **Row press** (`uiKit/List/rowPress.ts`): spread `rowPressProps(onPress)` on `Table.Tr` — **pressing a row does its main action** (open, edit). Presses on its controls and on `data-row-controls` cells, modified clicks, the end of a text selection and clicks in its portals keep their own behavior. The row is not a tab stop: put the same action on a link or button inside it (the name) — its focus outlines the row. A pressable card list uses the same test: `isRowPress(event)` (`uiKit/List`) says whether a click is the card's own press.
- **Row actions** (`uiKit/TableActions/`): the main action is the row press and gets no button. The others are **filled icon buttons** (`TableAction`: a 34px circle, the glyph half its size, aria-label + Tooltip), each in its action's color from `uiKit/TableActions/actionColors.ts` — the same action has the same color everywhere (history `brand`, edit `teal`, duplicate `indigo`, view `green`, retry / revert `orange`, run `lime`, email `cyan`, suspend `yellow`, billing `violet`, invoice `cyan`, failures and delete `red`; back and insert `gray`; anything else the brand). **Up to 3 actions** all show; **with 4 or more**, the first 2 show and the rest go in a **tonal ⋯ menu** in the third slot, so a row never holds more than three buttons. **On phones only the ⋯.** Destructive actions (`destructive: true`) are red and last — after a divider in the menu, red there too, and their row hovers red (the menu's 8% hover layer takes the item's own color).
- **Rules:**
  - A row that only opens something has **no actions column** — the row press is enough.
  - Every column shows at every width — on phones the table scrolls sideways in its card; the user hides columns with `ColumnsMenu`, never the breakpoint.
- **Do:** The row press for the main action; the name as its keyboard path; numbers aligned to the end, with their units in the header; secondary columns hideable in Columns.
- **Don't:** Striped rows; a title inside the table's card; a button for the row's main action, or more than three buttons on a row; wrapped cells; a fixed-height table with its own vertical scroll, or a list in place of the table on phones.
- **In code, don't:** Icon buttons without `aria-label` and a Tooltip.
- **Demo:** `TableScroll, SortableTh, CellName, TableActions, TableSelectionBar` (search, Columns, sorting, row press, row actions, selection, pager, empty state).

### SortableTh — L3 · `uiKit/SortableTh/`

- **Use when:** a column the user can sort.
- **API:** Mantine `Table.Th` props + `direction` (`'asc' | 'desc' | null`) + `onSort`. Use `ta="end"` on numeric columns.
- **A11y:** sets `aria-sort`.
- **Do:** Sort only columns people compare (names, dates, amounts).
- **Don't:** Sorting a column whose order means nothing (free-text notes); a header sort and a FilterGroup sort chip on the same table.
- **Demo:** `TableScroll, SortableTh, CellName, TableActions, TableSelectionBar` (sorting).

### TableSelectionBar — L3 · `uiKit/TableSelectionBar/`

- **Use when:** table rows (or a list's rows, or a grid's pictures — the Gallery) have checkboxes and there are bulk actions. The header's checkbox selects the page's rows.
- **Built from:** Mantine `Group`, `Text`, `Button`.
- **API:** `count`, `onClear`, `disabled?` (a bulk action is running), `children` (the bulk actions: filled `size="xs"` buttons with an icon and a label, each in its action's `ACTION_COLOR`, the destructive one red and last).
- **Look:** a labeled region on the tonal primary while rows are selected: "Selected: N" and an outlined "Clear selection" pill at the start, the bulk actions at the end.
- **Where:** in a `PageLayout` with a `footer` it covers the footer (the pager steps out of view until the selection clears) — through the page's footer slot (`usePageFooterSlot`), with nothing for the page to wire; on a page without a footer it sits on the table's top edge, above its header.
- **Rules:** destructive bulk actions confirm first; the page clears the selection after a bulk action.
- **Do:** The count and Clear first, the bulk actions after, each in its action color; the destructive action red and last, confirmed first.
- **Don't:** Bulk actions that act on a single row — those go in the row; the selection bar in the page header; a second selection bar on the table while the footer shows one.
- **Demo:** `TableScroll, SortableTh, CellName, TableActions, TableSelectionBar`.

### TableSkeleton — L3 · `uiKit/TableSkeleton/`

- **Use when:** the table's data is loading the first time (a refetch keeps the rows: `TableScroll loading`).
- **API:** `columns` (match the header), `rows?` (default 5). Render it **in place of `Table.Tbody`**, under the real `Table.Thead`.
- **Do:** As many skeleton columns as the real header; the real header above it, so the table doesn't jump.
- **Don't:** A skeleton on a refetch — the rows stay, dimmed.
- **Demo:** `TableSkeleton`.

### RelativeTime — L3 · `uiKit/RelativeTime/`

- **Use when:** a timestamp cell. Shows "2 days ago" in the cell's text color; the exact date and time on hover. **API:** `value` (ISO string).
- **Do:** Relative time in tables, the exact time on hover.
- **Don't:** Relative time where the exact moment matters (an invoice date).
- **Demo:** `TableScroll, SortableTh, CellName, TableActions, TableSelectionBar` (Last active).

### ColumnsMenu — L3 · `uiKit/ColumnsMenu/`

- **Use when:** a wide table where the user may hide columns.
- **API:** `columns` (only hideable ones — never identity, status or actions), `value`, `onChange`, `size?`.
- **Rules:** at the end of the filter row (`FilterGroup actions`), shaped like its chips, never in the page header; the menu stays open while toggling.
- **Do:** Only optional columns in it.
- **Don't:** Hiding the name, the status or the actions column.
- **Demo:** `TableScroll, SortableTh, CellName, TableActions, TableSelectionBar` (Columns).

### DraftNumberInput — L3 · `uiKit/DraftNumberInput/`

- **Use when:** a number cell in an editable table, or any number field bound to a numeric draft.
- **API:** NumberInput props + `value` (number, `NaN` = empty) + `onChange(number)`.
- **Why:** it keeps the half-typed text ("12.", "-") instead of re-formatting on every keystroke.
- **Do:** The unit in the column header or the field's affix.
- **Don't:** Reformatting the number while it is typed.
- **Demo:** `DraftNumberInput`.

### useRowDrag + RowDragHandle — L3 · `uiKit/RowDrag/`

- **Use when:** the user orders rows by hand (a list or a table body).
- **API:** `useRowDrag({ ids, getName, onReorder(from, to), disabled?, insets? })` returns `listProps` (on the element whose children are the rows — a `SegmentedList`, a `List`, `Table.Tbody`), `handleProps(index)` (each row's `RowDragHandle`), `statusProps` (one `RowDragStatus` beside the list) and `move(from, to)` (for Move up / Move down actions).
- **Behavior:** drag the grip with a mouse, pen or finger, or focus it and press ↑ / ↓; passed rows slide aside, a drop glides into place, the scroll area scrolls near its edges, Esc cancels; each move is announced ("moved from position 1 to 2"). A change of `ids` (a refetch) cancels a drag in progress.
- **Do:** A visible grip on every row; Move up / Move down in the row's menu too.
- **Don't:** Drag as the only way to reorder.
- **Demo:** `SegmentedList, useRowDrag, RowDragHandle`.

---

## 15. Stat Cards

### StatCard — L3 · `uiKit/StatCard/`

- **Use when:** KPIs — a few headline numbers above a dashboard or list.
- **Built from:** Mantine `Paper`, `Text`, `Skeleton`, `StatisticNumber` (a `RollingNumber` that rolls in on mount, grouped the language's way), `FieldHelp`.
- **API:**
  - `label`, `icon`.
  - `value?`: `RollingNumber` props such as `value`, `prefix`, `suffix`, `decimalScale`, `thousandSeparator`. `valueText?`: a value that isn't a plain number ("1.5 h", "—", "Active"), in the text face — only `value` takes the monospace digits. Neither = its skeleton.
  - `color?` (rates: §2 thresholds), `caption?` (the period, e.g. "Last 30 days"; its line is kept when empty, so cards in a row match), `help?` (an ⓘ beside the label).
  - `meter?`: the figure as a share of a whole, 0–100 and more (a quota in use): a 52px donut with its percent beside the value and caption, in the value's color, in place of the icon.
  - `onClick?`: the card opens what it counts (a filtered list) — the whole card is one button, a chevron after the value, M3's hover and press layers over its tone; no `help` on it (a button can't hold one).
- **Rules:** lay out in `SimpleGrid cols={{ base: 2, md: 4 }} spacing={CARD_GAP}`; the value is 24px 700 and rolls in (not under reduced motion).
- **Do:** 2 to 4 cards in a row, each one number with its label and period; color only when it means a threshold (§2).
- **Don't:** A chart, a list or several numbers in one card; a different card height per card in a row.
- **In code, don't:** A plain number as `valueText`; `Grid` for stat cards.
- **Demo:** `StatCard`.

---

## 16. Charts

### Charts — L1 · `@mantine/charts` + `ChartLegend` (L3)

- **Use when:** trends and comparisons. `recharts` only for what Mantine charts can't do.
- **Chart card:** a `Paper` → a title row (`Title order={2} size="h4"` and an optional `SegmentedControl size="xs"` — Bar / Line) → the chart at a fixed height — 220px for a chart among other cards, 300px when it is the page's main content — the same for its `Skeleton` while loading, so the card never resizes → `ChartLegend`.
- **Look:** quiet dashed guides in the decorative line (`gridAxis="x"`, `gridColor="var(--m3-outline-variant)"`, `strokeDasharray="4 4"`), no tick lines, 11px dimmed ticks in the body font; bars `maxBarWidth={22}` with 2px corners.
- **ChartLegend** (`uiKit/ChartLegend/`): pills under the chart — color dot, label and total, no percentage; pressing one hides or shows its series (`aria-pressed`). API: `label`, `items: { key, label, color, value? }[]`, `hidden`, `onToggle`; pass the chart only the series not hidden.
- **Rules:** Mantine color names in `series` (`green.6` success, `red.6` failed…).
- **Do:** One message per chart, its title saying it; the legend under the chart, its pills toggling series.
- **Don't:** More than about 6 series in one chart; color as the only way to tell series apart — the legend names them; 3D charts; a pie for more than 4 parts.
- **Demo:** `BarChart, ChartLegend`.

---

## 17. Dashboard & List Pages

**Dashboard order:** filters → stat cards → chart cards → section tables.
**List page:** `PageLayout` (`search`, `overflowActions` / `fab`, `filters`, `TablePagination` in `footer`) → table or `EmptyState`.

### FilterGroup — L3 · `uiKit/FilterGroup/`

- **Use when:** any filtering on a list or dashboard — the one filter bar, Google style, no drawer or sheet.
- **Not when:** free-text search → `SearchBar` in the header; bulk actions → `TableSelectionBar` (§14).
- **Built from:** Mantine `Button`, `Menu`, `Popover`, `Combobox`, `DatePicker`, `RangeSlider`, `Scroller`, and the kit's `AppModal` + `DialogList` (via `FilterChip`, `FilterChipCombo`, `FilterChipDialog`, `FilterChipPanels`).
- **API:**
  - `fields: FilterField[]`, `values: FilterValues`, `onChange(patch)` (only the changed keys), `leading?` (a control before the chips, set off by a hairline — e.g. a small mode switch as tall as the chips: a `SegmentedControl` with `styles={{ label: { height: 'calc(var(--chip-h) - 2px)' } }}`. **A list page's views with counts — All / My tasks / New — never go here: they are `ScrollerTabs` with `count`, under the filters, right above the table (§26)**), `actions?` (e.g. `ColumnsMenu`), `size?` (sm), `withClearAll?` (default on), `disabled?` (e.g. while the list loads).
  - **Field:** `key`, `label`, `icon?`, `pinned?`, `defaultValue?` (what the screen falls back to when cleared, e.g. a period's "Last 30 days"), `disabled?`, plus a type:
    - `select` takes `options` and `clearable?` (`false`: a sort order — always holds a value, shows "Sort: Newest" with no ✕, "Clear all" leaves it);
    - `multi` takes `options`;
    - `date` takes `compact?` (one-month calendar), `presetLabels?` (a preset pick reads as its name), `defaultPreset?` (the preset the field's `defaultValue` is — `'thisMonth'`, `'last30'`) and `pastOnly?` (the calendar stops at today);
    - `toggle` has no extra props;
    - `range` takes `min`, `max`, `step?`, `format`.
- **Behavior:**
  - **Pinned field:** always shown as an outlined chip `icon Label ▾`.
  - **Set filter:** a tonal chip `icon Value ✕`, read as "Label: Value"; the ✕ clears it. A field that holds its `defaultValue` or can't be cleared stays outlined with its value and ▾.
  - **Unpinned field:** sits behind "+ Add filter"; picking it adds its chip already open (a toggle is simply switched on); closed without a value, it goes away again. A **single** unpinned field shows as its chip — no Add filter for a menu of one.
  - **Clear all:** shown while any filter is set to something other than its default.
  - **Add filter** and **Clear all** are text buttons as tall as the chips.
  - **Date range:** applies once both ends are picked; a start date alone stays in the panel. The panel is the kit's `DateRangePanel` (§18): the picked range as the headline (the chip already names the filter), quick ranges as pills, the M3 calendar — one month with `compact` (and always below md), stopping at today with `pastOnly`. **On phones the chip opens Google's full-screen `DatePickerDialog` instead** (no room for a calendar under a chip): no quick ranges, Save applies once both ends are picked, the chip's ✕ unsets. A range two quick ranges cover (on the 1st This month is Today; on the 30th of a 31-day month Last 30 days is This month) is named by the field's `defaultPreset` when that is one of them — so a page's starting period keeps its name every day — otherwise by the calendar one (Today, This month, This year), in the chip and the pills alike (`presetFor`). **A date field with a `defaultValue` from a preset always names it in `defaultPreset`.**
  - **Lists:** select and multi open the same lists as ComboSelect and MultiCombobox (§19).
  - **A dialog picker** (`dialog: true` on a select or multi field, when the picks should be made together and applied at once): the chip picks in the kit's list dialog in an `AppModal`, full screen on phones (`FilterChipDialog`) — search (focused on desktop only), a "Select all" row over the matches with the count picked, the compact (sm) rows with the checkbox at the end and the full name, windowed (`useVirtualRows`), and Apply (Cancel beside it on tablets and desktop; the ✕ on phones); the filter changes once, on Apply. A single-choice list applies the option pressed. Other fields keep the menu.
  - **Layout** (`filterLayout.ts`, set by `PageLayout filters`): chips wrap with 8px gaps on desktop; below md one row that scrolls sideways within the page's side margin (like `ScrollerTabs`), "Add filter" and "Clear all" at its end.
- **Rules:**
  - **One period control per page:** a `date` field with `compact` + `presetLabels` (the kit's standard), never a period select beside it.
  - Keep the screen's own shape in the URL or store and map it to `FilterValues` with two small functions.
- **Do:** The filters people use most pinned, the rest behind Add filter; one period control per page.
- **Don't:** A labelled filter form, a filters drawer or a sheet; a hand-built row of selects; search as a filter chip.
- **Demo:** `FilterGroup` (every field type).
