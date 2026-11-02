# LM3 — Responsive, brand and writing (§27–31 and appendices)

Part of the LM3 design system — start at [README.md](README.md). Section numbers (§) run across all its files, so "LM3 §14" names one section wherever it is cited.

---

## 27. Responsive Design

Mobile-first: write the `base` value, override upward. The theme's breakpoints are **M3's window size classes**: `xs` 600 · `sm` 840 · `md` 1200 · `lg` 1600 · `xl` 1920. Screen classes (`useScreen`): **phone** below xs, **tablet** xs–md, **desktop** from md; the stylesheets' media and container queries use the same values.
Tools in order: responsive props (`p={{ base: 'md', xs: 'lg' }}`) → `visibleFrom` / `hiddenFrom` → `useScreen()` / `useBelow(bp)` only when a prop value or a component must change (desktop first: the first paint is the desktop layout).

| Component | Phone (< 600) | Tablet (600–1199) | Desktop (≥ 1200) |
|---|---|---|---|
| Navigation | ☰ modal drawer + navigation bar (3–5 `bar` pages; none with fewer) | Rail | Sidebar (☰ folds it into the rail) |
| Page side padding | 16px | 24px | 24px |
| Header actions | ≤ 2 icons (⋮ counted); the main action an extended FAB | Icons + the labeled main action; icons fold into ⋮ to keep the title | Same |
| Search | Behind 🔍 in the app bar: it swaps the bar for the field and a round ✕ (`PageHeaderSearch`) | The same 🔍 below 840; in the header (200px) from 840 | In the header (250px) |
| Filters | One sideways row, inside the side margin | One sideways row | Chips wrap |
| Stat cards | 2 | 2 | 4 |
| Tables | The same table, scrolling sideways | The same table | The same table |
| Pagination | Range and arrows | + rows per page | + rows per page |
| Detail pages | One column (lead, pane, main) | Supporting pane beside the main once the layout is 840px wide | Same |
| Modals (forms) | Full screen | Centered | Centered |
| Dialogs (decisions) | Small, centered | Centered | Centered |

---

## 28. Brand

### BrandLogo — L3 · `shared/layout/BrandLogo.tsx`

The 36px logo mark + the wordmark at 18px, **bold (700)**, in the body face, taking the surrounding text color (light on the sidebar, dark on the phones' light top bar); `compact` draws the mark alone (the rail). The only place the brand is drawn — never rebuild it inline. Brand color: `BRAND` in `styles/brand.ts`, the whole color system generated from it at build time (§2).

- **Do:** `BrandLogo` wherever the brand shows.
- **Don't:** A rebuilt, recolored or stretched logo.

---

## 29. Antipattern Index

The most common mistakes, in two tables: what people see, and how it is built. Each component's own **Do / Don't** has the rest.

### Design — what people see

| Don't | Do |
|---|---|
| Several filled or colored buttons competing in one area | One filled action; tonal or outlined for the rest (§21) |
| A dialog for news, a result or anything low-priority | A snackbar; a dialog only for a decision that blocks the task (§20, §23) |
| "OK" or "Yes" on a confirmation; a vague question as its title | One specific question, and the verb on the button: "Delete template" (§20, §30) |
| Text buttons in dialogs, sheets and empty states | The dismissive action outlined, the main one filled (§20, §24) |
| A field or select in a bottom or side sheet | `BasicDialog` for one or two, `AppModal` for more (§20) |
| A list's search focused as it opens on a phone or tablet | It waits for a tap (`useSearchAutofocus`, §19) |
| A card in a card; lines between cards | Space between cards and sections; lines only inside a card (§5, §13) |
| A list in place of a table on phones; a table with its own vertical scroll | The same table, scrolling sideways in its card; the page scrolls (§14) |
| An actions column on rows that only open something; a button for the row's main action | A row press (`rowPressProps`, §14) |
| More than three buttons in a table row | Two + the ⋯ menu (`TableActions`, §14) |
| The page header turning into a selection bar | `TableSelectionBar` — the page footer, or above the table or list (§14) |
| Search inside the filter row; pagination the page puts in the content | `PageLayout search` / `footer` (§11) — on phones PageLayout moves the footer under the table itself |
| A second period select next to a date filter | One `FilterGroup` date field (§17) |
| A full-page loader on a refetch | Section skeletons, dimmed rows (§24) |
| A wavy or morphing indicator for every wait | `LoadingIndicator` under five seconds, wavy progress for long noticeable work, `Loader` in buttons (§24) |
| An alert repeated on every page for an account issue | `AnnouncementBar` in the shell (§24) |
| An empty state with no way forward | Why it is empty and one next step (§24) |
| Color alone for a status; per-item nav colors | An icon or a word with every color; the one navigation look (§2, §12) |
| A chip on its own; chips that move a task on | Chips in a set beside the content; buttons for the next step (§21) |
| Switches for a list of options; radios side by side or more than five | Checkboxes; radios one under another; a select past five (§18) |
| A placeholder holding the only instructions; the error shown under the supporting text | A label and a description; the error replaces the description (§18) |
| Several snackbars at once; links or icons in a snackbar | One at a time, one short sentence, one action (§23) |
| Title Case, technical or library names in the UI | Sentence case, plain language (§30) |

### Code — how it is built

| Don't | Do |
|---|---|
| A hex / rgba for a theme-dependent color; hand-defined brand shades | A token (§1); `BRAND` + the generator (§2) |
| Passing radius, variant defaults, fonts, shadows or transitions the theme sets | Nothing — the theme sets them (L2) |
| A raw Mantine `Modal`, `Drawer` or `Alert` with hand-built chrome | `AppModal`, `SideSheet`, `BottomSheet`, `AppAlert` (L3) |
| A dialog scrolling in the browser's own scrollbar; `Modal.Root` without a scroll area | The theme's `ScrollArea.Autosize`, `DialogScroll`, or the compound dialog's own `ScrollArea` (§20) |
| A hand-built badge, confirm box, pager, empty box, KPI card, filter row, save bar or row-action group | `StatusBadge`, `ConfirmDialog`, `TablePagination`, `EmptyState`, `StatCard`, `FilterGroup`, `SaveBar`, `TableActions` |
| Header buttons built by hand, or a variant passed to them | `PageLayout overflowActions` / `fab` (§11) |
| Your own button as an alert action | `action={{ label, onClick }}` (§24) |
| A custom combobox built without ComboSelect's setup | ComboSelect's setup (§19); the theme's `Combobox` already has no dropdown padding |
| Large `Text` as a heading; a hardcoded font | `Title`; theme fonts |
| `100vh`; inline pixel spacing; z-index numbers | `100dvh`; spacing props and `pageMetrics`; z-index variables |
| An icon button without a name | aria-label + Tooltip |
| A sidebar color set in a stylesheet or a component | The one sidebar look (§12): from the brand, or its own tone in `styles/brand.ts` (`SIDEBAR`) |
| A rebuilt logo | `BrandLogo` |

---

## 30. Writing

- **Sentence case** everywhere: buttons, titles, labels, menu items, badges ("New automation", not "New Automation").
- **Buttons and menu items are verbs** naming the result: "Save changes", "Delete template", "Export CSV". Never "OK", "Yes", "Submit" — except the M3 date and time pickers' OK, which is Google's own spec.
- **Labels are nouns:** "Email", "Company name". Descriptions add format or limits.
- **Errors say what happened and what to do:** "Couldn't load runs. Check your connection and try again." Never raw codes or stack traces.
- **Empty states say why and what next:** "No orders match these filters" + "Clear filters".
- **Confirmations ask a question and name the consequence:** "Delete this location?" + "This can't be undone. 120 runs will be deleted."
- **Snackbars are one short past-tense sentence:** "Template deleted", "Run restarted".
- **Numbers and dates:** thousands separators in the language's format; relative time in tables ("2 days ago") with the exact time on hover; "Oct 11, 2026" elsewhere.
- **Plain language for users:** no component, library or technical names in the UI or the changelog.

---

## 31. Governance

- **Where the code lives.** A project is created from the boilerplate template once and then owns its copy of the theme (`src/styles/`), the kit (`src/components/uiKit/`) and the shell (`src/components/shared/layout/`). This document describes that code; when a project's code and this document disagree, fix one of them in the same change.
- **Adding to the kit** (something reusable is missing):
  1. Build it in its own folder, `components/uiKit/<Name>/`, from Mantine, in the theme's look, with a test. **Keep it portable:** a kit folder imports only other kit folders (through their `index.ts` — and a folder's CSS module only where it renders that folder's parts, as ComboSelect does ComboOptions'), Mantine, `lucide-react`, the stack's own libraries — `react-i18next` (the kit's strings are `common.*` keys, which a copied folder brings along in every language), `@tanstack/react-router` (`useSaveBar`'s leave guard, the route screens), `@tanstack/react-virtual` (long lists), `dayjs` (date math) — and the small standalone helpers in `styles/` (`spacing`, `pageFrame`, `lines`, `motion`, `shape`, `iconSize`, `tonalEdge`, `tableScrollArea`, `m3/contrast`), `hooks/` and `utils/`. Never the theme files (`theme.ts`, `themeComponents.ts`…) and never `PageLayout` for a constant (the frame's sizes are `styles/pageFrame`), so a folder can be copied as it is into another codebase (the SaaS Support SDK takes its UI from the kit this way). The theme may register a kit component (the `Loader` is `CircularLoader`); the kit never imports the theme. The folder holds the component, its private parts, hooks, CSS module and tests, and an `index.ts` that **names its public API** — the components and hooks screens use, and the types of their props and items; helpers, contexts and constants used only inside stay out of it (no `export *`). Screens import the folder (`@/components/uiKit/<Name>`), never a file inside it.
  2. Add an entry here (the template in §0) and a row in the lookup table.
  3. Bring it back to the boilerplate template with its own Components-page section (its name, one card, a few examples — no descriptions or option toggles) so new projects start with it.
- **Changing the look** (a token, a component default): change `styles/` only, check light and dark, and update the rule here if it changes a rule. Never copy theme code into this document.
- **Fixes to a kit component** made in a project go back to the boilerplate template too, so the next project doesn't start with the old version.
- **Checking a project's copy:** from the boilerplate's `frontend/`, `yarn kit:diff <the project's frontend folder>` compares the project's kit, theme and shell, and the helpers they import (`hooks/`, `utils/`, `lib/`, `test/`), with the boilerplate's, and exits 1 on any drift. A file a project changes on purpose (its own sign-in, profile menu or navigation in the shell) is accepted in the project's `kit-diff.json` with why it differs, pinned to both files' contents: once either side changes, it is reported again, so a fix in the boilerplate never misses a project. Run it after copying the kit into a project and before its release.
- **Recording a decision:** a design decision — a new or changed rule, a component replaced — gets a dated entry in [decisions.md](decisions.md): what it replaced and why, in the same commit as the section it changes.
- **Deprecating:** mark the component in Appendix A, point to its replacement, remove it once projects have moved.

---

## Appendix A: Component Inventory

The kit every project gets from the boilerplate template, by area. **L3** unless marked.

| Area | Components |
|---|---|
| Shell (`shared/layout/`) | `AppLayout`, `AppSidebar`, `NavRail`, `NavDrawer`, `NavToggle`, `NavigationBar`, `navSections` (+ `useNavSections`), `BrandLogo` |
| Page frame | `PageLayout` (+ `PageHeader`, `MobileAppBar`, `BAR_ICON`, `pageNav`, `PageHeaderActions`, `HeaderOverflowMenu`, `PageHeaderSearch`, `PageFab`, `PageInfo`, `useHeaderFit`, `usePageFeedback`, `usePageFooterSlot`, `useTableFooter`, `pageMetrics` — `SHOW_PAGE_INFO`; the frame's sizes are `styles/pageFrame`), `SaveBar` + `useSaveBar` |
| Messages & states | `AppAlert`, `AnnouncementBar`, `EmptyState`, `PageLoader`, `PageError`, `PageMessage`, `RouteError`, `NotFound` (in `PageStates/`), `AppErrorBoundary`, `CircularLoader`, `LoadingBar`, `LinearProgress` · `CircularProgress` (in `ProgressIndicator/`), `LoadingIndicator`, `TableSkeleton` |
| Status & data | `StatusBadge` + `defineStatuses`, `NavBadge` + `NavBadgeText`, `StatCard` (+ `StatisticNumber`), `ChartLegend`, `RelativeTime` |
| Dialogs & overlays | `ConfirmDialog`, `BasicDialog` (+ `DialogList`), `UnsavedChangesDialog`, `AppModal` (+ `AppModalFullScreen`, `appModalParts`, `DialogScroll`, `useScrollEdges`), `SideSheet`, `BottomSheet` (in `Sheets/`) |
| Tables | `TableScroll`, `TableActions` (+ `TableAction`, `actionColors`), `rowPress`, `CellText` (+ `CellSubtext`, `CellImage`, `CellName`), `SortableTh`, `TableSelectionBar`, `TablePagination`, `ColumnsMenu`, `DraftNumberInput`, `useRowDrag` + `RowDragHandle` (+ `RowDragStatus`) |
| Search & filters | `SearchBar` (+ `SearchScreen`, `SearchViewOptions`, `useSearchView`, `recentSearches`), `SearchInput`, `FilterGroup` (+ `FilterChip`, `FilterChipCombo`, `FilterChipPanels`, `FilterChipDialog`, `filterFields.ts`, `filterLayout.ts`) |
| Selects | `ComboSelect`, `MultiCombobox` (+ `ComboOptions`, `ComboOptionsRows`, `ComboOptionsVirtual`, `OptionHeadline`, `MultiComboboxOptions`, `comboOptionModel.ts`) |
| Forms | `FormSection`, `FormTabs`, `FieldHelp`, `FieldLabel`, `ImageUploader` (+ `ImageCropDialog`), `DatePickerInput` · `DatePickerDialog` · `DateRangePanel` (in `DatePicker/`), `TimeField` · `TimePickerDialog` (in `TimePicker/`) |
| Lists & settings | `List` + `ListItem` (+ `useVirtualRows`, `useLongPress`, `rowPressProps`), `SegmentedList` + `SegmentedListItem` (+ `SegmentedListIcon`), `AppAccordion` + `AppAccordionItem`, `SettingsGroup` + `SettingsRow` |
| Media | `MediaGrid` (+ `MediaGridSection`, `MediaTile`, `useMediaSelection`, `mediaSections`), `MediaViewer` (+ `MediaViewerStage`, `MediaViewerInfo`, `MediaViewerButton`), `DateScrubber`, `MediaGridSkeleton` |
| Actions & navigation | `AdaptiveButton`, `SplitButton`, `ButtonGroup`, `FabMenu`, `RichTooltip`, `ScrollerTabs` |
| Helpers | `styles/iconSize`, `styles/lines` (`HAIRLINE`), `styles/pageFrame`, `styles/motion` (`EASE`, `SLIDE_UP`), `styles/shape` (`FULL_SHAPE`), `styles/iconTile`, `hooks/useScreen`, `hooks/useSwipeToClose`, `hooks/useVerticalWheelPassThrough`, `lib/ripple`, `lib/snackbar`, `lib/activeOrg`; inside the kit's folders: `severity` (+ `AlertActionButton`, in `AppAlert/`), `parseDraftNumber`, `filterLabels`, `useLongPress` (in `List/`) |
| **L2 — themed Mantine** | Button, ActionIcon, Avatar, Badge, ThemeIcon, Loader, Pagination, SegmentedControl, Text, Tabs, Chip, Tooltip, NavLink, Notification, Alert, Accordion, Paper, Divider, ScrollArea, Container, Menu, Popover, HoverCard, Modal, Drawer, Table, TableScrollContainer, InputWrapper, TextInput, InputBase, PillsInput, PasswordInput, Textarea, JsonInput, NumberInput, Checkbox, CheckboxIndicator, Radio, RadioIndicator, Switch, Slider, RangeSlider, Indicator, Combobox, Autocomplete, TagsInput, Select, MultiSelect, DatePickerInput, DateInput, DateTimePicker, MonthPickerInput, YearPickerInput, Calendar, DatePicker, MonthPicker, YearPicker |

---

## Appendix B: Reference Theme

The theme is code in every project's `frontend/src/styles/` (from the boilerplate template):

| File | Holds |
|---|---|
| `brand.ts` | `BRAND`, the one brand color |
| `m3/generate.ts` | `generateColorScheme`: the brand's shades (Mantine's generator), the fixed neutrals, the brand's tonal, the sidebar color, the M3 roles — run at build time by `vite.config.ts` (`__M3_SCHEME__`) |
| `m3/contrast.ts` | Color math (WCAG contrast, color-mix); `m3/generate.test.ts` checks the color system for the brand and seven others |
| `palette.ts` | The light and dark palettes: page, card, containers, lines, scrim, shadow ink, tonal edge, and the CSS variables they set (§1) |
| `colorVariables.ts` | Both schemes' color variables: the palette, the brand's tonal, the sidebar color |
| `theme.ts` | `createTheme` (colors, `primaryShade`, breakpoints, fonts, headings, sizes, radius, spacing with `2xs` / `3xs`, shadows, the `adaptive`, `standard`, `inverse` and `tile` variants, `CONTROL_HEIGHT`, `FIELD_HEIGHT`) and `cssVariablesResolver` (both schemes' colors, the control, field and icon scales, `--m3-hairline`, `--m3-ease-*`, `--m3-fab-size`, `--m3-headline-small`) |
| `spacing.ts`, `pageFrame.ts`, `lines.ts`, `iconSize.ts`, `motion.ts`, `shape.ts`, `tonalEdge.ts`, `iconTile.ts`, `tableScrollArea.ts` | The page's spacing tokens (§7); the frame's sizes; `HAIRLINE`; `ICON_SIZE`; the easing curves and `SLIDE_UP` (§6); `FULL_SHAPE` (§4); the tonal edge (`tonalEdge`, `tonalEdgeColor`); the icon tile's shape and edge; the table's sideways scroll area — standalone, so kit folders can import them |
| `themeComponents.ts` | Defaults and styles for buttons, icon buttons, badges, theme icons, chips, segmented control, tabs, tooltips (hover and focus), nav links, notifications, alerts, accordion, paper, tables, container |
| `themeOverlays.ts` | Menus, popovers and hover cards; modals (the dialog header, `HEADLINE_SMALL`); drawers (the side sheet's look) |
| `themeInputs.ts`, `indicatorVars.ts` | Fields, checkboxes, radios, switches, option lists, selects and date pickers (`MENU_BORDER`); the indicator color for choice controls, tabs and loaders |
| `globals.css` | What theme `styles` can't do — the body's equal-width figures, imports `sizes.css` (control and field scales), `slider.css` (sliders), `fields.css` (outlined fields, floating label), `buttons.css` (outlines, icon sizes, disabled), `selection.css` (checkbox, switch, chips, segmented ✓, tabs), `stateLayers.css` (hover, press, ripple), `nav.css` (the sidebar colors); itself: option lists, menu rows, table header and scrollbar, accordion, dialog ✕ and scrolling, snackbar |

A project gets these files, `index.html`'s font link and `lib/ripple.ts` (installed in `main.tsx`) from the boilerplate template. Never copy them into this document.

**Mantine's styles load in its CSS layer** (`@mantine/*/styles.layer.css`, never `styles.css`): every style of ours is unlayered, so it overrides Mantine's whatever order the stylesheets arrive in. A production build links the code-split chunks' CSS (the kit's CSS Modules) before the entry's, so with plain `styles.css` Mantine's rules land last and win in production only — a status badge clipped to "⚠ W" while the dev server looks right. **An `animation` shorthand always names its animation** (`animation: m3-ripple 450ms …`, never `animation: 1.4s infinite` with `animation-name` on its own line): the production minifier turns a nameless shorthand into `animation: none`, so loaders stand still in production only (`styles/animationShorthand.test.ts` checks every stylesheet).

---

## Appendix C: Design Dependencies

`@mantine/core`, `@mantine/hooks`, `@mantine/dates`, `@mantine/charts`, `@mantine/notifications`, `@mantine/form`, `@mantine/dropzone` (ImageUploader), `@mantine/colors-generator` (all 9.7.4, one exact version; the generator with `chroma-js`, at build time only) · `recharts` (+ `react-is`; through `@mantine/charts` only) · `@tanstack/react-virtual` (long lists, `useVirtualRows`) · `lucide-react` · `dayjs` · Fonts: Google Sans, Noto Sans, JetBrains Mono — files in the kit (`styles/fonts/`, from Fontsource, SIL OFL), no font server (§3).
