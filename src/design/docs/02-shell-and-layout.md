# LM3 — App shell and page layout (§10–12)

Part of the LM3 design system — start at [README.md](README.md). Section numbers (§) run across all its files, so "LM3 §14" names one section wherever it is cited.

---

## 10. App Shell

### AppLayout — L3 · `shared/layout/AppLayout.tsx`

- **Use:** once, as the signed-in layout route. Every signed-in page renders inside it.
- **Built from:** Mantine `AppShell`, laid out by M3 window size class (`useScreen`, §27).
- **Behavior:**
  - **Navbar:** phones (below xs 600) have none — the M3 modal navigation drawer (`NavDrawer`) opens from the ☰ in the top row; tablets (xs–md, 600–1199) get `NavRail` (80px); desktop (from md 1200) gets `AppSidebar` (240px), which its ☰ folds into the rail and back (remembered in this browser, `nav-collapsed`). Drawer and rail are drawn in the sidebar color, with no border (§12).
  - **Header:** none of its own — on phones each page's `MobileAppBar` (§11) holds the ☰ that opens the drawer. AppLayout's `AppShell.Header` is only the **announcement slot**: a project renders its `AnnouncementBar` (§24) in the box inside it. The header takes the box's measured height (none while it is empty) and the page frame below gives up the same, so the bar runs across the whole window above the sidebar and every page and the window keeps one scroller. It is `role="none"` — each page's own header is the banner.
  - **Footer:** phones only — the M3 navigation bar (`NavigationBar`, 64px + the safe-area inset) in the surface container tone, rendered only when the app has 3–5 `bar` pages (§12).
  - **Main:** `100dvh` (on phones less the navigation bar); the page's own scroll area (PageLayout) is the one vertical scroller.
- **Rules:** any flex child that must scroll needs `minHeight: 0` on its flex parent. `100dvh`, never `100vh`.
- **Do:** One vertical scroller per screen — the page's; an account-wide message as one `AnnouncementBar` above everything.
- **Don't:** A banner or alert repeated inside every page; a second navigation (tabs or a menu) standing in for the sidebar.
- **In code, don't:** A second vertical scroller inside a page; `100vh`.

---

## 11. PageLayout

### PageLayout — L3 · `uiKit/PageLayout/`

- **Use when:** always — every page is a `PageLayout`.
- **API:**
  - `title` · `subtitle?` · `onBack?` · `info?` (About this page — the ⓘ; hidden by default — `SHOW_PAGE_INFO = false` in `pageMetrics.ts`; keep passing it, so the switch brings every page's About back).
  - `search?` — the page's `SearchBar` / `SearchInput` (§18).
  - `overflowActions?: PageHeaderAction[]` — the page's header actions: `label`, `icon`, `onClick` or `renderRoot` (a link), `disabled?`, `loading?`, `placement?` (`'icon'` default, `'menu'` for the rarely used), `color?` (ACTION_COLOR, §14), `showLabel?`, `tooltip?` (what the hover says instead of the label — Refresh's "Updated 2 minutes ago" alone; the label stays the name).
  - `refresh?: { onRefresh, refreshing, updatedAt?, label? }` — a page whose data loads again: **Google's Refresh**, first among the header's icons — the ↻ arrow itself turns while it loads (never a spinner in its place), its tooltip says only "Updated 2 minutes ago" from `updatedAt` (not "Refresh") (the query's `dataUpdatedAt`), a press while it runs does nothing — and, **on phones, pull to refresh**: pulled down from the page's top the M3 circular indicator comes down with the finger (filling as it goes), let go past the threshold it turns until the refresh settles; the browser's own pull is off the page meanwhile. Pages pass `refresh` instead of a Refresh in `overflowActions`.
  - `fab?` — the page's one main action: `label`, `icon`, `onClick` or `renderRoot`, `disabled?`.
  - `actions?` — header controls the page builds itself, first in the header.
  - `filters?` — the page's `FilterGroup` (§17).
  - `footer?` (`TablePagination`, `SaveBar`) · `loading?` · `error?` · `errorAction?` (the error's next step, e.g. `usePageFeedback`'s `retryAction`) · `withContainer?` · `containerSize?` (`xl` 1280px default, or `fluid` for the full width).
- **Behavior:**
  - **Header:** a frosted overlay above the scroll area (not sticky inside it — that jitters). It compacts as the page scrolls: 72 → 60px, the title 28px (24 on tablets) → 18px, always one line; the subtitle is gone by halfway. Page tone at rest; once compact the surface container tone with a hairline under it.
  - **Header buttons**, in order: search (from sm 840: 200px, 250px on desktop; below sm a search button), `actions`, the action icons, the main action, the ⋮, the ⓘ. **Every header button is filled:** the main action (`fab`) is the only one with a label; the other actions are filled icon buttons with a tooltip, in the brand or their action's `color` (one colored action per header at most; `showLabel` keeps a status action's label — "12 failed" — from xs up). **Only the ⋮ overflow is tonal**; `placement: 'menu'` actions always go in it, with icon and label. The title keeps its room: icons that don't fit fold into the ⋮ one by one, from the last (`useHeaderFit`). A page passes its buttons bare — the header styles them.
  - **Phones:** the M3 small top app bar (`MobileAppBar`, below) — one row: ☰ or back, the title, the actions (no subtitle); at most two header icons, the ⋮ counted; the main action becomes an M3 extended FAB (56px, 16px corners) at the bottom right above the footer, folding to its icon once the page scrolls.
  - **Search below sm (phones and small tablets), as on iOS:** a search button leads the header's actions (counted among the phone's icons); it swaps the whole bar for the search field, focused in the tap so the keyboard comes up, and a round outlined ✕ after it as tall as the field (`PageHeaderSearch`) — never a ←, which reads as leaving the page. ✕ or Esc closes it and empties the field, the focus back on the button; a search that holds text (one from the link) stays open. The field stays mounted while hidden and reports its text to the header (`usePageSearchReport` in `SearchInput`).
  - **Filters:** above the content — chips wrap on desktop; below md one row that scrolls sideways within the page's side margin (like `ScrollerTabs`), so the chips, the fades and the arrows stay inside the content's edges.
  - **Footer:** a static **solid** bar in the surface container tone with a hairline on top, 55px, level with the sidebar's profile row; on phones two buttons share the width. Never frosted: see-through, the rows' colors glowed through it and it lost its edge against the page.
  - **Width:** every page lays its content out in `PageLayout`'s own `Container` (`withContainer`), which also holds the search and filter rows, so all three share one width and side padding — a page never pads itself. `containerSize="fluid"` for tables, lists and dashboards (settings sections that are a table too), `"lg"` (1180px) for settings and form pages, the default `xl` (1280px) for detail and content pages. The sizes are the theme's (`Container` in `themeComponents.ts`).
  - **Loading / error:** `loading` → `PageLoader`, `error` → `PageError`, in place of the scroll area, with `errorAction` under its message. While `error` is set the header drops `actions`, `overflowActions` and the FAB (they act on data the page doesn't have), so the error's Try again is the only one. `usePageFeedback(...queries)` returns `error`, `retryAction` (an outlined Try again button, for `errorAction`) and `alert` (a failed refresh: a warning `AppAlert` with Try again over the content it keeps).
- **Rules:** search goes in `search`, filters in `filters`, pagination and the save bar in `footer`; header actions only through `overflowActions` and `fab`.
- **Footer on phones:** the `footer` (pagination, Load more) goes under the page's table, in the table's own card (`TableScroll` takes it — `pageTableFooter`), not in a bar fixed over the screen — the card keeps all four of its corners (only a sideways scrollbar that is the card's bottom edge squares them); the fixed bar then shows only a table's selection bar, while rows are selected, and the content makes room for it. A page without a table (a form's save bar) keeps the fixed footer. Tablets and desktop keep the fixed footer.
- **Do:** One title per page, said once, in the header; one main action (`fab`) — the only labelled header button; rarely used actions in the ⋮ (`placement: 'menu'`); pagination and the save bar in the footer.
- **Don't:** A second title or heading that repeats the page's inside the content; more than one labelled or colored button in the header; search inside the filter row, or pagination the page places inside the content (on phones PageLayout itself moves the footer under the table).
- **In code, don't:** A hand-made `<Box maw>` for width; a variant or a second label on header buttons.
- **Demo:** the Components page's own header.

### MobileAppBar — L3 · `uiKit/PageLayout/`

- **Use:** never directly — `PageLayout` renders it as the page header on phones (below xs 600); the Components page shows it on its own.
- **Built from:** Mantine `Box`, `Group`, `ActionIcon`, `Title`; ☰ opens the shell's drawer through `PageNavContext` (`pageNav.ts`).
- **Look:** the M3 small top app bar — one 64px row (`MOBILE_HEADER`): ☰, or ← with `onBack`, then the title (the page's h1 drawn at h2 — `<Title order={1} size="h2">`, 22px 700, one line cut with "…"), then the page's header actions at the end. Its ☰ / ← are `BAR_ICON` icon buttons with tooltips. Page tone at the top of the page; the container tone with a hairline under it once the page has scrolled.
- **API (inside PageLayout):** `title`, `onBack?`, `progress` (1 once scrolled: the container tone), `children` (the actions), `titleOrder?` / `component?` (for an example on a showcase page only).
- **A11y:** the title in the row is the page's h1.
- **Do:** A short page title, so it fits beside the actions; keep the actions to two icons (the ⋮ counted).
- **Don't:** The medium or large bar with the title under the row — phones use the small bar; more than one filled or tonal button in the bar (M3); a bar shorter than its height, or with curved corners (M3); a logo or a subtitle in the bar.
- **Demo:** `MobileAppBar`.

---

## 12. Sidebar Navigation

### AppSidebar · NavRail · NavigationBar · navSections — L3 · `shared/layout/`

- **Use:** add a destination to `NAV_SECTIONS` in `navSections.ts`. The sidebar, the rail, the phone drawer and the navigation bar all read it (through `useNavSections`, which drops what `visible(access)` hides) — never edit them per item.
- **Built from:** Mantine `NavLink` (L2: theme 40px rows rounded on the right, 500 labels), `ScrollArea`, `Menu` (rail parents), the SDK's `UserButton` (profile row).
- **Colors** (`nav.css` `.nav-brand` on the drawer and the rail; `--m3-nav-bg` from `colorVariables.ts`):
  - **Light:** the filled brand at 70% over black (`#195ED9` → `#124298`), a step under the filled color so the page's main action still leads — unless the brand has a sidebar tone of its own: `SIDEBAR` in `styles/brand.ts` (yourlab: `#265B3C` with `#1a7f37`), which needs white labels at 4.5:1 and must be deeper than the brand (the theme tests check both).
  - **Dark:** the card tone (`--m3-surface`), exactly like a Paper — no brand tint, no border.
  - Content is white in both: labels at 86%, the active one full white and 600 on a 16% white fill, hover 8% white, dividers 14% white, the focus ring white. `.nav-brand` redefines the tokens inside, so menus and dialogs it opens (portalled) keep the normal look. There is one sidebar look — no neutral option.
- **Behavior:**
  - **Drawer (sidebar):** M3 navigation drawer. Items sit flush on the left edge and are pill-rounded on the right, 2px apart; the list has right padding only. Section labels are M3 title small — 14px, 500, sentence case, dimmed — on a 36px line. Nav labels are never under 500.
  - **Top and bottom rows:** the logo row (60px, level with the compact page header) holds the ☰ (desktop) and `BrandLogo` with its bold (700) wordmark; the profile row (55px, level with the page footer) holds the user button edge to edge — its menu holds theme, language, organizations and sign-out.
  - **Rail (tablets, and the folded desktop sidebar):** 80px; the logo mark on top (on desktop the ☰ that unfolds the sidebar); a 56×32 pill indicator around a 20px icon with an 11px label under it (500, the active one 700); sections split by a short divider; a parent opens its children in a menu to the right; the avatar in a 56px bottom row.
  - **Navigation bar (phones):** only for an app's 3–5 main pages — mark them `bar: true`. `navBarItems` takes them in drawer order, at most `NAV_BAR_MAX` (5); with fewer than `NAV_BAR_MIN` (3) there is no bar and phones use the ☰ drawer only. The M3 Expressive flexible bar: 64px, each item centered — a 56×32 pill indicator around a 24px icon (with its `NavBadge`), a 12px label under it (500, the active one 700); a parent opens its first child and stays lit on all of them. The drawer still lists everything.
  - **Phone drawer:** the M3 modal drawer from the left, `min(360px, 100vw − 56px)` wide, 16px corners on its open end, the whole sidebar in it; the scrim, Esc, picking a page or **a swipe back to the left** closes it (`useSwipeToClose` with `direction: 'left'`: past about a third of its width or a flick; vertical drags still scroll it; a drag never presses the link it ends on). There is no edge swipe to open it — that is the phone's own back gesture.
  - **Sub-pages:** a parent with children is lit while one of its pages is open, and stays open; its pages hang off a 2px line under the parent's icon, labels aligned with the parent's label, no pill per page. The current one has **no fill**: only its own segment of the line in the label color and a 600 label (`AppSidebar.module.css`).
- **Rules:** active = `activeNavPath` — the longest nav path the page is on or under, so a list stays lit on its detail pages (links match exactly, `NAV_LINK_MATCH`, so a sibling never lights up).
- **Do:** Sentence-case labels that name the destination ("Orders", not "Manage orders"); group destinations under short section labels; an icon on every destination or on none (M3); the navigation bar only for 3–5 main pages, on phones (M3).
- **Don't:** Per-item colors, or a sidebar color set anywhere but `SIDEBAR` in `styles/brand.ts`; more than 5 `bar` items, or a navigation bar with fewer than 3; wrapped, shrunk or cut labels (M3); the active indicator on more than one destination (M3); a navigation bar on desktop (M3); a navigation bar and a toolbar of navigation controls on the same screen (M3).
- **In code, don't:** Negative margins to reach the edge; a second nav config.
- **Demo:** `NavigationBar`; the sidebar and the rail are the showcase's own shell.
