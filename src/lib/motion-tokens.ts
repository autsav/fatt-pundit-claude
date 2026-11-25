/**
 * One motion language for the whole site (docs/MOTION.md).
 * Fast = feedback (hover, tap, a stamp landing). Slow = story (reveals). Nothing in between.
 */
// Same values as the CSS tokens in src/styles/tokens.css (--dur-press, --dur-fast, --dur-panel,
// --dur-spring, --dur-story, --dur-story-long, --stagger, --rise). Change both together.
// `spring` is how long SPRING.stamp takes to be still (1% rest); --curve-spring is that spring sampled.
export const MS = { press: 60, fast: 200, panel: 260, spring: 460, story: 900, storyLong: 1200 } as const; // milliseconds (anime.js)
/** Gap between siblings in a sequence; never more than 6 in one sequence. Big objects (passes) may use 2x. */
export const STAGGER_MS = 60;
/** How far a revealed block rises into place (px). */
export const RISE_PX = 24;

/** Springs: things with weight. Spatial only (transform); colour and opacity never overshoot (EASE.out). */
export const SPRING = {
  door: { type: 'spring', stiffness: 60, damping: 18, mass: 1.4 },
  /** Also the CSS pair --dur-spring + --curve-spring (tokens.css). */
  stamp: { type: 'spring', stiffness: 420, damping: 22, mass: 1.1 },
  ui: { type: 'spring', stiffness: 500, damping: 34 },
} as const;

/** The same spring for anime.js (`spring(animeSpring(SPRING.stamp))`): anime takes its duration from the spring. */
export const animeSpring = (s: { stiffness: number; damping: number; mass?: number }, velocity = 0) =>
  ({ mass: s.mass ?? 1, stiffness: s.stiffness, damping: s.damping, velocity }) as const;

/** Easings shared by Motion (arrays) and anime.js (strings). */
export const EASE = {
  out: [0.23, 1, 0.32, 1] as const,
  in: [0.5, 0, 0.75, 0] as const,
  inOut: [0.65, 0, 0.35, 1] as const,
  animeOut: 'outExpo',
} as const;

/** Calm mode: visitors who switch off motion get the same content, still. */
export function isCalm(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** "Pause motion" (footer): the loops that never end on their own stand still. */
export function isPaused(): boolean {
  return typeof document !== 'undefined' && document.documentElement.dataset.motion === 'paused';
}
