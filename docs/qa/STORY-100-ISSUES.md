# /our-story/: 100 issues, ranked

**Date:** 23 Nov 2026
**Method:** four audits run in parallel, read-only:
- **A**: opening, Canton, Tangra
- **B**: Something new
- **C**: London and Next stop
- **D**: finale map, `#end`, page-wide flicker and global issues

Coverage:
- Screenshots in Playwright or Chrome at 390x844, 768x1024, 1024x700, 1280x800, 1440x900, 1920x1080 and 2560x1440, at 2-99% of each scroll track, waiting for images to decode.
- CDP probes: LayerTree paint counts, a layer census at DPR 2, a screencast A-B-A flash detector, trace compositing-failure reasons, A/B runs with Lenis off and images pre-decoded, and an image-alpha scan.

Gaps:
- The disk filled up during the audits. The opening stage was checked in code only. Canton scene 1 at 1440 and 2560 was captured at 0-8% only. `#end` was not captured at 768, 1024 or 1920.
- All runs used the dev server. Its image endpoint makes pop-in look worse than it will in production.

**Severity:** **P0** broken, **P1** looks amateur, **P2** polish. **Totals: P0 14, P1 49, P2 37.**
**Source tags:** `[A6]` is audit A, issue 6. `F1`-`F6` are audit D's flicker causes. Issues that appeared in more than one audit are merged into one entry that lists every place they show.
**File abbreviations:**

| Abbr. | File |
|---|---|
| GC | `src/styles/global.css` |
| SS | `src/components/story/StoryScene.astro` |
| SA | `src/components/story/SceneArt.astro` |
| RC | `src/components/story/RouteChart.astro` |
| OP | `src/components/story/StoryOpening.astro` |
| CA | `src/components/story/scenes/ChapterCanton.astro` |
| TG | `src/components/story/scenes/ChapterTangra.astro` |
| SN | `src/components/story/scenes/ChapterSomethingNew.astro` |
| LS | `src/lib/lazy-susan.ts` |
| LO | `src/components/story/scenes/ChapterLondon.astro` |
| NS | `src/components/story/scenes/ChapterNextStop.astro` |
| SM | `src/components/story/StoryMap.astro` |
| TS | `src/components/story/TastingStrip.astro` |
| CT | `src/components/story/ChooseTiger.astro` |
| OS | `src/pages/our-story.astro` |
| CR | `src/components/site/ChapterRail.astro` |

## Decisions already taken by the owner

1. **Remove the finale world map (StoryMap).** It repeats routes that Canton, London and Next stop already draw, and it is the worst repaint layer on the page (51 repaints). `#end` takes over the hand-off and the branch cards (#13, #99). This makes audit items C17, D14 and D15 (map pins, stamps, phone collisions) moot, so they are not counted.
2. **Recreate the Soho storefront as paper-cut art instead of the photo** (#10, #50, #51, #85-87). The spec is in the art tables below (layers S0-S12) and audit C, "Storefront art".
3. **Re-present the Covent Garden interiors artistically.**
   - Recommended: a pop-up-book diorama (two spreads: the mirror room and the mural room).
   - Interim: postcards pinned to a cork wall.
   - This retires the giant arch mechanism (#11, #12, #54-56, #88-91).
4. **Redesign the friends' table.** Recommended: a side-on banquet, the "puppet counter" (audit B, direction B). Issues #42-49 describe the current lazy Susan. They stay listed as acceptance checks for the redesign.
5. **Re-crop Lady Kenny and show the dishes professionally.** Recommended: uniform 4:5 menu-card prints in a 3x2 grid (#60-63). For Lady Kenny, crop x110-710, y274-1024 of `lady_kenny_new.png`.

Owner art rule (from `layers/README.md:8`): AI generation is fine for backgrounds, props and textures. Characters are drawn by an illustrator only.

---

## The 100 issues

### P0: broken (14)

1. [P0] **Two captions print at once at every caption change.** Where: page-wide, all widths (Canton 52-55%, Tangra 40/66%, SN 26/63%, London 62-65%, Next stop 47-50%). Cause: the outgoing caption fades on an ease-in and the incoming one on an ease-out, over the same 3% and in one grid cell (GC:220,225-228,277, plus every chapter's caption ranges), so the taller caption's extra line pokes out ("…the road." ghost). Fix: one plate per scene whose text spans swap in sequence, with the plate sized to the tallest. At minimum, out over [t-2,t] then in over [t,t+2.5], and hold the last caption to 100%. [A6 B30 C7 D9/F3]
2. [P0] **The route-chart noodle draw re-rasters a full-screen layer, so frames show the chart half-drawn or blank (the measured flicker).** Where: Canton s2, London chart, Next stop, finale. 3 flash frames at London y≈11500-11960, still there with Lenis off and with every image pre-decoded. Cause: `fx-draw` animates `stroke-dashoffset` through an SVG `<mask>` that sits in the same layer as the 3200px `.rc-sea` (RC:57,128-132,179; GC:256). Fix: give `.rc-sea` and `.rc-svg` their own layers (`will-change:transform; contain:paint`), drop the mask, and dash the strokes directly with `pathLength="1"`. [D2/F1]
3. [P0] **Pundit is buried behind the sacks, then leaves the market he is leading Fatt to.** Where: Tangra, 1024-2560 at 56-72% (gone entirely at 2560), 390 at 62%. Cause: DOM order paints `tg-sacks` (TG:51) over `tg-pundit` (TG:48). The sacks rise over 56-70% (TG:120) while Pundit fades out at 68-72% (TG:115), under the caption "Pundit takes him to the spice market". Fix: keep him for the beat (exit range to 100%, on the cast layer, #16), or have him walk out (`--x1:-30vw`) before 56%. [A1]
4. [P0] **Fatt in the spice market is hidden at 1440 and wider, and floats on top of the sacks on phones.** Where: Tangra, 2560 at 75-98% (only an ear shows, and "Show me." floats over nothing), 1024 at 75%, 390 at 70-98%. Cause: the sacks are `104vw` and grow with width (TG:120,145), while Fatt is `min(22vw,320px)` with his feet placed in % of stage height (TG:122,149). Fix: one `.tg-market` box with the aspect ratio of `spice-sacks.webp` that holds the sacks and Fatt, with Fatt placed in % of the sack art (waist on the rim). Phones change only the box. [A2]
5. [P0] **The wok street dissolves through a ghost plate.** Where: SN, all widths, 36-41%. Cause: `.sn-steam-set` is `fx-fade` over 36-40% (SN:51,115) while `.sn-wok-out` only starts fading at 38% (SN:92), despite the "cut, no ghost" comment (SN:91). Fix: drop `fx-fade` (keep `--y0`) and give `.sn-spot` an opaque sky-to-ground gradient so it slides up as a solid sheet. Set `.sn-wok-out` to 40-40.5%. [B26]
6. [P0] **The momos plate and the empty turntable show at the same time.** Where: SN, all widths, 58-63%. Cause: `.sn-photos` fades out over 58-63% (SN:114) while `.sn-susan` fades in over 56-62% (SN:132). Fix: cut instead of dissolving: photos out 57.5-58.5%, table in 58-62%. In the banquet design, the momos become dish 0 on the counter. [B3]
7. [P0] **The tigers are hidden behind the table.** Where: SN, all widths, 86-100%: only their heads show, and before 90% nothing shows. Cause: the cast is `top:-26%; width:56%; z-index:1` under the table at z 2 (SN:133,136), so 59% of the art is under the cloth; `--y0:30%` starts them lower still, and the rock pivots on their hidden feet. Fix: build the banquet (decision 4). Short-term patch: `top:-48%; width:64%`, with the far rim on the art's own table line (y≈59%). [B1]
8. [P0] **The dish name tag is cut off by the bottom of the viewport.** Where: SN, 768x1024 at 70-99% (tag at y 1008-1044 of 1024); 1024x700 sits right at the edge. Cause: the table hangs about 10svh below the stage (SN:132) and the tag sits at `top:74%` of that box (SN:140). Fix: anchor the tag to the stage (`bottom:calc(var(--floor) + 4svh)`) or under the front dish, and stop hanging the table off-stage. [B2]
9. [P0] **The mock-chicken pan is visibly cropped: a straight vertical cut through the pan and a missing handle.** Where: SN table, all widths, worst at 1440 94%. Cause: `food/mock-chicken-pan.png` (900x827) was cut from a larger photo; the hakka and crab images also touch all four edges. Fix: re-cut with a 4-6% transparent margin, or use `bombay-chilli-mock-chicken.png`. Add an asset check: no opaque pixel within 2px of the edge. [B4]
10. [P0] **The Soho street is soft and blocky (decision 2: recreate it as paper-cut).** Where: London, 1440 and wider at 35-72% (mush under sharp rain lines at 2560). Cause: `layers/soho-night.webp` is 1024x825, and SA:34 caps widths at the source width, so the srcset collapses to 1024 (LO:56,92). It is stretched 1.4-2.5x (3-5x on retina). Fix: build the paper-cut storefront (S0-S12) from SVG flat shapes plus WebP layers at least 3200px wide. Stopgap: a source at least 2880px wide. [C3]
11. [P0] **The Covent Garden arch layers are too big to raster, so the window shows solid ink instead of the room photo, and the page checkerboards.** Where: London, 1440 at 66-67%. There are 8 layers of 3060x4284px (33.6 Mpx each at 2560), and 206 layers on the page (≈200 Mpx). Cause: the arches are built at 4.6-4.76 stage heights (`--ah` 460/476) with `will-change` and a mask, then scaled down to 0.1 (LO:110-118). Fix: the pop-up book (decision 3). Meanwhile, drop `will-change`, size the arch `max(260cqh,140cqw)`, and hide rooms outside their range (#65). [C1 D3/F2]
12. [P0] **Each room scales 10x (13x on phones) in about one wheel notch.** Where: London, all widths, 66-98%: 108-126px of scroll at 900px tall, 76px on a phone. Cause: 6-7% ranges (LO:120-123) on a 300vh/250vh track (LO:43). Fix: at least 250-300px of scroll per reveal: London to 420vh (phone 360vh), or fewer rooms. The book's motion score replaces this. [C2]
13. [P0] **The finale world map replays the routes and is the worst repaint layer (decision 1: remove it).** Where: finale, all widths, a 300vh track (2796px). Cause: StoryMap redraws the legs that Canton, London and Next stop already drew (SM:44-56,202). It adds a third copy of the 3200px sea and repaints 51 times (OS:76). Fix:
    - Delete `<StoryMap>` and its import.
    - Give `#end` the torn top edge (`margin-top:calc(-1*var(--edge-h))` plus `--torn-top`, as in SM:205-207).
    - Drop the `.story-map::after` band.
    - Branch content moves to #99; the full-journey view moves to #94.
    [D1 C15]
14. [P0] **The dish plates are blank (shadow only) until they glide on screen.** Where: `#end`, 1440 at 0% and 35%, 390 at 25%. Cause: `loading="lazy"` (TS:39) on images that sit off-screen horizontally inside `.story-end{overflow-x:clip}` (TS:69), so they never intersect before the glide brings them in. Fix: `loading="eager" fetchpriority="low"` (nine small WebPs). The menu-card grid (#60) removes the glide altogether. [D4]

### P1: looks amateur (49)

15. [P1] **Bubbles drift off their speakers as the window changes shape, and tails ignore the data.** Where:
    - Tangra: "Show me." floats 250px above the roofs at 768 75-80%, and "where is the fire?" sits on the facade at 768 46%.
    - SN: the tail of "More chilli!" lands on the wok at 768-2560 (SN:108).

    Cause: bubbles are placed in % of stage height (TG:117,132) while speakers are sized in vw; `tail-left` is hardcoded (TG:76,79; CA:49,65) although `story.ts:105` says `right`. Fix: an engine `.cast` group that holds the art plus the bubble, with the bubble placed in % of the character (`--bx/--by`), the rock on `.cast-art` only, a flip variant, and `tail-${b.tail}` taken from the data. [A7 A9 B16]
16. [P1] **There is no layer contract: whether a character shows in front of a prop depends on DOM order and one-off z-index values.** Where: Tangra sacks over Pundit (#3), SN cast behind the table at z 1/2 (#7), Next stop tigers at `z-index:-1` (#59). Cause: no engine rule in the GC story section. Fix: z tiers in GC (`.prop` 0, `.cast` 1, `.prop-front` 2, bubbles and sfx 3). Chapters tag their layers and never rely on source order. [A1 B1 C14]
17. [P1] **The set and the cast scale in different units, so the composition only holds near 16:10.** Where:
    - Tangra cast at 2560 is about 1/8 of the frame height and the stall looks like a toy (TG:104,115,122).
    - Canton ship and Fatt (CA:86,95).
    - The momos plate is 22% of the frame at 2560 (SN:113).

    Cause: the cast uses `min(Nvw,px)` while backdrops are 104-112vw. Fix: an engine scene unit, `--u:min(1vw,calc(100svh/56.25))`. Size the cast and props in `--u` and backdrops as `max(112vw,calc(112*var(--u)))`, and drop the px caps. [A11 A27 B29]
18. [P1] **Scene images decode late and pop in on a pinned stage.** Where: a Canton layer at y=3524; Soho painted as a 190px strip at 35-64%; the London chart all ink on a cold load; SN blank for over a second in dev. Cause: SA:50-52 uses `lazy`/`async`, SS:39,43 switches to eager only 1.5 screens ahead and never calls `decode()`, and `warm` is not set on `soho-night` (LO:56). Fix:
    - `rootMargin:'300% 0px'`, and warm the next chapter too.
    - `await img.decode()` before a layer is revealed, and `fetchpriority=high` on each chapter's first backdrop.
    - Cap scene-layer `sizes` at 2000w for DPR 1.
    - Test on `build && preview`, not dev.

    [B21 C21 D12/F4 D25]
19. [P1] **90 scroll-driven animations are not composited (Chrome reason 64), costing about one style recalc per frame.** Where: page-wide. Cause: `.fx-then-out` stacks `fx-move` (which animates opacity) with `fx-out` (also opacity), and `.fx-puppet` stacks `transform` with `rotate` (GC:220,231-234). Fix: put the exit on a wrapper, or give then-out layers a variant of `fx-move` that does not animate opacity. Put the rock on a child element. [D10/F6]
20. [P1] **Captions are too small on big screens and leave orphans on phones.** Where: page-wide. The size tops out at 26px on 2560 (a thin strip); at 390 captions run to 3 lines into the sun and hills band, and "the road." sits alone on line 2. Cause: GC:277 uses `clamp(…,26px)` and 42ch with no `text-wrap`. Fix: `clamp(17px,.9vw + .9svh,28px)`, `max-width:min(36ch,100%)`, `padding:.5em .9em`, `text-wrap:balance`. Check the heavy typewriter face at 1920. [A22 D21]
21. [P1] **Bubble text is fixed in px and too small.** Where: page-wide. 14px bold at 1024 46% (the pill takes about 4% of the frame), 18px at 2560, and "the / fire?" breaks badly at 1440. Cause: GC:165,278 `clamp(14px,1.3vw,18px)` with `max-width:min(34vw,300px)`. Fix: scale with the speaker: `clamp(15px,calc(var(--u)*1.5),26px)`, `max-width:calc(var(--u)*28)`, `text-wrap:balance`. [A24]
22. [P1] **The kinetic chapter titles scramble into typos mid-flight.** Where: opening, Canton, Tangra and London title cards, 390-1024 at 3% ("A LONG WAY FRO MHOME"). Cause: each letter gets a pseudo-random `--x1:((i*37)%17-8)*.6vw`, so neighbours cross (CA:22, TG:33, OP:17-31), and the scatter runs over the same 1-8% as the card's fade (CA:75). Fix: the engine `.tl` rule derives the motion from `--i/--n`, either outward (`calc((i - n/2)*.5vw)`) or lift-and-fade only, staggered by `i*.25%`, with the card fading from 5%. Chapters set only `--i/--n`. [A16]
23. [P1] **Lenis moves the scroll position from JS every frame.** Where: page-wide (OS:137-153). Cause: every scroll-timeline frame waits for the main thread. The flashes persist with Lenis off, so it contributes but is not the root cause. Fix: delete Lenis; native scroll timelines are already smooth. If the glide must stay, raise `lerp` to 0.12-0.15. [D11/F5]
24. [P1] **The sea chart is one 3200px AVIF with no srcset, shared by four charts.** Where: page-wide (Canton, London, Next stop, finale); at 390 the finale chart was missing at 95%. Cause: RC:57, so phones decode 3200x2458 (about 31 MB). Fix: `srcset` at 1600/2400/3200 with `sizes` derived from `--rc-w`. [D13]
25. [P1] **Two title screens over two styles of dawn harbour come before the first line of story.** Where: opening plus Canton 0-12%, about 2 screens. Cause: the painted harbour (OP:38) is followed by a paper-cut harbour (CA:33-36), and the OP:3-4 docblock promises a rising sun that the opening does not have. Fix: the opening card becomes chapter one's title. Drop `.sh-title`, start cap1 at 4%, and cut the opening track to about 120vh. [A17]
26. [P1] **The compass lands on top of Fatt at the bow.** Where: Canton s1, 390 at 75-99%. Cause: `.sh-compass{left:var(--gutter)}` (CA:89), where the 86vw phone ship (CA:112) puts its bow and Fatt. Fix: on phones `left:auto; right:var(--gutter)` and higher up, or `display:none`. [A4]
27. [P1] **The at-sea compass covers the Guangdong token, stamp and name ("Guangdon").** Where: Canton s2, 390 at 0-60%. Cause: the phone rule `top:calc(var(--top)+150px)` (CA:117) lands on `focusPhone=[1020,855]`/`yPhone=46` (CA:57). Fix: anchor it bottom-left above the strip, or make it a RouteChart slot overlay at a chosen map coordinate. [A5]
28. [P1] **"Soup's ready!" comes from nobody.** Where: Canton s2, 390 at 47%: the bubble floats over dark water and Fatt is not on stage. Cause: `.ss-bubble` kept its position after the junk was removed (CA:107-108). Fix: put the bubble in the RouteChart slot at the token's leg-1 point for 30-33%, or fold the line into the caption. [A8]
29. [P1] **Canton scene 2's bottom strip is a dead, muddy band with a ruler-straight seam.** Where: 390/768 at 0-99%. Cause: the daylight `harbour-water` strip (CA:58) is darkened by `.ss-night` `--o1:.9` (CA:103) under the ink chart. Fix: fade the strip out with the night (10-30%) and let RouteChart fill the stage (`.rc` is already `inset:0`), or feather the join with a mask gradient. [A19]
30. [P1] **A second map, in a different style, labels Calcutta again right after Canton's chart.** Where: Tangra 0-12% (Canton s2 at 99%, then Tangra 2-10%). Cause: Tangra has its own sepia `world-land.svg` chart with a different crop and line weight (TG:38-41,94-95). Fix: drop it and open on the title card over the rising lane, with the torn edge as the hand-off. Or open on RouteChart `finished` with Canton's final focus and zoom. [A15]
31. [P1] **The chart zoom blurs Calcutta at 2.6x.** Where: Tangra 20-24% at 1024 and 1440. Cause: an `<img>` of the SVG with `will-change:transform` and `--s1:2.6` is rasterised at 1x and then scaled up (TG:93-94). Fix: render it at 2.6x and scale from 1/2.6 to 1, or use a 2x raster. Moot if #30 drops the map. [A13]
32. [P1] **The lane stall has no cook.** Where: Tangra, all widths, 20-55%. The caption says "Fatt sets up his wok by the road" over an unmanned wok, and Pundit tastes from it. Cause: there is no Fatt layer until 66%. Fix: add `tangra-fatt` behind the counter, in a stall box or cast group, entering at 18-26% with the steam. Stopgap: a mirrored `spice-fatt`. [A18]
33. [P1] **Portrait screens show a 35-40% band of blank sky.** Where: Tangra 390 at 40-98% (about 330px) and 768 at 46-98% (about 350px); Canton shows a milder version. Cause: the panoramas are sized by width and anchored at the bottom (TG:139-140). Fix: `@media (max-aspect-ratio:4/5){.tg-far{width:auto;height:72svh;left:50%;translate:-58% 0}}`, or a portrait-only `tangra-lane-top` prop. Move the garlands and sfx into the band. [A12]
34. [P1] **The garlands bunch up under the caption plate on phones.** Where: Tangra 390 at 62-98%; the rope runs behind the plate edge. Cause: the phone overrides use `!important` against inline styles at `top` 9%/15% (TG:147-148). Fix: drive the garlands with `--gt/--gl/--gw` and override those on phones (`--gt:calc(var(--top) + 9rem)`), with no `!important`. [A10]
35. [P1] **The falling chillies stop in mid-air and stay there.** Where: Tangra 768 at 80-98% (a row 300px above the sacks); 390, 1440 and 2560 at 75%. Cause: `.tg-chilli{top:0;--y1:38vh}` (TG:130; 52vh on phones, TG:146) lands at a share of height while the sacks scale with width, and `fx-fade` has no exit. Fix: put the chillies inside `.tg-market` (#4) with their bottom at the rim, or use `fx-then-out` so they vanish into the sacks, at `z-index:0` under the front rim. [A3]
36. [P1] **"SIZZLE!" covers the wok, the noodles and Pundit's face, and is clipped on phones.** Where: SN wok, 1024-1920 at 10-20%; at 390 its box spans x178-393, wider than the stage. Cause: SN:97 (`left:34%;top:42%`) and SN:153 (`left:46%;top:52%`). Fix: on desktop `top:30%` between the lanterns, or `left:22%;top:58%`. On phones `left:6%;top:58%;font-size:clamp(30px,10vw,48px)`. [B15]
37. [P1] **On phones Pundit floats above the street and overlaps Fatt's wok.** Where: SN wok, 390. Cause: Pundit sits at `floor+36%` and Fatt at 26% (SN:147-148), and their boxes overlap by 90px. Fix: one ground line for both, `calc(var(--floor)+24%)`. Pundit `left:80%;width:40vw`; Fatt `left:34%;width:60vw;z-index:3`. [B17]
38. [P1] **The momos plate is tiny on big screens and soft on retina, and the dish `sizes` are wrong.** Where: SN momos 36-63%: 22% of the frame at 2560, 1.8x upscaled at DPR 2 1440. Cause: `--pw:min(40vw,560px)` (SN:113) with a 612w source (SN:53), and dish `sizes="…200px"` (SN:68) while dishes render at 254-410px. Fix: a momos source of 1400px or more, `--pw:min(40vw,62svh)`, and dish `sizes="(max-width:599px) 32vw, min(26vw,30svh)"` with widths [320,480,720]. [B29]
39. [P1] **The caption introduces Fatt and Pundit over an empty table.** Where: SN table, 63-86%. Cause: `sn-cap3` arrives at 63-66% (SN:143) but the cast only rises at 86-92% (SN:136). Fix: bring the cast in with the table or counter at 58-64%, and let the turn play in front of them. [B10]
40. [P1] **The table leaves a dead band of empty sand above it.** Where: SN table, before 86%: about 600px at 768, 250px at 390, 190px at 1440, 120px at 1024. Cause: it is sized `min(92vw,112svh)` / `130vw` and anchored only at the bottom (SN:132,157). Fix: size it by the space below the caption (`height:min(55svh,…)`), and fill the upper band with the cast and a lantern back wall (banquet). [B9]
41. [P1] **The tiger art faces inward at its own small table, not out at the feast.** Where: SN table; heads are 70-90px at 1440 and 45px at 390. Cause: `friends-table.webp` (1776x1336) is a profile pose at a small table. Fix: in the banquet, put the counter's top edge on the art's table line (y≈59%) so it hides their table and stools. Optional: an illustrator "seated, facing out" pose. [B11]
42. [P1] **The dish photos were shot from different camera angles (30-75°), and two bring their own boards.** Where: SN table, all widths. Cause: momos about 35°, hakka about 70°, mock chicken about 30°, crab about 75°, sticky and malabar about 45°. Fix: one angle family (about 40°) for the banquet. Interim: keep momos, mock chicken, sticky and malabar, and drop crab and hakka. [B5]
43. [P1] **Every dish is drawn at the same width.** Where: SN table. Cause: `W = 24` cqw for every dish (LS:17), so heights jump with each image's aspect ratio (crab 1.45, sticky 1.07). Fix: a per-dish `w` in the `susanDishes()` input, normalised to the plate diameter. [B6]
44. [P1] **Dishes hang off the turntable, collide, and the back ones poke up over the tigers' chins.** Where: SN table, 1440 at 94% (a pan in front of Fatt's mouth). Cause: a ride radius of 26cqw plus 25cqw-wide dishes on a 30.4cqw disc, 60° spacing that overlaps about 40%, and `translate(-50%,-78%)` (LS:15-17,71). Fix: radius ≤ 22, width ≤ 17, at most 5 dishes at 72°, anchored at the base with `translate(-50%,-92%)`. [B7]
45. [P1] **The size change from back to front is far too strong for this table's tilt.** Where: SN table. Cause: dishes scale from 0.56 to 1.06 (LS:71), while the 0.365 ellipse implies about a 21° tilt. Fix: `scale(0.82 + 0.18*depth)`. [B8]
46. [P1] **The photo cut-outs and the paper-cut art share no treatment.** Where: SN table and the momos plate. Cause: a CSS drop-shadow is the only bridge (SN:137). Fix: a die-cut paper-white sticker border, 6-10% multiply paper grain on `.sn-slot::after`, and a flat contact-shadow ellipse instead of a blur. [B12]
47. [P1] **The dish name tag sits far from its dish, and the torn edge covers it at 99%.** Where: SN table, 70-99%: about 200px away at 1440, 120px at 390. Cause: the tag is on the front drape at 74% of the box while the dish centre is at about 41% (SN:140). Fix: put the tag under the front dish, or make it a toothpick flag in the dish. End the last tag at 96%. [B13]
48. [P1] **Six drop-shadowed images re-rasterise every frame during the turn.** Where: SN table, 72-96%. Cause: `filter:drop-shadow` sits on images whose `.sn-slot` parent animates `scale` (SN:137). Fix: bake the shadow and outline into the PNG, or use an unfiltered `span.sn-slot-shadow` gradient. [B23]
49. [P1] **z-index is animated on the main thread, with 81 step-end keyframes per dish.** Where: SN table. Cause: `sn-susan-z-*` (LS:72,77) restacks the dishes and repaints the filtered overlaps. Fix: a static order with 5 dishes or fewer, or back and front groups with an opacity hand-off at `CX±RX`. The banquet needs only one compositor transform. [B24]
50. [P1] **Soho and the four interiors are photoreal; every other chapter is paper-cut (decisions 2 and 3).** Where: London, all widths, 30-98%. Cause: photos at LO:13-17,56. `layers/README.md:29` says the file is a generated paper-cut with no lettering, but it is now a retouched photo. Fix: the storefront layers (S0-S12) plus the pop-up book. The README provenance row is updated by W1, which owns that file. [C5]
51. [P1] **The "FATT PUNDIT" sign is hidden under the header and caption, and phones show only the door.** Where: London, 1440 and wider at 32-72%; half covered at 768; at 390 no sign, no 77, no poster. Cause: centred `object-fit:cover` (LO:92) with the sign at source y≈110 of 825, and captions at the top (GC:276). Fix: compose the new art with the sign band at 28-38% of stage height, plus a portrait comp or phone CSS. Stopgap: `object-position:50% 12%`. [C4]
52. [P1] **The rain moves only while you scroll: static scratches when stopped, moiré while moving.** Where: London 1440/2560, 36-66%. Cause: a 104° `repeating-linear-gradient` of 1.5px lines (GC:318-319) moved by `--y1:50%` over 36-64% (LO:99-100). Fix: time-based rain: two sheets with `animation:lo-rain .7s linear infinite`, each moving exactly one 140px tile, 2px lines. Scroll controls only the wrapper's fade; reduced motion shows no rain. Scope it in LO; W1 deletes the dead `.scene-rain` rule. [C8]
53. [P1] **"Another sea, another kitchen." has no speaker on stage and covers the poster's "FATT PUNDIT".** Where: London 1440/1920, 44-60%. Cause: there is no tiger anywhere in the chapter (LO:76-78,103). Fix: the tigers (existing cut-outs) walk to the door at 45-52% in the storefront score, with the bubble inside their `.cast` group. [C6]
54. [P1] **No room is ever held fully open.** Where: London 1440, 73-98%. Cause: each room starts opening the moment the previous one finishes (LO:120-123). Fix: hold each room for 4-6% before the next starts, or show only 2 rooms. The book holds each spread. [C9]
55. [P1] **Rooms a, b and c are the same composition, revealed by the same arch, four times over, with no characters and no story beat.** Where: London 66-98% (LO:37,64-69). Fix: the pop-up book with two spreads (mirror room, mural room), where the tigers walk in and sit. Interim: postcards on cork. [C11]
56. [P1] **Phones crop the 3:2 room photos to about 28% of their width, so the tiger mural becomes stripes.** Where: London 390, 70-99%. Cause: the `pos` values are desktop-only (LO:37) and the images use `object-fit:cover` (LO:119). Fix: show whole prints (book polaroids or postcards). If full-bleed stays, add a per-room phone `object-position` (mural at 50% 35%). [C10]
57. [P1] **The skyline rises while the night chart is still opaque: continents show through the sky and the Dubai stamp floats on the skyline.** Where: Next stop 1440/390, 25-36%. Cause: the chart's `out={[36,37]}` (NS:37-39), the skyline and dunes rising at 20-36% (NS:87-88), and `.ns-sky` placed before RouteChart in the DOM (NS:35). Fix: chart out at 18-22%, move `.ns-sky` after RouteChart and fade it in at 18-22%, then raise the skyline at 22-36%. [C12]
58. [P1] **The Dubai set and the table cross-fade into a muddy double exposure.** Where: Next stop 1440, 45-50% (about 90px of scroll). Cause: Dubai fades out over 45-50% (NS:85-92) while the table fades in over 44-54% (NS:101,108-111). Fix: a transform-only wipe: the torn sand sheet (`--torn-top`) slides up over Dubai at 44-50% and the table drops onto it. [C13]
59. [P1] **The tigers stand behind the table so only their heads show, and Pundit is behind the lantern.** Where: Next stop 390, 66-99%. Cause: `.ns-tigers{z-index:-1}` plus a bottom offset (NS:146). Fix: on phones put the tigers in front on the left (cast tier from #16, 52vw) and set the table `--tw:86vw`. [C14]
60. [P1] **The dish "cut-outs" are elliptical vignettes of photos (decision 5: uniform 4:5 menu-card prints).** Where: `#end`, all widths. Cause: each alpha mask is an inscribed ellipse (about 78% opaque, π/4) with aspect ratios from 0.79 to 1.70. It slices through bowls and keeps the studio backgrounds, and `.disc img{max-*:100%}` (TS:55) sizes them at random. Fix:
    - A 3x2 grid: 2 columns under 600px, 3 from 768px, max 1040px wide.
    - 4:5 `object-fit:cover` crops at 800/1200w, cut from the originals in `assets/images/dishes`.
    - The `.scene-photo` frame and `.fp-photo` grade (GC:313,87).
    - Names and one-liners from `dishes.json`.

    [D5]
61. [P1] **The Lady Kenny crop cuts off the kennies and petals and leaves a grey table ring, and the file is too small.** Where: `#end`. Cause: an ellipse over `lady_kenny_new.png` (819x1024), and the served file is 630x370, below the 600w needed at 2x. Fix: a 4:5 crop at x110-710, y274-1024 (600x750), capped at 600w and served at 300 CSS px or less (or find a larger original). The plate then sits at 33-74% of the card height. [D6]
62. [P1] **The row mixes subjects and angles, and one plate has no name.** Where: `#end`. Cause: top-down bowls, a three-quarter dessert, a side-on kulhad and a portrait cocktail shot against a wall, and the cocktail pair has no label (TS:22). Fix: six dishes: pepper crab, Lady Kenny, rabbit wontons, Hakka noodles, sizzling brownie, saffron masala tea. Drop the cocktails and one of the two dark pan dishes. [D7]
63. [P1] **The rotation and the floor shadow fight the photos.** Where: `#end`, clearest at 2560. Cause: `taste-turn ±4°` (TS:63-68) makes rectangular prints wobble, and the `.disc::after` shadow sits at the box floor (TS:54) while the images bottom-align at different heights. Fix: a static tilt on each print (-1.5°, .8°, -.6°), no scroll rotation, and the shadow taken from the print frame. [D8]

### P2: polish (37)

64. [P2] **The torn-edge mask on each sticky stage composites every child through one masked surface.** Where: page-wide, 12 stages. Cause: `mask` plus `contain:paint` on `.scene-stage` (GC:239-241,267). It was not a measured flash source (3 or fewer repaints per stage), but it is a GPU blend cost every frame. Fix: draw the torn edge as a `::before` strip in the previous stage's colour, or apply the mask through a wrapper only for the first 0-5% of each stage. [B22 D28]
65. [P2] **Layers that have faded out, or not faded in yet, stay rastered and composited.** Where: page-wide: SN `.sn-wok-out` after 44%, `.sn-photos` after 63%, London rooms outside their range. Cause: the `fx` keyframes only reach opacity 0; nothing sets visibility. Fix: an engine `visibility:hidden` outside each layer's range: an `fx-gone` step on then-out layers, and a hidden base with a fill-none "visible" animation over the range for layers not yet in. [B25 C1 D/F2b]
66. [P2] **The caption's top position is hardcoded to a guessed header height.** Where: page-wide: a 22px gap at 1024 and wider (header 68px vs `--top` 96px), 10px under 600px, and the torn edge shows under the caption on short landscape phones. Cause: `.scene-text{top:calc(var(--top) - 6px)}` (GC:263,276). Fix: one header-height token from site.css: `top:calc(var(--header-h) + clamp(8px,1.5svh,20px))`. [A23 D22]
67. [P2] **The puppet rock runs for whole screens, including while the puppet is hidden.** Where: Tangra `tg-spice-fatt` rocks 71-100% behind the sacks (TG:123); Canton `sh-fatt` rocks 18-100% (CA:95). Cause: a ±4° five-keyframe swing over long ranges. Fix: engine default `--rock-a:0.4`, and a rule to rock only over the spoken line (`--rock-from/--rock-to` = the bubble's range). Chapters set the ranges. [A26]
68. [P2] **Caption copy runs over the subtitle budget.** Where: Canton cap1 (92 characters) runs to 3 lines at 390. Cause: `story.ts:65` exceeds the budget in docs §6 (2 lines of 42 characters). Fix: trim or split it into two beats, and check every scene caption against 84 characters. [A22]
69. [P2] **The chapter rail is hidden below 1024px, and from 1024 to 1319px it sits over the stage's right edge.** Where: page-wide; it covers the SN queue, Tangra's "TSSSS!" and London stamps (CR:90). Fix: show it from 768px in a compact form, and publish `--rail-w` so scenes keep pins and sfx out of the right 48-72px. [D23]
70. [P2] **The opening letters and card fade out of sync, leaving a paper with a hole in it.** Where: opening 40-60% (code only). Cause: the letters run to `--to` 34-55% (OP:22-23) while the card fades over 30-60% (OP:71). Fix: card `--from:42%;--to:58%`, letters capped at 46%, or fade the lede with the letters. [A21]
71. [P2] **The opening harbour is upscaled at 2560 and on DPR 2 1440.** Where: opening (code only). Cause: the largest source is 2688w (OP:38) and the push-in is 1.14 (OP:63), so about 2900px is needed. Fix: add 3200 and 3840 widths, or cap the push-in at 1.06 from 1920px. [A14]
72. [P2] **The LCP image is switched to eager by an inline script after parsing.** Where: opening (OP:38-40), which is lazy by default. Fix: render it `loading="eager" fetchpriority="high"` on the server and preload the 1400w candidate. [D26]
73. [P2] **"HOOONK!" sits on the sun, far from the ship.** Where: Canton s1, 768 at 40%. Cause: placed in stage %. Fix: anchor the sfx inside the ship group (`.sh-ship > .scene-sfx`). [A25]
74. [P2] **Fatt is a speck on the junk.** Where: Canton s1 15-40%: 25-30px at 390/768, at most about 136px at 1440. Cause: `.sh-fatt{width:22%}` of a `min(44vw,620px)` ship (CA:86,95). Fix: Fatt at about 30% of the ship, or push in on the bow (ship group `--s1:1.6` over 42-55%) with the bubble inside the group. [A27]
75. [P2] **"TSSSS!" sits about 600px from the wok, and its "!" runs under the chapter rail.** Where: Tangra 1024/1440, 20-30%. Cause: `right:6%;top:25%` (TG:112). Fix: anchor it inside the stall box (`left:55%;bottom:95%`) and keep `right` at least rail width plus gutter (about 72px) from 1024px. [A25]
76. [P2] **Scroll weight is uneven, and the market arrives under the wrong caption.** Where: Tangra, 290vh. The market (66-100%) gets about one screen, the bubble 72-89%, and the sacks rise at 56-70% while cap2 (out at 66-69%) still says "His first customer is Pundit". Fix: retime to beats: lane and stall 6-30%, Pundit 30-55%, market 55-100%, with the caption swap at 55%. Give the map's freed 12% (#30) to the market. [A20]
77. [P2] **Two layers animate without changing anything.** Where: SN wok. Cause: `.sn-backdrop` and `.sn-evening` carry `fx fx-fade` with `--o0`/`--o1` both 1 (SN:94-95), on a 2688px image. Fix: remove `fx fx-fade` from both. [B20]
78. [P2] **The caption, a bubble and the sfx compete between 12% and 21%.** Where: SN wok. Cause: `.sn-sizzle` is out at 18-21% while `.sn-bub1` comes in at 12-15% (SN:97,108). Fix: sfx in at 8-11% and out at 13-15%, bubble from 15%. [B18]
79. [P2] **The queue sits under the chapter rail.** Where: SN wok, 1024 and wider (1440 at 20-30%). Cause: `right:1%` (SN:104). Fix: `right:calc(var(--gutter) + 64px)`, or scale the queue down and anchor it at 74% from the left. [B19]
80. [P2] **Steam haze shows over the closed lid.** Where: SN momos, 36-44%. Cause: `.puff` sets `--o0:.9` (GC:316), and fill-backwards holds puffs 2-4 (`--from` 44/48/52, SN:123-125) visible from 36%. Fix: `.sn-puff{--o0:0}` with a 2-point fade-in inside each range. [B27]
81. [P2] **The lid starts lifting before the plate has landed.** Where: SN momos, 36-40%. Cause: `.sn-lid --from:36%` (SN:120) runs during the plate's slide-in. Fix: lid over 41-52%, with the hiss (SN:127) lined up with the lid cracking open at about 42%. [B28]
82. [P2] **The dish tag is a third type style.** Where: SN table. Cause: an ink plate with an orange offset shadow (SN:140-142). Fix: a paper tag with ink text on a string, or match `.scene-place` (GC:280). [B14]
83. [P2] **The food sources are heavy, and two are not used at all.** Where: repo and build. Cause: `food/hakka-bowl.png` (1.14 MB) and `food/momos-board.png` (0.93 MB) are unreferenced, and the other food PNGs are about 1 MB each (29 MB across 64 story files). Fix: delete the unreferenced files once W6 has moved `#end` to menu cards, and re-encode the food sources that stay. [D25]
84. [P2] **The ship token sits on the "London" label, and the title letters cross the Calcutta stamp.** Where: London chart, 1440 at 28-30% and at 5%. Cause: London uses `side:'left'` (LO:53). Fix: `side:'right'` on desktop, or hide the token once it lands. The title letters are fixed by #22. [C16]
85. [P2] **Magenta "neon pools" read as a colour cast, not light.** Where: London 1440/1920, 45-62%. Cause: free-floating radial gradients (LO:95-96). Fix: tie the glow to a drawn sign (blade-sign halo plus a pavement reflection, with a 2-step flicker) and delete the pools. [C18]
86. [P2] **`.lo-dusk` is invisible but costs a full-stage layer.** Where: London 34-67%. Cause: 0.14 opacity ink over an already dark photo (LO:57,93). Fix: delete it, or reuse it as the storefront's window shade fading 0.75 to 0 ("lights on"). [C19]
87. [P2] **The Soho photo carries a third-party face poster and a tobacconist sign.** Where: London 1440, 35-70%, left edge (`layers/soho-night.webp`). This is a distraction and a rights question in a brand piece. Fix: leave them out of the paper-cut storefront; until then, crop or retouch the photo. [C24]
88. [P2] **Each room "blinks" in as a small ink tombstone before its photo is readable.** Where: London, all widths. Cause: 2% fades (LO:120-123), with the window starting at k=0.1 (a slit). Fix: 4% fades and start the window at k=0.18. The book replaces this. [C27]
89. [P2] **The room photos are soft at 1920 and wider, and on DPR 2.** Where: London 66-98%. Cause: `widths={[800,1400,2000]} sizes="100vw"`, q72, WebP only (LO:67), although the sources are 2400w. Fix: `[800,1400,2000,2400]`, `sizes="120vw"`, `['avif','webp']`, q78. Apply the same to the book's polaroids. [C20]
90. [P2] **The arch rim band is uneven and its thickness drifts between steps.** Where: London 1440, 66-90%. Cause: the rim is a second masked element with its own scale steps (49/476 vs 46/460) (LO:34,115-116). Fix: draw the rim in the same SVG with `vector-effect:non-scaling-stroke`, or drop it (moot with the book). [C22]
91. [P2] **Each room's 1.2-to-1 drift runs half-hidden under the next room.** Where: London 1440, 70-98%. Cause: the `.lo-room-img` drift spans 66-82% while the next room opens at 74% (LO:120-123). Fix: end each drift as the next room starts, or drop the drift. [C23]
92. [P2] **The screen-reader sentence describes only Soho.** Where: London. Cause: `sr={firstSentence(sohoPanel.scene)}` (LO:43); Covent Garden, half the track, is never mentioned. Fix: `firstSentence(soho) + ' ' + firstSentence(garden)`. [C26]
93. [P2] **"DING!" prints over a tiger's head and the chair on phones, and over the garland and chair back on desktop.** Where: Next stop 390 at 66-99%, 1440 at 66-78%. Cause: the `.ns-ding` position (NS:133,148). Fix: anchor it at the lantern (`left:calc(50% - var(--tw)*.05);top:24%`), smaller. Drop it on phones if there is no room. [C14 C25]
94. [P2] **With StoryMap gone, the page loses its one full-journey view.** Where: Next stop 0-36%. Cause: Next stop's chart draws only London to Dubai (NS:37-39). Fix: open with legs 1-2 already drawn (a RouteChart option to pre-draw legs) and animate only the Dubai spur, the pins and the title. Offset stamps with dx/dy so they do not overlap labels. [C15 C17]
95. [P2] **The static dish row is a scroller that keyboard users cannot reach.** Where: `#end` (also in reduced-motion and comic mode). Cause: `.strip{overflow-x:auto}` with no `tabindex` or accessible name (TS:50), which fails WCAG 2.1.1. Fix: the grid (#60) removes the scroller; otherwise add `tabindex="0"`, a region label and a focus ring. [D16 D24]
96. [P2] **Dish names are announced twice.** Where: `#end`. Cause: the sr-only list (TS:35) plus the visible `.note` (TS:40), and the `ul` label repeats the sr-only line. Fix: delete the sr-only `<p>`. [D17]
97. [P2] **TastingStrip styles its parent.** Where: `#end`. Cause: `:global(.story-end){overflow-x:clip}` (TS:69) reaches outside the component and causes #14. Fix: clip inside `.taste` instead. [D19]
98. [P2] **The tiger choice uses `aria-current="true"` on links to mean "selected".** Where: `#end` (CT:72). This is the wrong semantics. Fix: `aria-pressed` on buttons, keeping the links as the no-JS fallback. [D18]
99. [P2] **The `#end` calls to action are three bare buttons.** Where: `#end` (OS:85-92). Fix: three branch cards (storefront photo, address, Open or Opening soon, same href), reusing the `.sm-card` styles from StoryMap before it is deleted. `story/photos/soho-front-77-berwick-street.jpg` already exists. [D20]
100. [P2] **At 2560 the dish row is one line of 8 uneven plates, with about 100px of empty gold under the calls to action.** Where: `#end` at 2560. Cause: the row has no max width. Fix: the grid's 1040px max width (#60), and trim the bottom padding of `#end` from 1920px. [D27]

---

## Workstreams

Each workstream owns a separate set of files, so builders can run in parallel without touching the same file. An issue that shows up in several chapters belongs to **W1**, which builds the shared engine piece (CSS or component). The chapter workstreams then *apply* it in their own files by changing markup and timing ranges. That application is part of the chapter work and is not counted as a separate issue. Order: W1's caption system (#1), cast group (#15/#16) and scene unit (#17) land first. W2-W6 then run in parallel, and the items marked "start now" can begin before W1 finishes.

**Shared style suffix for every AI art prompt (STYLE):**
> "paper-cut puppet-theatre layer matching the story's style frame A: flat cut-paper planes with crisp cut and slightly torn edges, visible paper-fibre texture, soft offset drop shadow between planes, flat colour, limited palette of ink #2c2925, sand, jade, ox-blood and tiger orange, warm light from the upper left, front-on to the proscenium, no people, no characters, no text, no logos, transparent background unless stated"

Characters are drawn by an illustrator only (owner rule). They are marked **ILLUSTRATOR**.

### W1: Engine (14 issues)

- **Owns:** `src/styles/global.css` (story section 162-330, `.tl`, `.puff`, `.scene-rain` deletion), `StoryScene.astro`, `SceneArt.astro`, `src/data/story.ts`, `src/assets/images/story/layers/README.md` (provenance rows for new art from all workstreams).
- **Issues:** 1, 15, 16, 17, 18, 19, 20, 21, 22, 64, 65, 66, 67, 68.
- **Depends on:** nothing.
- **Delivers to the others:**
  - The caption plate with swapping text spans (#1).
  - The `.cast` group, `.cast-art` and `.cast > .bubble` with `--bx/--by` and tail and flip variants (#15).
  - The z tiers (#16) and the `--u` unit (#17).
  - The `visibility` out-of-range helper (#65) and the decode/warm loader (#18).
  - `.tl` driven by `--i/--n` (#22) and the rock defaults (#67).
- **Clean-up:** after W5 lands #52, delete `.scene-rain` (GC:318-319).
- **Art:** none.

### W2: Opening, Canton, route chart (12 issues)

- **Owns:** `StoryOpening.astro`, `scenes/ChapterCanton.astro`, `RouteChart.astro`.
- **Issues:** 2, 24, 25, 26, 27, 28, 29, 70, 71, 72, 73, 74.
- **Depends on W1:** #1 (caption ranges), #15 (bubble and ship group for #28 and #74), #17 (`--u` for #74), #22 (title letters).
- **Start now:** #2, #24, #27, #29, #70, #71, #72.
- **Also delivers:** a RouteChart option to pre-draw legs (needed by W6 #94 and by W3 if #30 picks option b).
- **Art:**
  - ART-01, optional (#71). Re-render the opening harbour master at 3840x2160. Prompt: "painted dawn harbour, the same composition, framing and palette as the current `op-harbour`, extended to 3840x2160 with detail for a 1.14 push-in". This painted asset is the one exception to STYLE. If no master exists, cap the push-in instead and skip this asset.

### W3: Tangra (10 issues)

- **Owns:** `scenes/ChapterTangra.astro`, plus new `layers/tangra-*` assets.
- **Issues:** 3, 4, 30, 31, 32, 33, 34, 35, 75, 76.
- **Depends on W1:** #1, #15 (bubbles on Pundit and Fatt), #16 (cast over sacks, #3), #17 (`--u` for the market box, #4), #22, #67. #30 option (b) needs W2's RouteChart pre-draw option.
- **Start now:** decide #30 and #31, then #34.
- **Art:**
  - ART-02 `layers/tangra-lane-top.webp`, 1600x2400, portrait only (#33). Prompt: "upper storeys of a 1950s Tangra (Calcutta) Chinese-quarter lane seen from street level: weathered wooden shutters, wrought-iron balconies, blank vertical signboards, strings of red paper lanterns, sagging overhead wires, ochre and ox-blood walls, tall portrait composition, bottom edge meets the existing `tangra-lane-far` rooftops" + STYLE.
  - ART-03 `layers/tangra-fatt-stall.webp` (#32), **ILLUSTRATOR**. Brief: Fatt, waist up, behind a street-stall counter, tossing a wok, facing right, matching `spice-fatt` in line, palette and scale. Stopgap: mirror `spice-fatt`.

### W4: Something new and the table redesign (26 issues)

- **Owns:** `scenes/ChapterSomethingNew.astro`, `src/lib/lazy-susan.ts`, `src/assets/images/story/food/`, plus new `layers/banquet-*` and `layers/feast-*` assets.
- **Issues:** 5, 6, 7, 8, 9, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 77, 78, 79, 80, 81, 82, 83.
- **Depends on W1:** #1 (caption overlaps at 26% and 63%), #15 (the "More chilli!" bubble), #16 (cast and counter tiers), #17 (`--u` sizing for the cast, counter and momos), #65 (`.sn-wok-out` and `.sn-photos` hiding). #83 waits for W6 #60 (`#end` stops using `food/`).
- **Start now:** #5, #6, #9, #77-81.
- **Build:** the banquet as audit B "Direction B" describes it. `.sn-feast` contains a back wall, `.sn-cast` (friends-table art with its table line on the lip), `.sn-counter`, and `.sn-row` as a parade driven by one transform with `linear()` dwell plateaus generated in `lazy-susan.ts`.
- **Art:**
  - ART-04 `layers/banquet-front.webp`, 2800x500 (#7, #39-41). Prompt: "long low banquet table seen edge-on at eye level, flat frontal plane: red paper tablecloth with a scalloped hem and small gold paper-cut medallions, thin wooden top lip running the full width, transparent above the lip, soft shadow under the hem" + STYLE.
  - ART-05 `layers/feast-lanterns.webp`, 2800x420, optional; reusing the wok-street lanterns is the fallback (#40). Prompt: "a sagging cord strung with alternating red and gold paper lanterns and small paper tassels, hung across the full width, transparent background" + STYLE.
  - ART-06 dish re-cuts, photo edit, not generated (#9, #42, #46). Re-cut 5 dishes from the originals in `src/assets/images/dishes/` at a consistent 35-45° angle (momos, mock chicken, sticky, malabar, plus one more), with a 5% transparent margin, a baked 3px paper-white die-cut outline and a contact-shadow ellipse. WebP with alpha, 1200w.
  - ART-07 `layers/friends-banquet.webp`, optional, **ILLUSTRATOR** (#41). Brief: Fatt and Pundit seated side by side behind a long table, facing out, waist up, chopsticks raised, in the same style as `friends-table`.

### W5: London, storefront and interiors (19 issues)

- **Owns:** `scenes/ChapterLondon.astro`, `layers/soho-night.webp` (retire), plus new `layers/storefront/*` and `layers/interiors/*`.
- **Issues:** 10, 11, 12, 50, 51, 52, 53, 54, 55, 56, 84, 85, 86, 87, 88, 89, 90, 91, 92.
- **Depends on W1:** #1 (London caption overlap at 62-65%), #15 (the tigers' bubble, #53), #18 (warm and decode for the storefront and book layers), #65 (off-range hiding).
- **Start now:** #11 (drop `will-change`, an immediate flicker relief), #12 (track length to 420vh, phone 360vh), #92, art generation.
- **Build:** the storefront score (30-46% of 420vh) and the pop-up book score (46-100%) from audit C. Interim: postcards on cork.
- **Hand to W1:** the README provenance rows.
- **Storefront art.** Master canvas 3200x2000. The sign band sits at 28-38% of stage height, the door at x 55-65%, and the top 20% stays clear for the caption.
  - ART-08 `storefront/s0-sky.webp`, opaque. Prompt: "wet slate night sky over Soho rooftops, chimney pots, one or two lit sash windows, faint cloud, 3200x2000" + STYLE (opaque).
  - ART-09 `storefront/s1-neighbours.webp`. Prompt: "brick facades left and right of a gap for a shop, a café with a blank sign, black Victorian lamppost, two bollards" + STYLE.
  - ART-10 `storefront/s2-interior.webp`. Prompt: "warm amber restaurant interior seen through shop glass: three pendant lamps, bar shelf with glasses, stools, one table, soft glow" + STYLE.
  - ART-11 `storefront/s3-facade.webp`. Prompt: "London shopfront at 77 Berwick Street: grey-plaster upper storey, ox-blood timber front with window and door openings cut out, panelled left door, '77' fanlight shape left blank, empty sign fascia" + STYLE.
  - ART-12 `storefront/s5-door.webp`. Prompt: "single glazed shop door in ox-blood timber with brass handle, front-on, separate piece for hinging at the left jamb" + STYLE.
  - ART-13 `storefront/s6-poster.webp`. Composite of the existing approved tiger stamp art on a paper poster, with no AI tiger; poster paper and pins only: "pinned paper poster blank with torn corners" + STYLE.
  - ART-14 `storefront/s7-awning.webp`. Prompt: "scalloped striped canvas shop awning in ink, ox-blood and sand stripes, front-on, rolled-down state" + STYLE.
  - ART-15 `storefront/s10-pavement.webp`. Prompt: "wet London flagstone pavement with kerb and one puddle, a soft blank strip where a window reflection will sit, 3200x360" + STYLE.
  - ART-16 hand-built SVG/CSS, not generated:
    - S2b window shade.
    - S4 "FATT PUNDIT" as 11 letters in unlit and lit states, with a strip-light bar.
    - S8 blade sign with the existing tiger-head roundel and "FP".
    - S9 "BERWICK STREET W1" plate.
    - S11 light wedge.
    - S12 two rain sheets.
- **Pop-up book art.** Each plane is a transparent WebP at 2400w, about 1.2 MB in total.
  - ART-17 `interiors/book-base.webp`. Prompt: "open hardback pop-up book lying flat, two cream pages, spine shadow, stacked page edges, filling the lower 72% of a wide frame" + STYLE.
  - ART-18 `interiors/s1-wall.webp`. Prompt: "Covent Garden restaurant back wall as a pop-up plane: cream plaster, three ogee-arched mirrors in wooden frames softly reflecting lamp glow, a cluster of blue-and-white plates, picture rail" + STYLE.
  - ART-19 `interiors/s1-flap-l.webp` / `s1-flap-r.webp`. Prompt: "pop-up side wall flaps: wall returns with a brass sconce and a green-tiled corner, left and right versions" + STYLE.
  - ART-20 `interiors/banquette.webp`. Prompt: "long green leather banquette with timber back rail, front-on pop-up plane" + STYLE.
  - ART-21 `interiors/tables-a.webp`, `tables-b.webp`. Prompt: "two small wooden restaurant tables set with white plates, folded napkins and glasses, front-on" + STYLE.
  - ART-22 `interiors/chair-1..3.webp`. Prompt: "single bentwood café chair, front three-quarter, three slight variations" + STYLE.
  - ART-23 `interiors/lamp-1..3.webp` plus glow discs. Prompt: "brass pendant lamp on a cord, with a separate soft amber glow disc" + STYLE.
  - ART-24 `interiors/foreground.webp`. Prompt: "potted fern and a small folded 'Reserved' tent card (blank card, lettering added in CSS), foreground pop-up piece" + STYLE.
  - ART-25 `interiors/s2-wall.webp`. Prompt: "brick restaurant wall with a large blank rectangular mural panel, red banquette below, decorative brush strokes in place of lettering" + STYLE. The tiger mural inside the panel is **ILLUSTRATOR**, traced from the real mural photo.
  - ART-26 `interiors/s2-tables.webp`. Prompt: "second set of tables and chairs for the mural room, darker wood, red cushions" + STYLE.
  - ART-27 `interiors/page-turn.webp`, front and back. Prompt: "single cream book page mid-turn with a curling shadow, printed both sides with the right halves of two pop-up rooms" + STYLE.
  - ART-28 polaroids, photo edit, optional: two 600w crops of the real Covent Garden photos (`src/assets/images/covent-garden/`) in a white polaroid border, with "Maiden Lane, 2021" set in CSS.
- **Interim postcards on cork:**
  - ART-29 `interiors/cork-wall.webp`, opaque. Prompt: "cork pinboard texture with a few old pin holes and a thin wooden frame edge, opaque, tileable, 2400x1600" + STYLE (opaque).
  - ART-30 `interiors/pushpin.webp`. Prompt: "single red pushpin, top-down three-quarter, tiny drop shadow" + STYLE.
  - The prints themselves are the 4 room photos in CSS paper borders (#89 widths).

### W6: Next stop, finale removal, page shell, #end (19 issues)

- **Owns:** `scenes/ChapterNextStop.astro`, `StoryMap.astro` (delete), `src/pages/our-story.astro`, `TastingStrip.astro`, `ChooseTiger.astro`, `src/components/site/ChapterRail.astro`, plus new `src/assets/images/story/menu-cards/`.
- **Issues:** 13, 14, 23, 57, 58, 59, 60, 61, 62, 63, 69, 93, 94, 95, 96, 97, 98, 99, 100.
- **Depends on W1:** #1 (Next stop caption overlap at 47-50%), #15 (`.ns-bubble1`), #16 (tiger tier, #59). #94 needs W2's RouteChart pre-draw option. #69 publishes `--rail-w`, which the chapters read.
- **Start now:** #13 (copy `.sm-card` styles first, for #99), #14, #23, #60-63, #95-100.
- **Art:**
  - ART-31 menu-card prints, photo edit, not generated (#60-62). Six 4:5 crops at 800w and 1200w from the originals in `src/assets/images/dishes/` (pepper crab, Lady Kenny, rabbit wontons, Hakka noodles, sizzling brownie, saffron masala tea), subject in the lower-middle third, one shared warm grade. Lady Kenny: x110-710, y274-1024 of `lady_kenny_new.png`, capped at 600w.
  - ART-32 branch cards (#99). Soho uses `story/photos/soho-front-77-berwick-street.jpg`; Covent Garden uses a photo from `src/assets/images/covent-garden/`. Dubai, if no photo exists, uses `dubai-dusk-card.webp` at 1200x1500. Prompt: "small Dubai restaurant shopfront at dusk with a blank fascia, palm in a planter, warm window glow, 'opening soon' mood, portrait 4:5" + STYLE (opaque).

### Count check

W1 14 + W2 12 + W3 10 + W4 26 + W5 19 + W6 19 = **100**. Every issue appears in exactly one workstream.

---

## Art needed (consolidated)

| ID | Asset | WS | Issues | Method | Size and format |
|---|---|---|---|---|---|
| ART-01 | Opening harbour master, 3840w (optional) | W2 | 71 | AI re-render of the existing painted asset | 3840x2160 WebP/AVIF |
| ART-02 | `layers/tangra-lane-top.webp` | W3 | 33 | AI prop | 1600x2400 WebP alpha |
| ART-03 | `layers/tangra-fatt-stall.webp` (Fatt at the wok) | W3 | 32 | **ILLUSTRATOR** | ~1200w WebP alpha |
| ART-04 | `layers/banquet-front.webp` | W4 | 7, 39-41 | AI prop | 2800x500 WebP alpha |
| ART-05 | `layers/feast-lanterns.webp` (optional) | W4 | 40 | AI prop | 2800x420 WebP alpha |
| ART-06 | Dish re-cuts x5, die-cut outline, contact shadow | W4 | 9, 42, 46 | Photo edit from `assets/images/dishes/` | 1200w WebP alpha |
| ART-07 | `layers/friends-banquet.webp` (optional) | W4 | 41 | **ILLUSTRATOR** | ~1800w WebP alpha |
| ART-08 | `storefront/s0-sky.webp` | W5 | 10, 50 | AI background | 3200x2000 WebP opaque |
| ART-09 | `storefront/s1-neighbours.webp` | W5 | 10, 50 | AI prop | 3200x2000 WebP alpha |
| ART-10 | `storefront/s2-interior.webp` | W5 | 10, 50 | AI prop | ~1600w WebP alpha |
| ART-11 | `storefront/s3-facade.webp` | W5 | 10, 50, 51 | AI prop | 3200x2000 WebP alpha |
| ART-12 | `storefront/s5-door.webp` | W5 | 10 | AI prop | ~600w WebP alpha |
| ART-13 | `storefront/s6-poster.webp` | W5 | 10 | AI paper plus existing tiger stamp | ~500w WebP alpha |
| ART-14 | `storefront/s7-awning.webp` | W5 | 10 | AI prop (or SVG) | ~1400w WebP alpha |
| ART-15 | `storefront/s10-pavement.webp` | W5 | 10, 85 | AI texture | 3200x360 WebP alpha |
| ART-16 | Shade, sign letters, blade sign, street plate, light wedge, rain | W5 | 10, 51, 52, 85 | Hand-built SVG/CSS | SVG |
| ART-17 | `interiors/book-base.webp` | W5 | 11, 55 | AI prop | 2400w WebP alpha |
| ART-18 | `interiors/s1-wall.webp` (ogee mirrors) | W5 | 11, 55 | AI prop | 2400w WebP alpha |
| ART-19 | `interiors/s1-flap-l/r.webp` | W5 | 55 | AI prop | 1200w WebP alpha x2 |
| ART-20 | `interiors/banquette.webp` | W5 | 55 | AI prop | 2400w WebP alpha |
| ART-21 | `interiors/tables-a/b.webp` | W5 | 55 | AI prop | 1200w WebP alpha x2 |
| ART-22 | `interiors/chair-1..3.webp` | W5 | 55 | AI prop | 500w WebP alpha x3 |
| ART-23 | `interiors/lamp-1..3.webp` plus glow discs | W5 | 55 | AI prop (glow in CSS) | 400w WebP alpha x3 |
| ART-24 | `interiors/foreground.webp` (fern, Reserved card) | W5 | 55 | AI prop | 1200w WebP alpha |
| ART-25 | `interiors/s2-wall.webp` plus the tiger mural | W5 | 55, 56 | AI wall; **ILLUSTRATOR** mural | 2400w WebP alpha |
| ART-26 | `interiors/s2-tables.webp` | W5 | 55 | AI prop | 2400w WebP alpha |
| ART-27 | `interiors/page-turn.webp` (both faces) | W5 | 55 | AI prop | 1200w WebP alpha x2 |
| ART-28 | Polaroids x2 (optional) | W5 | 56, 89 | Photo edit from `covent-garden/` | 600w WebP |
| ART-29 | `interiors/cork-wall.webp` (interim) | W5 | 55 | AI texture | 2400x1600 WebP opaque |
| ART-30 | `interiors/pushpin.webp` (interim) | W5 | 55 | AI prop | 120w WebP alpha |
| ART-31 | Menu-card prints x6, 4:5 (incl. Lady Kenny) | W6 | 60, 61, 62 | Photo edit from `assets/images/dishes/` | 800w/1200w WebP+AVIF |
| ART-32 | Branch card images x3 (Dubai AI if no photo) | W6 | 99 | Existing photos; AI for Dubai | 1200x1500 WebP |

**Totals:** 26 AI-generated assets (ART-01, 02, 04, 05, 08-15, 17-27 with the mural excluded, 29, 30, and the Dubai card in 32). 3 illustrator pieces (ART-03, 07, and the mural in 25), plus seated tiger poses for W5 if the existing cut-outs do not fit. 4 photo-edit sets (ART-06, 28, 31, 32). 1 hand-built SVG/CSS set (ART-16).
