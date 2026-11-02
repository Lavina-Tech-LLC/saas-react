# LM3 — Forms and pickers (§18–19)

Part of the LM3 design system — start at [README.md](README.md). Section numbers (§) run across all its files, so "LM3 §14" names one section wherever it is cited.

---

## 18. Forms & Date Pickers

### Text fields — L2 · theme `TextInput`, `Textarea`, `PasswordInput`, `NumberInput`, `JsonInput` + `fields.css`

- **Use when:** any text or number entry.
- **Built from:** Mantine fields. The theme (`themeInputs.ts`) sets M3's 4px corners (`xs`), 500-weight text, `hideControls` on NumberInput, and a blank placeholder that enables the floating label. `fields.css` adds the `--m3-outline` border, the 2px focus / error outline, the floating label with its outline notch, the hover outline and the disabled state.
- **Shape and size:** the M3 outlined text field on the **field scale** (§9): **44px at the default `sm`** (`FIELD_HEIGHT` in `theme.ts`, M3's densest field), 4px taller than the button of its size; height, font size and padding follow the field's Mantine `size` (any size works). Fields are see-through — an outline on whatever surface holds them. The floated label sits on the top outline, lined up with the text; supporting text and errors sit 8px under the field, on its left edge (not indented to the text).
- **Behavior (M3 outlined text field):**
  - **Label:** rests inside the empty field; on focus, with a value, or while a dropdown is open it moves up into the top outline, which breaks around it (the M3 notch, a band of the surface it sits on — `--fl-bg`, set by cards, dialogs, sheets and menus). Color: dimmed → the primary on focus (the filled brand in light, the link color in dark) → red on error.
  - **Outline:** `--m3-outline` at rest, the text color on hover, 2px primary on focus, red on error.
  - **Multiline (`Textarea`, `JsonInput`):** padded like a one-line field of its size — top and bottom `(field height − one line) / 2` (`fields.css`), so the first line sits where a one-line field's text does, clear of the floated label and level with the resting one. Never Mantine's own smaller multiline padding (it put the text right under the label).
  - **Error:** outline, label and message turn red; the typed text and placeholder keep their normal colors.
  - **Disabled:** same see-through fill; text, label and asterisk at 38%, outline at 12% (never Mantine's grey fill).
  - Description and error go **under** the field; while an error shows it **replaces** the description (M3), so nothing under the field shifts (`fields.css`).
- **API:** `label` (always), `description?`, `error?`, `size?`, `required?`, `leftSection?`.
- **Content:** the label is a noun ("Email", "Company name"); description for format or limits; an error says what to fix ("Enter a valid email").
- **A11y:** the label is the accessible name; errors are announced through Mantine's `aria-describedby`.
- **Do:** A short noun as the label, fully visible on one line (M3); the error replaces the supporting text while it shows (M3); on wide screens, fields sized to their content — not stretched across the page (M3); required fields marked, the optional ones left plain.
- **Don't:** A label cut off, or on two lines (M3); a placeholder that repeats the label or carries the only instructions; outlined and filled fields in one form (the kit has only outlined) (M3).
- **One-time codes:** Mantine `PinInput` — the theme gives its boxes the fields' 4px corners (`xs`).
- **In code, don't:** `radius`, `variant`, `styles` or a background; a label-less field without `aria-label`.
- **Demo:** `TextInput, PasswordInput`.

### FieldHelp + FieldLabel — L3 · `uiKit/FieldHelp/`, `uiKit/FieldLabel/`

- **Use when:** a field needs a short explanation the label can't hold.
- **API:** `FieldHelp`: `help` (the tooltip), `label?` (the field it explains — "Help: Slug"), `icon?` (ⓘ by default). `FieldLabel`: `label`, `help`.
- **Look:** a 28px standard icon button with an 18px glyph in the text color; the tooltip opens on hover, focus and touch.
- **Rules:** text fields put `FieldHelp` in `rightSection` (with `rightSectionPointerEvents="all"`) — the floating label ignores the pointer; a Switch, Checkbox or Radio takes `label={<FieldLabel label="…" help="…" />}`, which keeps the control's name to the label alone.
- **Do:** One or two sentences that say what the field is for or what it accepts.
- **Don't:** Critical information in a tooltip — it is easy to miss; say it in the description (M3); a help button on every field.
- **Demo:** `FieldLabel`; FieldHelp in `FormSection, FieldHelp`.

### FormSection — L3 · `uiKit/FormSection/`

- **Use when:** one part of a long form, as its own card.
- **API:** `title`, `description?`, `icon?` (a 30px tonal tile), `leading?` (other content in that tile instead of an icon — a step's number, a brand logo), `actions?` (right of the title; under it in a narrow card), `disabled?` (locks every field inside — a disabled fieldset — while the header's actions stay usable), `children`.
- **Look:** a header strip (tile, h2 at h4, helper line; the tile centered on a title alone, at the top beside a title and helper line) over a hairline, then the fields 16px apart, room enough for their floating labels.
- **Rules:** sections `SECTION_GAP` apart; a long form splits them into `FormTabs` (§26).
- **Do:** One topic per section, named for it; the most used sections first.
- **Don't:** One field per section, or a section that scrolls on its own.
- **Demo:** `FormSection, FieldHelp`.

### ImageUploader — L3 · `uiKit/ImageUploader/`

- **Use when:** a record's image in a form — a cover, a logo, a photo.
- **API:** `label?` (the field's name; "Choose an image" by default), `spec?` (`{ ratio: '16:9', size: '1600 × 900' }` — shown on the label line and the crop's first shape), `initialUrl?` (a new one starts the field over), `upload?(file, signal)` → `{ id, url, reused? }` (the app's service layer; without it the image is a local preview), `onUploadSuccess?(id, url)`, `onClear?`, `crop?` + `cropStartsOriginal?` (logos keep their own shape), `onBrowse?` (the app's gallery picker), `maxFileSizeKB?`, `acceptedTypes?`, `disabled?`, `hideLabel?`, `reused?`, `badge?`, `extraActions?`, `description?` (supporting text under the field) and `error?` (the form's message, which replaces the description and marks the field invalid, as on a text field — never a hand-made red line under it).
- **Look:** no card of its own (it sits in a `FormSection`): the label, the size it should be under it; then the frame. Empty, the frame is a dashed drop area with everything in its middle — a tonal icon, "Drag an image here", the formats and limit (by default "PNG, JPEG, SVG, WEBP · up to 200 KB"; `acceptedTypes`, `maxFileSizeKB`), and its two buttons, Upload (tonal) and Choose from gallery (outlined). One container, 200px tall, the same empty or filled. With an image, the picture shown whole (`contain`) on `surface-container-high`, its actions floating in its bottom-right corner — Replace and Choose from gallery as outlined buttons on a surface fill with a light shadow (icons only in a frame under 440px), Remove as an outlined icon button in the error color. The upload status, a reused note and errors sit under it.
- **Behavior:** click or drop a file; a wrong type, an empty file or one over the limit says why and leaves the image as it was. With `crop` a dialog (`AppModal`, full screen on phones) offers the spec's shape, a square or the whole image, with drag, the arrow keys and zoom, and the size it will be saved at (WebP, at most 1600px). While it uploads the frame dims with a loader; Remove cancels the upload. A failed upload keeps the previous image.
- **Do:** Give every field its `spec`, so people know the size before they choose a file.
- **Don't:** Wrap it in another outlined card; a preview of its own next to the field; anything laid over the picture besides a gallery's own `badge` and `extraActions`.
- **Demo:** `ImageUploader`.

### SaveBar + useSaveBar — L3 · `uiKit/SaveBar/`

- **Use when:** a form page whose edits wait for one Save. One save model per screen: a save bar, or every change applied at once — never both.
- **API:** `const { submit, bar } = useSaveBar(form, onSave)` (a `@mantine/form` form; `onSave` rejects when the save fails) → `<form noValidate onSubmit={submit}>` and `<PageLayout withContainer footer={<SaveBar {...bar} />}>`. `SaveBar` also takes `unsavedLabel?` ("Unsaved changes: 3"), `blocked?` (why it can't be saved yet) and `saveLabel?` (the button names what saving does when it does more — "Send" for a message that goes out on save). When the bar saves only one card of a page whose other settings save on their own (each from its sheet), it sits in a row right under that card instead of the footer (`<Group justify="space-between" wrap="nowrap"><SaveBar {...bar} /></Group>`), so it is clear what it saves.
- **Behavior:** the state on the left ("No changes", "Unsaved changes", "Saving…", why the save failed — a live region), then Discard (text) and Save (filled, the page's only filled button), both off until something changed. Ctrl/⌘+S saves from anywhere; Save validates first (FormTabs then opens the first failing tab); leaving for another page with unsaved changes asks first (`UnsavedChangesDialog`), a reload gets the browser's prompt.
- **Do:** One save model per screen: a save bar, or every change applied at once; say why Save is off when it is (`blocked`).
- **Don't:** A Save button in the page as well as in the bar; saving on every keystroke on a page that has a save bar.
- **Demo:** `SaveBar, useSaveBar`.

### SearchBar + SearchInput — L3 · `uiKit/SearchBar/`, `uiKit/SearchInput/`

- **Use when:** search on a list page, in `PageLayout search` (the header sets its width; below sm it waits behind the header's search button, §11).
- **SearchInput API:** `value` (controlled, so a reset from outside empties it), `onChange` (every keystroke), `onSearch` (300ms after typing stops; an emptied box searches at once), `debounce?`, `placeholder?` (the box's text, "Search" by default), `size?` (sm). Nothing sits at its end but the ✕ once there is text.
- **SearchBar API:** SearchInput's `value`, `onChange`, `onSearch`, `debounce`, `placeholder`, `size`, `disabled` and `aria-label` + `recentKey` (this page's recent searches in localStorage, one key per page) + `suggestions?: { label, value }[]` (narrowed by the caller).
- **Look:** the M3 search bar — a see-through pill (it stays a pill, unlike the 4px text fields) in the `--m3-outline` line, a search icon, a ✕ while there is text.
- **Behavior (SearchBar):** on focus or typing the search view opens: recent searches (a clock each, then Clear) and the suggestions. Enter or a picked row searches at once and keeps the text as a recent search; typing still searches after a pause. The view hangs under the bar (at least 360px wide) from xs; on phones it opens full screen with a back arrow. Arrows and Enter pick; Esc closes and the focus goes back to the field.
- **Rules:** search is not a filter chip.
- **Do:** A hint in the box that says what it searches ("Search orders") when it isn't obvious; recent searches per page.
- **Don't:** Search as a filter chip, or a search button beside the bar; more than one search on a page.
- **Demo:** `SearchBar`.

### Checkbox · Radio · Switch — L2 · theme + `selection.css`

Theme: labels 500; drawn in `--m3-indicator` unless given a `color`. Checkbox: corners that scale with the box (2px at 20px), a 70% check; unchecked a 2px on-surface-variant outline, see-through. Checkbox and Radio: M3's 40px round state layer on hover, keyboard focus and press (on-surface, or the indicator color once checked), the label 16px from the control so the layer clears it. Switch: the M3 switch, 40×24 at sm — off an outlined track with a small handle, on the indicator track with a larger handle, no icon in it. Radio: the M3 radio (the `outline` variant by default) — a 2px ring with a dot half its size, both in the indicator color, no fill. A one-line label centers on the control, so a `FieldLabel` with its help button lines up; with a description the control stays by the first line. Use as Mantine documents. **Demo:** Checkbox; Radio button; Switch.

- **Do:** Checkboxes for picking several from a list; a parent checkbox to pick them all (M3); radios for one of up to five, one of them chosen from the start, listed one under another (M3); a switch that takes effect at once, its label saying what is on (M3).
- **Don't:** Switches for a list of options, or for two opposite choices (→ a connected `ButtonGroup`) (M3); a switch in place of a button, or one that waits for Save (→ a checkbox) (M3); radios side by side, nested, or more than five (→ a select) (M3).

### Slider · RangeSlider — L2 · theme + `slider.css`

- **Use when:** picking a value or a range on a scale where the exact number matters less than its place (volume, a discount, a price range).
- **Not when:** an exact number → `NumberInput`; a price filter on a list → the `FilterGroup` range field.
- **Built from:** Mantine; the M3 Expressive slider — a 16px track (size `xs`, the default; sm 24 · md 40 · lg 56 · xl 96) in the secondary container, the active part in the indicator tone, a 4px bar handle with a gap around it, stops (`marks`) as 4px dots inside the track, the value in an inverse-surface pill over the handle while it is pressed or dragged (not on hover; theme `showLabelOnHover: false`). The `FilterGroup` range panel has none: its header shows the range as it moves.
- **API:** Mantine's — `value` / `onChange`, `min`, `max`, `step`, `marks`, `label` (the value's text), `thumbLabel` (always: the handle's name for screen readers), `startPointValue` (fills from a midpoint), `disabled`.
- **Do:** A label for the value when the exact number matters; stops when only some values are allowed; a midpoint (`startPointValue`) for a value that can go both ways.
- **Don't:** A slider for an exact number (→ `NumberInput`); a vertical range slider (M3); an inset icon on a centered or range slider (M3).
- **Demo:** `Slider, RangeSlider`.

### DatePickerInput · DatePickerDialog · DateRangePanel — L3 · `uiKit/DatePicker/`

- **Use when:** a date or a date range in a form or a page (a due date, a date of birth, a booking's dates).
- **Not when:** a date filter on a list → the `FilterGroup` date field (§17).
- **Built from:** Mantine `DatePickerInput`, `DatePicker`, `Month`, `Modal`, `ScrollArea` + `dayjs`.
- **API:** `DatePickerInput`: Mantine's `DatePickerInput` props, unchanged (`type?: 'default' | 'range'`, `value` / `defaultValue`, `onChange`, `clearable`, `minDate`, `maxDate`…). `DatePickerDialog`: `opened`, `onClose`, `value`, `onChange` (a whole answer only), `type?` (`'range'`), `label?` (the line over the headline), `minDate?`, `maxDate?`. `DateRangePanel` (inline, no field): `value`, `onChange` (both ends — a preset or the second day), `presets?` (the kit's `datePresets(t)` by default, `false` for none), `months?` (2 on desktop, or 1), `maxDate?`, `headline?(range)`. The calendar look is exported for other pickers: `M3_CALENDAR_CLASS` (+ `M3_COMPACT_CLASS` in a drop-down), `M3_DAY_CLASS_NAMES`, `M3_HEADER_CLASS_NAMES`, `m3WeekdayFormat`.
- **Behavior:** `DatePickerInput` is Mantine's field with its calendar under it on tablets and desktop; **on phones the field opens Google's full-screen date picker** (`DatePickerDialog`). That picker follows Google's spec exactly — **its sizes and spacing are not ours to change**: a 56dp top bar (✕, a tonal Save), "Select date(s)" (label large) from the left edge in line with the ✕ (✎ at the right edge) over the day (headline large, 32sp) or the range (title large, 22sp; "Start date – End date" while empty) with ✎ to type it, a line, then the calendar. A day: one month with ‹ › and "August 2025 ▾" for the years. A range: the weekday letters fixed on top and the months scrolling under them, each under its name (title small) — two years back to one ahead, opening at the range's month. The full-screen picker has Google's sizes: 48dp columns and rows, 40dp circles, 16sp digits and weekday letters (`--day-*` in `PickerCalendar.module.css`; `PICKER_WIDTH` 360). **The drop-downs on tablets and desktop — the field's calendar and `DateRangePanel` — are the same M3 calendar at the compact size** (`M3_COMPACT_CLASS`): 40px columns, 36px rows, 32px circles, 14px digits, "August 2025 ▾" first and the arrows at the end in the field's; never Mantine's own calendar (square cells, red weekends). Today ringed, the chosen day filled, a range a tonal band between its ends; while only the first end is picked, just its circle. No quick ranges and no Clear in the picker (Google has neither); nothing changes until Save, which waits for a whole answer. **`DateRangePanel`** is the calendar inline with quick ranges, for the filter chip from xs: the picked range as the headline (M3 title medium), the presets as pills beside the calendar (a row of chips that wraps within the calendar's width on phones), two months only on desktop (one on tablets).
- **Do:** `DatePickerInput` for every date field; `clearable` on an optional one; a range as one field with both ends.
- **Don't:** Chips, presets or a Clear button in Google's picker; resizing or re-spacing it; Google's full-screen sizes in a drop-down (a two-month panel grows to 860px); two fields for a range; our own typed date field.
- **Demo:** `DatePickerInput`; `DateRangePanel`.

### TimeField · TimePickerDialog — L3 · `uiKit/TimePicker/`

- **Use when:** a time of day in a form (opening hours, a reminder, a schedule's start).
- **Built from:** Mantine `TextInput`, `ActionIcon`, `useMove` + `BasicDialog`.
- **API:** `TimeField`: TextInput props + `value` (`HH:mm`, 24-hour, or null), `onChange`, `format?` (`'24h'` default · `'12h'`). `TimePickerDialog`: `opened`, `onClose`, `value`, `onChange`, `format?`, `title?`.
- **Behavior:** the M3 time picker in a dialog. Pressing the field opens it on the hours: the hour and minute selectors (96 × 80) over a 256px clock dial; dragging or pressing the dial picks, and lifting from an hour moves on to the minutes. A 24-hour dial has an inner ring for 13–23 and 00; a 12-hour one has the AM / PM selector. ⌨ switches to typing both. Cancel and OK — nothing changes until OK. The dial is one slider for the keyboard (arrows step by one; Page Up / Down by five on the minutes, by one on the hours).
- **Do:** The format the user expects (12h with AM / PM in English, 24h otherwise); typing (⌨) for a time far from the current one.
- **Don't:** A squeezed dial on a small screen — switch to typing (M3); a time picker for a duration.
- **Demo:** `TimeField`.

### Date pickers — L2 · theme `DatePickerInput`, `DateInput`, `DateTimePicker`, `MonthPickerInput`, `YearPickerInput`, `Calendar`, `DatePicker`

- **Use when:** the theme's look for Mantine's pickers — the kit's `DatePickerInput` (above) on tablets and desktop, the auth SDK's screens.
- **Built from:** Mantine dates. The theme gives the same M3 outlined field and floating label; the calendar dropdown takes the menu look (§5), round day cells, the menu hover and 500 weights.
- **Rules:** a date range is one `DatePickerInput type="range"`. In filters use the `FilterGroup` date field, not a picker.
- **Do:** The kit's `DatePickerInput` in screens (it adds Google's full-screen picker on phones).
- **Don't:** Two pickers for a range.
- **In code, don't:** Colors on day styles (they break the selected / in-range states).
- **Demo:** `DatePickerInput`.

---

## 19. Select & Combobox

Every option list is an **M3 menu**: the menu panel (§5) with no side padding, rows edge to edge and square, 8px above and below, 48px at sm (40 with a mouse), 12px in from the sides, an 8% hover and a 10% press; a search strip across the top past 8 options; six and a half rows tall (the half row says there is more). The kit's rows are `ListItem` rows (`ComboOptionsRows.tsx`); `globals.css` (`[data-combobox-option]`) gives Mantine's own lists the same. Lists open with the 200ms pop (theme). **Long lists are windowed:** past 60 rows (`COMBO_VIRTUAL_FROM`) only the rows in view are drawn (`useVirtualRows`) — so a menu of hundreds (a dashboard's automations) opens at once and stays the default. **Option rows are one line:** a long name is cut with "…" and shows whole in a tooltip while the pointer is on it or the keyboard highlights its row (only when it is cut off; `OptionHeadline`). **The search strip takes the focus on desktop only:** on phones and tablets it waits for a tap, so the keyboard doesn't come up over the list the moment it opens (`useSearchAutofocus` in `hooks/useScreen.ts` — the same for a list dialog's search).

### ComboSelect — L3 · `uiKit/ComboSelect/`

- **Use when:** pick one option in a form or page — any list size, down to the rows-per-page picker (`variant="unstyled"`).
- **Not when:** several options → `MultiCombobox`; a filter → `FilterGroup`.
- **Built from:** Mantine `Combobox` + `InputBase` (so `label`, `description`, `error`, `size` work like any field) + the shared list `ComboOptions`.
- **API:** `data: { value, label, description?, icon?, avatar?, color?, group? }[]`, `value` / `defaultValue`, `onChange(value | null)` (Mantine `Select`'s signature), `placeholder?`, `searchPlaceholder?`, `nothingFoundMessage?`, `searchable?` (on past 8 options), `clearable?`, `readOnly?`, `onSearchChange?` (server-side search, 250ms debounced; turns search on), `loading?`, `creatable?` (the typed text can be the value), `comboboxProps?` (`width`, `position`), `size?` (sm), plus field props.
- **Behavior:** the picked option takes the selected tone with a trailing ✓; options with a `group` sit under its subheader; the caret turns up while the list is open; picking closes the list; `clearable` shows an × in place of the caret while a value is picked; after a pick, Esc or the ×, focus is back on the field.
- **Do:** A select past about 5 options, radios below that; search past 8 options; the picked option in view when the list opens.
- **Don't:** A select for two options (→ a switch or a segmented button); options that change the page instantly from inside a form.
- **Demo:** `ComboSelect`.

### MultiCombobox — L3 · `uiKit/MultiCombobox/`

- **Use when:** pick several options.
- **Built from:** Mantine `Combobox` + `InputBase` + `MultiComboboxOptions` (the same rows with a leading checkbox — Gmail's people picker; the same list as multi filter chips).
- **API:** `data`, `value: string[]`, `onChange(string[])`, `placeholder?`, `searchPlaceholder?`, `searchable?` (on past 8 options), `clearable?` (off — unpick in the list), `readOnly?`, `size?` (sm), plus field props.
- **Behavior:** the field shows the picked names comma-separated (with their icons); with `clearable` an × replaces the caret while anything is picked; the list stays open while picking.
- **Do:** Checkboxes in the list, the picked names in the field.
- **Don't:** A multi-select for one choice.
- **Demo:** `MultiCombobox`.

### Select · MultiSelect · Autocomplete · TagsInput — L2 · theme

The theme gives Mantine's own option lists the same menu rows and panel: the search strip in the container-low tone with a hairline under it, `checkIconPosition="right"`, the clear section in place of the chevron; MultiSelect values are M3 input chips. They are styled for code that renders them (the auth SDK's screens); the kit's own screens use `ComboSelect` / `MultiCombobox`.

- **Do:** The kit's selects in screens.
- **Don't:** Mantine's own selects in a screen.

### Building a custom combobox — recipe

When a picker needs a custom target or a footer action (e.g. a location switcher with "Connect location"):
- **Copy ComboSelect's setup:** `<Combobox size=…>` (the theme already sets `dropdownPadding={0}` — don't pass it), `Combobox.Target targetType="button"`, and `combobox.updateSelectedOptionIndex()` on every search change.
- **Render the kit list:** `ComboOptions` (or `MultiComboboxOptions`) inside `Combobox.Dropdown`; a footer goes in `Combobox.Footer p="sm"`.
- **Why:** with any dropdown padding the search strip stops short of the dropdown's edge.
