/**
 * One motion language for the whole site (plan: "Motion language").
 * Fast = feedback (hover, tap). Slow = story (reveals). Nothing in between.
 */
export const DURATION = { fast: 0.2, story: 0.9, storyLong: 1.2 } as const; // seconds (Motion)
export const MS = { fast: 200, story: 900, storyLong: 1200 } as const; // milliseconds (anime.js)

/** Springs: things with weight. */
export const SPRING = {
  door: { type: 'spring', stiffness: 60, damping: 18, mass: 1.4 },
  stamp: { type: 'spring', stiffness: 420, damping: 22, mass: 1.1 },
  ui: { type: 'spring', stiffness: 500, damping: 34 },
} as const;

/** Easings shared by Motion (arrays) and anime.js (strings). */
export const EASE = {
  out: [0.23, 1, 0.32, 1] as const,
  inOut: [0.65, 0, 0.35, 1] as const,
  animeOut: 'outExpo',
  animeThud: 'outBack(1.6)',
} as const;

/** Calm mode: visitors who switch off motion get the same content, still. */
export function isCalm(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
