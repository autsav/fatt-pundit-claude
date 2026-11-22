# Site review, 22 Nov 2026 (after the director's plan S0, S2, S4)

Five reviewers went through the whole site, top to bottom: an art director, a film director, an
interaction designer (with WCAG 2.2 checks), a brand and copy director, and a code reviewer. They
worked from 202 screenshots (every page, 1440 x 900 and 375 x 812) plus their own scripted captures
and tests. This report merges their findings and drops duplicates. Where several reviewers raised
the same thing, they are named. Their working files are in `/tmp/fp-review/` (art/, film/, ux/),
outside the repo.

**One-line verdict:** the engine and the bones are award-grade, and booking works well. The story
still plays as a slideshow of places. The characters are missing, about a fifth of the scroll is
empty, the words go by too fast to read, the art speaks six visual languages, and a few claims
aren't true yet.

## Fixed during the review (verified in the browser)

- The finale's ship jumped from London to the Arabian Sea over land. It now holds at London, then cuts to the Dubai spur.
- The finale's branch pins sat inside an `aria-hidden` block, so screen readers couldn't reach them. Only the decorative layers are hidden now.
- Keyboard users never reached the pins, which were hidden until the replay landed them. Pins now hide by opacity only, and focusing one jumps to the finished chart.
- On phones the finale's end card and pin card were squeezed to half width (`--gutter` was undefined). Both are now full width, with the button inside the card.
- On desktop the end card covered the Covent Garden pin. It now sits on the right.
- "Your table is ready." stayed floating over the gold wipe. It now fades out with the DING!
- An unused `lanes` key was shipping in the home page's JavaScript. It has been removed.

## P0: fix before launch

| # | What | Who raised it | Fix |
|---|---|---|---|
| 1 | Diet labels are wrong. Stir-fry Szechuan noodles carries V VG on a row that also offers chicken or beef. Bing bread is "buttery" but tagged VG DF. | Copy (CD Q2, Q3; CI #15, #16) | Split the noodle row. Remove VG/DF from bing bread until the client confirms. |
| 2 | Every "Join the Dubai list" button is a dead end. No form endpoint is set, so the Dubai page only says "follow us on Instagram". | UX, copy | Set `PUBLIC_DUBAI_LIST_ENDPOINT`, or relabel the five buttons "Dubai: get the opening date" and link them to Instagram. |
| 3 | The booking terms invent a walk-in policy ("we keep some tables free"). No source backs it. | Copy | Delete the line and ask the client (add it to CLIENT-INPUTS). |
| 4 | Home page contrast fails. Boarding-pass labels are 3.83:1, the pass code 2.88:1, the menu-book diet tags 2.24:1, "À la carte" 3.06:1, and the skip link 4.39:1. | UX | Raise the label opacity, use the deeper tiger and ink tones. |
| 5 | Calm mode and "Read as a comic" show 13 pencil storyboards instead of art. | UX | Use stills of each scene's finished state as the comic panels. |
| 6 | About 16-22% of the story's scroll is blank paper or a title card alone on paper (about 5 of 25 desktop screens). | Art, film, UX | Overlap the chapters, so the wipe reveals a composed title card that sits over the next scene's first shot. Start backdrops at 0%. Shorten the title tracks. |
| 7 | Words go by too fast to read. Captions are fully readable for only 0.15-0.3 of a screen of scroll; some bubbles ("Pack the wok.", "Show me.") for 2% of a track. Text also spends long stretches half-faded. | UX (measured), film, art | Keep each caption up until the next one replaces it, and each bubble for at least 10% of its track. Fade in and out over 3% at most. |

## P1: the big creative wins

| # | What | Who raised it | Direction |
|---|---|---|---|
| 8 | The stars are missing. Six pencil cards remain, the story's alt text still describes humans, and the logline appears nowhere on the site. | All | After the client approves the tigers: make the scene layers from the approved sheets, update the alt text, and put "Two tigers. One wok." on the story hero and a story share card. |
| 9 | There is no hook. The first screen is scenery, and the harbour is shown twice. | Film, art | A cold open: wok hits flame, TSSSS!, "More chilli!" / "More wok!", title slam. Merge the two harbours. |
| 10 | No conflict on screen. "Every day they argue" is only told. | Film, art | Three tries (too mild, too hot, perfect) staged as a shadow play on a tiger-orange screen. The queue grows one neighbour at a time, and the last place is an empty outline: you. |
| 11 | The story ends four times (table, recap map, "Come and taste the rest", the quiz), and the booking buttons come after the quiz. | Film | One ending: a short recap map, then "Your table is ready" as the last frame, with the booking buttons on the table. The quiz becomes a post-credits beat. |
| 12 | Six rendering styles and off-palette colours (mint, green, magenta, saturated blue). Straight CSS seams between layers. Stages shorter than the viewport. | Art | One print pass: map every layer to the five brand inks, matte finish, shared grain, torn edges, hard offset shadow. A planned colour arc across the chapters. Every stage at least 100svh, every backdrop bled. The big idea: a cut-paper proscenium arch with the two tiger heads as masks. |
| 13 | The Dubai skyline shows the wrong city: a Shanghai-style tower and a KL or Oriental-Pearl-style TV tower. Dubai is the launch market. | Art | Regenerate it from real references: Burj Khalifa, Burj Al Arab, Dubai Frame, Museum of the Future, the Creek. |
| 14 | The chapter rail is an opaque slab that covers the art (the Soho shop, the mural, DING!). | Art | A hairline with dots in the gutter, hidden while a stage is pinned. |
| 15 | Two different route tokens. Home's red junk disc is clearer than the story's gold coin. Map names are muddy (sand text with a blur halo on sand land). | Art, film | One token site-wide at 64px or more. One label style: ink on a sand cartouche, or the stamp alone. |
| 16 | Claims that aren't true or aren't confirmed: "open tonight" (false on Sundays and Mondays); a "Born here" badge on 36 or more dishes; "Online up to 7 at Soho"; the deposit wording differs between pages; three different allergy instructions. | Copy | Use day-aware or neutral copy, "House signature", one deposit line, one allergy line, and the client's sign-off on the rest. |
| 17 | Sharing is broken. Every page's og:image alt text says "boarding pass with the tiger stamp", and /our-story/ has no share card of its own. | Copy | Write alt text per card, and add a story card with the logline. |
| 18 | On phones the tiger-picker result lands under the dock, and the cards are links that behave as toggles. | UX | Scroll the result into view; make the cards `<button aria-pressed>`, with the share page kept as the no-JS fallback. |
| 19 | The Soho shop sign in the story is blank, and no real photo of the Soho front exists (every storefront in `assets/` is AI). | Film, plan | A live text layer on the board, then a real photo of the front. |

## P2: polish

- **Footer:** links are 24px tall (WCAG minimum, under the 44px guideline). The line "since 2019" reads as if Tangra began in 2019; say "In London since 2019".
- **"Scroll to begin" on the story's first screen:** half under the dock on phones, and clipped at the fold on desktop.
- **Naming:** "Chinese-Indian" in the home title against "Indo-Chinese" everywhere else. The home title is 76 characters.
- **Momo note:** reads as if Bhutan, Nepal and Tibet are parts of India. Reword with the client.
- **Inconsistencies:** "Kolkata" vs "Calcutta", "chilli" vs "chilly", and "Pitter pat" vs "Pitter-patter".
- **Story page headings:** every chapter's `h2` appears twice (once in the scenes, once in the comic).
- **Type:** the hairline h2s look thin next to the slab face. Make the speech bubbles hand-cut.
- **Real food layout:** the cut-outs sit on top of the same photo they were cut from. The momo board needs a re-cut in perspective.
- **Map cards:** tapping outside a map card doesn't close it on phones.

## What works (keep it)

- The scroll engine.
- The ink and sand night chart, and the noodle road on the true sea lanes.
- The film-style subtitles (now readable when they are on screen).
- The night-market wok frame, the strongest frame on the site.
- The real food.
- The tiger stamps and tiger picker.
- The booking: 2 taps from any page on a phone to OpenTable, with sensible defaults.
- No console errors and no horizontal overflow on any page.
- Focus rings everywhere.

## The 30-second trailer (film director's shot list)

0-1.2s, black, then the wok drops, the flame flares, TSSSS! · 1.2-2.6 Pundit pops in: "More chilli!"; Fatt: "More wok!" ·
2.6-3.6 the title flies in · 3.6-6 harbour, HOOONK! · 6-8.5 noodle road to Calcutta, stamp · 8.5-11 Tangra push-in, "Where
is the fire?", spectacles fog · 11-12.5 chillies rain into Fatt's paws · 12.5-16.5 three tries, SIZZLE! · 16.5-18.5 the
queue time-lapse, ending on the empty outline · 18.5-20.5 steamer lid lifts, real momos · 20.5-24 noodle road to London, Soho
rain, the mural, then Dubai · 24-27 "Your table is ready", both tigers wave · 27-30 end card: "Are you a Fatt or a Pundit?",
Soho · Covent Garden · Dubai soon.

## Decisions for the owner

1. Approve the two tigers as Fatt and Pundit (sheets made 22 Nov; one fix-up round recommended for stripes, the crown tilt and the plume).
2. The script changes: cold open, the argument beat, the diaspora line before London, one ending, and the logline.
3. Diet tags (#1), the walk-in line (#3), the Dubai list endpoint (#2), and the unconfirmed claims (#16).
4. Higgsfield spend for the scene layers and the Dubai skyline (balance 73 credits after the sheets).
5. A real photo of the Soho front.
