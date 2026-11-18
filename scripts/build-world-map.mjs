// Builds the world map for the voyage's second leg (Kolkata → London, and the Dubai branch).
// Run once (or when routes change): node scripts/build-world-map.mjs
// Outputs:
//   src/assets/images/brand/world-land.svg  — coastlines drawn in brand ink on paper (Natural Earth 1:50m, public domain)
//   src/assets/images/brand/voyage-sea.svg  — the same coast as a night chart (ink sea, gold engraved ripples, sand land)
//   src/data/world-route.json               — projected route paths + city points, same pixel box as the menu map
import { readFileSync, writeFileSync } from 'node:fs';
import { geoGraticule, geoMercator, geoPath } from 'd3-geo';
import { line, curveCatmullRom } from 'd3-shape';
import { feature } from 'topojson-client';

const W = 1295; // same box as the menu map, so the two layers swap cleanly
const H = 1320;

const topo = JSON.parse(readFileSync(new URL('../node_modules/world-atlas/land-50m.json', import.meta.url), 'utf8'));
const land = feature(topo, topo.objects.land);

// Frame: Atlantic edge of Europe to the South China Sea.
const frame = { type: 'MultiPoint', coordinates: [[-14, 60], [124, 60], [124, -6], [-14, -6]] };
const projection = geoMercator().fitExtent([[40, 150], [W - 40, H - 150]], frame);
projection.clipExtent([[0, 0], [W, H]]);
const path = geoPath(projection).digits(1);

const P = (lon, lat) => projection([lon, lat]).map((v) => Math.round(v * 10) / 10);
const curve = line().curve(curveCatmullRom.alpha(0.5)).digits(1);
const route = (pts) => curve(pts.map(([lon, lat]) => P(lon, lat)));

const points = {
  canton: P(113.26, 23.13),
  kolkata: P(88.36, 22.57),
  london: P(-0.13, 51.51),
  dubai: P(55.27, 25.2),
};

// Sea lanes (lon, lat), hand-placed so the line stays on water.
const leg1 = [[113.26, 23.13], [113.5, 21.2], [111, 17], [108.8, 11], [105.5, 4], [104.2, 1.3], [101, 2.6], [98.2, 6.5], [94.5, 13], [90.5, 19.5], [88.36, 22.57]];
const leg2 = [
  [88.36, 22.57], [88.2, 19], [84, 12], [81.4, 6.4], [79, 5.4], [74, 8.5], [66, 12.8], [56, 13.6], [48, 12.3], [43.4, 12.6],
  [40.2, 16.5], [37.4, 21.5], [34.4, 27.2], [32.6, 29.9], [32.3, 31.3], [27, 33.6], [19, 34.6], [12, 37.4], [7, 37.9],
  [0, 36.8], [-5.6, 35.95], [-9.6, 37.4], [-9.8, 42.5], [-7.5, 45.8], [-6.2, 48.4], [-3, 49.9], [0.6, 50.6], [1.6, 51.2], [0.6, 51.48], [-0.13, 51.51],
];
const dubai = [[64, 14.2], [61.2, 21.4], [59.2, 24.6], [57, 26.1], [55.9, 25.9], [55.27, 25.2]];
// London to Dubai for the Dubai page: leg 2 sailed backwards to the Arabian Sea, then the Gulf.
const toDubai = [...leg2.slice(6).reverse(), ...dubai];

const landPath = geoPath(projection).digits(0)(land);

// Drawn like the menu map (guidelines p.24): white paper, ink coastline with engraved
// ripple lines on the sea side. Wide-to-narrow strokes, then the land itself on top.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<defs><path id="l" d="${landPath}" stroke-linejoin="round"/></defs>
<rect width="${W}" height="${H}" fill="#ffffff"/>
<use href="#l" fill="none" stroke="#2c2925" stroke-width="15"/>
<use href="#l" fill="none" stroke="#ffffff" stroke-width="12.4"/>
<use href="#l" fill="none" stroke="#2c2925" stroke-width="8"/>
<use href="#l" fill="none" stroke="#ffffff" stroke-width="6.2"/>
<use href="#l" fill="#ffffff" stroke="#2c2925" stroke-width="2.6"/>
</svg>
`;
writeFileSync(new URL('../src/assets/images/brand/world-land.svg', import.meta.url), svg);

// Night chart for the home voyage: ink sea, gold graticule, gold ripple lines echoing the
// coast (the menu map's engraving, inverted), sand land with an ink coastline.
// The chart reaches past the route box on every side, so the camera never sees its edge.
const SEA = { x: -420, y: -160, w: W + 840, h: H + 320 };
projection.clipExtent([[SEA.x, SEA.y], [SEA.x + SEA.w, SEA.y + SEA.h]]);
const seaLand = geoPath(projection).digits(0)(land);
const grat = geoPath(projection).digits(0)(geoGraticule().step([10, 10])());
projection.clipExtent([[0, 0], [W, H]]);
const ripples = [40, 26, 14]
  .map((w, i) => `<use href="#l" fill="none" stroke="#cba052" stroke-opacity="${(0.34 - i * 0.07).toFixed(2)}" stroke-width="${w}"/>\n<use href="#l" fill="none" stroke="#2c2925" stroke-width="${w - 2}"/>`)
  .join('\n');
const sea = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${SEA.x} ${SEA.y} ${SEA.w} ${SEA.h}" width="${SEA.w}" height="${SEA.h}">
<defs><path id="l" d="${seaLand}" stroke-linejoin="round"/></defs>
<rect x="${SEA.x}" y="${SEA.y}" width="${SEA.w}" height="${SEA.h}" fill="#2c2925"/>
<path d="${grat}" fill="none" stroke="#cba052" stroke-opacity="0.16" stroke-width="1.2" stroke-dasharray="2 6"/>
${ripples}
<use href="#l" fill="#dac7b5" stroke="#cba052" stroke-width="7"/>
<use href="#l" fill="#dac7b5" stroke="#2c2925" stroke-width="2.4"/>
</svg>
`;
writeFileSync(new URL('../src/assets/images/brand/voyage-sea.svg', import.meta.url), sea);
writeFileSync(
  new URL('../src/data/world-route.json', import.meta.url),
  JSON.stringify(
    {
      w: W,
      h: H,
      points,
      // Where the brand's gold mountain drawings sit on this map.
      mountains: { himalaya: P(84, 31), alps: P(9, 46.5), caucasus: P(45, 41.5) },
      compass: P(-4, 2),
      sea: SEA,
      leg1: route(leg1),
      leg2: route(leg2),
      dubai: route(dubai),
      toDubai: route(toDubai),
    },
    null,
    2,
  ) + '\n',
);
console.log(`world-land.svg ${(svg.length / 1024).toFixed(0)} KB · points`, points);

// The site shows the sea as a picture (an SVG this detailed re-rasterises on
// every camera zoom). Master PNG at 3200 px; Astro makes the AVIF from it.
{
  const { default: sharp } = await import('sharp');
  const out = new URL('../src/assets/images/brand/voyage-sea.png', import.meta.url);
  await sharp(Buffer.from(sea), { density: (72 * 3200) / SEA.w }).resize(3200).png({ compressionLevel: 9 }).toFile(out.pathname);
  console.log('voyage-sea.png written');
}
