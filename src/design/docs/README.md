# LM3 — Design System

> **Version:** 4.5 · **Stack:** Mantine 9.7 + Material Design 3 + React 19
> **What LM3 is:** a hybrid. Mantine is the base; the LM3 theme restyles Mantine's own components toward Material 3; the LM3 kit adds components built from Mantine where Mantine has no fitting one. This document says, for every need, **which layer to use and how** — written so a developer picks the right piece on the first try.

---

## 0. Start here

### Principles

1. **One way to do each thing.** Every need has exactly one answer in the lookup table below. If two pieces could fit, the table says which.
2. **The kit before custom code.** If `components/uiKit/` has it, use it; if it is missing and reusable, add it to the kit — never build it once inside a page.
3. **The theme decides the look.** Never pass a prop or a style the theme already sets. A screen composes components; it does not style them.
4. **Material 3 on Mantine.** M3 gives the behavior, the shape scale and the sizes (40px controls, 44px text fields, 56px list rows); Mantine gives the components and their `size` props, so every size xs–xl still works. Text fields are the M3 outlined text field (4px corners, notched label, states — §18).
5. **Readable in both themes, usable with a keyboard.** Every choice works in light and dark, meets contrast, and has a label.

### The three layers

| Layer | What it is | How to use it |
|---|---|---|
| **L1 · Mantine** | A Mantine component the theme does not restyle (`Group`, `Stack`, `SimpleGrid`, `Flex`, `Box`, `Center`, `Skeleton`, `Image`, `Progress`, `RingProgress`, `CopyButton`, `FileButton`, `Code`, `Kbd`…) | Use it directly with Mantine's props. (`Progress` / `RingProgress` only for a static meter, like StatCard's; a job's progress is `LinearProgress` / `CircularProgress`, §24) |
| **L2 · Mantine + LM3 theme** | A Mantine component restyled in the project's `styles/` (theme config or the stylesheets) | Use the Mantine component directly — **never pass the props or styles the theme sets** (radius, variant defaults, fonts, colors, shadows, transitions) |
| **L3 · LM3 kit** | A component in `components/uiKit/` (or the shell in `components/shared/layout/`), built from Mantine | **Always use the kit.** Never rebuild it from Mantine, never use the Mantine original for the same job |

Every component entry below starts with its layer.

### I need… → use

| I need | Use | Layer | § |
|---|---|---|---|
| A page | `PageLayout` | L3 | 11 |
| Page width for tables, lists and dashboards | `PageLayout withContainer containerSize="fluid"` (full width) | L3 | 11 |
| Page width for forms / settings | `PageLayout withContainer containerSize="lg"` (1180px) | L3 | 11 |
| Page width for details / docs | `PageLayout withContainer` (1280px) | L3 | 11 |
| The page's main action ("New order") | `PageLayout fab` | L3 | 11 |
| Other page actions (Export, Refresh) | `PageLayout overflowActions` | L3 | 11 |
| Select items and act on them | checkboxes on the rows (a table's checkbox column, a list's leading or trailing checkbox) + `TableSelectionBar` — in the page footer when the page has one, else above the table or list; the page header never changes | L3 | 14 |
| Search on a list page | `SearchBar` (or `SearchInput`) in `PageLayout search` | L3 | 18 |
| Filters | `FilterGroup` in `PageLayout filters` (+ `ColumnsMenu` at its end) | L3 | 17 |
| A period / date filter | `FilterGroup` date field (`compact`, `presetLabels`) | L3 | 17 |
| A data table | Mantine `Table` in `TableScroll` + the table kit | L2 + L3 | 14 |
| Open a row by pressing it | `rowPressProps` | L3 | 14 |
| Row actions | `TableActions` (only if the row has actions besides opening) | L3 | 14 |
| A cell's text; a name with its detail | `CellText` / `CellSubtext` / `CellName` | L3 | 14 |
| Sortable column header | `SortableTh` | L3 | 14 |
| Reorder rows by dragging | `useRowDrag` + `RowDragHandle` | L3 | 14 |
| Pagination | `TablePagination` in `PageLayout footer` (under the table on phones) | L3 | 25 |
| Loading table | `TableSkeleton` (first load) · `TableScroll loading` (refetch) | L3 | 24 |
| A timestamp in a table | `RelativeTime` | L3 | 14 |
| Editable number in a table | `DraftNumberInput` | L3 | 14 |
| KPIs | `StatCard` in a `SimpleGrid` | L3 | 15 |
| A chart | `@mantine/charts` in a chart card + `ChartLegend` | L1 + L3 | 16 |
| A status | `StatusBadge` + `defineStatuses` | L3 | 22 |
| Something new behind a destination or an icon | `NavBadge` | L3 | 22 |
| A text field | Mantine `TextInput` / `Textarea` / `PasswordInput` / `NumberInput` | L2 | 18 |
| Help next to a field | `FieldHelp` (text field) · `FieldLabel` (switch, checkbox, radio) | L3 | 18 |
| A long form | `FormSection` cards (+ `FormTabs`) with a `SaveBar` in the footer | L3 | 18 |
| An image field (upload, crop, pick from a gallery) | `ImageUploader` | L3 | 18 |
| A date / date range input | `DatePickerInput` (kit; `type="range"` for a range) | L3 | 18 |
| A date range picked inline, with quick ranges | `DateRangePanel` | L3 | 18 |
| A time of day | `TimeField` | L3 | 18 |
| A value on a scale | Mantine `Slider` / `RangeSlider` | L2 | 18 |
| Pick one option | `ComboSelect` | L3 | 19 |
| Pick several options | `MultiCombobox` | L3 | 19 |
| Checkbox / radio / switch | Mantine `Checkbox` / `Radio` / `Switch` | L2 | 18 |
| A button / an icon button | Mantine `Button` / `ActionIcon` | L2 | 21 |
| A labeled button that turns into an icon on small screens | `AdaptiveButton` | L3 | 21 |
| A main action with related actions | `SplitButton` | L3 | 21 |
| A few related actions side by side; a toggle set | `ButtonGroup` | L3 | 21 |
| The main action opening a few related ones (phones) | `FabMenu` | L3 | 21 |
| An explanation behind a control | `RichTooltip` | L3 | 21 |
| Switch between 2–5 views | Mantine `SegmentedControl` | L2 | 21 |
| A list page's views with counts (All / My tasks / New) | `ScrollerTabs` with `count`, under the filters | L3 | 26 |
| A few on/off choices inside content | Mantine `Chip` | L2 | 21 |
| A menu of actions | Mantine `Menu` | L2 | 21 |
| Switch between page sections | `ScrollerTabs` | L3 | 26 |
| Confirm a destructive action | `ConfirmDialog` | L3 | 20 |
| A short decision with custom buttons, or a form of one or two fields or selects | `BasicDialog` | L3 | 20 |
| Leave with unsaved changes? | `UnsavedChangesDialog` (`useSaveBar` asks for you) | L3 | 20 |
| A form of three fields or more, a list picker with a search, or content in a window (full screen on phones) | `AppModal` | L3 | 20 |
| Details read beside the page (no fields — a form goes in a dialog) | `SideSheet` | L3 | 20 |
| Details or a short list of actions, with no field or select — a sheet on phones and tablets, the modal on desktop | `BottomSheet` (rather than `SideSheet`) | L3 | 20 |
| "Saved", "Deleted" (with Undo) | `snackbar()` / `notifications.show` | L2 | 23 |
| A message about this page | `AppAlert` | L3 | 24 |
| A message about the whole account | `AnnouncementBar` in the app shell | L3 | 24 |
| Nothing to show | `EmptyState` | L3 | 24 |
| Page loading / page error | `PageLayout loading` / `error` (+ `usePageFeedback`) | L3 | 24 |
| Progress of a job (upload, import, sync) | `LinearProgress` · `CircularProgress` (`value`, or none while unknown) | L3 | 24 |
| A short wait of unknown length | `LoadingIndicator` | L3 | 24 |
| A settings page | `SettingsGroup` + `SettingsRow` | L3 | 13 |
| A long or open-ended list of one kind (people, files, templates, a pick list, search results) | `List` + `ListItem` | L3 | 13 |
| A short group of separate items (accounts, keys, channels), choices, a short list to reorder | `SegmentedList` | L3 | 13 |
| A card | Mantine `Paper` | L2 | 13 |
| Pictures by day, with a viewer | `MediaGrid` + `MediaViewer` | L3 | 13 |
| Items that open in place to show more (a run's steps, a payload, FAQ answers) | `AppAccordion` + `AppAccordionItem` | L3 | 13 |
| Navigation | `navSections.ts` → `AppSidebar` / `NavRail` / `NavigationBar` | L3 | 12 |
| The logo | `BrandLogo` | L3 | 28 |

Nothing fits? Read §31 (adding to the kit) before writing a one-off.

### How to read a component entry

Every entry has the same fields, in this order:

- **Layer · source** — L1 / L2 / L3 and the file.
- **Use when / Not when** — and the right alternative.
- **Built from** — the Mantine component and the theme / CSS that shape it.
- **API** — the props that matter (kit) or the props you may pass (Mantine).
- **Rules** — how it is wired into a page.
- **Do / Don't** — design decisions: what people should see and never see. A rule marked **(M3)** comes from Material 3's own guidelines for that component (m3.material.io, the Do / Don't / Caution notes); the rest are LM3's.
- **In code, don't** — the mistakes that only show in the code (a prop the theme sets, a raw Mantine piece).
- **Content** — how to word it (§30 has the general rules).
- **A11y** — role, keyboard, labels.
- **Demo** — the section on the boilerplate template's Components page (`/showcase/components`, searchable with `?q=`) headed by the component's code name as it is imported (`TimeField`, `SaveBar, useSaveBar`): one tab per group — Material 3's (Actions, Inputs, Selection, Lists & cards, Status & progress, Overlays, Navigation) and the kit's own (Forms, Tables & data, Messages) — every kit component its own section (`KitSection`) — its name, one card, a few examples. The media grid and viewer have a page of their own, Gallery (`/showcase/gallery`). Projects leave the showcase out.

Every project is created from the boilerplate template and gets the same code: the theme in `src/styles/`, the kit in `src/components/uiKit/` (one folder per component), the shell in `src/components/shared/layout/`. This document describes that code and never copies it — it says what to use and why. Code comments cite sections as `LM3 §N`; section numbers are stable.

**Scope:** how the UI looks and which component to compose. Project structure, data fetching, state, forms logic and i18n live in the frontend guide (`README.md`), `best-practices.md`, `typescript.md`, `api-layer.md`, `i18n.md`. Examples here use English literals; real code translates them.

---

## Files

LM3 is split by part; section numbers run across the files.

| Sections | File | Covers |
|---|---|---|
| §0 | this file | principles, the lookup table (which piece for which need), how each section is laid out |
| §1–9 | [01-foundations.md](01-foundations.md) | tokens, color, typography, shape, elevation, motion, spacing, states, icons |
| §10–12 | [02-shell-and-layout.md](02-shell-and-layout.md) | app shell, PageLayout, sidebar navigation |
| §13–17 | [03-surfaces-and-data.md](03-surfaces-and-data.md) | cards, lists, settings, tables, stat cards, charts, dashboard and list pages |
| §18–19 | [04-forms-and-pickers.md](04-forms-and-pickers.md) | text fields, forms, date and time pickers, select and combobox |
| §20–21 | [05-dialogs-and-actions.md](05-dialogs-and-actions.md) | dialogs, modals, sheets, buttons and actions |
| §22–26 | [06-status-and-navigation.md](06-status-and-navigation.md) | badges and status, notifications, messages and page states, pagination, tabs |
| §27–31 and appendices | [07-responsive-brand-writing.md](07-responsive-brand-writing.md) | responsive design, brand, antipatterns, writing, governance, appendices |
| — | [decisions.md](decisions.md) | the design decisions log: what changed, when, what it replaced and why — read it before changing a rule |
