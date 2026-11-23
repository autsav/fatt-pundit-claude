import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

/**
 * Smooth scrolling (Lenis), by the owner's request: see docs/MOTION.md principle 3.
 * Wheel and trackpad are smoothed everywhere; touch is native except inside the story scenes, where
 * every input is paced to one top speed with an ease-out stop.
 * Off under reduced motion (watched live). Under Pause motion Lenis stays, but only inside the stories:
 * there the smoothing is pacing (the story's clock), not decoration; everywhere else wheel, touch and
 * anchor jumps are native/instant, as before.
 */
declare global { interface Window { __lenis?: Lenis } }

type Target = Element | number | string;
type Opts = { offset?: number; immediate?: boolean };

// Lazy: this module is also imported by components that render on the server.
const rm = () => matchMedia('(prefers-reduced-motion: reduce)');
const allowed = () => !rm().matches;
const paused = () => document.documentElement.dataset.motion === 'paused';
let locks = 0;
let started = false;

// ponytail: header offset is read once at init; re-init on resize if the bar ever changes height.
const headerOffset = () => -((document.querySelector('.bar')?.getBoundingClientRect().height ?? 0) + 16);

// The story scenes (home voyage, every pinned scene on /our-story/) play at one pace, whatever the
// swipe: the scroll may only run a little ahead of what is on screen, so a hard flick or a fast wheel
// moves the story at the same top speed and it glides to a stop (ease-out), like apple.com's pinned scenes.
const PACED = '[data-paced], .story-scene, section.voyage';
// A story beat is 30svh of scroll (--beat in global.css); svh ~ innerHeight on phones. Computed at use (rotation, toolbar).
const MAX_LEAD = () => (0.3 * innerHeight) / 3; // px the wheel/trackpad target may run ahead in a story: top speed ~ lerp x this per frame
const MAX_TOUCH_LEAD = 150; // px the finger may lead the screen in a story
const TOUCH_LERP = 0.1; // how the screen follows the finger in a story
const MAX_COAST = () => Math.round(innerHeight * 0.22); // px a touch flick may coast on in a story
const COAST_LERP = 0.06; // the coast's glide to a stop
// Cap a scroll delta so the target never runs more than `max` px ahead of what is on screen.
const clampLead = (l: Lenis, dy: number, max: number) => {
  const room = (dy > 0 ? max : -max) - (l.targetScroll - l.animatedScroll);
  return dy > 0 ? Math.max(0, Math.min(dy, room)) : Math.min(0, Math.max(dy, room));
};
let zones: Array<[number, number]> = [];
const measureZones = () => {
  zones = [...document.querySelectorAll(PACED)].map((el) => {
    const r = el.getBoundingClientRect();
    return [r.top + scrollY, r.bottom + scrollY] as [number, number];
  });
};
const inStory = (y: number) => { const mid = y + innerHeight / 2; return zones.some(([a, b]) => mid >= a && mid <= b); };

// Every wheel and trackpad gesture is smoothed (sideways swipes stay native so horizontal strips scroll).
// Touch stays native outside the stories; inside them we take over touchmove ourselves (Lenis would follow
// the finger 1:1 with lerp 1): the target may lead by MAX_TOUCH_LEAD and the screen eases after it at TOUCH_LERP.
// Returning false makes Lenis ignore the event (the browser then scrolls natively unless we prevent it).
const gate = (data: { deltaX: number; deltaY: number; event: Event }) => {
  const { event } = data;
  const l = window.__lenis;
  if (!l) return false;
  if (event.type.startsWith('touch')) {
    if (!inStory(l.animatedScroll)) return false;
    if (event.type === 'touchend') {
      const v = l.velocity;
      const coast = Math.sign(v) * Math.min(Math.abs(v) ** 1.4, MAX_COAST());
      if (Math.abs(coast) > 1) l.scrollTo(l.targetScroll + coast, { lerp: COAST_LERP, programmatic: false });
      return false;
    }
    if (event.type === 'touchmove') {
      // Nested scrollers and opted-out areas keep their own touch scrolling.
      if ((event.target as Element | null)?.closest?.('[data-lenis-prevent],[data-lenis-prevent-touch]')) return false;
      if (Math.abs(data.deltaY) <= Math.abs(data.deltaX)) return false; // sideways: native
      if (event.cancelable) event.preventDefault();
      if (l.isStopped) return false; // scroll locked (dialog open): swallow it, as Lenis would
      const dy = clampLead(l, data.deltaY, MAX_TOUCH_LEAD);
      if (dy) l.scrollTo(l.targetScroll + dy, { lerp: TOUCH_LERP, programmatic: false });
      return false; // handled here
    }
    return true; // touchstart: Lenis halts any glide under the finger
  }
  if (event.type !== 'wheel') return false;
  if (Math.abs(data.deltaY) < Math.abs(data.deltaX)) return false;
  if (inStory(l.animatedScroll)) {
    data.deltaY = clampLead(l, data.deltaY, MAX_LEAD());
    if (data.deltaY === 0) { if (event.cancelable) event.preventDefault(); return false; } // at top speed: hold it there
  }
  return !paused() || inStory(l.animatedScroll); // Pause motion: native wheel outside the stories
};

function sync() {
  if (allowed() && !window.__lenis) {
    const l = new Lenis({
      autoRaf: true, lerp: 0.12, smoothWheel: true, syncTouch: true, syncTouchLerp: 0.1, allowNestedScroll: true,
      anchors: paused() ? false : { offset: headerOffset() }, stopInertiaOnNavigate: true, virtualScroll: gate,
    });
    if (locks) l.stop();
    window.__lenis = l;
  } else if (!allowed() && window.__lenis) {
    window.__lenis.destroy();
    window.__lenis = undefined;
  }
}

export function initSmoothScroll(): void {
  if (started) return;
  started = true;
  sync();
  rm().addEventListener('change', sync);
  window.addEventListener('fp:motion', () => { sync(); if (window.__lenis) window.__lenis.options.anchors = paused() ? false : { offset: headerOffset() }; });
  // Anchor and skip-link jumps clear the header at every size.
  window.addEventListener('resize', () => { if (window.__lenis && !paused()) window.__lenis.options.anchors = { offset: headerOffset() }; }, { passive: true });
  // Where the stories are on the page (re-measured when anything above them changes size).
  measureZones();
  addEventListener('load', measureZones);
  new ResizeObserver(measureZones).observe(document.body);
}

/** Freeze page scroll (dialog, drawer, lightbox). Counted, so overlays can stack. */
export function lockScroll(): void { if (locks++ === 0) window.__lenis?.stop(); }
export function unlockScroll(): void { if (locks > 0 && --locks === 0) window.__lenis?.start(); }

export function scrollToEl(target: Target, opts: Opts = {}): void {
  const l = window.__lenis;
  if (l) {
    // scrollIntoView honours scroll-margin-top; Lenis does not, so add it back.
    const margin = target instanceof Element ? parseFloat(getComputedStyle(target).scrollMarginTop) || 0 : 0;
    l.scrollTo(target, { offset: (opts.offset ?? 0) - margin, immediate: opts.immediate || paused() });
    return;
  }
  const behavior: ScrollBehavior = opts.immediate || !allowed() || paused() ? 'instant' : 'smooth';
  if (target instanceof Element) target.scrollIntoView({ block: 'start', behavior });
  else if (typeof target === 'number') window.scrollTo({ top: target + (opts.offset ?? 0), behavior });
  else document.querySelector(target)?.scrollIntoView({ block: 'start', behavior });
}
