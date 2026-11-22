/**
 * The lazy Susan in chapter two ("Something new"): real dishes ride a turntable that turns with the scroll.
 * The dishes sit on an ellipse (the turntable seen at three-quarters) and stay upright; one nearer the front
 * is bigger and drawn over the ones behind. The turntable turns one dish at a time (ease in and out, then a hold)
 * so each comes to the front under the light, with its name.
 *
 * Positions are in the table box's container units (cqw, cqh): the table art is 1800 x 1113, the turntable's
 * top face is centred at 50.4% / 26% of the box with radii 30.4% / 18% of it. The dishes ride a little inside its rim.
 * Times are % of the scene's track (the same scale as --from / --to in the chapter's style block).
 */
import type { ImageMetadata } from 'astro';

const CX = 50.4; // cqw
const CY = 26; // cqh
const RX = 26; // cqw
const RY = 15.3; // cqh (0.365 of RX in pixels: the turntable's tilt)
const W = 24; // dish width, cqw, at the front
const LAND = 60; // the first dish drops in over 60-65, each next one 1.4 later (they cascade)
const LAND_STEP = 1.4;
const TURN_FROM = 72;
const TURN_TO = 96;
const MOVE = 0.62; // share of each step spent turning; the rest is the hold at the front
const END = 100;

const ease = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2);
const r = (v: number, d = 2) => Number(v.toFixed(d));

/** Turntable angle (degrees) at track time t, for n dishes. */
function angle(t: number, n: number) {
  const step = 360 / n;
  const len = (TURN_TO - TURN_FROM) / (n - 1);
  if (t <= TURN_FROM) return 0;
  if (t >= TURN_TO) return step * (n - 1);
  const k = Math.floor((t - TURN_FROM) / len);
  const u = (t - TURN_FROM - k * len) / len;
  return step * k + step * ease(Math.min(1, u / MOVE));
}

export interface SusanDish { i: number; src: ImageMetadata; name: string; drop: string; tag: string }

/** Each dish's landing time and its name tag's time at the front. */
export function susanDishes(list: { src: ImageMetadata; name: string }[]): SusanDish[] {
  const n = list.length;
  if (n < 2) throw new Error('lazy-susan: needs at least two dishes to turn');
  const len = (TURN_TO - TURN_FROM) / (n - 1);
  return list.map((d, i) => {
    const from = LAND + i * LAND_STEP;
    // At the front: the first from its landing; the rest from the end of the turn that brings them round.
    const tagIn = i === 0 ? from + 4 : TURN_FROM + (i - 1) * len + MOVE * len - 1.2;
    const tagOut = i === n - 1 ? END : TURN_FROM + i * len - 0.8;
    return { ...d, i, drop: `--from:${r(from)}%;--to:${r(from + 5)}%`, tag: `--from:${r(tagIn)}%;--to:${r(tagIn + 2.5)}%;--out-from:${r(tagOut)}%;--out-to:${r(tagOut + 2)}%` };
  });
}

/** Keyframes for each dish's place on the turntable, sampled along the turn. */
export function susanCss(n: number): string {
  const step = 360 / n;
  const times: number[] = [];
  for (let t = LAND; t <= END; t += 0.5) times.push(t);
  const range = END - LAND;
  const rules: string[] = [];
  for (let i = 0; i < n; i++) {
    const frames: string[] = [];
    const layers: string[] = [];
    for (const t of times) {
      const psi = ((angle(t, n) - step * i) * Math.PI) / 180; // 0 = at the front
      const depth = (Math.cos(psi) + 1) / 2; // 1 front, 0 back
      const x = CX - Math.sin(psi) * RX;
      const y = CY + Math.cos(psi) * RY;
      const at = `${r(((t - LAND) / range) * 100)}%`;
      frames.push(`${at}{transform:translate(${r(x)}cqw,${r(y)}cqh) translate(-50%,-78%) scale(${r(0.56 + 0.5 * depth, 3)})}`);
      layers.push(`${at}{z-index:${3 + Math.round(depth * 8)}}`);
    }
    // Transform and stacking in separate animations: a keyframe set that mixes z-index with transform cannot run on
    // the compositor, so the turn would fall back to the main thread.
    rules.push(`@keyframes sn-susan-${i}{${frames.join('')}}@keyframes sn-susan-z-${i}{${layers.join('')}}`);
    rules.push(`.story-scene .sn-slot-${i}{animation:sn-susan-${i} linear both,sn-susan-z-${i} step-end both;animation-timeline:--scene,--scene;animation-range:contain ${LAND}% contain ${END}%,contain ${LAND}% contain ${END}%}`);
  }
  // Before the gate (no scroll timelines, or reduced motion) the scenes are not shown at all; the comic is.
  return `.sn-slot{position:absolute;left:0;top:0;width:${W}cqw;transform-origin:50% 78%}
@supports (animation-timeline: view()){@media (prefers-reduced-motion: no-preference){${rules.join('\n')}}}`;
}
