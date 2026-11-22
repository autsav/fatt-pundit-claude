# src/assets/images

All site images live here. Astro (`astro:assets`) turns them into AVIF/WebP at the right sizes at build time,
so drop in the **largest original** you have (JPG/PNG, ideally 2400 px on the long edge). Never put images in `public/`.

Rules
- File names: lowercase, hyphens, no spaces: `soho-front-door-night.jpg`
- One subject per file. Crop later in code, not in the file.
- Every image needs alt text where it is used; the build fails without it.
- Logos: never rotate, recolour or place on a busy area (brand guidelines p.16).

## Folders and the files the build expects

| Folder | File (expected name) | Used in | Status |
| --- | --- | --- | --- |
| brand/ | logo-stamp-distressed-left.png, -right.png | Header, scene 1, stamp cards | Placeholder cut from guidelines PDF; replace with SVG from B3 branding pack |
| brand/ | logo-tiger-namemark-left.png, -right.png | Footer, doors (scene 2) | Placeholder; replace with SVG |
| brand/ | tiger-head-left.png, -right.png | Scene 2 doors | Placeholder; replace with SVG |
| brand/ | menu-back-map.png | Scene 3 reference | Placeholder; the live route needs the map as SVG |
| journey/ | 01-street-door.jpg | Scene 1 The street | **Needed** |
| journey/ | 04-kitchen-steamers.jpg (+ optional 04-steam.mp4, under 1 MB) | Scene 4 The kitchen | **Needed** |
| journey/ | 05-bar.jpg | Scene 5 The bar | **Needed** |
| journey/ | 06-room.jpg | Scene 6 The room | **Needed** |
| dishes/ | {dish-id}.jpg, e.g. crackling-spinach.jpg | Scene 4, menus | **Needed** for the 6 signatures (ids in src/data/dishes.json) |
| soho/ | hero.jpg, gallery-01.jpg ... gallery-09.jpg | /soho/ | **Needed** |
| covent-garden/ | hero.jpg, gallery-01.jpg ... gallery-09.jpg | /covent-garden/ | **Needed** |
| dubai/ | hero.jpg (render or site photo) | /dubai/ | **Needed** |
| unsorted/ | Photos not yet matched to a dish or room (unlabelled-dessert.jpg) | Nothing | Name it after its dish id and move it to dishes/ once the client confirms what it is. Kept out of dishes/ because that folder is globbed, and an unused file there is still copied into the build (563 KB). |

Signature dish ids: momo-kid-goat, crackling-spinach, popcorn-cauliflower, hakka-chilly-paneer-lettuce-cups,
bombay-chilly-prawns, malabar-monkfish-curry.

"left" / "right" = position on the guidelines page. Confirm with the client which tiger is the Indian tiger (Soho)
and which is the Chinese tiger (Covent Garden), then rename.
