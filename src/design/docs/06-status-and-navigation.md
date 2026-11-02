# LM3 — Status, messages and navigation (§22–26)

Part of the LM3 design system — start at [README.md](README.md). Section numbers (§) run across all its files, so "LM3 §14" names one section wherever it is cited.

---

## 22. Badges & Status

### StatusBadge + defineStatuses — L3 · `uiKit/StatusBadge/`

- **Use when:** any status (order, run, subscription, integration).
- **Not when:** a count or a tag → Mantine `Badge` (L2: size lg, 8px corners, no all-caps, the tonal edge on light badges).
- **Built from:** Mantine `Badge`, tonal (`light`) in both schemes with its own-color edge, and an icon sized to the badge (14px at lg).
- **API:**
  - `defineStatuses<Status>({ status: { color, icon } })`, defined once next to the feature, typed so a missing status fails the build.
  - `<StatusBadge {...MAP[status]}>{label}</StatusBadge>`, with `size?` (lg, like every badge).
- **Status colors:**

  | Status | Color | Icon |
  |---|---|---|
  | Success / completed / active | `green` | `CircleCheck` |
  | Failed / error | `red` | `CircleX` |
  | Warning / with errors | `yellow` / `orange` | `TriangleAlert` |
  | Pending / queued | `blue` | `Clock` |
  | Running / processing | `teal` / `blue` | `LoaderCircle` |
  | Inactive / canceled / draft | `gray` | `Ban` / `CircleDashed` |

- **Content:** sentence-case labels ("With errors"), shown as written — never all-caps, never cut off.
- **Do:** One status map per feature, colors by meaning (§2), an icon with every status; sentence-case labels shown in full.
- **Don't:** A status as color alone; two badges for one status, or a badge for a count (→ `Badge`).
- **In code, don't:** A hand-built badge; colors decided inline per page.
- **Demo:** `StatusBadge, defineStatuses`.

### NavBadge + NavBadgeText — L3 · `uiKit/NavBadge/`

- **Use when:** something new waits behind a navigation destination or an icon button (unread messages, new orders) — M3's badge.
- **Not when:** a status → `StatusBadge`; a count inside content → Mantine `Badge`.
- **Built from:** Mantine `Indicator` (theme: red, 999 max, 11px label) + `VisuallyHidden`.
- **API:** `NavBadge`: `badge` (`true` a 6px dot · a number a count, "999+" past 999 · 0 or none nothing), `children` (the icon). `NavBadgeText`: `badge` — put it after the destination's label for screen readers ("Orders, 3 new").
- **Look:** the M3 small badge (dot) or large badge (count), anchored on the icon's top end; navigation items take it from `navSections.ts` (`badge`).
- **Do:** A dot where space is tight (app bars), a count where it is not (the rail) (M3); the default red, anchored on the icon's top end (M3).
- **Don't:** A badge cut off, over the icon, or colliding with the next element (M3); custom badge colors (M3); a badge for something the user can't act on.
- **Demo:** `NavBadge`.

---

## 23. Notifications

### Snackbar — L2 · theme `Notification` + `globals.css` · helper `lib/snackbar.tsx`

- **Use when:** a short result of an action ("Saved", "Run restarted"), optionally with Undo.
- **Not when:** something the user must act on → `AppAlert` / `AnnouncementBar`; a failure the page must show → `AppAlert`.
- **Built from:** Mantine `Notifications` (`position="bottom-center"`, stacked). The theme makes every notification a Material snackbar: inverse surface, no border or accent bar, 4px corners (`xs`), 14px 500 text, at least 48px tall. Snackbars rise above the phones' navigation bar.
- **API:** `snackbar({ message, action?: { label, onClick }, icon?, color?, autoClose? })`. Plain `notifications.show({ message })` gets the same look. Status glyphs are 20px: success `CircleCheck` green, error `CircleAlert` red. A running task: `notifications.show({ loading: true, autoClose: false })`, then `notifications.update` with its result.
- **Rules:** one sentence, no title; at most one action — M3's text button on the inverse surface, in `--m3-inverse-primary` (the theme's Button `variant="inverse"`, which `snackbar()` uses); it runs, then closes the snackbar; 6s with an action, 4s otherwise.
- **Do:** One line (two on phones), past tense, with Undo where it can be undone (M3); in front of the content, above the navigation bar (M3).
- **Don't:** An icon beyond the success / error glyph, styled text or a link in it (M3: avoid icons and links); a filled button as its action (M3); several snackbars fired at once — they stack (M3: one at a time); a snackbar for an error the user must act on (→ `AppAlert`).
- **Demo:** `snackbar`.

---

## 24. Messages & States

### AppAlert — L3 · `uiKit/AppAlert/`

- **Use when:** an in-page message about this page or record (sync failed, unsaved changes, a form needs attention, a run's error, a failed refresh).
- **Not when:** about the whole account → `AnnouncementBar`; a short action result → snackbar; an empty list → `EmptyState`.
- **Built from:** Mantine `Alert`. The theme sets the light (tonal) variant with its own-color edge, `md` (12px) corners, compact padding, and title and text in the body face 500, both `sm` on one 20px line, the text 2px under the title (one block, not two loose lines); an 18px icon. The kit maps severity to color and icon and draws the action.
- **API:** `severity?` (`info` default blue · `success` green · `warning` yellow · `error` red), `title?`, `children`, `icon?`, `action?: { label, onClick, icon? }` (a compact text button in the severity's ink, beside the text — `AlertActionButton`), `onClose?` (adds the ✕).
- **Rules:** place it where the problem is; one action at most; the most severe first.
- **Content:** the title says what happened ("Sync failed"); the text says what to do next; the action is a verb ("Retry").
- **A11y:** `role="alert"`; the ✕ is labeled; every severity has its own icon.
- **Do:** The alert where the problem is, the most severe first; a title that says what happened, text that says what to do, one action.
- **Don't:** Several alerts saying the same thing; an alert for a passing result (→ snackbar).
- **In code, don't:** Your own button as the action; a raw Mantine `Alert` with its own colors; a hand-built colored box.
- **Demo:** `AppAlert`.

### AnnouncementBar — L3 · `uiKit/AnnouncementBar/`

- **Use when:** an account-wide message true on every page (subscription expired, grace period over, outage, maintenance).
- **Not when:** about one page → `AppAlert`; a passing result → snackbar.
- **Built from:** Mantine `Box`, `Group`, `Text`, `CloseButton` + `AlertActionButton`; rendered in the shell's announcement slot, AppLayout's header, which takes its height while the page frame gives up the same (§10).
- **API:** `severity?` (**`error` red default** · `warning` yellow · `info` blue · `success` green), `title?`, `children`, `icon?`, `action?: { label, onClick, icon? }`, `onClose?`.
- **Look:** a Google banner — a slim strip in the severity's soft tone with its ink and a hairline in its own color under it; one line on desktop: icon, bold title, message, then a text-button action and a plain ✕.
- **Rules:** one bar at a time, from the shell only — or, in a full-screen window outside the shell (an editor), right under its top bar, edge to edge, for the state of the whole thing being edited ("Linked to a template").
- **Content:** a bold title naming the state ("Subscription expired") and one sentence with the consequence or the date.
- **A11y:** `warning` / `error` → `role="alert"`; `info` / `success` → `role="status"`.
- **Do:** One bar for an account-wide state, with its consequence or date.
- **Don't:** A bar inside a page or `PageLayout`; several bars stacked; a bar for news or marketing.
- **Demo:** `AnnouncementBar`.

### EmptyState — L3 · `uiKit/EmptyState/`

- **Use when:** a list or page has nothing to show (no data yet, no filter results, a failed load) — "nothing yet" and "no results" are different states with different words.
- **API:** `icon`, `title`, `description`, `action?` (one next step: clear filters, create the first item, retry), `color?` (red for load errors).
- **Look:** an elevated card: a 48px tonal tile, a semibold title, one dimmed line, then the action 12px further down — a filled button to create the first item, an outlined one to clear filters or retry; never a text button, which reads as part of the description.
- **Content:** the title says why it is empty ("No orders match these filters"); the description gives one line of guidance.
- **Do:** Say why it is empty and the one next step; different words for "nothing yet" and "no results".
- **Don't:** An empty state with no way forward; a text button as its action.
- **Demo:** `EmptyState`.

### Loading — pattern

- **First load of a page made of sections** (dashboard, list): it keeps its layout and shows each section's skeleton:
  - `StatCard` without a value;
  - `Skeleton` in a chart card, at the chart's height;
  - `TableSkeleton` under the real table header.
- **Refresh:** the data stays, dimmed under the linear indicator on its card's top edge (`TableScroll loading`, `LoadingBar`). `LoadingBar` is that strip only — CSS, hidden from screen readers, the box saying it's busy (`aria-busy`); a job's progress, with or without a value, is `LinearProgress`.
- **A failed refresh** keeps the data and shows a warning `AppAlert` with Try again; **a failed first load** shows the page error with its own outlined Try again under the message, and no header actions (`usePageFeedback`, §11).
- **Anything else:** `PageLayout loading` (renders `PageLoader`, the wavy `CircularProgress`). Every `Loader` (in buttons, option lists) is the M3 circular indicator (`CircularLoader`, theme): the arc grows and shrinks round a track kept 4px clear of its ends, in CSS only, so it keeps turning while the page is busy. The wavy ring stays for page loading and progress (`CircularProgress`); a button keeps the flat one.
- **A job with a known amount** (an upload, an import): `LinearProgress value` — or `CircularProgress value` where a bar has no room.
- **Do:** Keep the page's layout while it loads (skeletons); keep the indicator in view until the work is done (M3).
- **Don't:** A full-page loader on a refetch; an indicator scrolled off screen, or one per button in a list (M3).
- **Demo:** `LoadingBar, Loader, Skeleton`.

### LinearProgress · CircularProgress — L3 · `uiKit/ProgressIndicator/`

- **Built from:** SVG drawn per frame (`useFrames`, straight into the paths — no re-render). Mantine's `Progress` and `RingProgress` can't draw M3's gap, stop dot or waves.
- **Anatomy (M3):** 4px lines (M3's thicker sizes are left out); the active indicator and the stop dot in the indicator tone; a 4px gap; the track in secondary container. Linear: the stop dot (4px) sits in the track's end while the track reaches it; the bar fills toward the end of the reading direction. Circular: from 12 o'clock, clockwise, no stop dot; 40px across, 48 when wavy.
- **Props:** `value` 0–100 (leave it out while the amount is unknown: indeterminate), `wavy` (M3 Expressive; the ring's default, `wavy={false}` for the flat one — the bar is flat unless asked: 3px waves, 40px long, 20 while indeterminate; flat below 10% and from 95%; the ring's are 1.6px, 12 round it), `label` (screen readers; "Loading" by default), `size` (circular).
- **Behavior:** a new value eases into place over ~250ms; the waves travel; indeterminate runs M3's two-line (linear) and grow-and-shrink (circular) loops. Reduced motion: values jump, waves hold still, an indeterminate bar shows one still line, a ring a slowly turning arc.
- **Use when:** the work has a measurable amount, or for a long indeterminate wait inside content. A plain spinner is Mantine's `Loader`; a card's refresh is its `LoadingBar`.
- **Do:** One indicator for a group of jobs, showing the overall progress (M3); switch from indeterminate to determinate once the amount is known (M3); the stop dot on a low-contrast surface (M3).
- **Don't:** A progress indicator for each item of a group (M3); a wavy indicator for short waits (it draws the eye); two indicators for the same job.
- **Demo:** `LinearProgress`; `CircularProgress`.

### LoadingIndicator — L3 · `uiKit/LoadingIndicator/`

- **Use when:** a short wait, under about five seconds, where the amount is unknown — refreshing a list, opening a panel (M3 Expressive's loading indicator).
- **Not when:** measurable or longer work → `LinearProgress` / `CircularProgress`; inside a button → the button's `loading`.
- **Built from:** a `clip-path` shape animated with the Web Animations API (`loadingShapes.ts`: seven M3 shapes — soft burst, 9-sided cookie, pentagon, pill, sunny, 4-sided cookie, oval — with the same number of points, so each morphs into the next).
- **API:** `contained?` (on a primary-container circle — over content), `size?` (48, the shape 38), `label?` ("Loading" by default).
- **Behavior:** the shape morphs and turns; with reduced motion it only turns, slowly.
- **Do:** Waits under about five seconds, kept in view until done (M3); contained over content, plain on a surface.
- **Don't:** Turning it into a determinate progress indicator — use a progress indicator from the start (M3); scrolling it off screen while the screen refreshes (M3); more than one on a screen.
- **Demo:** `LoadingIndicator`.

### PageLoader · PageError · PageMessage · RouteError · NotFound · AppErrorBoundary — L3 · `uiKit/PageStates/`, `uiKit/AppErrorBoundary/`

The router's defaults (pending `PageLoader`, error `RouteError` — inside the shell, plain words and Try again — not found `NotFound`) and the app's crash screen. Pages use `PageLayout loading` / `error` rather than rendering them directly. `PageError` takes the message as `children` and its next step as `action` — a red tile, the message and an outlined Try again, straight on the page with no card of its own (it replaces the page's content); never show raw error objects. `PageError`'s red tile is the icon tile (§4). `AppErrorBoundary` is the last resort around the whole app, for a render error outside the routes: an outlined Try again mounts the app again; the error itself only goes to the console. **The three whole-page messages — `NotFound`, `RouteError` and the crash screen — are one `PageMessage`, minimal:** the page's h1 ("Something went wrong", "Page not found"), one dimmed line of plain words (balanced, an alert when the page failed) and the one way on (Try again, Go home), centered where the page would be — no page header, icon or card. A route that failed is not a page with a title, so `RouteError` is not a PageLayout.

- **Do:** Plain words and Try again (outlined).
- **Don't:** Raw error objects or codes; a filled Try again.
- **Demo:** `usePageFeedback, PageError`. NotFound, RouteError and the crash screen are whole pages (each its own h1, through `PageMessage`), so the Components page doesn't host them — their tests cover them.

### Accordion — L2 · theme `Accordion` + `globals.css`

Mantine's raw `Accordion` keeps theme defaults (the body face 500 at 16px, the 8% hover, an open separated item in the card surface) for anything not yet on the kit. Screens use `AppAccordion` (§13).

---

## 25. Pagination

### TablePagination — L3 · `uiKit/TablePagination/`

- **Use when:** a paged table — always in `PageLayout footer`; on phones PageLayout moves the footer under the table, in the table's own card (`pageTableFooter`), and the fixed bar is left for the selection bar.
- **Built from:** `ComboSelect` (`variant="unstyled"`), Mantine `Pagination` (the theme's M3 pager), `Text`.
- **API:** `page` (1-based), `pageSize`, `total`, `onPageChange`, `pageSizes?` + `onPageSizeChange?` (rows per page), `loading?` (the pager waits), `label?` ("Orders" — read before the range).
- **Behavior:** minimal, at the end of the footer: the rows-per-page choice "25 ▾" (from xs; an outlined pill as tall as the page buttons, no label beside it — "Rows per page" is its tooltip and its name), then the pages — ‹ 1 … 4 **5** 6 … 12 › (Mantine `Pagination`, themed: each page and arrow a round button of its own on the xs control size (34px) in the 1px outline of the outlined buttons, 8px apart, no fill, the 8% hover; the current page in the secondary container without the outline, one page either side of it and one at each end, page numbers in the monospace face, 18px chevrons). Each page is named "Page N" for screen readers. The range "76–100 of 137" (numbers in the language's format) shows only on phones, where only ‹ › remain; elsewhere it is read to screen readers alone — a live region either way, so a page change is announced. Both arrows stay, disabled, on a single page, so the footer keeps its shape.
- **Why page numbers:** Google's bare ‹ › suits endless, ever-changing data; admin tables are moderate, filtered and stable — a page number says where you are and reaches a page in one press.
- **Rules:** an API without page offsets keeps "Load more" in the footer with the same range text.
- **Do:** The pager in the footer; rows per page from xs.
- **Don't (minimal):** a "Rows per page" label beside the choice, or the range beside the page numbers — the pages already say where you are.
- **Don't:** A pager placed in the card by the page itself (on phones PageLayout does it); first/last buttons (the boundary pages are already there).
- **Demo:** `TablePagination`.

## 26. Tabs

### Tabs — L2 · theme `Tabs` + `selection.css`

- **Use when:** switching whole sections of a page.
- **Not when:** 2–5 views of the same content → `SegmentedControl` — except a list page's views with counts (All / My tasks / New), which are tabs (`ScrollerTabs`, below).
- **Built from:** Mantine; M3 primary tabs — a step taller than a control of their size (44px at sm), 14px 500 labels in on-surface-variant; the active one in the link color with a 3px indicator.
- **Do:** 2 to about 6 short labels, nouns; the open tab in the address when a link should open it.
- **Don't:** Tabs for 2–5 views of the same content (→ `SegmentedControl`); tabs inside tabs; icons on some tabs and not others (M3); tabs for steps that must be read in order (M3); cut-off labels (M3).
- **Demo:** the Components page's own tabs.

### ScrollerTabs — L3 · `uiKit/ScrollerTabs/`

- **Use when:** a page's tab bar — always, instead of a bare `Tabs.List`. Also **a list page's views with counts** (All 6 · My tasks 0 · New, unassigned 4): the tab row sits **under the filters, right above the table** — the filters narrow the list, the tabs pick which part of it shows — and scrolls sideways on phones where segments would squeeze.
- **API:** `tabs: { value, label, icon?, leftSection?, count?, rightSection?, children? }[]` (`count`: a small monospace badge after the label, filled on the chosen tab and outlined on the others, read with the name — "All, 6"; never a count badge passed in `rightSection`, which runs into the name) (`leftSection` in place of the icon — a brand logo, an 18px image; no `children` when the tabs switch what one view below shows, like a gallery's sections: no panels), `aria-label?`, plus Mantine `Tabs` props (`value`, `onChange`, `keepMounted`).
- **Behavior:** the tab bar scrolls sideways when it doesn't fit (swipe, Shift + wheel, or 32px arrows fading in over its ends), and the chosen tab is always in view (M3) — also one the page picks from a link; only the bar scrolls, never the page. Each panel sits 24px under the bar. Keep the open tab in the address (`?tab=`) when a link should open it.
- **Do:** The most used tabs first.
- **Don't:** Tabs that wrap onto two lines.
- **Demo:** `ScrollerTabs`.

### FormTabs — L3 · `uiKit/FormTabs/`

- **Use when:** a long form split into tabs.
- **API:** `tabs: { value, label, icon?, fields?, children }[]` (`fields`: the form paths edited on the tab — `address` covers `address.city`), `errors?` (pass `form.errors` itself).
- **Behavior:** panels stay mounted, so values and work in progress (an upload) survive a tab switch; a tab with a failing field shows a red dot (and says so in hidden text); a submit that fails moves to the first failing tab unless the current one fails.
- **Do:** Tabs only for a long form; the failing tab marked.
- **Don't:** A tab with one field; saving per tab — one save for the form.
- **Demo:** `FormTabs`.
