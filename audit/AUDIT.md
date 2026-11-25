# Fatt Pundit: Phase 1 audit (24 Nov 2026)

Branch `redesign/premium-audit` from `main` @ 10a5a2c. Audited locally (`astro preview`, current `dist/`) and on the live preview (https://fatt-pundit-claude.vercel.app). Both serve the same build: every hashed `_astro` asset on `/` matches. This phase changed no `src/` code.

How it was measured. Scripts are in `audit/scripts/`, raw data is in `audit/data/`.
- `sweep.mjs`: 16 routes (15 built pages plus a 404) × 375/768/1280/1920 × motion on and reduced. It captures full-page screens, console/network logs, and axe at 375 and 1280, including inside the three dialogs. The live site was swept at 375 and 1280.
- `lighthouse.mjs`: mobile (median of 3) and desktop, local and live. Saved JSON has the base64 screenshots removed.
- `links.mjs`: a static crawl of every href/src/srcset and `#fragment` in `dist/`, plus runtime checks of the named anchors and `?at=`.
- `probes.mjs`: one probe per suspect from the brief. Evidence is in `audit/data/probes.json` and `audit/screens/probes/`.
- `refs.mjs`: the reference sites. `mocks.mjs`: the two direction mocks.

Committed slim set (your choice): screens at 375 and 1280 with motion on, plus probe screens, mocks and slim Lighthouse JSON. The other widths and reduced-motion screens are kept locally (gitignored).

Known capture limit: full-page screenshots draw the pinned scroll scenes (doors, voyage) as blank ink bands. The design review used per-screen viewport frames instead, which are kept locally in `audit/frames/`.

<!-- LH-BEFORE-AFTER -->
## Before / after (Lighthouse, mobile median of 3 local; P / A11y / BP / SEO)
| Route | Mobile local (before) | Desktop local (before) | Mobile live (before) | After (mobile local) |
|---|---|---|---|---|
| `/` | 89 / 100 / 100 / 69 | 98 / 100 / 100 / 69 | 96 / 100 / 100 / 69 | 89 / 100 / 100 / 69 (Phase 2) |
| `/book/` | 100 / 100 / 100 / 69 | 100 / 100 / 100 / 69 | 100 / 100 / 100 / 69 | 100 / 100 / 100 / 69 (Phase 2) |
| `/soho/` | 96 / 100 / 100 / 69 | 100 / 100 / 100 / 69 | 99 / 100 / 100 / 69 | 97 / 100 / 100 / 69 (Phase 2) |
| `/soho/menu/` | 100 / 100 / 100 / 69 | 100 / 100 / 100 / 69 | 100 / 100 / 100 / 69 | 100 / 100 / 100 / 69 (Phase 2) |
| `/covent-garden/` | 94 / 100 / 100 / 69 | 99 / 100 / 100 / 69 | 99 / 100 / 100 / 69 | 94 / 100 / 100 / 69 (Phase 2) |
| `/covent-garden/menu/` | 100 / 100 / 100 / 69 | 100 / 100 / 100 / 69 | 100 / 100 / 100 / 69 | 98 / 100 / 100 / 69 (Phase 2) |
| `/dubai/` | 100 / 100 / 100 / 69 | 100 / 100 / 100 / 69 | 98 / 100 / 100 / 69 | 100 / 100 / 100 / 69 (Phase 2) |
| `/private-dining/` | 98 / 100 / 100 / 69 | 100 / 100 / 100 / 69 | 99 / 100 / 77 / 69 | 98 / 100 / 100 / 69 (Phase 2) |
| `/our-story/` | 92 / 100 / 100 / 69 | 99 / 100 / 100 / 69 | 99 / 100 / 100 / 69 | 93 / 100 / 100 / 69 (Phase 2) |
| `/our-story/fatt/` | 98 / 100 / 100 / 69 | 100 / 100 / 100 / 69 | 99 / 100 / 100 / 69 | 97 / 100 / 100 / 66 (Phase 2) |
| `/allergens/` | 100 / 100 / 100 / 69 | 100 / 100 / 100 / 69 | 100 / 100 / 100 / 69 | 100 / 100 / 100 / 69 (Phase 2) |
| `/accessibility/` | 100 / 100 / 100 / 69 | 100 / 100 / 100 / 69 | 100 / 100 / 100 / 69 | 100 / 100 / 100 / 69 (Phase 2) |
| `/privacy/` | 100 / 100 / 100 / 69 | 100 / 100 / 100 / 69 | 100 / 100 / 100 / 69 | 100 / 100 / 100 / 69 (Phase 2) |
| `/booking-terms/` | 100 / 100 / 100 / 69 | 100 / 100 / 100 / 69 | 100 / 100 / 100 / 69 | 100 / 100 / 100 / 69 (Phase 2) |
| `/this-page-does-not-exist/` | n/a (Lighthouse won't audit a 404 response) | n/a (Lighthouse won't audit a 404 response) | n/a (Lighthouse won't audit a 404 response) | n/a (Lighthouse won't audit a 404 response) (Phase 2) |

Budgets (brief §4, mobile): P ≥ 90, A11y 100, BP ≥ 95, SEO ≥ 95, LCP < 2.5 s, CLS < 0.05. SEO 69 everywhere is the intended preview `noindex`; the launch-build pass is under SEO.

Below budget (before): home mobile local P89 (runs 78/89/90; live 96) with lab LCP 3.6 s; LCP > 2.5 s also on `/soho/` (2.6), `/covent-garden/` (2.9), `/our-story/` (3.2) locally (all < 2.1 s live); live `/private-dining/` Best Practices 77 (B-16); live `/dubai/` CLS 0.1 in one run (re-measure in Phase 2). Everything else meets budget.
<!-- /LH-BEFORE-AFTER -->

## Phase 2: fix status (24 Nov 2026)
Branch `redesign/premium-audit`. One commit per ID, plus follow-ups that cite the same ID. Each proof is a named test or file. `npm test` runs Vitest (22) and the hours checks; `npm run test:e2e` runs Playwright (120, phone and desktop).

| ID | Status | Commit(s) | Proof |
|---|---|---|---|
| B-01 | ✅ | 035a3b1, 7516873 | Overlay invisible until the module adds `.arrival-ready`; CSS hides it at 1.2 s; `<noscript>` hides it. `intro.spec.ts`: JS off and blocked scripts at 375/1280; `audit/screens/after/b01-*` |
| B-04 | ✅ | 8728228, facafb7, d6bfd9b | Intro ≤ 1.2 s, Skip focused, no 4.5 s cap. `intro.spec.ts`: gone ≤ 1.3 s, Skip focused, next Tab after the intro = "Skip to content". Probe (page clock): 1.08–1.12 s motion, 0.2–0.3 s reduced |
| B-02 | ✅ | f0ad81f, e2651e7, 062c21a | Per-room nearest time on the desk; `booking.slotGrid` ('opening' default, 'clock' = :00/:30) makes the Covent Garden answer one data line. `tests/unit/booking.test.ts` table (both rooms × opening edge × 19:00 × last slot + clock grid); `booking.spec.ts`: Covent Garden has a time at 7pm every Tue–Sun |
| B-03 | ✅ | 32b9acb, 9d259d5, 5977f14 | `dialogs.spec.ts` (reduced motion asserted): page behind still, no width change on open. Probe: 5/5 reduced-motion dialog cases still (the menus chooser has no phone trigger on `/soho/`) |
| B-05 | ✅ | 1df565f | Story scenes gated on an inline-set `js` class. `story.spec.ts`: with JS off, no rendered heading or paragraph at opacity 0; with JS on, the scenes play |
| B-06 | ✅ (form waits on client) | b068c44, 92b8a66 | Every Dubai list button: "Follow @fattpundit for the date" ("Follow for the date" where tight) + "(opens Instagram)", straight to Instagram in a new tab. The form stays behind `PUBLIC_DUBAI_LIST_ENDPOINT`. `dubai.spec.ts`; no "Get the opening date" in `dist/`; `audit/screens/after/b06-*` |
| B-07 | ✅ | 472b9ed, b6eeb28, 06ed5d0 | Launch `robots.txt` has no `Disallow: /og/` (`audit/data/robots-launch.txt`); `X-Robots-Tag: noindex` on `/og/*` (vercel.json + _headers). `robots.test.ts` |
| B-16 | ✅ (form waits on client) | 6087119 | No form without `PUBLIC_FORM_ENDPOINT`: "Email us" + "Call" per room. With an endpoint, no client-side `to` field (route by `restaurant` server-side). `groups.spec.ts`; Lighthouse Best Practices 100 locally (live 77 was the mailto form) |
| B-08 | ✅ | f25d9cc | `src/data/story-art.ts` manifest; StoryComic and SceneArt read only from it (an unknown slot fails the build); placeholders kept; the built page's 143 image refs are identical. `docs/ILLUSTRATOR-BRIEF.md`: 44 slots, 22 to commission. `story-art.test.ts` |
| B-11 | ✅ | 6e3c7a5, d65425d, cae8c30 | "Skip to content" first on all 16 routes, page skip second, no "Skip to footer". `a11y.spec.ts` |
| B-09 | ✅ | 6dcd794, 1af7125 | "Today, Tuesday 24 November" / "Tomorrow, …" (the chip now shows "Tomorrow", so its word leads the name). `a11y.spec.ts` |
| B-10 | ✅ | 1a07842 | Edge fade, snap, end padding. `audit/screens/after/b09-b10-day-strip--phone.jpg` |
| B-15 | ✅ | fc33dd2 | sr note "(opens in a new tab)" without JS, "(opens the booking panel)" once the drawer takes the link: true either way. `a11y.spec.ts` |
| B-19 | ✅ | fbbc778, 4ed61f7 | Calm-mode strip grows (wraps), no scroll region. axe 375 reduced motion clean; `audit/screens/after/b19-*` |
| B-25 | ✅ | d996fdf, e10e97b | One paused rule (`animation-play-state: paused`, no `!important`), scoped to the registered loops: `*` would freeze the booking drawer's entrance and the story's scroll scenes. o-cue-bob, lo-sway and lo-fall registered; the check's stale selector fixed. `docs/qa/phase8-motion/check.mjs` with motion on: ok; `motion.spec.ts` |
| B-12 | ✅ | 16d9628, b52f1d0 | `booking.spec.ts`: Soho 8, Covent Garden 5 → "Plan a group at …" |
| B-13 | ✅ | 84cf3aa | `audit/data/phase2-proofs.txt`: no review numbers in `.astro` |
| B-14 | ✅ | e80c0be | `dist/404.html` has no canonical/og:url (proofs file) |
| B-17 | ✅ | f3da74e | Proofs file: static HTML neutral; with the clock at D+1 the page says "Today, Wednesday" |
| B-18 | ✅ | 8d9d5d4 | Proofs file: `dist/index.html` and the hydrated DOM are free of "No more tables…" / "For 2, please call"; `hidden-copy.spec.ts` |
| B-20 | ✅ | c3b9e29 | Proofs file + `audit/screens/after/b20-hero-phone-3s.jpg` |
| B-21 | ✅ | dfd088c | Proofs file: 0 console warnings after a full scroll |
| B-24 | ✅ | 10268c5 | `jsonld.spec.ts`; `audit/data/jsonld-dump.txt` (Dubai: none; Soho and Covent Garden: Restaurant) |
| Host | ✅ | 1783692 | `vercel.json`: host-matched apex → www, permanent (308); `robots.test.ts` |
| Perf | ✅ | 7292cd1 (B-22), d4065f1, dad380c | Curtain fallback removed once live; map 1000 → 750 px (107 → 73 KB); voyage stamps 300 → 200 px; sitemap `lastmod` |
| B-23 | ➡️ open | — | The home menu still ships all 10 menus inside the MenuBook island (loads on approach, after first paint) |
| B-26 | ✅ fixed | perf/home-js | First-visit home JS 148.5 → 69 KB: no React before the voyage (rain glass and intro board are plain DOM); rain skipped on software WebGL; smaller soft hero still. Lighthouse home 88–91 (was 77), TBT 0, 1091 KB |

Harness: smoke 8/8 (e07b68e); `perf:taps` all < 200 ms at 4× CPU; the booking e2e covers both rooms × 2/4/7/8 × today/+3.

**Gate (24 Nov):**
- verify green; astro check 0 errors / 0 warnings; Vitest 22/22; Playwright 120/120.
- axe after an instant scroll and a 900 ms settle: **0 serious/critical** across 16 routes × 375/1280 × motion on/reduced, dialogs included (`audit/data/sweep-gate-*.json`).
- Console clean; links 0 broken, 0 missing anchors, 0 bad `?at=`.
- Probes: `audit/data/probes.json`. Lighthouse: the "After" column above.

## Summary
- **The booking widget's rules are right. The "contradiction" the scrape found is not what guests see.** I checked all 16 combinations (Soho and Covent Garden × 2/4/7/8 guests × today and +3 days). Thresholds, the £10 deposit from 4, the set menu from 8, the pre-theatre windows and both provider deep links behave correctly. The scraper read text that the drawer writes into hidden nodes (B-18). The real booking bug is on `/book/`: Covent Garden shows "Outside opening hours" at 7pm on days it is open (B-02).
- **One P0: with JavaScript off, or if the bundle fails, the home page stays a black intro screen for good** (B-01). The intro also holds the content for 2.2–2.4 s with motion on, against a 1.5 s budget (B-04).
- **Accessibility is in good shape where axe looks.** axe finds 0 stable serious or critical violations: 1 reduced-motion finding, plus transient hits taken mid-animation. The gaps are in things axe can't see: scroll lock fails under reduced motion (B-03), skip-link order (B-11), label-in-name on the day chips (B-09), and story text that stays invisible without JS (B-05).
- **Performance is close to budget, except the home page.** Home is mobile P89 locally (96 live), with lab LCP 3.6 s, 1.4 MB and **157 KB of JS against a 100 KB budget**, and its HTML carries all 10 menus. Every other page scores 92–100, and SEO is 100 on a launch build (see Performance and SEO).
- **Design: the craft is high, but the home page says too much.** It uses nine visual metaphors and about 21 phone screens, with 12 of them before the first dish. "Premium" here means one thread, fewer and larger moments, Book always within reach, and the full menu moved off the home page. The client chose to keep the current immersive journey and enrich it with motion (Direction C, scene-by-scene plan below); the two simplified directions are kept for reference.

## Scores
Design scores run from 1 (poor) to 5 (excellent). The design review used the 375 and 1280 viewport frames, with live interaction checks.

| Page | Hier. | Type | Colour/contrast | Spacing | Imagery | Motion | CTA reach | Nav | Mobile ergonomics | States | Microcopy | Brand | **Avg** |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Home `/` | 2 | 4 | 4 | 3 | 4 | 3 | 3 | 3 | 3 | 3 | 4 | 4 | **3.3** |
| Soho / Covent Garden | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | **4.0** |
| Dubai | 3 | 4 | 3 | 4 | 2 | 4 | 2 | 4 | 4 | 2 | 3 | 4 | **3.3** |
| Menus `/[branch]/menu/` | 4 | 4 | 4 | 4 | 3 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | **3.9** |
| Book `/book/` | 4 | 4 | 4 | 4 | 3 | 4 | 4 | 4 | 4 | 2 | 3 | 4 | **3.7** |
| Private dining | 4 | 4 | 4 | 4 | 3 | 4 | 4 | 4 | 4 | 3 | 4 | 4 | **3.8** |
| Our story | 3 | 4 | 4 | 4 | 3 | 4 | 3 | 4 | 3 | 2 | 4 | 3 | **3.4** |
| Info pages (allergens, accessibility, privacy, terms) | 4 | 4 | 4 | 4 | 3 | 4 | 3 | 4 | 4 | 4 | 4 | 4 | **3.8** |
| 404 | 4 | 4 | 4 | 4 | 3 | 4 | 4 | 3 | 4 | 4 | 4 | 4 | **3.8** |

Why the low scores:
- **Home.** Hierarchy (2): nine competing devices (rain glass, door, curtain, voyage map, postcards, menu book, film strip, boarding passes, goodbye). Spacing (3): long empty sandwich bands between chapters. CTA reach (3): the phone dock hides on scroll-down and the phone header has no Book.
- **Dubai.** Imagery (2): the hero stand-in is murky. CTA reach and States (2): "Get the opening date" appears three times and goes to Instagram, and there is no form state.
- **Book.** States (2): Covent Garden shows "Outside opening hours" when it is open.
- **Our story.** Brand (3): the tiger characters in the story panels conflict with the brief (B-08). States (2): no-JS text stays invisible.

Lighthouse (before) is in the Performance section.

## Bugs
Severity: **P0** blocks a primary task for some guests. **P1** is a real defect a guest will hit, or a brief, launch or legal conflict. **P2** is minor or latent.

| ID | Sev | Page | Steps to reproduce | Expected | Actual | Root cause | Fix |
|---|---|---|---|---|---|---|---|
| B-01 | P0 | `/` | Disable JS (or block `_astro/*.js`), open `/` on a first visit | Home page readable, intro skipped | Full-screen "Now arriving" overlay never leaves; Skip does nothing (`audit/screens/probes/nojs-home--375.jpg`) | Inline script sets `data-arrival="play"` and only the JS module ever ends it; CSS hides the overlay only for `data-arrival='skip'` (`src/components/scenes/Arrival.astro:16,36`) | CSS fail-safe: overlay auto-hides via a CSS animation by ~1.5 s whatever JS does, and is shown only when JS sets a class *after* the module loads; `<noscript>` style hides it |
| B-02 | P1 | `/book/` | Open `/book/` on a Tue–Sun, default 7pm, 2 guests | Covent Garden offers a time | "Outside opening hours" and a plain SevenRooms link (probe `desk`, screenshot frame book--375) | `slots()` (`src/lib/booking.ts:25-34`) steps 30 min from the opening minute: Soho → :00/:30, Covent Garden (opens 16:45) → :15/:45. The desk's one shared time list (`src/pages/book.astro:152-161`) never finds a time both rooms offer | Per-room nearest bookable time in the desk; client to confirm whether CG books on :15/:45 or :00/:30 (no hours changed). Vitest on `slots()` first |
| B-03 | P1 | all (site menu, "Which restaurant's menus?") | Reduced motion on, open the site menu on a phone, scroll | Page behind stays put | Page scrolls behind the modal (probe `dialogs`, 6 of 6 reduced-motion cases for the two header dialogs) | `lockScroll()` only stops Lenis (`src/lib/smooth-scroll.ts:190`); Lenis isn't created with reduced motion | Lock `html` overflow (with `scrollbar-gutter: stable`) when there's no Lenis |
| B-04 | P1 | `/` | First visit, motion on | Content within 1.5 s (brief §3) | Overlay gone at 2.18 s (375) / 2.35 s (1280); first Tab lands on "Skip to footer", not the intro's Skip | Board animation length + 4.5 s safety cap (`Arrival.astro:126`); Skip isn't focused or first in order | Keep the intro (Direction C) but cap it at 1.2 s and hand it into the hero (the doors); move focus to Skip on start |
| B-05 | P1 | `/our-story/` | Disable JS, open the page | Story text readable | 40 headings/paragraphs stay at `opacity: 0` (probe `nojs`) | Reveal start state applied in CSS without a JS gate | Gate the hidden start state on a `js` class set by an inline script, like the scenes' `@supports` gates |
| B-06 | P1 | `/dubai/`, home Dubai pass | Click "Get the opening date" | A way to join the list | Goes to Instagram; the form renders only with `PUBLIC_DUBAI_LIST_ENDPOINT` or a branch email, both unset | `src/pages/[branch]/index.astro:207`; comment at `:138` promises a reservations-address fallback the code doesn't do | Client: form service (#5/#10/#41). Until then, label the button for what it does ("Follow @fattpundit for the date") and make the comment true or delete it |
| B-07 | P1 | launch | Build with `PUBLIC_LAUNCH=true`, read `/robots.txt` | Share images reachable by link-preview crawlers | `Disallow: /og/` blocks the `og:image` files for crawlers that honour robots (X) | `src/pages/robots.txt.ts:5-9` | Allow `/og/`; keep them out of search with an `X-Robots-Tag: noindex` header in `vercel.json` |
| B-08 | P1 | `/our-story/` | Scroll the story | No AI-generated character art (brief §0; `docs/STORY-AWARD-PLAN.md` §2 "AI art: yes, except characters") | Panels p01–p13 (`src/assets/images/story/p*.jpg`) show anthropomorphic tiger characters (cook, scholar, crew) | Added on purpose in 6029368 "feat(story): tigers as the cast"; provenance not recorded per file | **Flag only.** Owner confirms provenance; if generated, swap to the storyboard sketches the page already supports (`StoryComic` shows a sketch when a panel has no file) until the illustrator delivers |
| B-09 | P2 | Book drawer | Open the drawer, inspect the first day chip | Accessible name contains the visible words | Visible "Today 24 Nov", name "Tuesday 24 November" (WCAG 2.5.3) | `aria-label` set to the long date (`BookDrawer.astro:210-211`) | Name = "Today, Tuesday 24 November" (and "Tomorrow, …") |
| B-10 | P2 | Book drawer | 375 px, look at "Which day" | Cue that more days scroll | 21 chips, 1539 px in a 339 px strip, no fade or arrows | `.book-days` is a plain overflow strip (`:156`) | Edge fade mask + scroll-snap padding; or a 7-day strip with "More dates" |
| B-11 | P2 | all | Tab once on any page | First stop skips to the main content | First stop is "Skip to footer" on every page; home and branch pages have no skip-to-main; home `<main>` has no id | `src/layouts/Base.astro:103` renders the footer skip before the page's own | Base renders "Skip to content" (→ `main#content`) first; page-specific skip second; drop or demote "Skip to footer" |
| B-12 | P2 | `/book/` | Guests 8 (Soho) or 5–8 (CG) | Button says what it does | Row text "call or plan a group", button still "Book at Soho (opens in a new tab)" but now goes to `/private-dining/` in the same tab | `paint()` swaps `href` and drops `target` but not the label (`book.astro:166-170`) | Swap the label to "Plan a group at Soho" and drop the sr-only "new tab" text |
| B-13 | P2 | `/` | Change `rating` in `branches.json` | Home follows the data | Home keeps "4.8 / 5 … 20,030 … 16,000+" | Typed into `src/pages/index.astro:188-189` | Read from `branches.json` `rating` (numbers unchanged) |
| B-14 | P2 | 404 | View source of any 404 | No canonical on a noindex error page | `canonical` and `og:url` = `https://www.fattpundit.co.uk/404/`, a URL that doesn't exist (`links.json`) | `Base.astro` always emits canonical | Skip canonical/og:url when `noindex` |
| B-15 | P2 | `/soho/`, `/covent-garden/` | Screen reader on the hero Book link | "opens in a new tab" announced | Not announced | `[branch]/index.astro:199,367` lack the sr-only text `/book/` uses | Add it |
| B-16 | P1 | `/private-dining/` | Submit on live | Posts to a form service; Best Practices ≥ 95 | Opens the mail app; Chrome logs an insecure-form-target warning (`mailto:` action) and live Lighthouse Best Practices drops to **77** (budget 95); the `to` routing field is ignored by most services | `PUBLIC_FORM_ENDPOINT` unset (`private-dining.astro:16`) | Client: form service (#5). Route per restaurant server-side, not via a `to` field |
| B-17 | P2 | branch pages | Build on day D, visit on D+1 before the board scrolls in | Today's specials | Static HTML holds day D's lines until hydration | `useState(() => pick(rows, branch, todayIn(tz)))` runs at build (`src/components/branch/TonightBoard.tsx:22`) | Render the empty/neutral state on the server; pick in `useEffect` |
| B-18 | P2 | Book drawer (all pages) | Read the page with a scraper / reader mode | Only visible copy | Hidden nodes carry "No more tables at Soho today" and "Soho books online for up to 7. For 2, please call…" (the brief's suspect #1) | Drawer pre-draws at idle and writes text into hidden elements unconditionally (`BookDrawer.astro:220-232`) | Write the text only when the element is shown; clear it when hidden |
| B-19 | P2 | `/` (reduced motion, 375) | Tab through the voyage | Scrollable ticket reachable by keyboard | axe `scrollable-region-focusable` on `.voyage-ticket` | Overflow box without `tabindex` in calm mode | `tabindex="0"` + label, or let it grow |
| B-20 | P2 | `/` phone | Wait 3 s on the hero | Hint only where it works | "Wipe the glass to look inside" shows on phones, where only horizontal drags wipe | `HomeHero.astro:56-61` shows it on a timer for every pointer type | Desktop/fine pointer only, or drop it |
| B-21 | P2 | motion pages | Console | Clean console | `createSpring() is deprecated use spring() instead` | anime.js 4.5 API change | Use `spring()` |
| B-22 | P2 | `/` | Network panel | Hidden layers not decoded | Velvet ×3, curtain ×2, door view ×2 in the DOM (1 download each; confirmed); the still-curtain fallback is force-loaded while `display:none` (`Doors.astro:172,323-328`) | Fallback copy shares the eager switch | Skip the fallback in live mode (redesign removes the scene anyway) |
| B-23 | P2 | `/` | View source | Home ships a teaser | 229 KB HTML, all 10 menus as island props (223 prices), plus a hidden `Measure` copy of the active menu (259 aria-hidden nodes, 7 "… continued" headings) | `index.astro:120-121,173`, `MenuBook.tsx:205-219,448` | Phase 3: menu teaser on home, full menus on `/[branch]/menu/` |
| B-25 | P2 | `/`, `/our-story/` (motion on) | Press "Pause motion" in the footer, watch | Every loop stops (WCAG 2.2.2) | `o-cue-bob` keeps running on `/`; `/our-story/` runs loops the pause list doesn't know (`lo-sway`, `lo-fall`) (`audit/data/phase8-motion-no-preference.log`) | Loops added after Phase 8 not registered with the pause switch | Gate every infinite animation on the paused state (one `[data-motion=paused] *{animation-play-state:paused}` rule) and add the new names to the motion check |
| B-26 | P2 | `/` | Lighthouse mobile, network table | JS < 100 KB (brief §4) | 157 KB JS transfer: React client + Voyage + MenuBook + RainHero + BarAfterDark + RoomContactSheet islands | Six islands on one page | Redesign removes Voyage/MenuBook/doors from home; remaining islands → Astro + small scripts where they don't need React |
| B-24 | P2 | `/dubai/` | Rich Results test | Valid, honest entity | `Restaurant` JSON-LD with no hours for a room that isn't open | `[branch]/index.astro:147-166` | Omit `Restaurant` until open, or mark it as planned (no hours/reservations) |

**Checked and not a bug.** These are the brief's suspects, each with evidence.
- **#1 booking thresholds.** The rules are correct; see Summary and probe `booking`. One hypothesis I raised during planning was wrong: Tailwind 4's preflight already forces `[hidden]{display:none!important}`, so the group box and the "Find a table" wrap do hide. This is recorded in `tasks/lessons.md`.
- **#2 doubled names.** The accessibility tree has one name each (probe `names`). Decorative copies are `aria-hidden`, and anime.js `splitText` keeps an accessible copy. Scrapers ignore `aria-hidden`, which is where the doubling came from.
- **#3 empty alts.** All are decorative: they sit inside `aria-hidden` wrappers, inside labelled buttons or links, or are stamps.
- **#4 repeated layers.** Each file is downloaded once (22 image requests on home). The DOM copies are noted in B-22.
- **#8 dialogs.** All three are native `showModal()`, so they are modal with `aria-modal` implied and an inert background. Esc closes them, and focus returns to the trigger in 10 of 10 cases. Tab leaves to the browser UI after the last control, which is the native behaviour; the page behind stays unreachable. The scroll-lock part is B-03.
- **#10 "Today".** It is computed in the browser in Europe/London time. A visitor in New York at 19:30 on Tue 24 Nov sees "Today, Wednesday" and the drawer starts on 25 Nov (probe `hours`). The one exception is B-17.
- **#11 review claim.** It is hard-coded; see B-13. The numbers are unchanged.
- **#12 SEO.** robots is driven by the `PUBLIC_LAUNCH` env var, and canonical is `https://www.fattpundit.co.uk` (www). Details are under SEO.
- **Transient axe hits, not reproducible after the transition settles.**
  - `color-contrast` on the drawer's submit button, which axe sampled 600 ms into the open animation.
  - `.lbl-long` on branch pages at 1280.
  - The live-only `target-size` on the footer's Dubai link and the live-only plate-wall contrast; both are font-loading timing.
  - Phase 2 re-runs axe with a settle wait.

## Accessibility
axe-core 4.14 (`@axe-core/playwright`) uses the tags wcag2a/aa, wcag21a/aa, wcag22aa and best-practice. It ran on every route at 375 and 1280, with motion on and reduced, plus inside each open dialog. Raw results are in `audit/data/sweep-*.json`.

| Rule | Impact | Count | Where | Fix |
|---|---|---|---|---|
| scrollable-region-focusable | serious | 1 | `/` 375 reduced motion, `.voyage-ticket` | B-19 |
| color-contrast | serious | 2 + 7 + 1 | branch pages `.lbl-long` (1280), drawer submit (open animation), CG plate wall (live) | Transient: not reproduced after settle (see above). Re-verify in Phase 2 with a settle wait |
| target-size | serious | 11 (live only) | footer `li:nth-child(3) > a[href$="dubai/"]` at 375 | Font-timing on live; the local runs are clean. Re-verify; give footer links `min-height: 24px` regardless |

What axe can't see, from manual probes:
- B-03: scroll lock under reduced motion.
- B-05: no-JS story text.
- B-09: label-in-name.
- B-10: no scroll cue.
- B-11: skip-link order.
- B-15: new-tab links not announced.
- B-01 and B-04: the intro's focus order and no-JS trap.

Focus rings are a surface-aware token (`--fp-ring`), and colour contrast of every token pair is gated at build (`scripts/check-contrast.ts`, green).

**Existing checks re-run** (pre-existing harnesses, unchanged):
- `npm run verify`: ok. astro check reports 0 errors, 0 warnings and 7 hints (unused variables in `SiteHeader.astro:188` and `RouteChart.astro:156`). The build has no warnings.
- `npm run test:smoke`: 6 of 8 pass. The two phone branch-page cases fail because the test scrolls down and then taps the dock, which by design hides on scroll-down (`SiteHeader.astro:185-194`). The site isn't broken here, but the failure confirms U-04. The test gets updated in Phase 2.
- `docs/qa/phase8-motion/check.mjs`:
  - Reduced motion: clean on 4 pages.
  - Motion on: B-25, plus one stale selector (`[data-tear][target=_blank]`, removed by the home audit).
- `npm run perf:taps`: aborted on the same dock tap (harness). Re-run after the test fix.

Not tested here and still open from Phase 10: real VoiceOver and NVDA, Safari, Firefox, and real devices.

## Performance
<!-- LH-PERF -->
| Route | LCP (lab, mobile) | Observed LCP | CLS | TBT | Total KB | JS KB | CSS KB | Img KB | Font KB | LCP element | Top 5 heaviest |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `/` | 3.6 s ⚠️ | 120 ms | 0.009 | 48 ms | 1409 | 157 | 37 | 1041 | 126 | `astro-island > div.absolute > div.pointer-events-none > img.size-full` | 202KB /_astro/interior-door-view-g.Cr3b3yGa_Z1xiq0g.avif<br>202KB /_astro/street-g.B4cM874r_Z1Xafik.avif<br>186KB /_astro/gallery-01.CO-AmVvm_Z25SH0H.webp<br>110KB /_astro/velvet-g.DBMl0JGv_2l2pqy.avif<br>75KB /_astro/gallery-01.CO-AmVvm_1YEWbi.webp |
| `/book/` | 0.9 s | 110 ms | 0 | 0 ms | 282 | 16 | 29 | 88 | 126 | `main#content > div.wrap > header.fp-section-head > p.chapter-intro` | 88KB /_astro/crackling-spinach.C4H3Bw-u_1hbVUQ.webp<br>35KB /_astro/fonts/72a3e9c5d5030199.woff2<br>34KB /_astro/fonts/435c08ed98fe9a95.woff2<br>33KB /_astro/fonts/7087c481161d8962.woff2<br>23KB /_astro/fonts/5e51b176470dd270.woff2 |
| `/soho/` | 2.6 s ⚠️ | 142 ms | 0.004 | 0 ms | 428 | 104 | 34 | 135 | 126 | `main.branch > section.arrival > div.arrival-media > img.arrival-bg` | 63KB /_astro/client.C5yqT35c.js<br>56KB /_astro/crackling-spinach.C4H3Bw-u_ng9qx.webp<br>36KB /_astro/momo-mix-vegetable.B0Y3ep22_Z2u7j4R.webp<br>35KB /_astro/fonts/72a3e9c5d5030199.woff2<br>34KB /_astro/fonts/435c08ed98fe9a95.woff2 |
| `/soho/menu/` | 1.4 s | 106 ms | 0 | 0 ms | 219 | 18 | 33 | 7 | 126 | `div.info-body > div.menu-layout > div.menu-list > p.menu-passport-tip` | 35KB /_astro/fonts/72a3e9c5d5030199.woff2<br>34KB /_astro/fonts/435c08ed98fe9a95.woff2<br>33KB /_astro/fonts/7087c481161d8962.woff2<br>23KB /_astro/fonts/5e51b176470dd270.woff2<br>23KB /soho/menu/ |
| `/covent-garden/` | 2.9 s ⚠️ | 142 ms | 0 | 0 ms | 876 | 105 | 34 | 431 | 126 | `main.branch > section.arrival > div.arrival-media > img.arrival-bg` | 172KB /_astro/gallery-01.CO-AmVvm_Z1vIFCW.webp<br>149KB /_astro/cg-booths-glow.B4nEEiPZ.mp4<br>63KB /_astro/client.C5yqT35c.js<br>56KB /_astro/crackling-spinach.C4H3Bw-u_ng9qx.webp<br>49KB /_astro/gallery-01.CO-AmVvm_2gnL12.webp |
| `/covent-garden/menu/` | 1.4 s | 111 ms | 0 | 0 ms | 218 | 18 | 33 | 7 | 126 | `div.info-body > div.menu-layout > div.menu-list > p.menu-passport-tip` | 35KB /_astro/fonts/72a3e9c5d5030199.woff2<br>34KB /_astro/fonts/435c08ed98fe9a95.woff2<br>33KB /_astro/fonts/7087c481161d8962.woff2<br>23KB /_astro/fonts/5e51b176470dd270.woff2<br>23KB /_astro/logo-stamp-distressed-left.DNY1Exw2.css |
| `/dubai/` | 1.1 s | 111 ms | 0 | 0 ms | 361 | 104 | 34 | 73 | 126 | `section.arrival > div.arrival-media > div.arrival-bg > span.gate-code` | 73KB /_astro/crispy-okra-salt-n-pepper.Bph3S8Xk_Z1enDKF.webp<br>63KB /_astro/client.C5yqT35c.js<br>35KB /_astro/fonts/72a3e9c5d5030199.woff2<br>34KB /_astro/fonts/435c08ed98fe9a95.woff2<br>33KB /_astro/fonts/7087c481161d8962.woff2 |
| `/private-dining/` | 2.4 s | 98 ms | 0 | 0 ms | 310 | 17 | 29 | 116 | 126 | `div.info-desk > div.info-body > figure.pd-photo > img` | 88KB /_astro/gallery-04.DcWCLPKI_2gogcI.webp<br>35KB /_astro/fonts/72a3e9c5d5030199.woff2<br>34KB /_astro/fonts/435c08ed98fe9a95.woff2<br>33KB /_astro/fonts/7087c481161d8962.woff2<br>28KB /_astro/gallery-06.Bvu973qT_1u7QB8.webp |
| `/our-story/` | 3.2 s ⚠️ | 227 ms | 0.012 | 86 ms | 750 | 14 | 44 | 555 | 91 | `div.story-scenes > section.story-scene > div.scene-stage > img.layer` | 127KB /_astro/harbour-ship.DxAquXI5_Z18MywW.webp<br>69KB /_astro/harbour-hills-near.X0zZm8ED_ReQIh.webp<br>60KB /_astro/opening-harbour.CCZv7oa3_6bRFs.webp<br>52KB /_astro/sticky-pan.D0vbHyi8_1bOG8H.webp<br>42KB /_astro/harbour-hills-far.DZSGDfpx_228Wdq.webp |
| `/our-story/fatt/` | 2.4 s | 108 ms | 0 | 0 ms | 246 | 14 | 29 | 91 | 91 | `main#content > section.sec > div.wrap > img.pick-img` | 91KB /_astro/tiger-head-right.B0gAFUjb_A9Xjq.webp<br>34KB /_astro/fonts/435c08ed98fe9a95.woff2<br>33KB /_astro/fonts/7087c481161d8962.woff2<br>23KB /_astro/fonts/5e51b176470dd270.woff2<br>23KB /_astro/logo-stamp-distressed-left.DNY1Exw2.css |
| `/allergens/` | 1.2 s | 90 ms | 0 | 0 ms | 249 | 14 | 29 | 58 | 126 | `div.info-desk > section.in-short > ul > li` | 58KB /_astro/momo-mix-vegetable.B0Y3ep22_xj86m.webp<br>35KB /_astro/fonts/72a3e9c5d5030199.woff2<br>34KB /_astro/fonts/435c08ed98fe9a95.woff2<br>33KB /_astro/fonts/7087c481161d8962.woff2<br>23KB /_astro/fonts/5e51b176470dd270.woff2 |
| `/accessibility/` | 0.9 s | 65 ms | 0 | 0 ms | 249 | 14 | 29 | 58 | 126 | `div.wrap > div.info-desk > div.info-body > p` | 58KB /_astro/momo-mix-vegetable.B0Y3ep22_xj86m.webp<br>35KB /_astro/fonts/72a3e9c5d5030199.woff2<br>34KB /_astro/fonts/435c08ed98fe9a95.woff2<br>33KB /_astro/fonts/7087c481161d8962.woff2<br>23KB /_astro/fonts/5e51b176470dd270.woff2 |
| `/privacy/` | 0.9 s | 116 ms | 0 | 0 ms | 249 | 14 | 29 | 58 | 126 | `div.info-desk > div.info-body > ul > li` | 58KB /_astro/momo-mix-vegetable.B0Y3ep22_xj86m.webp<br>35KB /_astro/fonts/72a3e9c5d5030199.woff2<br>34KB /_astro/fonts/435c08ed98fe9a95.woff2<br>33KB /_astro/fonts/7087c481161d8962.woff2<br>23KB /_astro/fonts/5e51b176470dd270.woff2 |
| `/booking-terms/` | 1.2 s | 77 ms | 0 | 0 ms | 249 | 14 | 29 | 58 | 126 | `div.info-desk > section.in-short > ul > li` | 58KB /_astro/momo-mix-vegetable.B0Y3ep22_xj86m.webp<br>35KB /_astro/fonts/72a3e9c5d5030199.woff2<br>34KB /_astro/fonts/435c08ed98fe9a95.woff2<br>33KB /_astro/fonts/7087c481161d8962.woff2<br>23KB /_astro/fonts/5e51b176470dd270.woff2 |

JS KB is transfer size (gzip/brotli as served). Budget: home JS < 100 KB — **home ships 157 KB of JS (over budget)**; branch pages ~104 KB (React client 63 KB). Observed LCP is 65–230 ms everywhere; lab LCP > 2.5 s comes from simulated slow-4G image loads (lesson: check observed first).
<!-- /LH-PERF -->
Image probe on home (1280, after a full scroll): 22 image requests, 1,279 KB. The largest are `voyage-sea` AVIF (208 KB), the `street` layer (202 KB), the `gallery-01` hero (186 KB) and `map.webp` (107 KB). Over-served images: `map.webp` 1000 px shown at 372 px, and the gold and orange stamps 300 px shown at about 100 px. Only one image has `fetchpriority="high"` (the hero still), which is correct. DOM: 1,713 nodes, 374 of them in the menu, 259 of those in the hidden measuring copy.

Fixes, in order:
1. Home menu teaser instead of 10 menus (B-23): about −150 KB of HTML and −260 nodes.
2. Drop or shorten the door scene's hidden fallbacks (B-22).
3. Serve `map.webp` at 2× its rendered width, about 750 px.
4. Stamps at 200 px.
5. Lab LCP on home is the hero image. Observed LCP is far lower, so check `observedLargestContentfulPaint` before chasing it (lesson).

## SEO / launch readiness
| Item | Status | Note |
|---|---|---|
| `robots` meta | ✅ env-driven | `noindex, nofollow` until `PUBLIC_LAUNCH=true` (`Base.astro:22-37`). Preview SEO score 69 is this, by design; see the launch-build pass below |
| robots.txt | ⚠️ B-07 | Pre-launch `Disallow: /`; post-launch blocks `/og/` share images |
| Canonical / og:url | ✅ / ⚠️ | From `Astro.site` = `https://www.fattpundit.co.uk` (www). Confirm with client that www is the primary host and set apex → www in Vercel domains. 404 canonical bug: B-14 |
| JSON-LD | ✅ / ⚠️ | Home `Organization` + `subOrganization`; each branch page `Restaurant` (address, geo, openingHoursSpecification, hasMenu, acceptsReservations); menu pages `Menu`. Dubai gap: B-24. Geo coordinates still a launch blocker in `tasks/todo.md` |
| Titles / descriptions | ✅ | Unique per route (home, 3 branches, 2 menus, 6 info pages, story) |
| Sitemap | ✅ / P2 | Lists every public path; no `lastmod` (add build date) |
| hreflang | ℹ️ | None. `<html lang="en-GB">`, `og:locale en_GB`. A single-language site gains nothing from self-referencing hreflang; add `en-GB` + `x-default` only if a Dubai page in another locale ships |
| Redirects / headers | ⚠️ untested | 8 old-URL 301s + HSTS + CSP (report-only) in `vercel.json`; `astro preview` can't apply them. Check on the first production deploy |
| Links | ✅ | 16 pages: 0 broken internal links, 0 missing `#fragments`, 0 bad `?at=`; `#top #menu #bar #room #tables #footer #waitlist` exist after hydration; `?at=soho` / `?at=covent-garden` open the right menu; unknown `?at=` falls back cleanly (`audit/data/links.json`). One broken self-reference: B-14 |
| Status codes | ✅ | Every route 200 locally and live; unknown path 404 with the 404 page |

<!-- LH-SEO -->

Launch-build pass (`PUBLIC_LAUNCH=true`, SEO only, mobile):

| Route | SEO | Failing audits |
|---|---|---|
| `/` | 100 | — |
| `/soho/` | 100 | — |
| `/covent-garden/` | 100 | — |
| `/dubai/` | 100 | — |
| `/soho/menu/` | 100 | — |
| `/book/` | 100 | — |
| `/our-story/` | 100 | — |
| `/private-dining/` | 100 | — |
<!-- /LH-SEO -->
## UX & design improvements
| ID | Page/section | Problem | Proposal | Impact | Effort |
|---|---|---|---|---|---|
| U-01 | Home | Nine devices (rain glass, door, curtain, voyage map, postcards, menu book, film strip, boarding passes, goodbye) feel like separate set pieces; the cuts between them are hard (colour bands, jumps) | **Keep every scene** (client, 24 Nov) and join them into one continuous walk: each scene hands an object or light to the next (Direction C) | H | M |
| U-02 | Home | 16.7k px at 375 (~21 screens); doors + voyage take ~12 screens before the first dish | Keep the length but give every screen something happening (scrubbed motion, depth); add a phone chapter chip and a visible "Skip to the menus / Book" so the long walk is optional, not a toll | H | M |
| U-03 | Home menu book | Four control rows (room, menu, diet filters, list view) above the book | Keep the book; fold diet filters and list view into one "Filter" button so the book itself is the hero of the chapter | H | S |
| U-04 | Phones, all pages | "Book" leaves the screen on scroll-down (dock hides); phone header has only "Menu" | Keep a slim Book bar fixed on phones (hide only while typing), or put Book in the phone header after the hero | H | S |
| U-05 | Footer, all pages | 3–4 phone screens: goodbye, three room blocks, newsletter, socials, sitemap, giant wordmark, legal | One screen: rooms (name, today, Book), small sitemap, legal; move "Goodbye" into the home closing only | M | S |
| U-06 | Home "Choose your gate" | A 14 px paragraph of group/deposit rules under three detailed passes | Passes show room, address, today, Book; rules live on `/book/` and the groups page | M | S |
| U-07 | Dubai | "Get the opening date" ×3, all to Instagram; dim stand-in hero | One honest CTA (B-06), better image when the client sends one (#46) | M | S |
| U-08 | Home hero board | Clock time "11.41am" next to each London room reads like an opening time | Show status only ("Open now · until 10.30pm"); local clock only for Dubai | M | S |
| U-09 | `/book/` | One shared time list for rooms with different slot grids | Per-room times (with B-02) | M | M |
| U-10 | Type system | Tracked caps eyebrows + section numbers + Lora kicker + AT Light H2 on every chapter: four voices per screen | Keep numbers (the visit *is* a sequence) or eyebrows, not both; one Lora line per screen | M | S |
| U-11 | Our story | 24 screens at 1280, 36 at 375; chapter rail only ≥1024 | Phone chapter jump ("Chapter 2 of 5" chip); keep the scroll story | L | S |
| U-12 | Microcopy | "Tear the stub", "Step inside", "Choose your gate", "Goodbye, for now" — the travel conceit stacks up | Keep one travel line per section; plain verbs on buttons ("Book Soho", "See the menu") | M | S |
| U-13 | Imagery | Many stand-in photos; the brand's best asset is the room itself | Commission: Soho room at night, bar, 4 signature dishes overhead, pass/kitchen (client #35/#36/#46) | H | client |

**What "premium" means for Fatt Pundit**, from the references:
- endspeciesism.org: one scroll-driven story, one idea per screen.
- tonemaki.com and tigranz.com: big photography and very little UI.
- landonorris.com: one motion signature, everything else still.
- navbar.gallery: a quiet nav with one obvious action.

What to change:
- **Keep the journey** (client, 24 Nov): arrival, rain glass, doors, curtain, voyage, menu book, bar, room, boarding passes all stay. Premium comes from polish and continuity, not removal. Cut only clutter inside scenes: repeated travel puns, control rows, the 4-screen footer.
- **Enlarge:** photography (room, food, bar) up to full-bleed or near it, the display name, and dish photos with prices.
- **Slow down and connect:** motion should feel like one camera walking through the restaurant. It is scroll-scrubbed where possible, uses transform and opacity, and runs 200–600 ms for responses and longer only for scrubbed scenes. Every scene keeps a static end state for reduced motion.
- **Keep:** American Typewriter + Lora, the ink/sand/gold palette, tiger orange for Book only, and the stamps and boarding pass, used once each.

## Redesign direction

### Direction C (chosen by the client, 24 Nov): "The Walk-In", the current journey made richer
**Concept.** Keep the immersive home page exactly as a journey: you arrive, look through the rainy window, the doors open, the curtain parts, you sail the voyage, open the menu, sit at the bar, look around the room, and take your boarding pass. What changes is that it becomes **one continuous camera move instead of nine set pieces**. Each scene hands something to the next:
- the lamp light from the hero warms the door;
- the curtain's red becomes the route line;
- the ship docks at the menu book;
- the book's last page turns into the bar's receipt;
- the film strip of the room runs into the boarding passes.

Motion carries the story, and the content stays readable at every point.

**Motion plan, scene by scene.** These add to what exists (`docs/MOTION.md`). They use only the libraries already installed (anime.js, motion, Lenis, CSS scroll and view timelines), so no new dependency.

| # | Scene | Today | Add |
|---|---|---|---|
| 1 | Arrival | Split-flap board, 2.2–2.4 s, no fail-safe | Cap at 1.2 s; the board's two halves become the **two doors** opening on the hero (shared element, so arrival and hero read as one move); CSS fail-safe (B-01, B-04) |
| 2 | Hero, rain glass | WebGL rain, letters rise, wipe hint | Slow **parallax depth**: the room behind the glass drifts at 0.3× scroll and a few px with the pointer (desktop); lamps in the photo **breathe** (opacity 0.85↔1, 4.8 s, existing `breathe`); a wipe trail where the finger or mouse has been, phones included (B-20) |
| 3 | Doors and street | Pinned: facade → sign lights → door → room | **Scroll-scrubbed lamp-lighting** (the three brass lamps light one by one, glow spilling down the brick); the door swings with real **perspective (rotateY)** and warm light spills across the cobbles; reflections on the glass slide opposite to the scroll |
| 4 | Curtain | Velvet panels part | Panels part with a **spring and a settle-sway** (2 small overshoots, `--curve-spring`); a dust-in-the-light shimmer as they open (CSS gradient sweep, one pass) |
| 5 | Voyage | Camera along the map, postcards | The ship leaves a **drawn wake** (SVG stroke along the route, scrubbed); each port **stamps** in (`--curve-stamp`) with a small ink spread; postcards arrive with a slight rotation and settle; fix the Dubai label overlap |
| 6 | Menu book | Page-flip island, controls above | The book **opens its cover in 3D** as it enters (scrubbed); the signature pages show **steam wisps** over the momos (opacity loop, paused off-screen); controls fold into one Filter button (U-03) |
| 7 | Bar after dark | Lights up | **Bottles catch light in sequence** as you scroll (a sheen across the shelf); the drink list **prints like a receipt** (existing receipt pattern); photos ease in with a slow Ken Burns (scale 1.04→1, 1.2 s) |
| 8 | The room | Contact sheet + lightbox | The film strip **runs sideways as you scroll down** (CSS scroll-timeline, translateX); frames **develop** from sepia to colour as they enter (`filter` on the small thumb only, or a cross-fade of two layers); the lightbox opens from the frame you tapped (shared-element zoom) |
| 9 | Boarding passes | Three passes, tear-to-book stub | Passes **slide out of a ticket wallet** one after another; the departure board split-flaps "BOARDING" for open rooms; the stub tear keeps its perforation snap |
| 10 | Goodbye → footer | Receipt prints, "Thank you" | The **lights dim** (the room's lamps fade one by one) into a shorter footer (U-05) |
| — | Between pages | Hard page loads | **Cross-document View Transitions** (`@view-transition { navigation: auto; }`, CSS only): the room name flies from the home pass into the branch hero, and menus slide in. Chrome and Safari 18.2+; other browsers just load normally |

**Guardrails.**
- Every loop pauses off-screen and obeys Pause motion (B-25).
- Reduced motion shows each scene's end state.
- Book stays one tap away throughout (U-04).
- The home JS budget is met by hydrating the menu book only on approach and keeping new motion in CSS and small scripts, not new islands (B-26).
- Lighthouse budgets and the scroll jank target (< 2% dropped frames, `npm run perf:budget`) are checked per scene.
- Before/after at 375 and 1280, plus a short screen recording per scene, go into `audit/screens/after/`.

**Type and palette.** Unchanged: American Typewriter + Lora and the brand tokens, with tiger orange only on Book.

**Next step for C.** A motion storyboard (key frames per scene) for sign-off before building, then one scene at a time in the order above.

### Alternatives considered (not chosen)
The two directions below simplified the home page. The client prefers to keep the immersive journey, so they are kept for reference only.
Both directions keep the same stack, the tokens in `src/styles/tokens.css` and `global.css`, the brand fonts and the motion tokens. Neither adds a library. Both drop the intro board, so there is nothing to wait for (this fixes B-04 by design). Both move the full menu to `/[branch]/menu/`. Both keep tiger orange for Book only, with a sticky Book on phones.

### Direction A: "Lamplight" (the room after dark)
**Concept.** You arrive at night. The first thing you see is the room through the window, warm and full, with the name over it. You don't open a door, walk a voyage and turn a menu. The page simply walks you in: one line of story (the route, drawn as you scroll), four plates under the lamps, the bar, then the two rooms side by side with today's hours, and Book. Ink-deep surfaces make the photography glow, and gold hairlines do the work the stamps did. It is the closest to "walking in the door and seeing the food, the drinks and the room."
- **Type.** American Typewriter Bold caps for the name and room names, with tight tracking (−0.01em). AT Light sentence case for chapter heads, one per screen. AT Regular body at 17–19 px on a 56–60ch measure. Lora italic once per screen for the spoken line. No eyebrows.
- **Palette.** `--color-ink-deep` #1a1714 base, `--color-paper` #f6efe4 text, `--color-sand` #dac7b5 secondary, `--color-gold` #cba052 rules. The single accent, `--color-tiger` #f15d3d, is used only on Book.
- **Motion.** One signature: the route line draws with `animation-timeline: view()`. The hero glass stays as a desktop-only wipe. Photos fade in once at 400 ms `--curve-out`. Reduced motion shows the route drawn and everything static.
- **Home order.** Hero (room photo, name, three rooms) → story teaser (route + "Read the whole story") → four dishes → the bar (one photo, one drink) → two rooms + Dubai row → Book.
- **Mock.** `audit/mocks/direction-a--1280.jpg` and `direction-a--375.jpg` (source `direction-a.html`). The numbered callouts are explained in the legend at the bottom of the mock.

### Direction B: "The Paper Trail" (printed matter, one route)
**Concept.** Fatt Pundit's identity is printed ephemera: stamps, tickets, menu cards, boarding passes. Direction B makes the page a desk of those objects in daylight, held together by a single dashed route line in the margin. The line draws itself as you scroll (the endspeciesism idea, in brand form), and each chapter is a stop on it. The hero is type and a postcard photo, so it paints instantly. The four dishes sit on a menu card with dotted price leaders. The bar is an ink chit. The rooms are boarding passes whose stub is the Book button. It is more literal and more brand-forward than A, and lighter on photography, which suits the current photo gaps.
- **Type.** The same families. AT Bold display caps, AT Light H2, and a Lora italic kicker per stop in `--color-tiger-deep`.
- **Palette.** `--color-paper-light` #faf6ef base, `--color-ink` #2c2925 text and rules, `--color-paper` #f6efe4 cards, `--color-tiger-deep` #93321b for the route and kickers. The single accent, `--color-tiger`, is used only on Book stubs.
- **Motion.** One signature: the route line (`scroll()` timeline, `scaleY` from 0 to 1) with the stop dots stamping in (`--curve-stamp`, 460 ms). Nothing else moves. Reduced motion shows the line drawn.
- **Home order.** Hero (name, three room tickets, postcard) → story stop → menu card (four dishes) → bar chit → boarding passes (two rooms + Dubai) → footer.
- **Mock.** `audit/mocks/direction-b--1280.jpg` and `direction-b--375.jpg` (source `direction-b.html`).

Superseded by Direction C (client, 24 Nov).

## Proposed task order
1. **P0:** B-01 (no-JS/failed-JS intro trap).
2. **P1 bugs:** B-02 (desk time grid; Vitest on `slots()` + Playwright desk e2e first), B-03 (scroll lock), B-04 (intro budget), B-05 (story no-JS), B-07 (robots `/og/`). B-06 and B-08 need client or owner answers first.
3. **Accessibility P2:** B-09, B-10, B-11, B-15, B-19. Then re-run axe with a settle wait; target 0 serious/critical on every route.
4. **Correctness P2:** B-12, B-13, B-14, B-17, B-18, B-20, B-21, B-24.
5. **Performance:** B-22, B-23 and B-26 (they land with the home redesign); image sizes.
6. **Design (Phase 3, Direction C), one scene at a time** after the storyboard sign-off: arrival → hero → doors → curtain → voyage → menu book → bar → room → boarding passes → goodbye/footer → page transitions. Before/after screens at 375 and 1280 plus a short recording for each.

The test baseline added in Phase 2: Vitest for `src/lib/booking.ts` and `hours.ts` rules, and a Playwright booking e2e covering both rooms × 2/4/7/8 guests × today and future. A typed `src/data/branches.ts` view only if it removes duplication; `branches.json` plus the Zod schema already types it.

## Flagged, not changed (content, URLs, prices)
- **Review figures** "4.8 / 5, 20,030 (Covent Garden), 16,000+ (Soho), November 2026": hard-coded on home, with no link to the source. The client should confirm them and provide a source URL.
- **Pre-theatre windows.** Soho 17:00–17:45 matches the brief. Covent Garden is 16:45–17:30, which the brief doesn't state; please confirm. **Confirmed by the owner, 25 Nov 2026.**
- **Covent Garden booking times** on :15/:45 (from opening at 16:45): does SevenRooms take those slots?
- **Canonical host** is `www.fattpundit.co.uk`, while the brief says `fattpundit.co.uk`. Which is primary?
- **Story panel art provenance** (B-08).
- **The Dubai list form and the groups form service** (#5, #10, #41).
- **The untracked `assets/` folder** (132 MB, including AI "mockup"/"cinematic" files) is not used and is not committed.

## Open questions for the client
1. Primary host: `www.fattpundit.co.uk` or `fattpundit.co.uk`?
2. Covent Garden slot grid (:15/:45 or :00/:30) and its pre-theatre window.
3. A form service for the Dubai list and group enquiries, and the reply-to inboxes.
4. Were the story panels' tiger characters generated, and may they ship before the illustrator delivers?
5. A source link for the Google ratings, and how often the figures are updated.
6. Photography: the Soho room at night, the bar, four signature dishes, and Dubai.
