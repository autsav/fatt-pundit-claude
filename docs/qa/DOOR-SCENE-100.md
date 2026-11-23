# Door scene: 100 problems and the fix plan (23 Nov 2026)

**Scope.** The home door scene (`src/components/scenes/Doors.astro`): the velvet curtain and the POV walk-in.

**How it was audited.** 132 headless frames across 11 viewports:
- desktop: 1440×900, 1280×720, 1920×1080, 2560×1080
- tablet: 1024×768, 768×1024, 820×1180
- phone: 390×844, 360×640, 430×932, 844×390

Three agents reviewed the frames:
- POV research: how a real first-person walk-in behaves, landscape and portrait
- visual and art direction (V*)
- motion, responsiveness and performance (M*)

**Status:** ✅ fixed in this pass · ⏸ deferred (with the reason).

## POV rules adopted (research)

| Rule | What it means here |
|---|---|
| Distance, not zoom | `s = d/(d−z)`, d = 4 m, z rising evenly to 3.33 m gives 1→6×. It accelerates naturally as you near the door. |
| Turn, then walk | The door centres sideways early in the walk; after that, no sideways drift. |
| Walking bob | Subliminal: ±0.35% of height, one cycle per step (5 steps), fading in and out with the walk. |
| Frame never fades | It passes the lens and leaves the screen. Only once it is fully off is the camera hidden. |
| Threshold | A short dark dip in the door depth. |
| Eyes adjust | The room arrives a little bright and warm, then settles. |
| Holds | On the lit sign, the full curtain, the room and the story. |
| Portrait | The curtain splits from the middle, both halves gathering to the sides. The room crop is set so its vanishing point sits where the street's was. |

## The 100

### Timeline and pacing
1. ✅ M35: no hold on the lit sign → hold .16–.24.
2. ✅ M36: no hold with the curtain full-frame → hold .54–.60.
3. ✅ M37: story heading readable for only about 3% → opening done by .92, held to 1.
4. ✅ M38/V11: the drift and the room hold look identical → drift −3%, +8%, with a slight rise.
5. ✅ M39: the push ends at top speed as the frame vanishes, reading as a cut → one distance curve, with the frame off-screen before the camera hides.
6. ✅ M40/V46: "Come in." collides with the sign lighting → fades .04–.10.
7. ✅ M41: the shine replays every time you cross .20 → latched (it clears only below .05).
8. ✅ V45: the bloom starts mid-drift and reads as overexposure → bloom .82–.92.
9. ✅ V42: the rail jump-cuts away → it leaves with the curtain over .70–.78.
10. ✅ M31: one phone flick crosses the whole scene → scroll budget set in px per device (`--len`).
11. ✅ POV: the zoom reads as flat → distance-based scale (`s = d/(d−z)`).
12. ✅ POV: the walk is a sideways pan plus zoom → the door centres first (.30–.38), then you walk.
13. ✅ POV: no gait → a subliminal 5-step bob.
14. ✅ POV: no threshold → a dark dip at .52–.57.
15. ✅ POV: no eye adaptation → the room arrives +EV and settles over .64–.74.

### The curtain
16. ✅ V40/M19: a ghosted double curtain at .68 → the stack arrives first (.66–.69), the panel fades under it (.70–.72).
17. ✅ V41: banding in the ghosted stack (fixed by 16 and 22).
18. ✅ V37/V38: the rail pops in over the front → it is the head of the velvet layer from the start (moves with it, hidden behind the front until you're there).
19. ✅ V12: the rail is theatre-sized on desktop → its height is tied to the stage (clamp 28–64px).
20. ✅ V13/M33: the rail is a hairline on phones → same stage-height rule.
21. ✅ V14: the finials are cropped → end caps are kept whole; the rod and rings repeat between them.
22. ✅ V22: the gathered stack is pixelated → 4K upscale re-keyed (2 credits).
23. ✅ V15: the stack is 55% wide on phones → stack width matches the gathered panel.
24. ✅ V48: the fold overlay squashes into a barcode → removed; the panel darkens as it gathers instead.
25. ✅ V49: a gap between the stack and the rail → the stack hangs from under the rail.
26. ✅ V50: the curtain has no hem; it hangs in the void → a floor shadow at the bottom.
27. ✅ Portrait research: a single right pull leaves a slab on narrow screens → split from the middle on portrait.
28. ✅ V26: two different reds (front vs velvet) → velvet graded toward the door red.
29. ⏸ V47: the panel still reads partly as a sliding photo → a strip accordion or sprite gather, as a follow-up asset task.
30. ⏸ V43: the rings don't bunch with the curtain → needs a rail with rings separated (asset).
31. ✅ M42: an unloaded velvet shows ink → a velvet-red fallback colour.
32. ✅ M16: the stack and rail decode on the frame they appear → decoded ahead.
33. ⏸ V16: fold scale varies by device (large folds on ultrawide) → needs a velvet tile or a second plate; low impact.

### Composition per device
34. ✅ V4/M20: on 21:9 the lamps are cut and the sign sits under the header → the front is anchored to the top on ultrawide.
35. ✅ V5/M27: on phone landscape (844×390) the lamps and sign are cropped → a short-landscape anchor.
36. ✅ M21: on 1280×720 the lamps nearly touch the top → JS keeps ≥ 4% headroom above the lamps.
37. ✅ V6/M24: on portrait tablets, 30% dead cobbles → a larger front (72% height).
38. ✅ M22/M23: ink bands at 3:4–1:1 → the front always covers the stage. The Maiden Lane street now surrounds it on every screen, so turning to the door shows the neighbours, not a gap. The curtain is clipped to the street's box only while the turn could expose an edge.
39. ✅ M25/V57: the phone dock hides the bottom of the stage → the focal point is lifted above the dock.
40. ✅ M26: the header height is hardcoded → `--bar` is measured from the real header (zoom-safe).
41. ✅ V7: the sign crops mid-beat on phones → centring waits until the door is open.
42. ✅ V9: the door is dead-centre and static → the focal point is set at 50% height (horizon), per the POV rule.
43. ✅ V10: the portrait room crop is left-heavy, with the skylight hottest → object-position 58%, and a grade.
44. ✅ M32: on ultrawide the velvet behind the glass is giant (base ≥ 1) → base capped at .85.
45. ✅ V36: the vignette shape on 21:9 → closest-corner.
46. ✅ M46: calm and no-JS phones show a small card → a wider front on tall screens.
47. ⏸ V8: a sliver of the address peeks under the header on 1024×768 → acceptable after 36; revisit if seen.

### Light, colour, grade
48. ✅ V27: the room photo is cooler and higher-key than the painted front → a warm static grade.
49. ✅ V28: the windows stay milky (reflection ends at .25) → it ends at .08.
50. ✅ V29: the lit room through the windows is flat → dim ends at .22, with a touch of contrast.
51. ✅ V30/V56: a muddy room ghost under the story card → the flood reaches 1.
52. ✅ V31: a hot spot behind the headline → a flatter, softer centre.
53. ✅ V61: the hand-off seam into the voyage → the flood ends flat sand.
54. ✅ V32: the unlit sign is olive mud → a darker unlit gilt with a faint catch-light.
55. ✅ V33: the light leak is a light-sabre on phones → its width scales with the stage, with a lower peak.
56. ✅ V34: exposure plus leak fog → exposure peak .22, shaped as arrive-then-settle.
57. ✅ V35: the vignette peaks on the dark curtain → peak .35.
58. ✅ V19: the lamp glow is a round smudge → a downward pool on the fascia.
59. ✅ V25: the grain tile repeats → a 256px tile at .05.
60. ✅ V2: a flat ink band between the hero and the fascia (desktop) → a taller, softer seam.
61. ✅ V3: the phone seam is too thin to matter → 14% soft.

### Typography and chrome
62. ✅ V18: the phone sign lines are 8–9px → 10/9px floors, on portrait only.
63. ✅ V51: the dimmed Book button turns to mud and fails contrast → 60% and desaturated instead of 35%.
64. ✅ V52: "Come in." shadow pool is boxed → a soft pseudo-element pool.
65. ✅ V53: "Come in." and the skip link are hard to read on cobbles → 16px with a shadow; the link at 90%.
66. ✅ V54: "Come in." sits over the door on short landscape → it moves to the very bottom, smaller.
67. ✅ V55: an orphan "TO" in the heading at 360px → balanced wrap and a smaller floor.
68. ✅ V62: the static "keep scrolling" cue → a gentle bob (off under reduced motion).
69. ⏸ V60: the story heading repeats the sign's tagline → a copy decision for the owner.
70. ⏸ V58: the red progress line crosses the story card → it belongs to the site header; out of scope.
71. ⏸ V1: the unlit sign doubles the hero wordmark while rising → it is the real painted sign; softened by 54.

### Smoothness and performance
72. ✅ M4: the scene renders on every scroll event across the page → skipped when outside or unchanged.
73. ✅ M5/M6: every property is written every frame → writes are cached and only made on change.
74. ✅ M1: velvet overlays repaint the 3200w panel → dim and rim get their own composited layers.
75. ✅ M2: full-stage gradients repaint every frame → composited (will-change only while shown).
76. ✅ M3: the shine mask repaints inside the camera → its own layer.
77. ✅ M7: trackpad scrolling feels floaty → smoothing only for mouse-wheel notches.
78. ✅ M8: wheel lag stacks with Chrome's own smooth scroll → tau 60ms.
79. ✅ M9: a dead first smoothed frame → prev is seeded.
80. ✅ M10: a rect read on every scroll event → the section top is cached and re-measured on resize.
81. ✅ M11: lamps permanently promoted → will-change removed (their animation promotes them).
82. ✅ M12: about 130MB of layers on iOS → layers are `display:none` outside their beats.
83. ✅ M13: the camera is soft while held zoomed → will-change released after 150ms idle, so it re-rasters sharp.
84. ✅ M15: the room's first raster lands on the reveal frame → shown from .42 under the opaque front, and decoded early.
85. ✅ M17: requestIdleCallback has no timeout → a 1200ms timeout.
86. ✅ M18: the portrait velvet and room picks are too small → portrait `sizes` corrected.
87. ✅ V20: the front is soft past 2× on big desktops → a 4096 variant again.
88. ✅ V44/M14: the camera-fade flicker and the flattened 3D surface → no fade; hidden once the frame is off-screen.
89. ⏸ V21/V23: the door leaf (712w) and rail sources are small → the door is already at the art's native resolution; the rail is fixed by 19–21.
90. ⏸ V24: the room through the windows is double-scaled → the windows leave the screen early in the walk; low impact.

### Responsiveness and robustness
91. ✅ M28: an ink strip under the stage when the iOS URL bar collapses → stage on `lvh` where supported.
92. ✅ M29: the URL-bar resize re-measures mid-scroll → small height-only changes ignored on touch.
93. ✅ M30: rotating mid-scene jumps to another beat → progress is kept through re-measures.
94. ✅ M34: "Skip the story" animates every beat → smoothing off on hash jumps; large jumps snap.
95. ✅ M43: reduced motion switched on live leaves stale styles → the page re-renders (reload) on change.
96. ✅ M44: back/forward cache restores with stale geometry → re-measured on pageshow.
97. ⏸ M45: the phone street pops in after rotating to portrait mid-scene → rare; the browser fetches it lazily.
98. ✅ Section scroll budget unified: `height = stage + --len` (desktop 2600–3400px; touch 2800–3600px).
99. ✅ Header and stage: the sticky top follows the measured header.
100. ✅ Reduced motion and no-JS keep the calm layout; the new layers are hidden there.

**Totals:** 88 fixed this pass, 12 deferred. The deferred items are asset or copy tasks or low impact; reasons are above.
