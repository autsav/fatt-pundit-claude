# Phase 9: production engineering optimisation (21 Nov 2026)

Performance, SEO, security and code-quality pass over the built site (`npm run build`, Astro 7.4.13),
measured with Lighthouse 13.6 mobile (simulated slow 4G, 4× slower CPU, headless Edge, software WebGL)
against `astro preview`. Every number here is a **lab** number from one machine. The Core Web Vitals
targets (LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 at the 75th percentile of real visits) can only be
judged from the field: the site already sends LCP / INP / CLS to Plausible as "Vitals" events, but
that is off until `PUBLIC_PLAUSIBLE_DOMAIN` is set, so **no field data exists yet and no target is
claimed as met**.

Re-run: `npm run build && npx astro preview --port 4321`, then `node docs/qa/phase9-optimisation/lighthouse.mjs`
(env `LIGHTHOUSE`, `CHROME_PATH`, `PAGES`, `OUT`). The gate stays `npm run perf:budget`.

## Verified issues

| # | Area | Finding | Evidence |
|---|---|---|---|
| 1 | Performance | The home page fetched the voyage's 211 KB AVIF sea chart at page load, three screens before it is seen: React 19 emits a `<link rel="preload">` for every eagerly loaded `<img>` it renders on the server, and the Voyage island's chart `<img>` was eager. | Lighthouse network log: `voyage-sea…avif` requested at 34 ms, priority Low, before the first paint |
| 2 | Performance | The voyage postcard map was generated at 1295 px (170 KB) for a card at most 460 px wide. | `image-delivery-insight`: 198 KB possible savings on `/` |
| 3 | Performance | Contact-sheet thumbs (home and room pages) were one 640 px cut for every screen; on a phone the strip shows them at 174 px. The "lights on" lit still was one 1280 px cut. | `image-delivery-insight`: 314 KB possible savings on `/covent-garden/` |
| 4 | Performance (CLS risk) | Two stamp images in the voyage postcard had no `width`/`height`. | `unsized-images` failed on `/` |
| 5 | Build hygiene | `src/assets/images/dishes/unlabelled-dessert.jpg` (563 KB) is matched by the `dishes/*.jpg` glob in `src/lib/dish-photos.ts` but belongs to no dish, so the untouched original was copied into `dist/` on every build. | the only `.jpg` in `dist/_astro/` |
| 6 | Dead code | `src/components/kokonutui/attract-button.tsx` and `type-writer.tsx` were vendored but never imported. `menurow-390.png` (a QA screenshot) was committed at the repo root. | `grep` for imports; `git ls-files` |
| 7 | Code quality / CSP | `rain-glass-background.tsx` kept an Unsplash URL as the default `src`: never used, but a stray external fetch that the CSP (`img-src 'self'`) would block. | source |
| 8 | Security headers | No `Strict-Transport-Security` in `public/_headers` (Cloudflare Pages / Netlify). Vercel adds one itself; the other hosts do not. | `public/_headers`, `vercel.json` |
| 9 | SEO (expected) | Every page carries `noindex, nofollow` and `robots.txt` disallows everything: Lighthouse SEO 69 on all pages. This is the preview-mode behaviour (`PUBLIC_LAUNCH` unset), by design. | Lighthouse `is-crawlable`; `src/layouts/Base.astro`, `src/pages/robots.txt.ts` |
| 10 | Docs | `docs/HANDOVER.md` said the budget was "Lighthouse mobile ≥ 90"; `scripts/perf-budget.mjs` enforces 85. | both files |

Checked and found sound (no change): one `<h1>` per page, titles 17–74 characters, descriptions
38–160, canonical and `og:*` on every page, `lang="en-GB"`, `Organization` / `Restaurant` / `Menu`
JSON-LD with no invented facts, sitemap and robots generated from the page list, every `<img>` has
`alt`, every `target="_blank"` has `rel="noopener"`, no secrets in the repo (`.env` ignored, only
`PUBLIC_*` settings referenced), `npm audit --omit=dev` clean, no cookies or trackers (Plausible is
cookie-free; the privacy page says so), forms escape user input before `innerHTML`, the Dubai list
validates email client-side and the group form server-side via the form service, cache headers one
year immutable on `/_astro/*`, fonts self-hosted and preloaded, `astro check` strict with no errors.

## Fixes applied

| # | Fix | Files |
|---|---|---|
| 1 | Sea chart `<img>` is `loading="lazy"` in the HTML (React then emits no preload); the island's mount effect sets it eager and decodes it. The island hydrates one screen early (`client:visible` with `rootMargin: '100% 0px'`), so the chart is in before the scene is reached. | `src/components/scenes/Voyage.tsx` |
| 2 | Postcard map generated at 900 px. | `src/pages/index.astro` |
| 3 | Contact-sheet thumbs carry a `srcset` (360 / 480 / 640 w) and `sizes="(min-width: 761px) 310px, 50vw"`; the lit still carries 800 / 1024 / 1280 w with `sizes="(min-width: 1024px) 980px, 100vw"`. New optional props, old callers unchanged. | `src/components/scenes/RoomContactSheet.tsx`, `src/components/site/LightsOn.astro`, `src/pages/index.astro`, `src/pages/[branch]/index.astro` |
| 4 | Stamp images get `width`/`height` (508×564, 431×564), `h-auto`, `decoding="async"`. | `src/components/scenes/Voyage.tsx` |
| 5 | Photo moved to `src/assets/images/unsorted/` (outside the glob); README row explains. | `src/assets/images/unsorted/unlabelled-dessert.jpg`, `src/assets/images/README.md` |
| 6 | Deleted. | `src/components/kokonutui/attract-button.tsx`, `src/components/kokonutui/type-writer.tsx`, `menurow-390.png` |
| 7 | `src` is required; the Unsplash constant is gone. | `src/components/kokonutui/rain-glass-background.tsx` |
| 8 | `Strict-Transport-Security: max-age=63072000` (this host only, no preload) in both header files. | `public/_headers`, `vercel.json` |
| 10 | Budget text corrected; lab versus field explained. | `docs/HANDOVER.md` |

Not changed on purpose: the three render-blocking stylesheets (inlining was measured slower on
18 Nov, see `astro.config.mjs`); React's 208 KB runtime (the islands need it; it is one cached file);
the palette PNG stamps (`src/lib/stamp.ts` explains why they beat WebP); the arrival board's
`client:load` (it has to clatter on first paint); the CSP, which stays report-only with
`'unsafe-inline'` until the live console has been watched.

## Performance measurements

Lighthouse mobile, one run per cell unless stated. "Lab LCP" is the simulated slow-4G figure; "obs LCP"
is the LCP actually painted in the run. Transfer weight is gzip-compressed.

| Page | Perf before → after | Lab LCP before → after | Obs LCP | TBT before → after | CLS | Weight before → after |
|---|---|---|---|---|---|---|
| `/` | 85 → 88 (see note) | 3.9 s → 3.6 s | 0.20 s | 127 → 101 ms | 0 | 1014 → 940 KB |
| `/soho/` | 98 → 99 | 2.4 s → 2.1 s | 0.25 s | 0 → 1 ms | 0 | 410 → 409 KB |
| `/covent-garden/` | 95 → 96 | 2.8 s → 2.8 s | 0.29 s | 57 → 62 ms | 0 | 961 → 813 KB |
| `/soho/menu/` | 100 → 99 | 1.2 s → 2.1 s | 0.21 s | 21 → 0 ms | 0 | 196 → 196 KB |
| `/book/` | 100 → 99 | 0.9 s → 2.0 s | 0.19 s | 0 → 0 ms | 0.001 | 266 → 265 KB |

Home, five runs after the changes (same bytes, 940 KB): performance 88 / 78 / 86 / 93 / 87 (median
**87**), lab LCP 3.6 / 3.9 / 3.8 / 3.0 / 3.0 s (median **3.6 s**), TBT 101 / 338 / 98 / 47 / 260 ms
(median **101 ms**), CLS 0 in every run. The single run before the changes was 85 / 3.9 s / 127 ms.

Run-to-run noise on this machine is large: the same unchanged menu and booking pages moved by a point
and their lab LCP by a second between runs, and a third home run landed at 78 (TBT 338 ms) with the
same bytes. Treat differences under about 5 points or 0.5 s as noise. The byte counts are exact.

Other lab facts: `unsized-images` now passes on `/`; `/covent-garden/` image savings fell from 314 KB
to 273 KB (what remains is the Doors room photo and the stamps); best practices and accessibility are
100 on every page before and after; `dist/` shrank from 13.1 MB to 12.8 MB (the dead 563 KB original).

Not measured: real phones, Safari, Firefox, scroll jank (`scripts/perf-budget.mjs` was not re-run;
nothing in this phase changes what runs per frame), and any field metric.

## SEO

- Preview mode (this branch as built): SEO 69 on every page, entirely from `noindex` + `robots.txt`
  `Disallow: /`. Correct for a preview.
- Launch mode, verified: a second build with `PUBLIC_LAUNCH=true` (to a scratch folder, served
  statically) scores **SEO 100** on `/` and `/soho/menu/`; `robots.txt` becomes `Allow: /` with
  `Disallow: /og/`, `/styleguide/` and the sitemap line; no page carries `noindex`; the styleguide
  route is not built.
- No content was invented and no indexing directive was changed.
- Still open (needs the client, in `tasks/todo.md`): `geo` coordinates for the two London
  `Restaurant` entities; licensed fonts; the privacy page's data-controller details.

## Security and privacy

- Headers (both hosts): `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`,
  `X-Frame-Options` + `frame-ancestors 'self'`, one-year immutable cache on build files, and now HSTS.
- CSP is report-only. It needs `'unsafe-inline'` for scripts because Astro inlines several small
  scripts and the JSON-LD; moving to hashes is possible later. When a form service, the Google Sheet
  CSV link or Plausible are switched on, add their origins to `connect-src` (HANDOVER already says so).
- `Permissions-Policy: interest-cohort=()` is obsolete (FLoC is gone) but harmless.
- Data handling: nothing is stored server-side (static site). Group enquiries and the Dubai list POST
  to a form-to-email service only once its address is set; until then the enquiry opens the guest's
  own email app. `localStorage` holds only the menu choice, the dish passport, the motion preference
  and the "arrival seen" flag; none leaves the device.
- Consent: Plausible is cookie-free and collects no personal data; the privacy page states this and no
  banner is needed under that model. Review again if any other tracker is ever added.
- No exposed secrets, no vulnerable dependencies (`npm audit --omit=dev`: 0), `.env` ignored.

## Code quality

- Type checking strict and clean; the build gates (data validation, hours tests, contrast) pass.
- Dead code and a stray binary removed (above). `components.json` (shadcn registry pointer) and the
  `d3-*` / `world-atlas` dev dependencies are used by `scripts/build-world-map.mjs` only and stay.
- `playwright-core` and `axe-core` are present in `node_modules` but not in `package.json`
  (installed by hand for the QA scripts). Either add them as devDependencies or keep installing them
  ad hoc; they do not ship.
- Outdated: `typescript` 6 → 7 and `web-vitals` 5 → 6 are available; both are majors and were not
  bumped in this pass.
- No React error boundaries: an island that throws at hydration keeps its server-rendered HTML, which
  is the right failure mode for this site; scripts guard every `localStorage` access with try/catch.

## Remaining risks

1. **No field data.** Until `PUBLIC_PLAUSIBLE_DOMAIN` is set and the site has traffic, the Core Web
   Vitals targets are unverified. The home page's lab LCP (3.6 s simulated) is the one figure that
   suggests real slow-4G visitors may miss 2.5 s; the painted LCP on the lab machine is 0.2 s.
2. **Home page cost** is structural: React (66 KB gz) loads on the first screen for the arrival board;
   MenuBook's props (every menu, 72 KB of HTML) and 11 scripts make it a 200 KB document (31 KB gz).
   Reducing either changes the design of the page.
3. **Run-to-run noise** in these lab numbers (±5 points, ±1 s lab LCP) means the 85 budget on `/` is
   close to the line; one run after this phase scored 78 with identical bytes.
4. **CSP** is still report-only; enforcing it without watching the console first could break the
   inline scripts or the booking providers' pages opened in new tabs (those are unaffected, but any
   future embed would be).
5. **Client blockers** unchanged: font licence, real photos, geo coordinates, privacy details.
