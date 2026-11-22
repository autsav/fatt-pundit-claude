# Our story: director's plan (v2, 22 Nov 2026)

How to turn `/our-story/` from a well-built storyboard into a short film people send to each other.
Builds on `docs/STORY-AWARD-PLAN.md` (stagecraft A1-A7 is done) and `docs/STORY-MOTION-PLAN.md`
(the scroll engine). Everything here keeps the rules in `docs/MOTION.md`: scroll is the camera, never
hijacked; transform and opacity only; calm mode and "Read as a comic" show the finished frames.

## 1. The pitch

> **Two tigers. One wok. Every day they argue. Every night the queue gets longer.**

The line is already in the script (p07). It is the trailer, the social caption and the share card.
Everything below serves it: two characters you can recognise from their silhouette alone, a fight
you want to watch, and a queue you want to join (the booking).

## 2. What is wrong today (the audit)

Walked the live page at 1440 x 900 and 375 x 812, with the owner's 14 annotated screenshots.

**A. There are no characters.** 16 scene layers have no art of their own. Ten borrow brand art or photos;
the six that still show a pencil card are exactly the six characters: `wok-fatt`, `wok-pundit`, `wok-queue`, `tangra-pundit`, `friends-table`,
`dubai-travellers`. Neither the harbour (ch.1) nor the at-sea scene shows Fatt at all. A story called
"The tale of Fatt & Pundit" never shows Fatt or Pundit.

**B. You cannot read the words.** Captions sit top-left at 15-17px, away from where the eye is (the
action is centre and low), and spend much of their range half-faded ("Weeks at sea", "Calcutta calls
it Indo-Chinese" were caught at about 40% opacity). Film does the opposite (section 6).

**C. You cannot follow the journey.** Four route charts (at sea, London calling, Next stop, the finale)
draw a 3px gold dotted line over a chart at 18-22% opacity on a busy gradient. Too thin, too faint, no
moving thing to follow. Factual errors on top:
- *At sea (ch.1):* the line arcs over the Himalayas from China to a "Calcutta" dot in north-west India.
  The caption says "Weeks at sea". The brand map behind it (`map.webp`) even draws the true sea lane
  (South China Sea, Malacca, Bay of Bengal). Same bug class as the four charts fixed on 22 Nov.
- Already fixed on 22 Nov: Tangra, London calling, Next stop and the finale now place every point
  from `src/data/world-route.json`.

**D. Empty frames.** The spice market is a sky with six floating chillies; Tangra has a large empty
sky over the lane; the Dubai beat is a dark gradient with one bubble. The eye has nothing to do.

**E. Real Fatt Pundit is missing where it matters.** The food is generic (a stock-looking dumpling
photo stuck on the tablecloth in "Your table"), Soho is a generic London terrace, and Covent Garden is
three tilted photos on a grey gradient. The owner has supplied the real photos (`assets/`, section 7).

**F. The finale is a framed card, not a scene.** "Where the recipes went" replays the voyage but inside
a bordered 16:9 box under a heading. The owner wants it full screen and fun.

**G. Story gaps (script).**
1. *No conflict on screen.* "Every day they argue" is told in a caption, never shown. There is no
   failed attempt, so there is no breakthrough.
2. *Steam and fire are in the wrong place.* Tangra's steam rises from the middle of the stall, not
   from the wok (`.tg-steam` is anchored at 50% / 50% of the stall art).
3. *Calcutta to London is unmotivated.* "The recipes travel on" skips the why. The true why is the
   diaspora: Tangra's children grew up, moved abroad and missed the taste.
4. *Time does not add up for people.* A young cook in the 1800s still opening Soho in 2019 reads as an
   error with human characters. With tigers it reads as a fable (section 3).
5. *No payoff in the real world.* The ending says "your table is ready", but nothing ties the story to
   the rooms, where the tiger paintings actually hang (Soho opened with "paintings of the 'Fatt Pundit'
   himself", restaurantonline.co.uk, 1 Mar 2019; the Covent Garden tiger mural is already in the
   story's own postcard photos).

### Owner's notes, one by one

| Screen | Note | Fix (section) |
|---|---|---|
| Harbour caption | Put text where the eye is; learn from film | Subtitles (6) |
| At sea route | Thicker line, one fun animation | The noodle road (5) + correct sea lane |
| Tangra stall | Steam should rise from the wok | Re-anchor `.tg-steam` to the wok (8, S0) |
| Tangra Pundit card | Design the character, make with Higgsfield | Tigers (3, 4) |
| Spice market | Dull, empty | New staging (8) |
| Night market | Fatt, Pundit, the queue | Tigers + growing queue (8) |
| Momos / friends | Use our real food, creatively | The Tangra table (7) |
| London chart | Hard to follow | The noodle road (5) |
| Soho street | Use our real Soho photo as art | Soho portrait (7) |
| Covent Garden | Use our many photos creatively | The gallery wall (7) |
| Next stop chart | Hard to look at | The noodle road (5) |
| Dubai | Add the characters | Tigers on the suitcases (8) |
| Your table | Real Fatt Pundit dumplings | Real momos in the steamer (7) |
| Finale map | Full screen, immersive, fun | Finale (8) |

## 3. The characters: two tigers in two hats

The logo already has them: `tiger-head-left.png` wears a turban with a jewelled plume (gold stamp),
`tiger-head-right.png` wears a beaded crown (orange stamp). Make them the cast.

| | **Fatt** | **Pundit** |
|---|---|---|
| Who | The Hakka cook, from Guangdong | The Calcutta scholar who lives to eat |
| Tiger | South China tiger (native to Guangdong): leaner, narrower stripes spaced wide, warmer orange | Bengal tiger (native to the Sundarbans, outside Calcutta): broader, dense stripes |
| Hat | The beaded crown from the logo, worn a little askew when he cooks | The turban from the logo, a pencil tucked in it; round spectacles |
| Colour key | Tiger `#F15D3D` (fire, wok) | Gold `#CBA052` (spice, turmeric, books) |
| Props | Wok (always), cleaver, grandmother's recipe book | Book under the arm, a twist of chillies in the pocket |
| Body | Compact, quick, all elbows; a cook's apron | Tall, round, unhurried; a shawl |
| Says | Short lines: "Show me." "More wok!" "Pack the wok." | Verdicts: "Good. But where is the fire?" "More chilli!" |
| Tells | Tail flicks when he's impatient | Spectacles steam up when food is hot (a running gag) |

Why tigers:
- **Recognition.** The tigers are already the logo, the stamps, the Soho paintings and the Covent Garden
  mural. Every frame of the story is now also brand.
- **Fable logic.** Animals can live 200 years and cross oceans; the time jump in G4 disappears.
- **No ethnic caricature.** The brief rightly bans it for human characters. Tigers carry the culture in
  their hats and their food, not in drawn human features.
- **IP.** Two characters with clear silhouettes travel: stickers, merch, menus, shorts (section 9).

Care points for the client to approve: both hats are the logo's own; Pundit's is a jewelled pagri with
a sarpech, not a Sikh dastar (keep it that way); Fatt's crown is ceremonial, so in the kitchen he can
wear it pushed back. The script's human words ("a young Hakka cook", "a local scholar") stay true.

Silhouette test (the rule for every pose): fill each tiger black. If you cannot tell which is which,
the pose is wrong. The hats do the work.

## 4. Making them (Higgsfield pipeline)

This changes Plan B1's rule ("no characters from Higgsfield"): the tigers are brand art, not people.
Client to confirm (#49).

1. **Character sheet first** (Higgsfield `character-sheet` workflow). References: both tiger heads,
   both stamps, and the approved style frame A layers (`harbour-*`, `tangra-*`) so they match the paper
   cut-out look. Per tiger: front, three-quarter, side, back; six expressions (neutral, doubtful,
   delighted, arguing, proud, teary from chilli); hands holding wok, bowl, book, suitcase.
2. **Client approval** of the sheet before any scene work.
3. **Scene layers**, one transparent PNG each (background removal), named to fill the empty slots
   (`wok-fatt`, `wok-pundit`, `tangra-pundit`, `friends-table`, `dubai-travellers`) plus new ones
   (`harbour-fatt`, `at-sea-fatt`, `spice-pundit`, `spice-fatt`, `table-tigers`). Same size rules as
   `docs/STORY-BRIEF.md` (about 1600px tall).
4. **Puppet parts** for the moves that sell the gag: Fatt's wok arm (pivot at the shoulder),
   Pundit's spectacles (a steam-up layer), both tails. These rotate on scroll like the shadow-puppet
   theatre the engine already is (pose swaps, no frame animation, as the benchmark does).
5. **Motion clips for social only** (image to video, 5-8 s loops): wok toss, spectacles fogging,
   suitcase slam. The site never plays video in the story; the shorts do (section 9).

Estimate credits with Higgsfield's cost tools before each batch; spend only with the owner's go-ahead.

## 5. The noodle road (the route animation)

One device for every journey, so the reader learns it once: **the route is a hand-pulled Hakka noodle.**
As you scroll, Fatt's junk sails the real sea lane and the noodle pays out behind it like a wake. Where
it arrives, it ties a knot and a passport stamp slams down with the city's name.

Readability rules (what fixes C):
- **Line:** a thick noodle, 8px at 1440 (min 5px on phones), sand with an ink edge so it reads on
  light and dark charts; the road ahead shows as faint dots so you know where it is going.
- **Something to follow:** the ship (and on the London legs, the tigers on deck) rides the head of
  the line, and the camera follows it at about 1.8x, pulling back to the whole route at the end.
- **Chart contrast:** land filled sand, sea ink (the night chart `voyage-sea.png`, already used on
  the home voyage), at full opacity. No more 18% outline on a gradient.
- **True lanes only:** every line from `world-route.json` (leg1, leg2, toDubai). Fix the at-sea scene
  to use leg1.
- **Places:** big names, a knot and a stamp. No labels that fade before you can read them.

Alternatives considered: the film-classic red line with a ship (clear, but common); a trail of
chillies (fun, but busy at sea). The noodle is ours: the dish is literally on the menu.

## 6. Words on screen: shoot it like film subtitles

From the Netflix English timed-text guide (42 characters per line, 2 lines at most, up to 20
characters per second for adults, centred) and title-safe practice:

- **Captions move to the lower third**, centred, inside a title-safe margin (10% from the bottom,
  above the phone dock). One caption on screen at a time; the eye has one place to look.
- **Size and plate:** clamp(18px, 2vw, 26px), sand on an ink plate at 90%; never over the busiest
  part of the art.
- **Length:** each caption 2 lines at most, about 42 characters a line. Long ones split into two cues
  (p07 becomes "Chinese technique, Indian spice." / "Every day they argue. Every night the queue gets longer.").
- **Time on screen:** fully readable for at least 12% of a track (about a screen of scroll), fading in
  and out over 3%, not 6-20% as now.
- **Speech bubbles** stay next to the speaker's head (they will have heads now). Sound words (TSSSS!,
  DING!) stay as graphic lettering.
- **Chapter title cards** stay (A3), now with the two tigers' heads in the frame as film idents.

## 7. Real food and real rooms (from `assets/`)

Rule: **the food is never redrawn by AI.** Real dishes are cut out of the owner's photos and placed
into the art, so what you see is what you get. Higgsfield makes the settings around them.

What `assets/` actually holds (313 files, catalogued 22 Nov 2026):

- **Real food photos, usable:** `veg momo.jpg` (green momos, top-down, on a round board: cleanest to
  cut), `momo.jpg` (white and green momos, 45°), `group pic.jpg` (a real top-down feast: Malabar curry,
  chaat, lettuce cups, bao in a steamer, paratha), `malabar curry.jpg` (top-down), `crunchy_pepper_crab.jpg`,
  `veg hakka.jpg`, `rabbit.jpg`, `sticky.jpg`, `mock chick.jpg`, `lady_kenny_new.png`, `brownie.jpg`,
  `tea.jpg`, and pro cocktail shots in `originals/section-04/alchemist/`.
- **AI images (Gemini watermark or synthetic):** most `*_new.jpg` dish shots, every storefront, the
  "tiger mural". Usable as mood reference only; never shown as "our food" or "our room".
- **No real photo of either storefront exists.** Every Soho and Covent Garden exterior is an AI render
  (door "77" and "6 Maiden Ln" signage drawn by the model). So the Soho portrait needs one real phone
  photo of the front (owner to supply) before it can be "the real Soho". Until then the scene keeps
  the illustrated street.
- **Real rooms, branch unconfirmed:** `originals/section-04/bar-interior.jpg` (best), `wallshow.jpg`
  (the blue-willow plate wall), `testimonials_bg.jpg` (likely Soho bar).
- **Never use:** files showing other venues (The Golden Hind, The French House, Bar Italia, The Globe
  Tavern, The Piazza Grill, Hong Kong Garden, a "MIX CLUB"), the "Michelin-star" text image, the
  unconfirmed "Best in taste, runner up 2021" rosette, and the Instagram screenshots (other people's
  names and faces).
- **No momos in a bamboo steamer** exist, and nothing for Dubai.

The pieces:

- **Your table (ch.5):** the real momos (`veg momo.jpg`, cut along the round board) set on the drawn
  table in perspective; the steamer lid lifts off them with steam. Replaces the rectangular photo.
- **The Tangra table (ch.3, p08-p09):** the real top-down feast (`group pic.jpg`) as the table the two
  tigers share, with single dishes (curry, Hakka noodles, crab, momos) cut out and slid in as each is
  named. Replaces the three tilted snapshots and the "friends" pencil card once the tigers exist.
- **Soho portrait (ch.4):** waits for a real photo of the front (decision 4).
- **The gallery wall (ch.4, Covent Garden):** the real rooms as framed pictures hung on a plaster wall
  beside the blue-willow plates, the camera dollying past; captions name only what is confirmed.

## 8. Chapter by chapter (the shot list)

**Cold open (new, 1 screen).** Black. A wok hits a flame (TSSSS!). Two voices argue off-screen in
bubbles ("More chilli!" "More wok!"). Smash to the title. The hook comes before the history lesson.

**1. A long way from home.** Wide: dawn harbour, Fatt on the quay with the wok strapped on (new layer).
Medium: packing the recipe book. **At sea:** night chart, the noodle road from Guangdong to Calcutta on
the true lane, Fatt on deck stirring soup as the ship rides the line.

**2. Tangra.** Wide: the lane, Fatt's stall with steam rising from the wok (fix the anchor). Pundit
walks in from the left as you scroll. Close-up insert: his spectacles fog up over the bowl. "Good. But
where is the fire?" **Spice market**, restaged so the frame is full: foreground sacks (have), mid-ground
stalls with hanging chilli garlands and spice cones, Pundit pulling Fatt by the sleeve through the
crowd, the chillies falling into Fatt's open paws (they never float in the sky again). "Show me."

**3. Something new.** *The argument, shown:* first try too mild (Pundit's tail droops), second too hot
(Fatt's eyes stream), third: silence, then both grin. Wide: the night market, Fatt tossing the roaring
wok centre frame, Pundit throwing in chillies, **the queue grows as you scroll** (each few percent, one
more neighbour steps in; the last place in the queue is an empty outline: yours). Then the Tangra
table (section 7) and the two of them sharing one plate.

**4. London calling.** One new line that motivates it: Tangra's children grew up, moved abroad and missed
the taste. The noodle road Calcutta to London. Soho: the portrait of the real front, in the rain, the
two tigers reflected in the window (a nod to the paintings inside). Covent Garden: the gallery wall.

**5. Next stop.** The noodle road London to Dubai, then dusk: the two tigers from behind, sitting on the
stamped suitcases, looking at the skyline. "Pack the wok." **Your table:** the lid lifts, real momos,
steam; Fatt and Pundit either side of the empty chair, waving you in. "Your table is ready."

**Finale, full screen.** No heading box. The whole screen is the night chart; a fast "previously on"
recap redraws the noodle road with all five stamps landing to the beat, the ship ends in harbour, and
the chart settles into the clickable branch pins. Title and lede arrive last, as an end card.

**Post-credits (new).** One line under the pins: "They are still there. Look up next time you are in
Soho." The tigers on the restaurant walls become a real-world hunt (section 9).

## 9. Making it travel (the viral kit)

- **Designed moments.** Each chapter has one frame built to be screenshotted and one 3-5 s beat built
  to be clipped: the wok hitting flame, spectacles fogging, the queue growing, the noodle road, the
  steamer lid. These are the hooks for the shorts.
- **Trailer and shorts from the same layers.** A 30 s vertical trailer and five "Fatt vs Pundit"
  shorts (chilli vs wok, momo folding, the queue, the move to London, packing for Dubai), rendered
  from the site's own layers with HyperFrames, so there is nothing to re-animate. Every one ends on
  "Your table is ready" and the booking link.
- **Choose your tiger.** At the end: "Are you a Fatt or a Pundit?" (fire or spice). Picking one gives a
  share card (an `og/[id]` image per tiger, as the branch cards already work) and the booking.
- **Tap to argue.** Tapping either tiger makes them bicker (a short list of lines from the script). A
  small, repeatable delight; keyboard-reachable; off in calm mode.
- **Find the tigers.** In the rooms: the paintings and the mural. A table card with a QR to the story
  and a photo prompt; the post-credits line points here. (Client decision.)
- **Sound, opt-in.** A wok sizzle, a steamer lid and a DING, behind a clear sound toggle (off by
  default, per A's open question). Sound sells food clips on social; on the site it stays a choice.
- **Seeding.** Awwwards/FWA entry (Plan C), London food press ("the origin of Indo-Chinese food as an
  animated scroll film"), food creators for the wok-ASMR short.
- **Measure.** Scroll completion per chapter, share-card clicks, booking clicks from the story,
  short-form views. Cut what nobody reaches.

Things we do not do: invent dates or facts, redraw real food with AI, put words inside the art, or hide
the booking behind the story.

## 10. Order of work

| Stage | What | Needs | Done when |
|---|---|---|---|
| **S0** Fix now (code only) | Subtitles (6); noodle road on all charts with true lanes, incl. the at-sea fix (5); steam on the wok; full-screen finale (8) | Nothing | Verify green, perf budget green, desktop + phone checked |
| **S1** Characters | Sheet, approval, then the 11 character layers (4) | Client OK on tigers (#49), Higgsfield credits | Every pencil card with a character is gone |
| **S2** Real food and rooms | Cut-outs, the Tangra table, steamer momos, Soho portrait, gallery wall (7) | Assets cleared for web use | No stock or generic food or rooms left |
| **S3** Fill and polish | Spice market and Tangra sky restaged, the argument beat, the queue, cold open, post-credits | S1 | Every frame passes the "where does the eye go" check |
| **S4** Viral kit | Trailer, shorts, choose your tiger, tap to argue, sound toggle, launch seeding (9) | S1-S3 | Trailer and five shorts exported; share cards live |

## 11. Decisions for the owner

1. Fatt and Pundit as the logo's two tigers (Fatt: crown, Pundit: turban)?
2. Script changes: the argument beat, the diaspora line before London, the post-credits line.
3. Higgsfield for the characters (changes Plan B1); budget for the batches.
4. Which `assets/` photos are cleared for web use; a real photo of the Soho front (none exists);
   which branch each real interior is; consent for the staff hands in the bar shots.
5. Sound: an opt-in toggle, yes or no.
6. In-room tie-in (table card, QR): yes or no.
