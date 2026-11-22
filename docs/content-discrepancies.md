# Content discrepancies: please confirm with the client

> **Resolved 20 Nov 2026 for the à la carte and drinks menus** by photos of the printed menus
> (`docs/reference/menu-2026-11/food-a-la-carte.jpg`, `drinks.jpg`). Every à la carte price on the photo matches
> the live-site column, so the site's food prices stand. The drinks list now follows the printed one: Chin Chin Choo
> £13.50 (bell pepper infused rum, passion fruit, mustard salt), Negroni £14, Hakka Garden with Cuban white rum; added
> The Scholar and the Priest £13.50, Birds Eye Margarita £14, Lunch Box £13.50, La Giustiniana Montessoro Gavi
> £10.25 / £56.50, saffron masala tea £5; removed Desi Dragon and the Akluj Chardonnay (not on the printed list).
> Wine prices already matched. Still open below: dietary-menu price variants, bing bread on the vegan menu (the print
> still says "buttery"), Covent Garden vs Soho menus (the photos don't say which room), chilly/chilli.

The site data (`src/data/*.json`) currently uses the **live website menus** (fattpundit.co.uk/soho/, read 18 Nov 2026),
because that is what guests see today. The brand guidelines PDF (B3 Designers, Aug 2026) shows different prices
and some different dishes and drinks. One of the two is out of date. **Client: tick the correct column for each row.**

## Food prices (£)

| Dish | Live site | Guidelines PDF | Correct? |
| --- | --- | --- | --- |
| Crackling spinach | 11.00 | 10.20 (à la carte page), 11.00 (other menus) | |
| Popcorn cauliflower | 11.00 | 10.20 | |
| Crispy okra salt ‘n’ pepper | 11.00 | 10.20 | |
| Hakka chilly paneer lettuce cups | 13.75 | 13.25 | |
| Sticky sesame vegetables | 11.50 | 11.20 | |
| Bombay chilli mock chicken | 13.75 (13.25 on live vegan menu, 11.00 on live GF menu) | 13.25 | |
| Kolkata chilli duck | 15.95 | 14.95 (à la carte), 15.75 (GF menu) | |
| Lollypop chicken | 11.50 | 10.50 | |
| Manchurian chicken | 14.00 | 13.50 | |
| Shredded chilly venison | 15.50 | 15.20 | |
| Bing bread | 5.90 | 5.20 (vegan menu) | |
| Burnt ginger rice | 6.25 (5.25 on live dairy-free menu) | 5.65 (vegan menu) | |
| Stir fry Szechuan noodles, veg | 13.00 | 12.20 (vegan menu) | |
| Sweet potato fries | 6.75 (6.65 on live dairy-free menu) | not listed | |
| Lady Kenny | 7.50 (7.00 on live sides tab) | not listed | |
| Szechuan honey duck | pre-theatre only, no price | 18.25 (dairy-free menu) | |
| Tamarind glazed potatoes | pre-theatre only, no price | 6.75 (gluten-free menu) | |

## Drinks

| Item | Live site | Guidelines PDF | Correct? |
| --- | --- | --- | --- |
| Fruit coolers, mocktail | 8.50 | 8.00 | |
| Chin Chin Choo | 11.00 | 13.50 | |
| Fatt Pundit Negroni | 13.50 | 14.00 | |
| Hakka Garden rum | Venezuelan white rum | Cuban white rum | |
| Desi Dragon | 13.50 | not listed | |
| The Scholar and the Priest | not listed | 13.50 | |
| Birds Eye Margarita | not listed | 14.00 | |
| Lunch Box | not listed | 13.50 | |
| Noam lager beer | not listed | 8.20 | |
| Saffron masala tea | not listed | 5.00 | |

The journey's bar scene names The Scholar and the Priest, which is only on the PDF. Confirm it is on the current list.

## Other questions

1. **Set menu price**: neither source gives a price per person.
2. **Bing bread** is described as "buttery" but appears on the vegan and dairy-free menus. Which is right? (Site now tags it V H only and drops it from those menus until confirmed; CLIENT-INPUTS #15.)
3. **Stir fry Szechuan noodles** appear on the vegan menu; now two rows: veg (V VG DF H) and chicken or beef (DF H); vegan menu keeps the veg row only (CLIENT-INPUTS #16).
4. **Covent Garden menus**: the live Covent Garden page lists menu names but no dishes. Same as Soho? Same prices?
5. **Spelling**: "Lollypop" (à la carte) vs "Lollipop" (pre-theatre); "chilly" vs "chilli" across dishes. Pick one style.
6. **Map label**: the guidelines map says "Kalkata". Kolkata or Calcutta for the website version?
7. **Allergen line**: live site also says "Anti-foaming agent E900" on pre-theatre menus. Add to every menu?
8. **Dubai**: menu, AED prices, alcohol and halal status: all unknown.
9. **Covent Garden booking system**: the old home page links to ResDiary (widget 28683), but the Covent Garden
   "Reserve a table" page embeds SevenRooms (venue `fattpunditcoventgarden`). The data uses SevenRooms. Which is live?
10. **Vouchers and click & collect**: the old pages show no voucher or pickup provider, only Deliveroo/Uber Eats links.
    What do guests actually use to buy vouchers and order pickup?
