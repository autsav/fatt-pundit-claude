/**
 * The banquet parade in chapter two ("Something new"): real dishes stand in a row on the table's edge, and one
 * slide of the whole row (a single compositor transform) brings each to the centre, where it dwells under the
 * tigers' chopsticks with its name. The dwell plateaus live in one `linear()` timing function: the row's
 * position is the value (0 = first dish centred, 1 = last), so no per-dish keyframes, z-index or filters animate.
 * Times are % of the scene's track (the same scale as --from / --to in the chapter's style block).
 */
import type { ImageMetadata } from 'astro';

const LAND = 62; // the first dish drops in over 62-66, each next one 1.2 later (they cascade)
const LAND_STEP = 1.2;
export const TURN_FROM = 72; // the slide: first move starts here, the last dish is centred by TURN_TO
export const TURN_TO = 97;
const MOVE = 0.55; // share of each step spent sliding; the rest is the dwell
const END = 100;
const EASE_STEPS = 12;

const ease = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2);
const r = (v: number, d = 2) => Number(v.toFixed(d));

export interface SusanDish { i: number; src: ImageMetadata; name: string; w: number; drop: string; tag: string }

/** Each dish's landing time and its name tag's window at the centre. `w` is the dish's width in the shared unit (real size, not box size). */
export function susanDishes(list: { src: ImageMetadata; name: string; w: number }[]): SusanDish[] {
  const n = list.length;
  if (n < 2) throw new Error('lazy-susan: needs at least two dishes to slide');
  const len = (TURN_TO - TURN_FROM) / (n - 1);
  return list.map((d, i) => {
    const from = LAND + i * LAND_STEP;
    // At the centre: the first from its landing; the rest from the end of the slide that brings them round.
    const tagIn = i === 0 ? from + 4.5 : TURN_FROM + (i - 1) * len + MOVE * len - 0.6;
    const tagOut = i === n - 1 ? END : TURN_FROM + i * len - 0.2;
    return { ...d, i, drop: `--from:${r(from)}%;--to:${r(from + 4)}%`, tag: `--from:${r(tagIn)}%;--to:${r(tagIn + 2)}%;--out-from:${r(tagOut)}%;--out-to:${r(tagOut + 1.6)}%` };
  });
}

/** The row's `linear()` timing function over TURN_FROM..TURN_TO: n - 1 slides, each an ease-in-out then a flat dwell. */
export function paradeEase(n: number): string {
  const pts: string[] = [];
  for (let k = 0; k < n - 1; k++) {
    for (let s = 0; s <= EASE_STEPS; s++) {
      const u = s / EASE_STEPS;
      const t = (k + MOVE * u) / (n - 1);
      pts.push(`${r((k + ease(u)) / (n - 1), 4)} ${r(t * 100, 2)}%`);
    }
    pts.push(`${r((k + 1) / (n - 1), 4)} ${r(((k + 1) / (n - 1)) * 100, 2)}%`); // the dwell's end
  }
  return `linear(${pts.join(', ')})`;
}

/** The row's slide, as CSS: the engine's `.fx` linear timing, swapped for the dwell curve (nothing else changes). */
export function susanCss(n: number): string {
  return `.story-scene .fx.sn-row{animation-timing-function:${paradeEase(n)}}`;
}
