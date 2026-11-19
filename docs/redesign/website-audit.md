# Website audit — baseline (Phase 0)

Date: 19 Nov 2026 · Branch `redesign/world-class` · Baseline tag `baseline-pre-redesign` (= `main` @ 0ead5a8)
Scope: understand the current site and record a measured baseline. **No design or code changes in this phase.**

Evidence key, used on every number below:
- **[M]** measured in this phase (details in `qa-report.md`)
- **[V]** looked at in this phase's screenshots (`baseline/`)
- **[C]** read from the code
- **[T]** carried over from `tasks/todo.md` and not re-measured

---

## 1. What the site is

Fatt Pundit is a Chinese-Indian (Hakka / Tangra) restaurant group. The site covers Soho and Covent Garden in London, plus Dubai (opening soon, waitlist only). It works as a scroll-driven "voyage" story (Canton → Kolkata → London → Dubai), built from the B3 brand guidelines (Aug 2026). **It is not live yet**: a preview banner shows and `noindex` is on until `PUBLIC_LAUNCH=true` [C].

### Stack [C]
| Layer | What |
| --- | --- |
| Framework | Astro 7.4 static output (`trailingSlash: 'always'`) |
| Styling | Tailwind 4 (`@tailwindcss/vite`), plus `src/styles/global.css` (tokens) and `site.css` (buttons, chrome) |
| Interactivity | React 19 islands (`client:idle` / `client:visible`), `motion` 14, `animejs` 4, a vendored KokonutUI set (MIT) |
| Fonts | Self-hosted through Astro `fonts`: American Typewriter (licence blocker) + Lora 500 italic; `FONT_BACKUP=1` → Kameron (OFL) |
| Data | `src/data/*.json`, checked by Zod (`src/content.config.ts`) and `scripts/validate-data.mjs` (prebuild) |
| Tests | `scripts/test-hours.ts` (opening hours, GMT/BST), `scripts/perf-budget.mjs` (Lighthouse + scroll jank, Linux-oriented) |
| Hosting | Cloudflare Pages / Netlify via `public/_headers`; build `npm run build` → `dist/` |

### Routes [C][M]
| Route | Purpose | JS (gz, eager + islands) [M] |
| --- | --- | --- |
| `/` | Story home: rain hero + branch chooser, doors, voyage map, menu book, bar, room, boarding passes, goodbye | 117 KB / 11 files |
| `/soho/`, `/covent-garden/`, `/dubai/` | Branch pages from one template | 100 / 100 / 66 KB |
| `/soho/menu/`, `/covent-garden/menu/` | List menu with search, diet filters, print, dish passport | inline only |
| `/private-dining/`, `/allergens/`, `/privacy/`, `/accessibility/`, `/booking-terms/` | Info pages (`InfoPage.astro`) | 0 |
| `/404` "Lost luggage", `/styleguide/` (internal), `/og/[id]` (share card source), `robots.txt`, `sitemap.xml` | | |

### Integrations to preserve [C][M]
- **Booking:** `BookDrawer.astro` builds OpenTable (Soho, rid 171789) and SevenRooms (Covent Garden, `fattpunditcoventgarden`) deep links. **Both verified to build the expected URL [M].** Dubai uses a waitlist (demo only, not wired to a backend).
- **Tonight's board:** Google Sheet CSV (`SPECIALS_CSV_URL` / `PUBLIC_SPECIALS_CSV_URL`), with a fallback to `specials.json` (currently shows "sample lines") [C][V].
- **Analytics:** Plausible + web-vitals, gated on `PUBLIC_PLAUSIBLE_DOMAIN` [C].
- **Newsletter:** form action from `PUBLIC_NEWSLETTER_ACTION` [C].
- **Structured data:** Organization (home), Restaurant + Menu (branches) [C][T].

---

## 2. Baseline results (summary; full numbers in `qa-report.md`)

| Check | Result |
| --- | --- |
| `npm test` (hours) | pass [M] |
| `validate:data` | 0 errors, 7 content warnings (set-menu price, Soho vouchers URL, 5 signature dish photos) [M] |
| `npm run build` | pass, 12 s, 16 pages [M] (needs the WASM workaround on this PC, see §4.11) |
| `astro check` | **1 error**: `astro.config.mjs:44`, font variants type (from the `FONT_BACKUP` change) [M] |
| Lighthouse mobile (perf / a11y / BP) | home 88/100/100 · Soho 95 · CG 97 · Dubai 97 · Soho menu 99, a11y and BP 100 everywhere [M] |
| SEO score | 66–69, **only** because the preview build is noindex (by design) [M] |
| CLS | 0.000 on all 5 pages [M] |
| Lab LCP (slow 4G sim) | home **3.66 s** (over the 2.5 s target), Soho 2.80 s, Dubai 2.42 s, CG 2.29 s, menu 1.81 s. Observed LCP 0.13–0.35 s [M] |
| Horizontal overflow | none, 12 pages × 390/768/1440 × normal/calm [M] |
| JS errors | none [M] |
| Failed requests | only `cg-lights-on.mp4` on /covent-garden/, reported as "failed". It is a media range request that headless Chrome aborts; the video shows. Recheck in a real browser [M] |

---

## 3. Strengths to keep (do not regress)

1. **A distinct brand concept that is executed well.** The travel and voyage metaphor (departure board, ticket postcards, boarding passes, receipt goodbye) comes straight from the brand story. Nothing about it looks like a generic template [V].
2. **Brand discipline.** It uses the 5 guideline colours only, typewriter + Lora only, and never rotates the logo or puts it on a busy photo (audits 1–6 in todo.md) [C][T].
3. **Performance engineering.** CLS 0, TBT ≈ 0, islands are lazy, and the lessons file holds 60 concrete rules about scroll jank, LCP and fonts [M][C].
4. **Accessibility basics.** Lighthouse a11y 100. A calm mode for reduced motion that shows end states. A focus ring that follows the surface colour (0/553 failures [T]). `<dialog>` lightbox and drawer [M][C].
5. **Data integrity.** Prices are typed once in `dishes.json`, and the build fails on bad data [C][M].
6. **Booking in 2–3 taps** with prefilled provider links [M].

---

## 4. Findings by area

Severity: **H** = blocks launch or quality, **M** = clear improvement, **L** = polish.

### 4.1 Visual design [V]
- **M: Large empty fields at 1440 px.** The Soho hero puts a small left column (logo, name, buttons) against a wide flat dark field, with the street sign floating on the right. The doors scene is a portrait object in a landscape frame with heavy empty sides. The menu book sits small in a big sand field. The goodbye door panels are mostly blank black. The desktop composition reads as "phone layout, widened".
- **M: Soho has no photography.** "Walk the room" uses floor-plan line drawings as stand-ins, and the 5 signature dish photos are missing (validate-data warnings). Soho is the flagship, so its page carries the least imagery. This is content, not code: `docs/SHOT-LIST.md`.
- **L: Typographic monotony.** Almost everything is the typewriter face, in bold caps or regular, so hierarchy rests on size and case alone. Lora italic notes help, but the guidelines allow only these two families (see §5).
- **L: Tonight's board at 1440** clips its lines ("WHITE TIGER AT THE"). The source is sample data, but long lines need a rule (truncate on a word boundary or scale to fit).

### 4.2 UX and information architecture [V][M]
- **M: Page length.** Home is 16.2 screens at 390 px and 13.5 at 1440. Branch pages are 11–12 screens. Menus run 38–41 screens on the phone. Booking is always one tap away (sticky header button + phone dock), but finding hours or address on a branch page means a long scroll.
- **L: Two global navs.** The header nav and the chapter rail overlap in purpose on desktop home. Fine for now; review in Phase 1.
- **L: "Or see the menus first"** is the only text link in the hero. Menus are a main task for restaurant visitors and could carry more weight.

### 4.3 Motion [V][C]
- Scroll scenes are purposeful (doors open, the ship sails, the passes stamp). Calm mode works.
- **L: Possible overlapping captions** in Soho "Walk the room" at 1440 mid-pan ("THE BAR, ON YOUR LEFT" drawn twice). This may be a capture-timing artefact; verify by hand before acting (lesson 56).

### 4.4 Responsive [M][V]
- No overflow at 390/768/1440. Phone layouts are the strongest form of the site.
- **L:** On the voyage map at 390 px, the far-right city label ("Canton") is cut at the screen edge on the Kolkata → London frame.

### 4.5 Accessibility (target WCAG 2.2 AA) [M][C]
- Lighthouse 100 on 5 pages. This is automated only and does not prove AA.
- **M: `/404` has no heading at all** (no h1–h3) [C][M].
- **To verify in Phase 1+ (not tested here):** keyboard-only path through the scroll scenes (2.1.1, 2.4.3), focus not obscured by the sticky header or phone dock (2.4.11, new in 2.2), target size ≥ 24 px for small controls such as chips and the menu book arrows (2.5.8, new in 2.2), drag alternatives for tear-the-stub and the plate wall (2.5.7, new in 2.2; the stub is a link, so it is likely fine), screen reader pass in NVDA/VoiceOver.

### 4.6 Performance (target CWV "good": LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1) [M]
- CLS met everywhere. TBT 0–113 ms (INP proxy, fine).
- **M: Home lab LCP 3.66 s.** Observed LCP is 0.27 s, so real users are likely fine, but the lab number fails the target. The cause, per lessons 43/44/51, is preloaded fonts plus early JS counted by the simulator. To judge real LCP we need field data (web-vitals beacon after launch).
- Home transfer 974 KB, CG 936 KB, close to the project's own 1.1 MB budget [M].
- `src/assets` holds a 1.4 MB `voyage-sea.png` and a 1.2 MB `menu-back-map.png`. They go through Astro's image pipeline, so the source size is not the shipped size. No issue was measured.

### 4.7 Functionality [M]
- Booking deep links, menu search, the 404 status and the branch chooser all work.
- Not tested: newsletter (env not set), Plausible (env not set), the live Sheet CSV, the Dubai waitlist backend (none exists).

### 4.8 Content [C]
- **H (launch): Unconfirmed prices and facts.** `docs/content-discrepancies.md` lists 27 differences between the live site and the guidelines PDF, plus 10 open questions. **Not resolved here and must not be guessed.**
- **H (launch): Legal page wording** (allergens, privacy controller, booking terms, step-free access) is a client-unconfirmed draft [T].
- **L:** Page titles disagree: home says "Chinese-Indian Hakka", branches say "Indo-Chinese Hakka" [M]. Needs a client pick.
- Spelling inconsistencies ("chilly"/"chilli", "Lollypop"/"Lollipop") are already logged for the client.

### 4.9 SEO [M][C]
- Canonical, sitemap, OG cards per branch, Organization/Restaurant/Menu schema, `robots.txt`: all present.
- **H (launch):** `noindex` until `PUBLIC_LAUNCH=true`, by design. Redirect map ready in `docs/redirects.csv`.
- **M:** Geo coordinates for Soho and CG are missing from the schema [T].

### 4.10 Security [C]
- `_headers`: nosniff, referrer policy, permissions policy, X-Frame-Options. **M: no Content-Security-Policy and no HSTS.** A static site with few third parties (Plausible, the Sheet CSV, booking providers on outbound links) is a good fit for a strict CSP. HSTS normally comes from the host, so check it there before adding.
- **H (launch): `/styleguide/` is public** [T].
- Outbound booking windows set `opener = null` [C].
- No secrets in the repo (`.env` is gitignored) [C].

### 4.11 Maintainability and tooling [C][M]
- ~~**M: `astro check` fails** (1 type error in `astro.config.mjs`, from the last commit).~~ Fixed 19 Nov after the baseline; check now 0 errors.
- **M: Builds are blocked on this Windows PC.** Windows Application Control blocks satteri's native binary (`@bruits/satteri-win32-x64-msvc`). Workaround used here: install `@bruits/satteri-wasm32-wasi@0.11.7` with `--no-save --force` and set `NAPI_RS_FORCE_WASI=1`. **Running `npm install` again removes it.** Neither `package.json` nor the system policy was changed.
- **L:** `perf-budget.mjs` defaults to a Linux Chrome path and needs Playwright + Lighthouse on PATH. On this machine, use Edge via `CHROME_PATH`.
- **L:** Mixed approach: Tailwind utilities in markup + scoped `<style>` + global classes. It is consistent with itself, but `src/pages/[branch]/index.astro` is 37 KB and `index.astro` is 19 KB, which makes them heavy to change.
- Good: `tasks/lessons.md`, `docs/HANDOVER.md` and data validation keep the project understandable.

---

## 5. Constraints for the redesign (from the brand guidelines and project history)
- Colours: ink `#2c2925`, tiger `#f15d3d`, gold `#cba052`, sand `#dac7b5`, slate `#758591`, plus the derived contrast tokens already in `global.css`. **No new hues.**
- Type: American Typewriter (Bold / Semi Bold / Regular) and Lora Medium Italic **only** (guidelines p.20–21).
- Logo: never rotated, reshaped, recoloured outside the approved set, or placed on a busy photo (p.16).
- Do not break the perf rules in `tasks/lessons.md` (transform/opacity-only scroll scenes, first screen painted finished, no `filter` in scroll scenes).
- Do not invent facts: prices, set menu price, Dubai details, booking providers, legal wording.

## 6. Launch blockers (already known, unchanged)
1. Font licence (ITC American Typewriter web). 2. Client sign-off on content discrepancies. 3. Logo SVGs from B3. 4. Geo coordinates. 5. Remove or protect `/styleguide/`. 6. Legal draft wording. 7. Real-phone + Safari test (not possible on this machine; only headless Edge/Chromium was used).
