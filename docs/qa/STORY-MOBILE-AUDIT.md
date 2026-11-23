# Our Story on phones: audit and fix plan (23 Nov 2026)

**Trigger.** The owner's Android screenshot of the wok ("SIZZLE!") scene: both tigers float in mid-air, with about 40% of the screen empty road beneath them.

**Method.**
- 308 frames of the live page: every pinned scene at 10 points through its animation.
- Four phones: 412×915 (a large Android like the owner's), 390×844, 360×780 and 430×932.
- Three audits ran in parallel. Item IDs below use their prefixes:
  - **G**: staging and graphics, 42 items.
  - **T**: text, interface and details, 36 items.
  - **M**: motion and pacing, 27 items, measured live with scripted touch scrolls.
- **Total:** 105 findings. They are grouped below by root cause, not by auditor.

## The three root causes

### 1. The story is far too short on phones (M1–M4)
- All the pinned scenes together are about 8,700px of scroll: roughly 15 seconds at a normal 600px/s swipe.
- The captions alone need about 37 seconds of reading at 4 words a second.
- So on phones:
  - captions show for 0.3–0.9 seconds
  - bubbles show for about 0.3 seconds
  - in the opening, the title card leaves within about 15px
  - a single swipe crosses 3–8 beats
- The swipe-speed limit can't fix this alone: the scroll distance simply isn't there.

### 2. Characters float on phones (G1–G3, G24, G5)
Three offsets stack up:
- **`--floor` reserves the bottom 60–85px for the phone dock,** which hides itself as soon as you scroll down. That bar of space is always empty, so every grounded layer sits too high.
- **Chapters lift the cast by percentages of the screen,** such as +26%, +36% or `--tb` − 9%, instead of by the painted ground line. On a tall phone their feet land on the far horizon.
  - In the wok scene, Pundit is also 10% higher than Fatt.
- **Nothing ties feet to the ground:** no contact shadows. The cast's scale also jumps between chapters: Fatt is about 70px tall in one chapter and about 350px in another.

### 3. Beats are timed as if every reader scrolls slowly (M5–M16, T7, T13, T22)
- Hard cuts over 8–16px, for example the wok out at 40–40.5%.
- 8–11 layers start at once in Tangra and London.
- Title cards ghost over the cast.
- The last caption fades just before the scene hands over, so the handover plays with no words.
- Linear easing on moving layers makes them stop dead.
- Bubbles stack on top of each other or have no visible speaker.

## The plan

### Phase 1: one pacing model (fixes cause 1 and most of cause 3)
1. Add a story beat constant: `--beat: 30svh`, about 275px on a 915px phone and about 0.46s per beat at a normal swipe. Each scene's phone height becomes `calc(100svh + N × var(--beat))`, where N is the scene's beat count.
2. Rescore every chapter in beats:
   - Entrance: 1 beat. Exit: half a beat.
   - At most 2 movers start in the same beat.
   - Captions hold `ceil(words ÷ 2)` beats.
   - Bubbles hold `max(2, ceil(words ÷ 2))` beats.
   - Sound effects hold 1 beat.
   - The last caption rides out with its sheet.
   - Ranges are written as `calc(B / N * 100%)`, so retiming a scene means changing N only.
3. Replace every hard cut with a crossfade of at least half a beat (M5–M8).
4. Easing for moving layers:
   - Use apple.com-style ease-out for landings, `cubic-bezier(.28,.11,.32,1)`, and a soft ease-in-out for exits, `cubic-bezier(.4,0,.6,1)`.
   - Ambient layers (sun, hills, compass, harbour) stay linear.
5. Each scene's first beat starts while it slides in (an `entry` range), so there are no dead slides between chapters (M13).
6. Input pacing to match the beat:
   - Touch lead capped at 150px with lerp 0.1, so a finger can't blow through several beats.
   - Coast capped at 0.22 × screen height.
   - Wheel lead set to beat ÷ 3.
   - Under Pause motion, keep the pacing but drop the smoothing (M18–M20, M25).

**Owner decision: story length.** Fully paced, the phone story is about 100 beats: roughly 27,500px, or 46 seconds at a normal swipe (today it is 15). The alternative is about 70 beats (about 32 seconds) by trimming phone captions to 8 words or fewer, keeping the full text in "Read as a comic" and for screen readers.

### Phase 2: grounding and staging (cause 2)
1. **`--floor`** follows the dock's real state: no reserved band while the dock is away (G3, T26).
2. **Ground line per backdrop.** Each backdrop gets a measured `--ground`, the svh of its road or floor front edge. The cast is anchored to `calc(var(--floor) + var(--ground))`, and both tigers share one baseline (G1, G2, G6, G30).
3. **One cast scale.** A `--cast-h: clamp(220px, 34svh, 360px)` token with per-shot multipliers: wide ×0.6, medium ×1, close-up ×1.4 (G24, G25).
4. **Contact shadows.** One soft ellipse under every cast group, in the story engine (G5, G7).
5. **Wok scene:**
   - The banquet counter no longer leaks in early (G4, T25).
   - The backdrop is cropped so its own stove and second wok are gone (G10).
   - "SIZZLE!" moves into the dark sky with a sand fill and ink stroke (G11, T19).
   - The two bubbles play in sequence (G12, T14).
6. **Layer fixes:** sacks behind the tigers' legs in Tangra (G9); explicit cast stacking in the wok scene (G28); the momo plate sits on the cloth (G13).
7. **Composition on phones:**
   - Canton's sky band (G16).
   - The at-sea map framing and the lingering sea strip (G17, G18).
   - The London storefront fills more of the frame (G19).
   - Next stop: the travellers and the empty band (G21, G22).
   - The Tangra top storey (G23).
8. **No blank or ghost frames:**
   - London's orange blur frame (G36).
   - The momo plate fading on an empty stage (G14).
   - Title cards held opaque before the cast enters (G39, T22).
   - Backdrops warmed early, with an average-colour background (T36).

### Phase 3: text and interface
1. **Opening:**
   - "Scroll to begin" moves above the dock, on a sand pill with an arrow (T1, T2).
   - The name note ("Fatt is a common Chinese surname…") and "Chapter one · A long way from home" join the opening card (T4, T23).
   - The "Read as a comic" toggle relabels itself when pressed, and appears again at the end (T5).
   - "Skip to the story" goes to the story (T6).
2. **Captions:**
   - The "queue" line matches what phones show (T8).
   - The spice-market caption gets a closing beat (T10).
   - Dubai copy says "opening soon" (T12).
3. **Bubbles:**
   - Tails follow the data and point at the speaker (T16, T17).
   - No unspoken lines on an empty street: the London line folds into the caption (T15, G20).
   - Nothing clipped at 360px (T18).
4. **Sound effects:** "Hooonk", "Tssss" and "Psshh!" clear of bubbles and faces (T20, T21).
5. **Minimum sizes:** map stamps at least 11px, tags at least 14px (T24).
6. **Phone chapter navigation:**
   - A slim "Chapter 2 / 5" chip.
   - A 3px reading line (T27).
7. **Finale:**
   - One end line instead of two.
   - Menu links become 44px chips.
   - Dish cards link to the menus.
   - One Book label pattern.
   - "Which tiger are you?" with fixed traits (T29–T32).
   - The footer "Book Covent Garden" button wraps at 360px (T28).
8. **Accessibility:**
   - One screen-reader line per beat, in story order.
   - Visual bubbles hidden from screen readers in favour of a transcript.
   - Real alt text in comic mode (T33–T35).

### Phase 4: smoothness and art polish
1. **Masks:**
   - The torn edge is masked on a top strip only, not the whole stage (M21).
2. **Images:**
   - Phone-sized crops for the at-sea map, which today decodes about 30MB (M22).
   - Fix the soft Tangra lane image (M27).
3. **Loops:**
   - Rain and blade-sway loops stop under Pause motion (M24).
   - Rain is gated outside its range (M23).
   - Tracks are measured in svh so the toolbar can't shift the scrub (M26).
4. **Art consistency:**
   - The food photos get the paper treatment (G34).
   - A shared vignette, and a Tangra→wok colour bridge (G35).
   - The Canton sun matches the opening (G31).
   - The opening gets a torn seam (G41).
   - Small fixes: G8, G15, G26, G27, G32, G37, G38.

### Deferred: needs new art or the owner
- **G33:** the harbour appears twice in two styles. Either use the opening harbour as Canton's backdrop or start at sea.
- **G20:** a tiger in the London doorway, if the bubble is kept.
- **G42:** paper-cut tiger heads for the "Fatt or Pundit" cards.
- **G10:** a stove-free wok backdrop from the illustrator, unless cropping is enough.

### Checks for every phase
- Re-capture the same 4 phones × 10 points and compare.
- Measure frames with a scripted touch scroll at 1× and 4× CPU.
- Read every caption at 600px/s.
- Test reduced motion, Pause motion and comic mode.
- `npm run verify`.
