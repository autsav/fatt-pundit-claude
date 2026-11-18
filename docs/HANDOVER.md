# Fatt Pundit website — handover

A static site (Astro). No server, no database: every page is built ahead of time and served from a CDN. Content lives in three JSON files; a few things switch on with settings in the host.

## Day-to-day changes

| I want to… | Where | Who |
| --- | --- | --- |
| Change tonight's specials | The Google Sheet (columns `branch`, `line`, `from`, `to`). `branch` = `soho`, `covent-garden` or `all`; `line` up to 24 characters; dates optional (YYYY-MM-DD). | Restaurant staff |
| Change opening hours, phone, address, booking link | `src/data/branches.json` | Developer |
| Change dishes, descriptions, prices, diet tags | `src/data/dishes.json` | Developer |
| Change which dishes are on which menu | `src/data/menus.json` | Developer |
| Gift vouchers link | `vouchersUrl` in `src/data/branches.json` | Developer |

After a JSON change: `npm run build`. `scripts/validate-data.mjs` runs first and stops the build if data is broken (missing dish, bad hours).

## Host settings (environment variables)

| Setting | What it does |
| --- | --- |
| `PUBLIC_LAUNCH=true` | **Launch day.** Removes the preview banner, lets search engines in (robots.txt, no `noindex`). |
| `SPECIALS_CSV_URL` / `PUBLIC_SPECIALS_CSV_URL` | The Sheet's "Publish to web → CSV" link. Build reads the first; the page re-reads the second so changes show without a rebuild. |
| `PUBLIC_PLAUSIBLE_DOMAIN` | Turns on cookie-free analytics (visits, Book clicks, passport stamps, real-phone speed). |
| `PUBLIC_NEWSLETTER_ACTION` | The email tool's form address (Mailchimp, Klaviyo…). Shows the footer sign-up. |

## Launch checklist

- [ ] Licensed American Typewriter web fonts in `src/assets/fonts/american-typewriter/` (same file names)
- [ ] Client confirms the draft wording marked in italics on Allergens, Privacy, Booking terms, Accessibility
- [ ] Test one real booking hand-off each: OpenTable (Soho) and SevenRooms (Covent Garden) open with party, date and time filled in
- [ ] Real photos replace upscaled ones; Soho photos added
- [ ] `node scripts/make-og.mjs` after any name or address change (share cards in `public/og/`)
- [ ] Set `PUBLIC_LAUNCH=true`, deploy, submit `/sitemap.xml` in Google Search Console
- [ ] Phone check on one iPhone and one mid-range Android

## Keeping it fast

`npm run perf:budget` (with `npx astro preview` running) checks every page against the budgets and fails if one slips: Lighthouse mobile ≥ 90, TBT ≤ 200 ms, CLS ≤ 0.05, page weight ≤ 1.1 MB, dropped scroll frames ≤ 2 %.

Rules that keep scrolling smooth (details in `tasks/lessons.md`):
- Scroll scenes only move `transform` and `opacity`. No `filter`, big blurred shadows, width or height.
- First screen paints finished; intros play over it.
- Detailed vector art that zooms is shipped as a picture.
- Rain and steam start after the page is idle and halve their frame rate on slow phones.

## Hosting

`public/_headers` sets a one-year cache on built files and basic security headers (Cloudflare Pages and Netlify read it). Build command `npm run build`, output folder `dist`.
