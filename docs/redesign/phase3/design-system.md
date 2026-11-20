# Phase 3 — Design system

**Status: built and approved 20 Nov 2026 (recommended options adopted: sentence-case buttons, AT Light section headlines).** Foundations and components only. No page has been redesigned yet: on all 8 live routes checked, the computed style of every element is unchanged, except one fix (the Book drawer focus ring, see §9).
Direction: "A, disciplined by B": *objects for moments, ledger for facts* (`phase2/creative-direction.md` §5).
Showcase: `/styleguide/` (noindex, not linked, **preview builds only**: not generated when `PUBLIC_LAUNCH=true`). Code: `src/styles/tokens.css`, `src/styles/components.css`, `src/lib/dialog.ts`, `src/lib/contrast.ts`, `scripts/check-contrast.ts`.

---

## 1. Architecture

| Tier | Where | What | Rule |
| --- | --- | --- | --- |
| 1 Brand palette | `global.css` `@theme` (`--color-*`) | 5 guideline colours + derived text-safe partners + 2 papers | Never used for a *role* in new components |
| 2 Foundation tokens | `tokens.css` `:root` | type steps, spacing, layout, controls, elevation, motion, layers | Plain custom properties, not `@theme`: no stray Tailwind utilities, no clash with Tailwind's `--text-*`, `--ease-*`, `--shadow-*` |
| 3 Semantic colour (`--fp-*`) | `tokens.css`, one block per **surface** | `--fp-fg`, `--fp-control`, `--fp-error`… | Components ask for a role; the surface answers |
| Components | `components.css` in `@layer components` | `fp-` classes | Tailwind utilities (later layer) and Astro scoped styles (unlayered) can still adjust them |

Cascade order (from Tailwind's import): `theme → base (tokens) → components (fp-*) → utilities`. `site.css` (legacy chrome) stays unlayered, as before.

**Naming.** New classes start with `fp-` (BEM-ish: `fp-btn`, `fp-btn--primary`, `fp-ticket-stub`). Legacy classes (`.btn`, `.wrap`, `.stack`, `.choice`, `.book-chip`, `.diet-chip`…) are left alone until their page is redesigned (§10). Tokens: `--step-*` sizes, `--lh-*` line heights, `--space-*`, `--grid-*`, `--dur-*`, `--curve-*`, `--z-*`, `--fp-*` colour roles.

**Why parallel classes instead of restyling `.btn`?** The approved direction changes the look of shared pieces (for example, buttons become sentence case). Restyling `.btn` now would redesign every page before this system is approved. Pages move to `fp-` classes in Phase 4, one slice at a time, and the legacy rules are deleted when their last user is gone.

---

## 2. Colour

### Palette (tier 1)
ink `#2c2925` · tiger `#f15d3d` · gold `#cba052` · sand `#dac7b5` · slate `#758591` (guidelines), plus derived partners: ink-deep `#1a1714`, tiger-deep `#93321b`, tiger-bright `#f5836a`, gold-deep `#6b4c18`, slate-deep `#465460`, **slate-bright `#a9b6bf` (new: same hue as slate, lighter, for success text on night)**, and the two papers: paper `#f6efe4`, paper-light `#faf6ef`. No white, no green, no new hues.

### Surfaces (tier 3)
| Surface | Class | Background | Use |
| --- | --- | --- | --- |
| Night | `.surface-night` (+ legacy `.ink`, `.bar`, `.foot`…) | ink | Evening sections: hero, bar, visit, footer |
| Deep | `.surface-deep` | ink-deep | Sheets, dock, index |
| Day | `:root`, `.surface-day` | sand | Page default |
| Paper | `.surface-paper`, `.fp-postcard` | paper | Documents, postcards |
| Paper light | `.surface-paper-light`, ticket and tag insides | paper-light | Tickets, tags, strips, forms |
| Gold | `.surface-gold` (+ legacy `.gold-bg`…) | gold | Rare. The action turns ink, because tiger can't sit on gold |

Roles each surface defines: `bg, fg, fg-muted, label, accent, link, link-hover, rule, rule-strong, control, field-bg, field-fg, selected-bg/fg, invert-bg/fg, action-bg/fg, hover-tint, ring, error, success, warning, info, shadow, lift-object`.

### Contrast (measured, not estimated)
`scripts/check-contrast.ts` reads the real surface blocks and checks 25 pairs per surface (150 in total): 4.5:1 for text, 3:1 for edges and focus rings. It runs in `prebuild`, so a token change that breaks contrast **fails the build**. `npm run test:contrast` prints every pair; `/styleguide/` shows the same numbers live.
Result: **150/150 pass**. Tightest: tiger-deep on sand, 4.73:1 (labels, links and errors on day). On its first run the gate caught one real failure: a darker sand row hover took tiger-deep to 4.43:1. The day hover now lightens instead.

Rules: tiger is a fill for things you can press (its text is ink-deep, 5.4:1; ink on tiger is only 4.4:1). Tiger as text is tiger-deep on light and tiger-bright on night. Status always pairs colour with a shape and words.

---

## 3. Typography

Two families only: American Typewriter (Light 300, Regular 400, Bold 700) and Lora Medium Italic. `font-synthesis: none`. Kameron (`FONT_BACKUP=1`) has no Light, so `.fp-h2` falls back to Regular there.

| Class | Token | 390 → 1440 px | Face | Line height / tracking | Use |
| --- | --- | --- | --- | --- | --- |
| `.fp-display-xl` | `--step-display-xl` | 52 → 140 | AT Bold caps | 0.92 / 0.1em | Home hero |
| `.fp-display` | `--step-display` | 44 → 92 | AT Bold caps | 0.92 / 0.1em | Branch name |
| `.fp-h2` | `--step-h2` | 38 → 86 | **AT Light, sentence case** | 0.98 / −0.03em | Section headline (≥ 48 px from 1024) |
| `.fp-h3` | `--step-h3` | 22 → 32 | AT Bold caps | 1.05 / 0.1em | Object titles |
| `.fp-h4` | `--step-h4` | 19 → 22 | AT Bold | 1.25 / 0.05em | Ledger rows, tag titles |
| `.fp-spoken` | `--step-spoken` | 20 → 30 | Lora italic | 1.3 / 0 | One spoken line per section, max 22em |
| `.fp-body` | `--step-body` | 17 → 19 | AT Regular | 1.55 / 0.05em | Copy, max `--measure` 32.7em |
| `.fp-small` | `--step-small` | 15 → 16 | AT | 1.45 | Labels, hints |
| `.fp-fine` | `--step-fine` | 14 | AT | 1.45 | Captions, legal |
| `.fp-caps` | `--step-tag` | 12 → 13 | AT Bold caps | 0.16em | **Objects only** (tickets, tags, boards) |

Sizes are `clamp(rem, rem + vw, rem)`, linear between 390 and 1440, so text follows the reader's font-size setting. Inputs are fixed at 17 px (never under 16, or iOS zooms in on focus). `.fp-num` gives tabular figures for prices and hours. `.fp-prose` styles long text pages.

---

## 4. Layout

| Token | Value |
| --- | --- |
| `--space-1…10` | 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128 |
| `--section-pad` | 64 → 128 (top and bottom of a section) |
| `--section-gap` | 36 → 56 (headline to content) |
| `--grid-max` / `--grid-margin` / `--grid-gutter` | 1320 / clamp(20, 5vw, 80) / clamp(16, 2vw, 24) |
| `--measure` / `--measure-spoken` | 32.7em / 22em |

Containers: `.fp-container` (1320 + margins); `.desk` (the grid: 4 / 8 / 12 columns). Rhythm helpers: `.fp-section`, `.fp-stack` (`--sm`, `--lg`), `.fp-cluster`, `.fp-grid-auto` (1 → 2 → 3 across by available width).

**Breakpoints** (Tailwind's own `sm` 640 and `lg` 1024 are the system's): **< 640 phone · 640–1023 tablet · ≥ 1024 desktop · 1440 where fluid type stops growing**. A component may add a breakpoint only when it is *measured from its content*, and must document it. Today: the header at 720, 920 and 1100; the 380 small-phone header.

### When the composition changes (not just shrinks)
| Pattern | Phone < 640 | Tablet 640–1023 | Desktop ≥ 1024 |
| --- | --- | --- | --- |
| Section head (`.fp-section-head`) | label above headline | label above headline | label in a rail (cols 1–2), headline 3–12, both with a top rule |
| Photo + object (`.spread-photo` / `.spread-object`) | stacked, no tilt, 32 px apart | object pulled up 64 px over the photo's foot | photo 1–7 bleeds left; object 7–12 overlaps it by one column |
| Object + list (`.desk-object` / `.desk-list`) | **list first** (facts before story) | stacked | object 1–6, list 8–12 |
| Small objects (`.fp-grid-auto`) | 1 across | 2 across | 3 across; tags tilt ±0.6° |
| Facts row (`.fp-facts`) | 1 per line; actions live in the dock | 2 across | up to 4 across |
| Form rows (`.fp-form-row`) | 1 column | 2 columns once the **form** is ≥ 30rem wide (container query) | same |
| Side dialog | bottom sheet ≤ 92dvh | drawer 460 px | drawer 460 px |
| Navigation | wordmark + Index; dock (Menus, Call, Book) | short labels; Index below 920 | full bar from 1100 |
| Hours | the same table (7 rows fit) | same | same |

---

## 5. Components

Every component: one target ≥ 44 × 44 px; a 3 px focus ring in the surface's `--fp-ring`; no colour-only state; works in calm mode.

### Buttons `.fp-btn`
- **Variants:** `--primary` (the action: tiger with ink-deep text, or ink on gold) · default = secondary (outline in `--fp-control`) · `--text` (underlined, no box). Modifiers: `--sm` (44), `--block`, `--icon` (48 square; use an SVG or ×, and an `aria-label`).
- **Look:** sentence case, AT Bold 17 px, 0.05em, 50 px tall. Tiger only for the one main action in view.
- **States:** hover lifts 2 px on a hard shadow (secondary inverts). Focus: surface ring. Active stamps down (`translateY(1px) scale(.98)`, 60 ms). Disabled: `:disabled` or `aria-disabled="true"` fades to 0.45 with a dashed edge, and an anchor stops taking clicks. Loading: `aria-busy="true"` keeps the label, adds three typing dots and blocks a second press; pair it with a `role="status"` line. Done: `data-state="done"` turns over and adds a tick ("Sent", "Copied"); text buttons keep their look and add the tick.

### Links
`.fp-link` (inline, link colour, 1 px underline → 2 px on hover) · `--quiet` (inherits text colour, for dense facts) · `--strong` (bold, 44 px tall standalone action: Call, Directions) · `.fp-nav-link` (numbered; `aria-current="page"` underlines in the label colour). A new tab is announced with hidden text "(opens in a new tab)", not an icon.

### Forms
- **Anatomy:** `.fp-field` > `.fp-label` → `.fp-hint` → control → `.fp-msg`. Groups use `.fp-fieldset` and `.fp-legend` (with `min-width: 0`, lesson 49). `.fp-form` and `.fp-form-row` handle layout.
- **Controls:** `.fp-input` (input, textarea, select inside `.fp-select`), `.fp-choice` (radio or checkbox chips; checkboxes show a box that fills), `.fp-check` (native box for long lists), `.fp-stepper` (− value +, with an `aria-live` output).
- **States:** hover thickens the edge inward (no shift) · focus ring outside · invalid (`aria-invalid="true"`, or `:user-invalid` after typing) gets an error edge, a bar outside the left edge and a message · success (`.fp-field[data-state=success]`) gets a slate edge and a tick message · disabled is dashed and faded · read-only is dotted with no fill.
- **Copy rules:** optional fields say "(optional)"; required fields don't wear asterisks. Messages say what to do ("Enter an email address like name@example.com"). The message id goes in `aria-describedby`.
- **Validation timing (found while testing):** once a field shows an error, re-check it **on input, never on blur**. Clearing a message on blur moved the form up just as the guest tapped the next control, and the tap missed.
- **Form status:** `.fp-status.fp-msg--{info|success|warning|error}` is a box with a bar, icon and words. Use `role="alert"` for errors (and move focus to the first bad field) and `role="status"` for the rest.

### Facts (the ledger)
- `.fp-ledger` (+ `--numbered`) with `.fp-ledger-row` (as an `li`, or as an `a` for a fully clickable row with hover tint), `-no`, `-name`, `-note`, `-meta`, and `.fp-price`.
- `.fp-hours`: a real `<table>` with a caption. Today's row carries `aria-current="date"` and the hidden word "today".
- `.fp-facts`: a `<dl>` row with sentence-case labels.
- `.fp-badge --open | --closed | --soon`: dot, ring or diamond, plus words.

### Objects (instead of cards; at most one type per section)
`.fp-print` (photo on paper, hard shadow; tilt only on desktop with motion allowed) · `.fp-ticket` (`-band`, `-body`, `-stub`; the notches show the surface underneath) · `.fp-tag` / `.fp-tag-in` (clipped corners, punched hole) · `.fp-postcard` (airmail edge; lifts as a link). Board (`TonightBoard`) and receipt (`Goodbye`) stay as built. Six types maximum; a new one needs approval.

### Dialogs `.fp-dialog`
- Native `<dialog>` with `showModal()`, so the focus trap, Escape and top layer are free.
- Shapes: `--side` (460 px drawer, bottom sheet on phones), `--center`, `--full`.
- `.fp-dialog-panel` **must carry a surface class**, because a dialog in the top layer still inherits from wherever it sits in the DOM.
- Behaviour (`bindDialogs()` in `src/lib/dialog.ts`): `[data-dialog-open="id"]` opens it; `[data-dialog-close]` or a backdrop click closes it; focus returns to the opener.
- Entrance: slide in 260 ms (side) or set down 16 px (centre); none in calm mode.

### Navigation and footer
The live header bar, Index sheet (numbered) and phone dock already follow these rules (slice 2.4a) and are shown on `/styleguide/` as they are. Their colours already match the night and deep tokens. When the chrome is next touched, it moves to `fp-nav-link` and the semantic tokens with no visual change. Footer pattern: night surface; brand and tagline, one block per branch (hours, phone, Book), newsletter (an `.fp-input` on night with a primary button), small nav; it ends above the dock on phones.

---

## 6. Motion

| Token | ms | Curve | Use |
| --- | --- | --- | --- |
| `--dur-press` | 60 | out | press down |
| `--dur-fast` | 200 | stamp (lift) / out (colour) | hover, focus, state |
| `--dur-panel` | 260 | panel | drawers, sheets |
| `--dur-story` | 900 | out | a reveal in a scene |
| `--dur-story-long` | 1200 | in-out | flip boards, receipt |
| `--stagger` | 60 | — | between siblings, at most 6 (≤ 360 ms) |

The same values are exported from `src/lib/motion-tokens.ts` (`DURATION`, `MS`, `STAGGER_MS`) for Motion and anime.js; change both together.

**Rules**
- Motion is physical only: stamp, slide, flip, tear.
- No fades or drifting glow.
- Animate transform and opacity only.
- One focal motion at a time.
- Entrances use an ease-out curve. Native dialogs close instantly.
- The first screen is painted finished.

**Calm mode** (`prefers-reduced-motion`): every `--dur-*` token becomes 0, the global rule stops other animations, and the end state shows. Loading dots stand still, and tilt and hover lifts are removed. The footer's "Pause motion" stops endless loops.

---

## 7. Accessibility checklist (per component and per page)
- Contrast gate passes (build).
- Targets ≥ 44 px.
- Visible surface-coloured focus ring.
- No state conveyed by colour alone.
- Labels tied to controls; messages in `aria-describedby`.
- Dialogs labelled (`aria-labelledby`) and return focus.
- New-tab links announced.
- Sentence case for anything a guest reads in a row (no tracked caps outside objects).
- Text stays inside its container at 320 px.

## 8. Implementation decisions
1. **Semantic surfaces over variants.** One `.fp-btn` works on six surfaces; the contrast gate proves every combination.
2. **Legacy dark containers get night tokens.** `.ink`, `.bar`, `.foot` and the rest get the night set, so system components drop into existing sections before those sections are rebuilt.
3. **Parallel `fp-` classes.** Pages are unchanged until Phase 4 (see §1).
4. **Measured, not assumed.** Contrast comes from the token file; the showcase displays the same numbers.
5. **Fluid type in rem** between 390 and 1440 (WCAG 1.4.4 resize).
6. **Container query for form rows**, so a form in a 460 px drawer and one on a page behave correctly at the same screen width.
7. **No new dependencies.** Plain CSS, native `<dialog>`, ~30 lines of TypeScript.
8. **Hover tints are opaque mixes** of surface colours, so their contrast can be checked.
9. **Sentence-case buttons** (was caps 0.1em), per B rule 2 and the approved branch mock. They apply when a page migrates.

## 9. Verification (20 Nov 2026)
- `astro check`: 0 errors. `npm run build`: 17 pages; prebuild contrast 150/150.
- **No page redesigned:**
  - Built before and after, then compared the computed styles (27 properties + `--fp-ring`) of every element on `/`, `/soho/`, `/covent-garden/`, `/dubai/`, `/soho/menu/`, `/private-dining/`, `/allergens/` and `/404.html` at 390 and 1440 (reduced motion, fixed clock).
  - The only differences are 37 elements per page, all inside the Book drawer, all only `--fp-ring`.
  - **Fix:** the drawer is a sand sheet but was listed with the dark surfaces, so its focus ring was gold on sand (1.6:1). It is now ink (8.8:1). This had survived earlier ring checks.
- `/styleguide/` at 390, 768, 1440 and 390 in calm mode:
  - no sideways scroll, 0 console errors, axe (WCAG 2.0 / 2.1 / 2.2 AA) 0 violations;
  - side dialog: focus inside, Escape closes, focus returns to the opener; centred dialog closes on backdrop click;
  - form: 4 errors with focus on the first, then loading, then done;
  - focus ring correct on all 6 surfaces.
- Not tested: real phones, Safari, Firefox, screen readers (as in earlier phases).

## 10. Migration map (Phase 4, per page slice)
| Legacy | System |
| --- | --- |
| `.btn.btn-orange` / `.btn-ink` | `.fp-btn.fp-btn--primary` (ink on gold is automatic) |
| `.btn-line` / `.btn-ghost-light` | `.fp-btn` (the surface sets the colour) |
| `.btn-sm` | `.fp-btn--sm` |
| `.wrap` (1240, clamp 16–40) | `.fp-container` (1320, clamp 20–80) |
| `.stack`, `.stack-sm`, `.stack-lg`, `.row` | `.fp-stack` (`--sm`, `--lg`), `.fp-cluster` |
| `.sec` | `.fp-section` |
| `.h2` (caps 34–72) | `.fp-h2` (Light sentence case 38–86) |
| `.kicker`, `.note` | `.fp-spoken` |
| `.choice` (private dining, white, tiger selected), `.book-chip`, `.diet-chip` (40 px, white) | `.fp-choice` (44 px, paper, ink selected) |
| Enquiry, waitlist, newsletter and menu-search inputs (four styles, two on `#fff`) | `.fp-input` in `.fp-field` |
| Book drawer, passport, lightbox, Index | `.fp-dialog` shapes + `bindDialogs()` (keep each one's own logic) |
| VisitStrip caps labels + green `#2f7d32` open dot | `.fp-facts` + `.fp-badge--open` (slate) |
| Branch `.tag`, `.other` | `.fp-tag`, `.fp-postcard` |
| Hard-coded `#5b544b`, `#4a443d`, `#fff` | `--fp-fg-muted`, `--fp-rule`, `--fp-field-bg` |

Delete each legacy rule once its last user has moved; `/styleguide/` is the regression page for the system.

## 11. Decisions and open items
- **Decided 20 Nov 2026 (recommended options):** buttons are sentence case; section headlines are AT Light in sentence case. Both apply page by page in Phase 4.
- **Done:** `/styleguide/` is a preview-only route (`src/pages/styleguide/[...rest].astro`); a launch build has no such page (checked: 16 pages with `PUBLIC_LAUNCH=true`, 17 without). This clears launch blocker C19.
- Open: font licence (unchanged); if it falls through, check the Light headlines in Kameron, which has no Light cut.
- Open: real phones, Safari, Firefox and screen readers (no devices here).
