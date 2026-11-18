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
- Multi-page static demo on a sub-path: give sub-pages <base href="../"> and rewrite internal links to explicit index.html paths; hash-only links on sub-pages must point at their own page or <base> sends them home.
- import.meta.glob with eager:true emits every matched file: glob only the folders the page needs.
- Sticky scenes under a sticky site header need top/height offset by the header, or their headings hide under it.
- Astro scoped styles don't reach elements rendered inside a child component (a <video> from LoopVideo): style them with :global() from the page.
- Check AI motion clips by numbers, not just eyes: diff each frame against the source photo (mean diff + % pixels changed), then look.
- Scroll triggers ("at mid-screen") must fire where people actually stop: test at phone size; trigger when the element's middle passes ~65% down, not dead centre.
- Light added on a bright photo is invisible: darken the scene first (multiply grade), then add the glow (screen blend) — contrast sells it.
- A camera over a big detailed map: one pre-drawn image moved by transform only (will-change), plus a light SVG overlay whose viewBox follows the same camera. Draw the chart wider than the route so the camera never sees its edge.
- Thin line art (the gold junk) disappears on a busy background: put it on a solid badge.
- Test touch gestures with the target fully on screen and clear of the sticky header, or the test swipes the header.
- window.open(url, '_blank', 'noopener') ALWAYS returns null, so it can't detect a blocked pop-up. Open without the feature, then set w.opener = null; fall back to same-tab only when w is null.

- User feedback 18 Nov (phone): blur, foggy glows, unreadable logo, text spilling out of plates, page opening at the bottom. Root lesson: review every scene on a real phone-size screenshot before publishing, and never put text or the logo on a busy photo, stretch a 1024px photo full-screen, or let decorative light cover a photo.
- The Claude app viewer can keep the previous page's scroll on navigation: pages must reset to top themselves (keep back-button restore).
- AI upscalers invent fine lettering (faint Chinese characters became fake glyphs). Always check text areas side by side at 1:1 before using an upscale; a whole-image drift number won't catch it.
- Small round labels (plates ~55px on phones) can't hold names: show the short fact (price) on the shape and the full name in a caption line nearby. Size names from the longest word with container units.
- CSS @container units measure the content box (inside padding/border) — set thresholds and formulas against that, not the outer shape.
- An overflow checker must skip deliberately hidden things (skip links, off-screen tracks, clipped book pages) and treat zero-size boxes carefully, or the noise hides the real issues.

- Links inside a React island break in the sub-path demo (the exporter only rewrites static HTML). Put link-heavy UI in an Astro component and slot it into the island; use document-level click delegation, since the island can re-mount slotted HTML (listeners on the old nodes are lost).
- Astro's <astro-slot> wrapper is display:block inside islands: it shrinks to content in a flex parent. Size it from the parent ([&>*]:w-full).

- Scroll stutter in headless came from raster, not JS: an SVG <img> under a zooming camera re-rasterises per zoom (1.4 s raster). Ship detailed vector art as a picture when it's scaled by transform; cap layer size in device px.
- Animate opacity of a dark layer, never `filter: brightness`, inside scroll scenes. Write transform/opacity straight onto elements instead of custom properties on a parent (whole-subtree style recalc per frame).
- An intro that starts at opacity 0 makes it the LCP element and drags LCP to the end of the intro. Paint it finished; animate a press, not an appearance.
- Lighthouse simulated LCP counts high-priority JS before paint: `client:load` islands in the hero cost ~1 s of lab LCP; `client:idle` fixed it. Check `observedLargestContentfulPaint` before chasing lab LCP.
- Inlining all CSS (88 KB) made FCP slower than three cached files. Measure before keeping a "best practice".
- Distressed one-colour stamps: palette PNG (sharp png quality<100) is 3× smaller than WebP/AVIF; the noise is what costs bytes.
- To find what janks: record scrollY of slow frames, then trace — `RasterTask` vs `FunctionCall` tells raster from script.
- Visually hidden inputs (`position:absolute; opacity:0`) inside a horizontal scroller escape it unless their label is `position:relative` — they widened the whole page to 566px.
- A `<fieldset>` defaults to `min-width: min-content`; give it `min-width:0` inside flex/grid or its nowrap children push the page wide.
- JS-filled text that changes line count after first paint (live status, clocks) is a layout shift: reserve the width and `nowrap` it. Preloading the font a hero line uses fixed the rest (CLS 0.17 → 0.001).
- Lab LCP for text adds preloaded fonts; judge real paint by `observedLargestContentfulPaint` and keep CLS fixes.
- Scoped Astro CSS doesn't reach elements made in JS; use `.parent :global(.child)`.
- Detached `requestIdleCallback` throws "Illegal invocation"; call it on `window`.
