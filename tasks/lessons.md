# Lessons

Review at the start of every session. Add a line after any correction.

- Astro here is v7: content config lives at `src/content.config.ts`, collections use `file()` loaders, Zod comes from `astro/zod` (Zod 4: `z.email()`, `z.url()`).
- Fonts use Astro's built-in `fonts` config with `fontProviders.local()`; load them per page with `<Font cssVariable=... />` from `astro:assets`.
- Menu data source of truth = live site (18 Nov 2026), not the guidelines PDF. Differences live in docs/content-discrepancies.md until the client confirms.
- Covent Garden books through SevenRooms, Soho through OpenTable (old site embeds). Don't trust the old home page's ResDiary link.
