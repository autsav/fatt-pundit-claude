# Phase 7: responsive and accessibility review (21 Nov 2026)

Desk audit of every built page in headless Edge (Chromium 131) via Playwright. Not a conformance claim:
automated checks (axe-core 4.10, WCAG 2.x A/AA + best-practice rules) were supplemented by scripted
keyboard runs and visual review of screenshots, but no screen reader, Safari, Firefox or real phone was used
(tasks/todo.md "Not yet tested").

## What was tested

Pages: `/`, `/soho/`, `/covent-garden/`, `/dubai/`, `/soho/menu/`, `/covent-garden/menu/`, `/book/`,
`/private-dining/`, `/our-story/`, `/accessibility/`, `/allergens/`, `/booking-terms/`, `/privacy/`, `/404`.

Viewports (CSS px): 320, 375, 390, 430, 600, 768, 1024, 1280, 1440, 1920; landscape phone 844×390;
200 % text zoom at 1280 (`html { font-size: 200% }`); all with `prefers-reduced-motion: reduce` so
screenshots are deterministic. Per page and viewport the script (`audit.mjs`) records: horizontal overflow,
elements past the right edge, sticky/fixed elements, targets under 24 px, headings, landmarks, images
without `alt`, smallest rendered font, console errors, and (at 390 and 1440) axe violations.
`shots.mjs` made the six-frame montages in `screens/` and tabbed through the first 45 focus stops of five
pages at 390 and 1440, checking each stop is visible, has a focus ring and is not inside hidden content;
it also opened the Book drawer from the header and the phone dock, checked focus moved in, Tab stayed in,
and Escape returned focus to the opener.

Screenshots: `screens/<page>--<viewport>.png` (six scroll positions side by side, four at 1920), plus `drawer--*`,
`menubook--*`, `plates--*`. They show the state before the fixes below; `home--844land.png` and
`menubook--844land.png` are the clearest before/after pair.

## Issues found and fixed

| # | Where | Issue | Fix |
|---|-------|-------|-----|
| 1 | Home, 320 px | Goodbye "bill" (`--p: clamp(160px, …)`) was 320 px wide inside 16 px gutters: 16 px horizontal page scroll | `--p` floor becomes `min(160px, 50vw - 24px)` (Goodbye.astro) |
| 2 | Home, landscape phone (844×390) | Menu book sized from viewport height collapsed to 75 px wide with 1–3 px type | Width floor of 320 px (260 px under `sm`); the book scrolls instead (MenuBook.tsx) |
| 3 | Menu pages, 200 % zoom | `legend` "Show only" (`white-space: nowrap`, floated) ran 15 px past the page edge | Legend may wrap, `max-width: 100%` (menu.astro) |
| 4 | Every page | Preview banner `<p>` sat outside all landmarks (axe `region`) and clipped at 320 px ("…NOT THE LIVE S") | `<aside aria-label="Preview notice">`; 11 px / 0.06 em under 360 px (SiteHeader.astro, site.css) |
| 5 | Home | Menu book section headings were `h4` under an `h2` (axe `heading-order`) | `h3` (MenuBook.tsx) |
| 6 | Every page | Footer links 23 px tall; wordmark link 23 px (WCAG 2.5.8 minimum 24 px) | Footer links `min-height: 24px`; wordmark 44 px (site.css) |
| 7 | Private dining form | Date and time fields lost their focus ring once Tab moved to the month/year segment (Chromium drops `:focus-visible` and `:focus` on the host) | Ring also on `:focus-within` for date/time inputs (components.css) |
| 8 | Covent Garden plate wall, phones | Price on the smallest plates rendered at 4–7 px | Hidden under a 40 px writing area; the caption and `aria-label` already carry name and price (PlateWall.tsx) |

After the fixes the full sweep reports no horizontal overflow, no axe violations, one `h1` per page and no
image without `alt` at any viewport.

## Checked and passing

- Skip link on every page; `header`/`nav`/`main`/`footer` landmarks; one `h1`; `lang` set.
- Keyboard: every focus stop visible with a 3 px ring; no stop inside hidden content; Book drawer is a
  native modal `<dialog>` (focus in on open, Escape closes, focus returns to the opener) from both the
  desktop header and the phone dock; the room gallery, index and menu sheets use the same `showModal` path.
- Sticky header plus phone dock never cover content at 320–430 px; the dock is dropped on landscape phones.
- Text zoom 200 % reflows without loss (checked at 1280 → equivalent to 640 px) and 320 px covers the
  WCAG 1.4.10 reflow width.
- Remaining sub-24 px targets are inline links inside sentences (exempt under 2.5.8) and the 1 px hidden
  inputs behind `.fp-choice` chips, whose 44 px labels are the targets.
- Reduced motion: the build already honours `prefers-reduced-motion` (bill, plates, book, voyage) and the
  footer has a Pause motion toggle.

## Known issues not fixed here

- Home menu book on phones: page copy is 9–11 px at 320–390 px because the book scales with its container.
  The "read them as a list" links above it lead to the full-size menus. Logged in tasks/todo.md.
- axe cannot judge text over photographs and gradients (hero, bar, voyage postcards); those contrasts were
  checked by eye only. Token pairs are gated by `scripts/check-contrast.ts`.
- `/dubai/menu/` is not a route (Dubai opens later) and correctly serves the 404 page; nothing links to it.
- `cg-lights-on.mp4` logs `net::ERR_ABORTED` under reduced motion: the browser cancels the download of a
  video that will not autoplay. Harmless.
- Not covered: VoiceOver/NVDA, Safari, Firefox, real devices, touch gestures on the page-flip book.

## Re-running

```
npm run build && npx astro preview --port 4321
cd docs/qa/phase7-responsive && npm i --no-save playwright-core@1.49 axe-core@4.10   # once; not in package.json
MSYS_NO_PATHCONV=1 node audit.mjs            # all pages; or: node audit.mjs / /soho/menu/   SHOTS=0 skips PNGs
node shots.mjs                               # montages + keyboard probe
```
Both read `BASE` (default `http://localhost:4321`), `OUT` (default `screens/`, gitignored) and `CHROME_PATH`
with the same Edge/Chrome fallback as `scripts/smoke-booking.mjs`.
