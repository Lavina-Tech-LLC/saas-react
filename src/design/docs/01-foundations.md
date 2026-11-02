# LM3 — Foundations (§1–9)

Part of the LM3 design system — start at [README.md](README.md). Section numbers (§) run across all its files, so "LM3 §14" names one section wherever it is cited.

---

## 1. Design Tokens

The color tokens are made at build time from the brand color (§2): `styles/palette.ts` maps the generated scheme onto the M3 role names (`--m3-*`) and Mantine's own variables, `styles/colorVariables.ts` adds the brand's tonal and the sidebar, and `theme.ts` hands both schemes to `cssVariablesResolver`. **Neutrals are fixed, the same for every brand:** light = Google's greys (Gmail, Drive) on the `#F8FAFD` page with white cards; dark = Google's greys on YouTube's near-black page. Default scheme **dark**.

### Surfaces

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--mantine-color-body` | `#F8FAFD` | `#0F0F0F` | The page, the page header at rest, the phones' top row |
| `--m3-surface` | `#FFFFFF` | `#1E1F20` | Cards (Paper), the dark sidebar |
| `--m3-surface-container-low` | `#F8FAFD` | `#1B1B1B` | Sheets (side and bottom), the photo viewer's Info panel, an option list's search strip |
| `--m3-surface-container` | `#F0F4F9` | `#1E1F20` | The compact page header (frosted) and the footer (solid), the phones' navigation bar, the table header row in light, filled areas |
| `--m3-surface-container-high` | `#E9EEF6` | `#282A2C` | The table header row in dark; menus in dark (`--m3-menu`) |
| `--m3-dialog` | `#E9EEF6` (container-high) | `#1E1F20` (the card tone) | Dialogs and modals (§5) |
| `--m3-dialog-tile` | `#FFFFFF` | `#333537` (container-highest) | Tiles in a dialog or sheet: SegmentedList, AppAccordion, fact tiles — a clear step from the dialog in both schemes |
| `--m3-surface-container-highest` | `#DDE3EA` | `#333537` | The switch track; dialog tiles in dark (`--m3-dialog-tile`) |
| `--m3-menu` | `#FFFFFF` | `#282A2C` | Every floating panel: menus, option lists, popovers, date pickers, chip panels |
| `--m3-outline-variant` (= `--mantine-color-default-border`, `--m3-menu-border`) | `#C4C7C5` | `#444746` | The one decorative line: dividers, table rows, header strips, panel borders |
| `--m3-card-edge` | transparent | `#444746` (outline-variant) | A card's edge: none in light, where its shadow sets it apart; the hairline in dark, where a shadow doesn't show (§5) |
| `--m3-card-shadow` | the `sm` shadow | none | A card's elevation in light (§5) |
| `--m3-outline` | `#747775` | `#8E918F` | The one interactive outline: fields, outlined buttons and icon buttons, chips, segmented buttons (≥ 3:1) |
| `--mantine-color-default-hover` | 8% text-color layer | 8% text-color layer | Hover on any surface (§8) |
| `--m3-inverse-surface` / `--m3-inverse-on-surface` | `#303030` / `#F2F2F2` | `#E3E3E3` / `#303030` | Snackbars (§23), tooltips |
| `--m3-inverse-primary` | brand-3 `#76A0EE` | the filled brand `#195ED9` | The snackbar's action (§23): picked from the brand's shades to read 4.5:1 on the inverse surface, for any brand |
| `--m3-scrim` | the shadow ink at 40% | `rgba(0,0,0,.55)` | Modal / Drawer overlay |

### Text and roles

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--mantine-color-text` (`--m3-on-surface`) | `#1F1F1F` | `#E3E3E3` | Primary text |
| `--mantine-color-dimmed` (`--m3-on-surface-variant`) | `#444746` | `#C4C7C5` | Secondary text (`c="dimmed"`), placeholders, field icons |
| `--mantine-color-anchor` (`--m3-primary`) | brand-7 `#195ED9` | brand-3 `#76A0EE` | Links, the active tab, a focused field in dark |
| `--m3-indicator` | brand-7 | brand-3 | Checkboxes, radios, switches, loaders, tabs, focus rings (the filled brand is under 3:1 on dark cards) |
| `--m3-secondary-container` / `--m3-on-secondary-container` | `#E0ECFE` / `#003682` | `#263C65` / `#D3E2FD` | The brand's tonal (§2) |
| `--mantine-color-error` | red-9 | red-3 | Field errors |
| `--mantine-color-disabled` / `-disabled-color` | 12% / 38% of the text color | same | Disabled containers and outlines / content |

**Constants:** `primaryColor: 'brand'` (from `BRAND`, §2) · `primaryShade` = the brand's own shade in both schemes (7 for `#195ED9`) · `autoContrast: true` · `defaultRadius: 'md'` · `focusRing: 'auto'` · `--mantine-color-default: transparent` (fields and outlined buttons are see-through). Size scales: §9.
**Layering:** `--mantine-z-index-app` (shell, PageLayout header/footer, the FAB) · `-modal` · `-popover` · `-overlay` · `-max` (notifications) — never numbers for these. (A kit part may stack its own layers with a small local `z-index` inside its own box.)
**For stylesheets:** the theme also publishes `--m3-hairline` (§5), `--m3-ease-*` (§6), `--m3-fab-size` (§21) and `--m3-headline-small` (§20), from the TS constants script uses.

```
RULE: Colors come from tokens or light-dark() — never a hex or rgba for anything theme-dependent, never --mantine-color-dark-* for surfaces or text.
```

---

## 2. Color

**Brand:** one constant, `BRAND = '#195ED9'` in `styles/brand.ts` — the only value to change to re-brand. At build time `vite.config.ts` runs `generateColorScheme(BRAND)` (`styles/m3/generate.ts`) into `define: { __M3_SCHEME__ }`, so Mantine's color generator (`@mantine/colors-generator`) and chroma-js stay out of the app bundle; `theme.ts` and `colorVariables.ts` read it.

- **Shades:** the brand's ten shades are Mantine's `generateColors(BRAND)` — never hand-define them. `primaryShade` is the shade the brand itself landed on (7 for `#195ED9`, 9 for a deep brand) in **both** schemes, so the brand fills as itself in light and dark, with the label `autoContrast` picks.
- **Every other hue** (red, green, yellow, teal…) is Mantine's default palette with Mantine's own filled, light and text variables; `autoContrast: true` puts black text on light fills (yellow, lime, green).
- **The brand's tonal** (Mantine's `light` variant, pointed at the M3 secondary container: tonal buttons and badges, the active nav item, selected segments, chips, rows and options) uses fixed formulas: light — an opaque mix of shades 0 and 1 (`#E0ECFE`) with shade 9 deepened toward black as its ink (`#003682`); dark — shade 5 at 35% over the card (`#263C65`) with shade 1 on it (`#D3E2FD`). Hover lays an 8% layer of the ink over it.
- **Roles:** the kit reads colors by their M3 role names (`--m3-*`, `palette.ts`, §1): links, indicators and focus rings take the filled brand in light and brand-3 in dark; success and error are Mantine's green and red. The color tests check every contrast pair — text, outlines, labels on fills, indicators, the snackbar's text and action — for the project's brand and seven others from deep to light (`m3/generate.test.ts`), so a re-brand holds.

| Intent | Color |
|---|---|
| Primary action | brand (default) |
| Destructive | `red` |
| Success | `green` |
| Warning | `yellow` / `orange` |
| Info / pending | `blue` |
| In progress | `teal` |
| Neutral / inactive | `gray` |
| A row or header action | its action color (`uiKit/TableActions/actionColors.ts`, §14) |
| Secondary text | `c="dimmed"` |

**Rate thresholds** (success rates, health scores): **> 90 green · > 70 yellow · otherwise red**.

```
RULE: Color carries meaning, never decoration — no per-item colors in navigation, no colored text for emphasis.
RULE: Never color alone: a status also has an icon or text.
```

---

## 3. Typography

| Font | Applied to |
|---|---|
| **Google Sans** (`fontFamily`) | Body text, labels, inputs, alert and accordion text, the BrandLogo wordmark (700, 18px) |
| **Noto Sans** (`headings.fontFamily`) | `Title`, the PageLayout page title (800; on phones the app bar's title, 22px 700 — §11) and subtitle (600), dialog and sheet titles |
| **JetBrains Mono** (`fontFamilyMonospace`) | IDs and codes (`ff="monospace"`) |
| **Figures** | Digits inside text keep the text's face ("JFM-001 \| New leads" is one face), as equal-width figures (`tabular-nums` on the body) so numbers line up in columns. A **pure number** takes JetBrains Mono (the theme's monospace face): number fields and page numbers from the theme, stat values, the slider's value and chart legend values in their own styles — never digits inside text |

**Loading:** the faces ship with the app — `styles/fonts.css` (imported at the top of `globals.css`) declares them from the files in `styles/fonts/`: variable fonts from Fontsource (SIL Open Font License, the licenses beside them), **one file per script holding every weight** — smaller than a file per weight for the three or four weights each face uses (Google Sans 400–700, Noto Sans 600–800, JetBrains Mono 500 and 700) — and **only the scripts our languages need**: Latin and Cyrillic with their extended ranges. A browser downloads a file only when the page has a character in its `unicode-range`. **No font server** (Google Fonts): no third-party request, nothing to allow in the CSP but `font-src 'self' data:`, and it works where Google is blocked. A language in another script adds that script's files from Fontsource.
**Headings:** `Title order={1…6}` — h1 28px 800 · h2 22px 700 · h3 18px · h4 16px · h5 14px · h6 12px at 600 (theme). One h1 per page (PageLayout's title); a card's or a section's title is an h2 drawn at h4 (`<Title order={2} size="h4">`); no skipped levels. `size="h…"` takes that heading's size, line height **and weight**, so a title drawn at another level never needs `fw`.
**Text:** xs 12 · sm 14 · md 16 · lg 18 · xl 22. **Weights:** body, inputs, menus, options, tabs, table header and cells **500** — Google Sans reads thin at 400 (theme, `globals.css`).

```
RULE: Headings are <Title order={n}> (with size="h4" when the level and the look differ) — never a large <Text>, never fw on Title, never a hardcoded font family.
```

---

## 4. Shape & Radius

M3's shape scale (theme `radius`; the full shape is `FULL_SHAPE` in `styles/shape.ts`, the theme's `PILL`):

| Key | Value | Used for |
|---|---|---|
| `xs` | 4px | Text fields of every kind (M3 outlined text field — single- and multi-line, selects, pickers); tooltips; snackbars; split-button inner corners |
| `sm` | 8px | Chips and filter chips, badges, icon tiles in dialog and form-section headers, a row's picture |
| `md` | 12px | `defaultRadius`: cards (Paper), menus, option lists, popovers, alerts, accordion; the 48px icon tiles of empty states and page errors |
| `lg` | 16px | Side sheets (leading corners), the phones' nav drawer (open end), the phone FAB |
| `xl` | 28px | Dialogs and modals, the bottom sheet's top corners, calendar cells, the open FAB menu's close button and items |
| full | 999px | Buttons, icon buttons and every ✕, ThemeIcon circles, segmented buttons, the search bar, switches; nav rows on the right side only |

Checkbox corners scale with the box (2px at 20px); separated-list tiles are 4px inside the group and 20px at its ends. All set in the theme and CSS. **Screens never pass `radius`.** A kit component whose shape differs from its Mantine default sets it once, with a theme key: the search bar's `FULL_SHAPE`, the FAB's `lg`, a row picture's `sm`. **The icon tile** (dialog and form-section headers, empty states, page errors) is the theme's `<ThemeIcon variant="tile">`: the tonal colors, the tonal edge, and `sm` corners up to 32px, `md` above (`styles/iconTile.ts`).

---

## 5. Elevation & Borders

Cards are **elevated in light, outlined in dark**; floating panels get the stronger shadow; everything else is tone and lines.

| Surface | Treatment (theme) |
|---|---|
| Card (Paper) | card tone; **light: elevated** — the `sm` shadow (`--m3-card-shadow`), no line; **dark: outlined** — a 1px outline-variant edge (`--m3-card-edge`), no shadow (a shadow barely reads on the near-black page) |
| Floating panels (menus, option lists, popovers, date pickers, chip panels) | menu tone + its own outline-variant border (`MENU_BORDER`) + `shadow="md"` |
| Dialogs and modals | `--m3-dialog` (light: container-high; dark: the card tone), over the scrim; no border in light, an outline-variant hairline in dark so the edge shows against the dark page (`--dialog-edge`, none on a full-screen dialog); tiles in them (SegmentedList, AppAccordion, fact tiles) take `--m3-dialog-tile` (light: white; dark: container-highest), a clear step apart in both schemes |
| Fields, outlined buttons and icon buttons, chips, segmented buttons | 1px `--m3-outline` (`fields.css`, `buttons.css`, `selection.css`) |
| Tonal buttons, badges, alerts, icon tiles | a 1px edge in their own color (`--m3-tonal-edge`: 35% light, 18% dark) |

Two line tokens only: `--m3-outline` marks what the user interacts with (3:1 contrast); `--m3-outline-variant` separates content quietly — a border drawn in code takes `HAIRLINE` (`styles/lines.ts`) and a stylesheet `var(--m3-hairline)`, never the value spelled out. A tonal edge drawn by hand takes `tonalEdgeColor()` (`styles/tonalEdge.ts`). Lines only inside cards — space separates cards and sections; cards never nest. Shadows are soft, tinted toward the brand and stronger in dark (`--m3-shadow`, `--m3-shadow-strength`).

---

## 6. Motion

Modals and option lists: `{ transition: 'pop', duration: 200 }` (theme); menus, popovers and hover cards keep Mantine's 150ms fade. The phones' full-screen dialog slides up (250ms, M3 emphasized decelerate — `SLIDE_UP`); folding the sidebar into the rail eases over 250ms (M3 standard). **Easing** comes from `styles/motion.ts` (`EASE`, for script — a Web Animations keyframe can't read a CSS variable) and, in stylesheets, `var(--m3-ease-standard)` (most motion), `var(--m3-ease-emphasized-decelerate)` (what enters the screen) and `var(--m3-ease-legacy)` (where a motion spec names it: the circular loader's arcs, the skeleton's shimmer) — never a `cubic-bezier` spelled out, except a component's own keyframe spec (the M3 linear indicator's). Buttons, icon buttons, nav items, menu items, tabs, chips and segments: the M3 **ripple** (`lib/ripple.ts`, installed once in `main.tsx`; `.m3-state-layer` opts a custom surface in; Mantine's press nudge is off). Respect `prefers-reduced-motion`: no ripple, no fold, numbers don't roll, new table rows don't rise in.

---

## 7. Spacing

Base unit 4px; theme spacing xs 8 · sm 12 · md 16 · lg 24 · xl 32, and two steps under it for the kit's tight spots: 2xs 4 (an icon beside its label) · 3xs 2 (a split button's halves, rows stacked in one cell). Every key works in style props (`gap="2xs"`, `ml="-sm"`) and as `var(--mantine-spacing-*)`. The page's spacing tokens are in `styles/spacing.ts`; the frame's sizes (header and footer heights, the nav bar, the FAB) in `styles/pageFrame.ts`:

- `PAGE_PADDING_X` — side padding of the header, the footer and the content: 16px on phones, 24px from xs (600).
- `SECTION_GAP` (24px) between a page's sections and between form sections — space alone separates them, no lines.
- `CARD_GAP` (12px on phones, 16px from xs) between sibling cards.
- `HEADING_GAP` (8px) from a section heading to its content.

**Alignment (every surface):** one inset per surface — a dialog's, sheet's or card's title, content, list rows and actions start on the same left edge and end on the same right edge (dialogs and sheets 24px, cards `lg`, list rows and table cells 16px). **Buttons in a row sit 8px apart** (`gap="xs"`) in dialogs, sheets and footers. An **icon button at a surface's edge** is pulled out by half its padding (−10px for a 40px button, set in the component's stylesheet) so its **glyph** lines up with the text and buttons beside it (the date picker's ✎, the time picker's ⌨); a top app bar pads its row 6px so its 40px buttons put their glyphs 16px in, where the title is. A page footer (pagination, the save bar) has the same room over its buttons as under them; a dialog's or sheet's action row sits closer to its content than to the edge (M3: 8px over, 24px under in a dialog).

Full-width page content: `<Stack px={PAGE_PADDING_X} py="md" gap={SECTION_GAP}>` · cards `p={{ base: 'md', xs: 'lg' }}`, compact ones (stat cards) `p="md"`, lists and tables `p={0}` · buttons in a row `gap="xs"`.

```
RULE: Spacing comes from the theme scale (xs–xl, 2xs, 3xs), the `styles/spacing` tokens and the frame's `styles/pageFrame` sizes. Screens never write pixel padding, margin or gap. Inside the kit, an off-scale optical value (6px, a −10px pull) lives in the component's CSS module, with a comment saying why.
```

---

## 8. Interaction States

| State | Treatment |
|---|---|
| Hover | an 8% layer of the element's own content color over its fill (`--m3-hover`; `--mantine-color-default-hover` on surfaces) |
| Focus / press | a 10% layer (`--m3-press`) + the ripple |
| Clickable row | `rowPressProps` (§14): pointer and press layer; a link inside it is the keyboard path |
| Keyboard focus | Mantine's focus ring (`focusRing: 'auto'`) in `--m3-indicator` — a kit part drawing its own ring uses the same token, never the filled brand (under 3:1 on dark cards; `styles/focusRing.test.ts` checks every stylesheet); white on the sidebar and the dark photo viewer |
| Selected | the tonal secondary container (rows, options, segments, chips, nav) |
| Disabled / loading | the `disabled` / `loading` props — never faked; M3 grey for every variant and color: content at 38%, filled and tonal containers and outlines at 12% (`buttons.css`); text fields fade the M3 way (§18) |
| Active nav item | NavLink `active` — the tonal fill, flush left, rounded right; on the sidebar a 16% white fill and a 600 label (§12) |

---

## 9. Icons

`lucide-react`, always with an explicit `size` — unless a kit slot sizes it in CSS (a list row's leading or trailing icon, the select's caret, a settings row's chevron). Icon buttons are **40px by default** (the theme's `ActionIcon` default — never pass `size="input-sm"`, M3's standard icon button); a smaller one says its size. On a page's top bar (☰, ←) an icon button is `BAR_ICON` (`<ActionIcon {...BAR_ICON}>`: the standard icon button in the text color, like the title). An icon-only button has an `aria-label` and a `Tooltip` with the same words; the theme opens tooltips on hover and on keyboard focus, never on a tap. An icon button inside a field (a calendar, the password eye, a clear ✕) draws its glyph at the **field's icon size** (`--m3-icon-*`, published from `ICON_SIZE` by the theme), not at half its button. `ICON_SIZE[size]` (`styles/iconSize.ts`: xs 16 · sm 18 · md 20 · lg 22 · xl 24 — M3's 18px at the default sm) for field sections, chips, list and media icons; `INLINE_ICON_SIZE` (14) for an icon in 12–14px text (sort arrows). Buttons and icon buttons size their own glyphs whatever is passed (`buttons.css`): a button's icon follows its height (18px in the 40px button); an icon button's glyph is **half the button** (20px in the 40px header icon, 17px in the 34px row action). One exception: the field help button (`FieldHelp`) is 28px with an 18px glyph. Menu items draw their icons at 20px; navigation: sidebar 18 · rail 20 · navigation bar 24; stat cards 20. Glyphs on a filled fill are a touch bolder (stroke 2.25).

**Sizes** (`theme.ts` `CONTROL_HEIGHT` / `FIELD_HEIGHT`, `sizes.css`) — every Mantine size works:

| Scale | xs | sm (default) | md | lg | xl |
|---|---|---|---|---|---|
| Controls `--m3-control-*`: buttons, segmented controls, `size="input-*"` icon buttons | 34 | 40 | 46 | 54 | 64 |
| Fields `--m3-field-*`: text fields, selects, pickers | 38 | 44 | 50 | 58 | 68 |

A field is 4px taller than the button of its size (44px is M3's densest text field), so in a row of both they center on each other. Choice chips (Mantine `Chip`) are 8px shorter than the control (sm 32), filter chips 4px (sm 36, §17); tabs a step taller (44 at sm); list rows 56 / 72 / 88 for one to three lines (md); menu and option rows 48, 40 with a mouse (`--m3-menu-density`).
