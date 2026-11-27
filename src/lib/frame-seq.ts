// Pure frame-sequence maths for the scroll-scrubbed door scene. No DOM, no imports.

export type Rect = { l: number; t: number; w: number; h: number };

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Frame to show for scroll progress `t`, where `a..b` is the scrub window across `n` frames. */
export function frameIndex(t: number, a: number, b: number, n: number): number {
  return Math.round(clamp01((t - a) / (b - a)) * (n - 1));
}

/** Download order: ends, then coarse-to-fine multiples of 8 and 4, then the rest ascending. */
export function loadOrder(n: number): number[] {
  const seen = new Set<number>();
  const out: number[] = [];
  const take = (i: number) => {
    if (i >= 0 && i < n && !seen.has(i)) {
      seen.add(i);
      out.push(i);
    }
  };
  take(0);
  take(n - 1);
  for (const step of [8, 4]) for (let i = 0; i < n; i += step) take(i);
  for (let i = 0; i < n; i++) take(i);
  return out;
}

/** Index of the nearest truthy entry to `i`; ties go to the lower index; -1 if none. */
export function nearestLoaded(i: number, loaded: ArrayLike<unknown>): number {
  const len = loaded.length;
  for (let d = 0; d <= len; d++) {
    const lo = i - d;
    if (lo >= 0 && lo < len && loaded[lo]) return lo;
    const hi = i + d;
    if (d > 0 && hi >= 0 && hi < len && loaded[hi]) return hi;
  }
  return -1;
}

/**
 * Handoff from a front-plate rect (fractions of the frame) to the camera rect (stage px).
 * k=0: front rect lands on cam. k=1: frame cover-fitted to the stage, centred.
 * Linear interpolation between the two, k clamped to 0..1.
 */
export function handoffTransform(
  front: Rect,
  cam: Rect,
  stage: { w: number; h: number },
  frame: { w: number; h: number },
  k: number,
): { x: number; y: number; s: number } {
  const s0 = cam.w / (front.w * frame.w);
  const x0 = cam.l - front.l * frame.w * s0;
  const y0 = cam.t - front.t * frame.h * s0;

  const s1 = Math.max(stage.w / frame.w, stage.h / frame.h);
  const x1 = (stage.w - frame.w * s1) / 2;
  const y1 = (stage.h - frame.h * s1) / 2;

  const p = clamp01(k);
  // (1-p)*a + p*b keeps the endpoints exact at p=0 and p=1.
  const mix = (a: number, b: number) => (1 - p) * a + p * b;
  return { x: mix(x0, x1), y: mix(y0, y1), s: mix(s0, s1) };
}
