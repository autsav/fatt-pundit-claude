# Photo shot list — Fatt Pundit website

What the site still needs, where each photo goes, and how to shoot it so it matches what is already there.

## The look (match the Covent Garden set)

- Warm, low light: lamps on, no flash, no daylight blue. White balance on the warm side.
- Real tables: plates half-eaten is fine, staged stock look is not.
- Landscape 3:2, long edge 2400 px or more. JPEG, best quality. No filters or text on the photo.
- Leave room on one side of the room shots: on wide screens the words sit over the darker side.
- The site adds a light house grade on top, so shoot neutral rather than heavily edited.

## 1. Soho room (most important: Soho has no photos yet)

These replace the floor-plan frames in "Walk the room" on /soho/, in this order.

| # | Shot | Notes |
|---|------|-------|
| 1 | The door from Berwick Street | Outside, dusk, sign and window lit. Also used as the Soho hero. |
| 2 | The bar, on your left | From the door looking in: stools, hanging lights. |
| 3 | Tables for two and four | Along the right-hand wall; show the reclaimed wood and brick floor. |
| 4 | The graffiti wall | Chinese lettering, teal paint, tiffin carriers on the shelves. |
| 5 | The kitchen pass | Momos coming out; a chef's hands are fine, faces optional. |
| 6 | Wide of the whole room | Lamps on, a few guests, for the Soho gallery. |

## 2. Dishes (12)

Shoot each twice: top-down and at 45°. Plain dark table, dish fills about 60% of the frame.

1. Kid goat momo (Soho's "born here" dish, and a Dubai teaser)
2. Chicken momo
3. Popcorn cauliflower
4. Hakka chilly paneer lettuce cups
5. Malabar monkfish curry
6. Bombay chilly prawns
7. Shredded chilly venison
8. Veg Manchurian
9. Burnt ginger rice
10. Vegetable Hakka noodles
11. Vegan sizzling brownie (Dubai teaser)
12. Momo platter with the three chutneys (for share cards and social)

Already have good photos: mix vegetable momo, crackling spinach, crispy okra, sizzling brownie.

## 3. Bar

- White Tiger, Hakka Garden, Desi Dragon (one each, on the bar, warm back-light).
- The Covent Garden upstairs bar, wide.

## 4. Dubai

- A render or site photo of The Hangout, Mall of the Emirates, once the client can share it.

## How they go in

- Room and gallery photos: `src/assets/images/<soho|covent-garden|dubai>/`, then list the file name in that branch's `gallery` (and `hero`) in `src/data/branches.json`.
- Soho walk stops: add `image` and `alt` to each stop in `src/pages/[branch]/index.astro` (`sohoStops`); the floor plan steps aside on its own.
- Dishes: `src/assets/images/dishes/<dish-id>.jpg`, named after the id in `src/data/dishes.json`.
- Every photo needs a one-line description (alt text) of what is in it.
