# Lessons

Review at the start of every session. Add a line after any correction.

- Astro here is v7: content config lives at `src/content.config.ts`, collections use `file()` loaders, Zod comes from `astro/zod` (Zod 4: `z.email()`, `z.url()`).
- Fonts use Astro's built-in `fonts` config with `fontProviders.local()`; load them per page with `<Font cssVariable=... />` from `astro:assets`.
- Menu data source of truth = live site (18 Nov 2026), not the guidelines PDF. Differences live in docs/content-discrepancies.md until the client confirms.
- Covent Garden books through SevenRooms, Soho through OpenTable (old site embeds). Don't trust the old home page's ResDiary link.
- Never select by a data-attribute that is also set on <html> (data-arrival): querySelector('[data-arrival]') returned <html> and .remove() wiped the page. Use a unique overlay attribute.
- CSS custom properties holding url() resolve against the stylesheet, not the page: put mask-image URLs directly in the inline style.
- Demo export: Vite's preload helper prefixes "/"; scripts/export-demo.mjs rewrites it to page-relative. Host reserves "_" prefixes, so assets ship in assets/.
- SplitFlapText: a full-drum spin reads as noise; cap trips with maxFlips and fire follow-ups from onSettled, not timers.
- anime.js draw: set strokeDasharray as an SVG attribute, never inline style (inline style wins and the draw never shows).
- Calm mode must show the END state of a scrubbed scene, including moving parts (ship parked at London), not the start.
- A crossfade between two maps only reads as one camera move if transform-origin + scale are solved from shared city points.
- Headless screenshots of a WebGL canvas that is partly off screen can come back black or transparent. Check the real pixels with gl.readPixels before "fixing" the shader.
- Paginating content into fixed pages: measure real block heights in a hidden copy (cqw units scale with width), don't guess from character counts.
- Layers that must move together (a paper sheet and its wash) go in ONE element; a separate unrotated overlay leaves a wedge.
