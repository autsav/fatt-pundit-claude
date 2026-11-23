Cut-out layers for the scroll scenes on /our-story/ (docs/STORY-BRIEF.md "Delivery",
docs/STORY-MOTION-PLAN.md "The scenes"). Transparent PNG (or WebP), named `<scene>-<layer>.png`,
e.g. `tangra-lane-rickshaw.png`. A file here replaces that slot's storyboard card or brand stand-in;
nothing else needs to change. The slot names are the `name` props of SceneArt in
src/components/story/scenes/.

## Generated art (provenance)
The owner approved AI generation for backgrounds, props and textures, but not for characters
(docs/STORY-AWARD-PLAN.md, decision 2, 22 Nov 2026). Everything here was generated on Higgsfield with
GPT Image 2.6 on 22 Nov 2026. Each layer used the approved style frame (style A, an open harbour at
dawn) as its reference image, with "no people, no characters, no text" in the prompt. The layers were
trimmed and converted to WebP. No person or character appears in any of them.

| File | What | Prompt gist |
|---|---|---|
| opening-harbour.webp | the approved style frame A itself, the opening backdrop | paper-cut harbour at dawn: jade hills, gold sun, junks, pavilion |
| harbour-hills-far.webp | distant misty jade mountains, transparent | far mountain range only |
| harbour-hills-near.webp | nearer mountains, pines and a small village, transparent | near range plus village only |
| harbour-water.webp | torn blue-grey paper sea with wave crests, transparent above | water band only |
| harbour-ship.webp | junk with orange batten sails, bow left, transparent | one junk, side view, no crew |
| tangra-lane-far.webp | Calcutta Chinatown facades, lanterns, blank signboards | facades only, no writing |
| tangra-lane-near.webp | empty rickshaw, crates, pots, tea-stall corner | foreground only, no people |
| tangra-stall.webp | street-food cart, awning, wok on a stove | empty stall |
| spice-sacks.webp | six sacks: chillies, turmeric, cumin, ginger, garlic | no labels |
| chilli-red.webp, chilli-green.webp | one chilli each | single prop |
| wok-street-night.webp | Calcutta street at night, lanterns, fire glow (opaque) | empty street |
| wok.webp | wok with noodles and chillies flying up | no hands |
| steamer-lid.webp | woven bamboo steamer lid | lid only |
| soho-night.webp | RETIRED (no longer used by any scene; replaced by storefront/*). Was a Soho street in the rain (opaque) | no people, no lettering |
| storefront/s0-sky.webp | wet slate night sky, Soho rooftops, lit windows (opaque, 2752x1536) | no lettering |
| storefront/s1-neighbours.webp | brick buildings far left and far right, lamp post, bollards, empty middle gap (3168x1319) | no people; sign blank |
| storefront/s2-interior.webp | warm amber paper-cut restaurant interior: pendant lamps, bar, tables (opaque, 2400x1340) | no people; seen through the glass and as the room |
| storefront/s3-facade.webp | shopfront: grey upper storey, empty sign fascia, ox-blood timber front, transparent openings (2400x1792) | no lettering; openings at x 564-1138 and 1646-2218, y 744-1392; door 1286-1504 x 960-1390 |
| storefront/s5-door.webp | glazed ox-blood door with brass handle, for the central opening (1200x2370) | single piece, hinged left in CSS |
| storefront/s7-awning.webp | striped scalloped canvas awning (2400x794) | no lettering |
| storefront/s10-pavement.webp | wet flagstone pavement and kerb (3168x511) | no people |
| dubai-skyline.webp | dusk skyline with a tall spire | no logos |
| dubai-dunes.webp | dunes, low buildings, palms | no people |
| dubai-suitcases.webp | two stickered suitcases with a wok tied on | stickers without writing |
| your-table.webp | laid table, steamer basket, lantern, empty chair turned to the reader | no people |
| ../paper-crumpled.webp | tileable crumpled sand paper (title cards, wipes) | texture, no reference image |

The 2K re-render of opening-harbour.webp also used style frame A as its reference.
