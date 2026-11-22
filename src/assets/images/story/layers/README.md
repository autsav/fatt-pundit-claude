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
