# LM3 — Design decisions log

What changed in the design system, when, what it replaced and why — newest first. The rules themselves live in the
LM3 sections named here; this log keeps a settled decision from being argued again, or quietly undone. **Every design
decision gets a line here in the same commit that changes LM3** (§31).

Each entry: **the decision** — what it replaced — why. (§ where the rule lives.)

## 2026-11-02

- **No brand presets in the kit; BRAND is one color the project sets** — replaced the same day's `BRAND_PRESETS` (tested
  blues, reds, greens) and the Components page's brand color control — the owner tried them and removed them. (§2)
- **Light neutrals are Google's own too (Gmail, Drive): the `#F8FAFD` page, white cards, cool containers `#F0F4F9` /
  `#E9EEF6` / `#DDE3EA`, lines `#C4C7C5`, secondary text `#444746`** — replaced the soft warm set of 2026-10-26 — the owner
  wanted light to follow M3 as closely as dark does (Google Photos, YouTube); on trial. (§1)
- **A brand may name its own light sidebar tone (`SIDEBAR` in `styles/brand.ts`); without one the sidebar is the
  filled brand at 70% over black** — replaced "one formula for every brand" (2026-10-26) — the formula turned yourlab's
  production sidebar `#265B3C` into `#135927`; the owner keeps the brand's own tone. The theme tests hold any named tone to
  white labels at 4.5:1 and deeper than the brand. (§12)
- **The fonts ship with the app: variable files for Latin and Cyrillic only, in `styles/fonts/`** — replaced the Google
  Fonts link in `index.html` — the owner's call: no request to a third party, a stricter CSP, it works where Google is
  blocked; one variable file per script is smaller than a file per weight for the 3–4 weights each face uses, and a
  browser fetches only the scripts a page uses (about 440 KB for all twelve files). (§3)
- **A card that holds a table is flat, with the rows' hairline edge (`--m3-outline-variant`), in light and dark** —
  replaced light's elevated white card around tables — its edge read as a white rim around the header row. Tables only;
  other cards stay elevated in light. (§14)
- **A list page's views with counts (All / My tasks / New) are `ScrollerTabs` with `count`, under the filters, right
  above the table** — replaced a `SegmentedControl` leading the filter row — the filters narrow the list and the tabs pick
  which part shows; tabs scroll on phones where segments squeeze; the counts rendered badly inside segments. A
  `SegmentedControl` stays for small mode switches without counts. (§17, §26)
- **The phone navigation drawer closes with a swipe back to the left; no edge swipe opens it** — before, only the scrim,
  Esc or a page picked closed it — M3's modal drawer, as in Gmail; the screen edge is the phone's own back gesture. (§12)
- **A swipe on a sheet never closes it when the gesture is interrupted, and a drag never presses the button it ends on**
  — the boilerplate's swipe had lost these (yourlab's original had them). (§20, `useSwipeToClose`)
- **The page footer is solid, the surface container tone with a hairline on top** — replaced the frosted, see-through
  footer — colored rows glowed through it and it lost its edge against the page. (§11)
- **Multiline fields (`Textarea`) are padded like a one-line field of their size** — replaced Mantine's smaller
  multiline padding — the first line sat right under the floated label. (§18)
- **No two files whose names differ only in case** (`FilterGroup.tsx` beside `filterGroup.ts`) — the kit's helpers were
  renamed — a macOS or Windows disk sees one file, so the app broke on a Mac while Linux built fine.
  (Convensions `frontend/react/naming.md`, the kit's `fileNames.test.ts`)

## 2026-11-01

- **The table pager is minimal: the rows-per-page choice "25 ▾" as an outlined pill (its label is a tooltip), then
  round outlined page buttons on the xs control size (34px); the "76–100 of 137" range only on phones** — replaced the
  2026-10-29 pager (40px unoutlined page buttons with the "Rows per page" label and the range beside them), which itself
  replaced the 2026-10-26 Google-style pager without page numbers — the owner found the labels crowded, wanted the round
  page buttons kept, and 40px too big. (§25)
- **Not found, a failed route and the crash screen are one minimal `PageMessage`**: centered h1, one dimmed line, one
  button — replaced a route error drawn as a whole page with its title up in the header. (§24)
- **A date field names the period it starts on (`defaultPreset`)** — on the 1st "This month" is the same range as
  "Today" and read as Today. (§17)

## 2026-10-27

- **Two kinds of list:** `SegmentedList` tiles for settings, short groups managed one by one and choices; standard
  `List` rows for long or open-ended lists of one kind — replaced "every list as tiles" — M3 Expressive has both, each for
  its job. (§13, LM3 4.2)
- **Settings are a separated list everywhere:** a `SettingsGroup` heading over `SegmentedList` tiles, no card. (§13)
- **Every page header button is filled:** the main action (the FAB) is the only one with a label; the other actions
  are filled icon buttons with a tooltip, only the ⋮ is tonal — replaced 2026-10-26's "the FAB is the only filled header
  button" — LM3 caught up with the kit's header as built. (§11, §21)
- **Dialog and sheet actions: the dismissive one outlined, the confirming one filled** (Android 16 / M3 Expressive) —
  replaced M3 text buttons. (§20)

## 2026-10-26

- **Light neutrals are soft and warm, dark neutrals are Google's own** — light: the page `#F7F7F4` (warm paper), white
  cards, warm containers (`#F1F1EE`, `#EDEDE9`, `#E6E6E1`), light warm lines (`#E4E3DF`), secondary text `#5F5E5A`; dark:
  Gmail's and Drive's neutrals (cards `#1E1F20`, the page `#0F0F0F` as YouTube) — replaced Google's cool light neutrals
  (Gmail's blue-greys) — the owner found the cool light theme "aggressive". Both pass the same contrast tests. (§1, §2)
- **The color system comes from the brand through Mantine's color generator** (`BRAND` → every light and dark role at
  build time); every other hue is Mantine's palette — replaced a hand-made MD3 scheme. (§2)
- **The sidebar is brand-colored in light only; in dark it is the card tone**, with no brand tint. (§12)
- **The desktop sidebar folds into the rail (☰, remembered); phones get M3's modal drawer and a bottom bar for 3–5 main
  pages.** (§10, §12)
- **A table row's press is its main action**; up to three secondary actions inline, four or more as two plus ⋯, phones ⋯
  only. (§14)
- **The system rules from the yourlab/M3 audit:** one vertical scroller per page, tables scroll sideways only; one main
  action per page (the FAB); interactive outlines 1px `--m3-outline`, decorative lines
  `--m3-outline-variant`; spacing tokens; 40px controls and 44px text fields; one h1 per page. (§0, §5, §7, §11, §21)
