# Door scene: review and premium plan

Scene: `src/components/scenes/Doors.astro` (homepage, Covent Garden walk-in). Reviewed 23 Nov 2026 from 12 scroll frames (desktop 1440×900, phone 375×812) and the code. There were three independent reviewers plus the lead.

## Scores

| Lens | Score | One line |
|---|---|---|
| Lead (overall) | 5 | Strong idea; the interior photo carries it; it breaks at every seam. |
| Art direction | 5 | Clever prototype, not a flagship: soft AI facade vs sharp real photo, a flat gold card, dead bands on phone. |
| Motion / scroll | 6.5 | Good layering; soft 4.4× zoom, crossfade ghosting, lights fire before the pin, the inside dwell drags. |
| Tech / perf / a11y | 6 | No CLS, lean per-frame JS; raster blur and GPU cost on the push, eager loading competes with LCP, the h2 is hidden. |
| **Consensus** | **~5.5** | Target after the plan: 8.5–9. |

## What all reviewers agreed on

1. **The push goes soft.** The camera zooms the 4096px facade 4.4×, and the room behind the glass ends up about 7.5×. Frames 4–5 are blurry and the red frame smears.
2. **The crossfade ghosts.** Two moving images sit at half opacity together, so red mullions show over the room (frame 6).
3. **The flat gold card is a dead end.** The warm, lived-in room drops into a template beige gradient that repeats the sign's tagline (frame 8).
4. **The facade and the photo don't match.** The painted facade is waxy and over-saturated; the interior is a real photo with grain.
5. **The phone has dead bands.** The shopfront is a ~525×396 thumbnail with ~350px of empty ink, and the sign subtitle is about 6px.
6. **The lights fire before the stage pins.** Lamps and letters light while the facade is still sliding up, leaving almost no pinned hold to read the sign.
7. **The sign looks digital.** The CSS glow on a slab serif doesn't match the real sign (gilt slab capitals, white sans tagline).
8. **The hero → facade seam.** The blurred "glass" hero hard-cuts into the red fascia.

Also found:
- `Base.astro:61-70` resets scroll to the top on load unless the user has interacted. This explains why scripted test scrolls jumped.
- The flood `h2` is `visibility: hidden`, so screen readers skip chapter 01.
- The IntersectionObserver eager-decodes every image at page load.
- `sizes` doesn't match the drawn size on portrait.

## The plan

### Phase 1: craft fixes (code only, no new assets) · effort M · biggest gain

1. **New beat sheet.** All light beats move onto the pinned stretch, with a hold to read the sign.

   | Beat | q | Motion | Easing |
   |---|---|---|---|
   | Rise | 0–.42 | Section scrolls in; street dark, reflection full | native |
   | Lamps | .42–.50 | 3 lamps flick on in turn | steps flicker |
   | Sign | .46–.58 | Letters light 1 by 1 | step |
   | Tagline + address | .60 | On | 260ms ease-out |
   | Glass clears | .48–.66 | Dim + reflection fade | linear |
   | Hold | .58–.64 | Nothing moves | – |
   | Door | .62–.78 | rotateY 0→−78°, light spill, jamb shadow | cubic in-out |
   | Push | .66–.92 | Camera 1→2.6× toward the door | linear in log space |
   | Doorway wipe | .84–.94 | Room revealed by `clip-path` from the door rectangle to full, scale 1.25→1 | ease-out-quart |
   | Drift | .94–1.18 | Room 1→1.06, 1.5% lateral | linear |
   | Bloom | 1.10–1.26 | Bar light burns the frame to warm gold | ease-in quad |
   | Hand-off | 1.26–1.32 | Hold, then unpin into Voyage on the same colour | – |

   Section height: 290svh on desktop, 270svh on phones (down from 320/290).

2. **Cap the zoom at 2.6×** (log-linear scale) and replace the opacity crossfade with the **doorway wipe** above. This removes both the blur and the ghosting.
3. **Smoothing.** A rAF loop lerps progress toward the scroll position (about 90ms time constant) for wheel input; touch stays 1:1. No scroll hijacking.
4. **The door reads as 3D.**
   - Swing it to −78° instead of −96°, so it stays visible rather than going edge-on.
   - Give it a thickness edge face.
   - Lower the perspective to about 1200px.
   - Add warm light spilling through the gap.
5. **Performance.**
   - The IO margin becomes 50%, and it decodes only the facade and room; `fetchpriority="low"` on all images.
   - Use AVIF and WebP via `<Picture>`.
   - Drop the 4096px variant.
   - Fix `sizes` on portrait.
   - Bake the screen blend into the reflection files.
   - Draw the lit sign as a second composited layer, so nothing repaints while scaled.
6. **Accessibility.**
   - The flood h2 stays in the accessibility tree (opacity only, no visibility toggle).
   - Reduced motion skips loading the room image.
   - The sign tagline gets a minimum readable size.
7. **Hand-off.** The Voyage section's first frame starts on the same warm colour, so there is no seam.

### Phase 2: art direction, one look · effort M

1. **One grade over the whole scene.**
   - Add 3–4% film grain to every layer.
   - Lift the facade blacks a little.
   - Take the red 10–15% toward the real weathered vermilion.
   - Add patina and chipped paint on the pilasters, by regrading the facade asset.
2. **The sign as it really is.**
   - Gilt slab capitals with a dark keyline and a single specular sweep L→R once lit.
   - The tagline and address in a white condensed sans, as on Maiden Lane.
   - Letters flicker on 30–40ms apart rather than fading.
3. **The "Come in." line.**
   - Remove the dark strip.
   - Small uppercase tracked gold over a soft vignette.
   - "Skip the story" becomes a quiet text button.
4. **A quiet scene.** The chapter rail and the header CTA dim to about 40% while the scene is pinned.
5. **The bloom replaces the flat card.** The heading "From Guangdong to Calcutta" sits on the burnt-out warm room (6–8% of the room texture left), lit as if by the bar pendant.

### Phase 3: new assets · effort S–M · about 3–5 Higgsfield credits

1. **Portrait facade for phones** (about 1200×1800). Outpaint the brick and first-floor sash windows above, and the cobbles below, so the front fills the screen with no bands. Swap it in with `<picture media="(max-aspect-ratio: 3/4)">`.
2. **A dusk street plate for the hero → facade join.** The Maiden Lane cobbles and the arches across the lane, so the hero dollies down into the shopfront instead of hard-cutting.
3. (Optional) A regraded facade master, if the CSS grade in Phase 2 isn't enough.

### Phase 4: signature moment (needs the client)

**"The door is open."** A real 4–6 second locked-off video from inside the doorway at service: steam from the pass, a server crossing, pendants swaying. It plays as the room view, scrubbed by scroll, with no zoom; the door edge wipes the frame and you are inside. The red Devanagari wall line writes itself in as the subhead before the story title. Nothing is AI-generated at the hero moment.

Needs: a 30-minute shoot at Covent Garden (phone on a tripod is fine, 4K, 24fps, before service with staff only), plus the client's OK.

## Order and checks

Phase 1, then 2, then 3, with a commit per phase on PR #2. After each phase:
- `npm run verify`
- frames at 1440×900, 375×812 and 390×844
- reduced motion
- one throttled mid-range Android profile, to check frame drops on the push
