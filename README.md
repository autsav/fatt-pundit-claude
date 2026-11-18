# Fatt Pundit website

One site for Fatt Pundit Soho, Covent Garden and Dubai. Astro 7 (static) + Tailwind 4 + TypeScript.

```bash
npm install
npm run dev          # http://localhost:4321  (internal check page: /styleguide/)
npm run build        # runs scripts/validate-data.mjs first, then astro build
npm run check        # astro type check
```

## Where things live
| Path | What |
| --- | --- |
| src/data/branches.json | Branches: address, hours, booking, delivery, timezone, currency |
| src/data/dishes.json | Every dish and drink once: name, description, price, diet tags |
| src/data/menus.json | Menus reference dish ids; diet menus are lists of ids |
| src/content.config.ts | Zod schemas: build fails on bad data |
| scripts/validate-data.mjs | Cross-file checks (unknown dish ids, missing prices) |
| src/styles/global.css | Brand tokens from the B3 guidelines |
| src/assets/fonts/ | Self-hosted fonts (see licence note in tasks/todo.md) |
| src/assets/images/ | All images; see the README inside for expected file names |
| docs/ | Redirect map, content questions for the client |
| tasks/ | todo.md (plan + progress), lessons.md |

## Editing a price
Change it once in `src/data/dishes.json`. Every menu that lists the dish updates.
