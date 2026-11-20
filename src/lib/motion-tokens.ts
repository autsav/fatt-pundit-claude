/**
 * One motion language for the whole site (plan: "Motion language").
 * Fast = feedback (hover, tap). Slow = story (reveals). Nothing in between.
 */
// Same values as the CSS tokens in src/styles/tokens.css (--dur-press, --dur-fast, --dur-panel,
// --dur-story, --dur-story-long, --stagger). Change both together.
export const DURATION = { press: 0.06, fast: 0.2, panel: 0.26, story: 0.9, storyLong: 1.2 } as const; // seconds (Motion)
export const MS = { press: 60, fast: 200, panel: 260, story: 900, storyLong: 1200 } as const; // milliseconds (anime.js)
/** Gap between siblings in a sequence; never more than 6 in one sequence. */
export const STAGGER_MS = 60;

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
