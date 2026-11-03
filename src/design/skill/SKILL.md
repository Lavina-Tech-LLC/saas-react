---
name: lm3-design
description: LM3, Lavina Tech's Material 3 design system on Mantine 9.7, and its UI kit. Use ONLY in an LM3 project (LStudio's src/kits/lm3/, or a project whose repo guide says LM3) for any UI work — JSX, pages, layouts, forms, tables, dialogs, buttons, filters, loading, empty or error states, the theme or the kit — and when reviewing UI or choosing a component. Never for a project on another design system.
---


# LM3 design system

LM3 is Material 3 built on Mantine 9.7. The theme restyles Mantine's own components (`src/styles/`), and the kit adds what Mantine lacks (`src/components/uiKit/`, one folder per component). The shell lives in `src/components/shared/layout/`. The boilerplate template is the reference implementation.

## Before anything: is this an LM3 project?

This skill is for **LM3 only**. In LStudio (the Saas support boilerplate) the active kit is `DESIGN` (`lm3` unless set
otherwise) and LM3's files are under `src/kits/lm3/`; in a project, its repo guide names its design system. If the
work is for another design system, **stop using this skill** — use that kit's own skill.

## Where the rules are

This skill only points at the rules; it does not replace them. LM3's design docs sit next to this skill: `../docs/`
(resolve this folder with `realpath` first if it is a link — in LStudio `src/kits/lm3/docs/`, in a project
`src/design/docs/`).

- `../docs/README.md`: read it first. It holds §0 (principles, the three layers, the "I need… → use" table) and the
  map of which file holds which section.
- `../docs/01-*.md` to `07-*.md`: the parts. Read only the section the task needs. `../docs/decisions.md`: what changed
  and why — read it before changing a rule.
- The Mantine 9.7 docs are in the Convensions repo (a sibling of the project): `frontend/react/reference/mantine/`.
  Read a component's file before writing its code, then list the files read under a closing **Mantine docs used**
  section, by their path inside `reference/` (`mantine/core/inputs/textarea.md`). The code rules are Convensions'
  `frontend/react/` (the `react-conventions` skill).

"LM3 §25" in code and docs names a section; the README's map says which file holds it.

A project's own repo guide (its **Project-Specific Constraints**) can extend or override these rules — for example SalesBridge's app text stays plain English and its forms use react-hook-form. Where they differ, the project's guide wins.

## The rules people break most

1. **The kit before custom code.** If `uiKit/` has it, use it: `PageLayout`, `StatusBadge`, `ConfirmDialog`, `TablePagination`, `EmptyState`, `StatCard`, `FilterGroup`, `SaveBar`, `TableActions`, `AppModal`, `BasicDialog`, `AppAlert`… If something reusable is missing, add it to the kit; never build it once inside a page.
2. **The theme decides the look.** Never pass radius, variant defaults, fonts, shadows, colors or transitions the theme already sets. No hex or rgba for theme colors: use the tokens. No inline pixel spacing: use spacing props and tokens. No `100vh`: use `100dvh`.
3. **One page = `PageLayout`.** Pass search to `search`, filters to `filters` (one `FilterGroup`, one date field for a period), the main action to `fab`, other actions to `overflowActions`, and the pager to `footer`. The page header never turns into a selection bar. A list's views with counts (All / My tasks / New) are `ScrollerTabs` with `count`, under the filters and right above the table.
4. **Tables:** the table's card is flat, with the rows' hairline edge in light and dark. A row press opens the row, with no actions column just to open it. At most two buttons per row, plus the ⋯ menu (`TableActions`). Selection goes in `TableSelectionBar`. On phones it's the same table scrolling sideways, never a list, and never a table with its own vertical scroll.
5. **Dialogs by what they hold:** a decision or one or two fields goes in `BasicDialog` or `ConfirmDialog`; three or more fields in `AppModal`; `BottomSheet` takes no fields at all. A confirmation asks one specific question ("Delete this template?"), and its button repeats the verb ("Delete", "Delete template"), never OK or Yes.
6. **One filled action per area.** The others are tonal or outlined. Low-priority news goes in a snackbar, not a dialog.
7. **States:** section skeletons or dimmed rows on a refetch, never a full-page loader. An empty state says why it's empty and gives one next step. Whole-page messages (not found, a route that failed, the crash screen) use `PageMessage`. Never show a raw error.
8. **Fields:** M3 outlined text fields with a label, never a placeholder carrying the only instructions. The error replaces the supporting text. Dates use `DatePickerInput`.
9. **Accessible in both themes:** every icon button gets an aria-label and a Tooltip, every status gets an icon or a word as well as its color, and everything is checked in light and dark.
10. **Writing:** sentence case and plain language. Never library or component names in the UI. All text goes through i18n.

LM3 §29 (the antipattern index) has the full list.

## Changing the kit or the theme (LM3 §31)

- Build or fix it in **LStudio first** (`src/kits/lm3/`), with a test and a Components-page section. Then copy it to the projects. A fix made in a project goes back to the boilerplate.
- Update the LM3 section it changes **in the same change**, and update this skill if a rule above changes.
- A design decision (a new or changed rule, a component replaced) also gets a dated entry in `../docs/decisions.md`: what it replaced and why. Read that log before changing a rule, so a settled decision isn't undone.
- After copying the kit into a project, run `yarn kit:diff <the project's frontend folder>` in the boilerplate's `frontend/`. Fix what drifted; accept a file the project changes on purpose in its `kit-diff.json`, with why.

## Before UI work is done

- [ ] Every piece comes from the kit or a themed Mantine component, and no prop the theme already sets is passed.
- [ ] Checked in light and dark, on desktop and phone width: spacing, alignment, nothing cut off.
- [ ] Tests pass, lint and type-check are clean, and new kit parts have a test.
- [ ] The LM3 doc (and this skill) still match the code.
