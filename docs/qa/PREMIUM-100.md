# Premium pass: 100 issues and the plan (23 Nov 2026)

## Method
- **Frames:** 210 captured from 11 pages, at desktop 1440×900 and phone 390×844.
- **Research:** premium hospitality craft, with 30 rules and 12 anti-patterns. References: Dishoom, Gymkhana, Noma, Hawksmoor, Apple, and the Awwwards restaurant gallery.
- **Audits:** three parallel audits covering home (H), branch and menu (B), and booking, story, info and the design system (S).
- **Prior audits:** still-open items from docs/qa/HOMEPAGE-AUDIT.md are carried over (#n).
- **Out of scope:** the door scene, already done in DOOR-SCENE-100.md.

## Rules adopted from the research (the bar every fix is held to)
1. **One display voice per role.** The slab is for the wordmark and signature titles; light typewriter for chapter H2s; Lora for long reading.
2. **Text wrapping:** `text-wrap: balance` on headings and `pretty` on prose. Measure 60–70ch.
3. **One Book style everywhere:** filled tiger `fp-btn--primary`. Two link roles only.
4. **No hard colour cuts between sections:** soft bands or feathered edges.
5. **Hover only on devices that hover.** Focus is visible everywhere.
6. **Chrome never covers content:** the dock hides on scroll down and on input focus, and pages pad for it.
7. **The first screen on every page answers "what is this, and how do I book".**
8. **Never let draft copy, false errors or US date formats reach a guest.**

## The 100, by area and owner

Status per item: ✅ done in this pass · ⏸ needs the client (photos, endpoints, facts) or an asset, so it is deferred.

### A. Design system: `styles/*.css` (owner: system)
1. S31 · Hover sticks on touch → wrap hover rules in `@media (hover:hover)`.
2. S32 · Book appears in four styles → one primary Book style; small variant in the footer.
3. S33 · Four link looks → two roles (inline, strong); footer links underline on hover.
4. S23 · Info-page lists lose their markers → `.fp-prose ul/ol` markers and spacing.
5. S24 · H1 → H2 jump on prose pages → prose H2 light at `--step-h3`, more space above.
6. H9 · Orphans everywhere → global `text-wrap: balance` on headings, `pretty` on paragraphs.
7. #41 · Anchors hide under the header → `scroll-padding-top: var(--header-h)`.
8. #45 · Layout shifts when a dialog opens → `scrollbar-gutter: stable`.
9. #69 · Default blue text selection → brand `::selection`.
10. #63 · Global grey antialiasing thins text on light backgrounds → apply only on dark surfaces.
11. B14 · Long reading set in typewriter → Lora for `.fp-prose` paragraphs.
12. S34 · Form containers differ → one `.fp-sheet` component.
13. H29 · The phone dock covers page content → body bottom padding for the dock height.
14. #49 · `content-visibility` placeholder size is wrong → `contain-intrinsic-size: auto`.
15. Focus ring → 2px gold on ink, 2px ink on light, 3px offset, on every interactive element.

### B. Chrome: header, footer, dock, rail, layouts, 404 (owner: chrome)
16. S37/H22 · Dock always fixed → hides on scroll down, shows on scroll up, hides on input focus; `aria-current` on /book/.
17. H23 · Header Book disappears while the hero CTA is clipped → swap at the header line.
18. H31/S36 · "Index" and "Rooms" are jargon and open the same dialog → one "Menu" trigger.
19. S35 · Nav has no "Our story" → added to desktop nav.
20. H36/B30 · The X icon reads as "close"; 16px icon targets → real X glyph, 44px targets.
21. S38/B29 · The phone footer runs 2.5 screens → collapsed rooms (details) on phones, plus a © line.
22. H25/B9 · External Book links give no new-tab cue → ↗ plus a hidden "(opens in a new tab)".
23. H20/H37 · The receipt clip makes Dubai look like it has Covent Garden's phone → shows a whole, branch-less summary.
24. H3 · The bill holder is an empty slab → cropped, `max-height` 60svh.
25. H7 · Goodbye heading shouts in caps → sentence case, display role, 14ch.
26. S20 · Chapter rail sits over art at all widths → translucent, 0.6 idle opacity.
27. H32 · Progress hairline duplicates the rail → hairline hidden where the rail shows.
28. S12 · Email addresses break mid-word → link text names the room.
29. S27 · Info pages show no review date → `updated` prop shown under the H1.
30. S28 · 404 reads like a sitemap → two groups, safe phone gutters.
31. S29 · Dead `[data-fortune]` hook → filled with an on-brand line.
32. S30 · 404 doesn't help → "Did you mean…?" matched to the nearest route.
33. S41 · Prerender fetches the heaviest page on hover → conservative for /our-story/.
34. #52 · Notch safe areas ignored → `viewport-fit=cover`.
35. ⏸ S39 · Per-page OG cards (needs `make-og` art).
36. ⏸ S40 · SVG favicon and maskable icon (needs the brand stamp as SVG).

### C. Home sections (owner: home)
37. H6 · Four display voices → every chapter H2 on `.fp-h2`.
38. H16/H17 · Hard ink↔sand cuts → feathered bands between sections.
39. H1 · 160px of empty gold under the passes → padding plus a gold-to-ink band.
40. H2 · Empty column under the film strip → strip sticky / aligned to the start.
41. H4/H19 · About 330px of menu controls before the book → secondary controls folded into a `<details>`.
42. H5 · Dead sand under the story opener → tightened, fades into ink.
43. H8 · Drink names wrap in wide caps → tighter tracking, balanced, fixed price column.
44. H10 · "4.8 / 5" baseline → lining numerals, aligned.
45. H11 · Calcutta stop is a void with oversized mountains → mountains at 0.55×, 0.7 alpha.
46. H12 · Room "pick" arc smudges labels → drawn outside the frame.
47. H13 · Bar photo about 85% black on phones → veil starts at 0.45 on touch.
48. H14 · Signature dish grades mismatch → one CSS grade.
49. H15 · Hero ends on a flat edge into the street → mask fade at the bottom.
50. H18 · Halftone dots cut in hard → fade in.
51. H21 · Passes carry 9 data points on phones → FLIGHT and SEAT hidden on phones.
52. H24 · Menu CTA ignores the selected branch → follows the toggle and opens the drawer.
53. #91 · Stub CTAs open a new tab → routed through the booking drawer (`data-book`).
54. H26 · Postcard marker cuts the glyphs → behind the text, padded.
55. H27/#55 · BOARDING stamp overlaps the name → placed in the header row grid.
56. H28 · Ticket strip and labels clipped on phones → scroll-snap with edge fades.
57. H30 · Menu tabs overflow with no cue → scroll-snap plus a fade mask.
58. H33 · Branch toggle doesn't match the book tabs → same choice/tab style.
59. H34 · The phone book opens on its cover only → a 2-dish peek under the cover.
60. #23 · MenuBook `drop-shadow` filter repaints → static box-shadow.
61. #31 · `voyage-ping` runs forever → stops after 3 cycles.
62. #33 · `key={leg}` remounts → stable keys.
63. B10 · Best room photos at 150px → one large frame plus the strip as an accent.
64. ⏸ H35 · Voyage PNGs to AVIF via `getImage` (React island props; next pass).
65. ⏸ #21 · Spring on the Voyage camera (motion rework; next pass).

### D. Branch and menu pages (owner: branch)
66. B1 · Boxed desktop hero with empty ink → full-bleed photo with the name card bottom-left.
67. B2 · Ghost tile boxes around the flap letters → removed at rest.
68. B3 · Phone hero is a 220px letterbox → 4:5 at about 60svh, name overlaid.
69. B5 · Hours and address below the fold → "Open now · 6 Maiden Lane" line in the hero.
70. B7 · Lone Book button → a "Reserve" card grouping Book, rating and the group rule.
71. B8 · "Open six days a week." hides the label → "Visit · Hours" kicker.
72. B13 · Branch H2 overrides the type scale → uses the `--step-h2` token.
73. B15 · Hard-coded menu sizes → type tokens.
74. B16 · Bold line standing in for a header → `.fp-h3`.
75. B17 · Eight-screen menu with no jumps → sticky section chips.
76. B18 · Tools fill the first phone screen → folded behind a "Filter" button.
77. B19 · Diet codes break the dish line → codes after the description.
78. B20 · Passport stamp reads as a checkbox → labelled "Save".
79. B22 · No allergen or service note per menu → a line under each menu's H2.
80. B23 · Switching menus loses focus → focus moves to the new H2.
81. B26/B28 · Branch and Dubai pages just stop → end on NextStep.
82. B27 · Other-room postcards are text only → open-now pill.
83. B31 · Menu page has no branch context → slim banner plus links to the other rooms' menus.
84. B32 · Header, picker and dock take 21% of a phone screen → picker 44px (the dock now hides).
85. B33 · Branch videos load before LCP → loaded on idle.
86. B34 · Every hidden menu renders → `content-visibility: auto`.
87. B4 · Soho sign in `system-ui` → brand face.
88. B25 · The Dubai page has no form → waitlist form with a mailto fallback (endpoint ⏸).
89. ⏸ B6 · Real map (needs map tiles or an illustrated plate); directions links kept.
90. ⏸ B11/B12/B24 · Branch, Soho room and Dubai photography (needs the shoot).

### E. Booking, private dining, story, info content (owner: pages)
91. S1/S2 · The desk shows a false red "No tables" by default → a valid default time; "Closed today, opens …" wording.
92. S3 · The desk's main action is a ghost button → primary buttons per room.
93. S4 · Guests is a bare number input with a max of 20 → 1–8 select plus "9 or more → Plan a group".
94. S5 · No trust signals → a reassurance row under the picker.
95. S8 · US date and 12-hour time on private dining → en-GB day and time selects.
96. S10/S13/S14 · Private-dining form faults: minimum 2 (should be 5); "Send an enquiry" twice on phones; bare success state → minimum 5, duplicate removed, a "what happens next" card.
97. S22 · Visible "Draft wording" notes → shown only before launch (`PUBLIC_LAUNCH`).
98. S25/S26 · Allergens: the 14 listed as a sentence; "In short" repeats paragraph one → a grid of the 14 and a `<dl>` of menu marks; repeat removed.
99. S15/S16/S18/S19/S21 · Story fixes: sfx overlaps a bubble; double map labels; the finale buries Book; truncated dish lines; a clipped chapter card.
100. ⏸ S9/S11/S17 · Private-dining endpoint, capacity facts, tiger paper treatment (client or asset).

**Totals:** 89 to do in this pass, 11 deferred (⏸). Each deferred item names what it is waiting for.
