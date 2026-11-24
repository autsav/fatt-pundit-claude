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
const MAX_TOUCH_LEAD = 150; // px the finger may lead the screen in a story
const TOUCH_LERP = 0.1; // how the screen follows the finger in a story
const MAX_COAST = () => Math.round(innerHeight * 0.4); // px a touch flick may glide on in a story (~1.3 beats)
// Wheel in a story: the wheel adds to a distance budget, and drive() plays it out at one top speed (ease-in
// start, ease-out stop). Following a capped lead (lerp) instead made the speed sag between wheel events and
// surge on the next one: a visible sawtooth stutter.
let pending = 0; // px still to scroll
let vel = 0; // px/ms, signed
let raf = 0;
let lastT = 0;
const VMAX = () => innerHeight * 0.00065; // px/ms: ~10.8px a frame on a 900px screen
const DECEL = () => VMAX() / 420; // to rest over ~420ms
const ACCEL = () => VMAX() / 180; // to top speed over ~180ms
const MAX_PENDING = () => 0.3 * innerHeight; // a beat: how far the story glides on once the wheel stops
let cap = 0; // top speed of the current glide (px/ms): VMAX for the wheel, the finger's speed for a touch flick
let takeoverAt: number | null = null; // touch release: where the screen was, so the first frame doesn't step twice
function drive(t: number) {
  raf = 0;
  const l = window.__lenis;
  const takeover = takeoverAt !== null;
  // Yield to Lenis's own glides (anchor, skip link, scrollToEl) and to locks.
  if (!l || l.isStopped || (l.isScrolling === 'smooth' && !takeover) || (Math.abs(pending) < 0.5 && Math.abs(vel) < 0.01)) { pending = vel = 0; return; }
  if (takeover) {
    const moved = l.animatedScroll - (takeoverAt as number);
    takeoverAt = null;
    if (moved) { // the finger-follow lerp already stepped this frame: stop it there and count its step
      l.scrollTo(l.animatedScroll, { immediate: true, force: true });
      pending -= moved;
      lastT = t;
      raf = requestAnimationFrame(drive);
      return;
    }
  }
  const dt = lastT ? Math.min(t - lastT, 50) : 1000 / 60;
  lastT = t;
  const dir = Math.sign(pending);
  let step: number;
  if (vel && Math.sign(vel) !== dir) {
    // Reversed (or overshot): brake through zero at the ease-out rate rather than stopping dead.
    vel = Math.sign(vel) * Math.max(0, Math.abs(vel) - DECEL() * dt);
    step = vel * dt;
  } else {
    const want = dir * Math.min(Math.max(cap, VMAX()), Math.sqrt(2 * DECEL() * Math.abs(pending))); // ease-out: v = sqrt(2·a·d)
    vel = Math.abs(want) <= Math.abs(vel) ? want : vel + dir * Math.min(Math.abs(want - vel), ACCEL() * dt);
    step = Math.abs(vel * dt) >= Math.abs(pending) ? pending : vel * dt;
    if (step === pending) vel = 0; // arrived
  }
  const before = l.animatedScroll;
  l.scrollTo(before + step, { immediate: true, force: true });
  if (step && l.animatedScroll === before) { pending = vel = 0; return; } // page edge
  pending -= step;
  raf = requestAnimationFrame(drive);
}
const glide = () => { if (!raf) { lastT = 0; raf = requestAnimationFrame(drive); } };
// Cap a scroll delta so the target never runs more than `max` px ahead of what is on screen.
const clampLead = (l: Lenis, dy: number, max: number) => {
  const room = (dy > 0 ? max : -max) - (l.targetScroll - l.animatedScroll);
  return dy > 0 ? Math.max(0, Math.min(dy, room)) : Math.min(0, Math.max(dy, room));
};
// The home voyage paces the wheel only: touch there stays native (compositor-driven), as docs/MOTION.md
// promises. Taking a phone's swipe over in JS left the screen trailing the finger and stuttered the scene.
const TOUCH_NATIVE = 'section.voyage';
let zones: Array<[number, number, boolean]> = [];
const measureZones = () => {
  zones = [...document.querySelectorAll(PACED)].map((el) => {
    const r = el.getBoundingClientRect();
    return [r.top + scrollY, r.bottom + scrollY, !el.matches(TOUCH_NATIVE)] as [number, number, boolean];
  });
};
const inStory = (y: number, touch = false) => {
  const mid = y + innerHeight / 2;
  return zones.some(([a, b, t]) => mid >= a && mid <= b && (!touch || t));
};

// Every wheel and trackpad gesture is smoothed (sideways swipes stay native so horizontal strips scroll).
// Touch stays native outside the stories; inside them we take over touchmove ourselves (Lenis would follow
// the finger 1:1 with lerp 1): the target may lead by MAX_TOUCH_LEAD and the screen eases after it at TOUCH_LERP.
// Returning false makes Lenis ignore the event (the browser then scrolls natively unless we prevent it).
const gate = (data: { deltaX: number; deltaY: number; event: Event }) => {
  const { event } = data;
  const l = window.__lenis;
  if (!l) return false;
  if (event.type.startsWith('touch')) {
    if (!inStory(l.animatedScroll, true)) return false;
    if (event.type === 'touchend') {
      // The flick glides on at the finger's own speed and eases to a stop over its stopping distance
      // (v^2 / 2a): no long lerp tail creeping a pixel at a time at the end.
      const v = l.velocity * 0.06; // px/frame -> px/ms. ponytail: assumes 60Hz; on 120Hz the glide is shorter, measure frame dt if it shows
      const lead = l.targetScroll - l.animatedScroll;
      const stop = (v * v) / (2 * DECEL());
      pending = Math.sign(v || lead) * Math.min(Math.max(Math.abs(lead), stop), MAX_COAST());
      vel = Math.sign(v) === Math.sign(pending) ? v : 0;
      cap = Math.abs(vel);
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      takeoverAt = l.animatedScroll; // drive() takes over from the finger-follow lerp on the next frame
      glide();
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
    pending = vel = 0; takeoverAt = null; // touchstart: a finger on the glass stops any glide too
    return true; // touchstart: Lenis halts any glide under the finger
  }
  if (event.type !== 'wheel') return false;
  if (Math.abs(data.deltaY) < Math.abs(data.deltaX)) return false;
  if (inStory(l.animatedScroll)) {
    if (event.cancelable) event.preventDefault();
    if (l.isStopped) return false;
    const dy = data.deltaY;
    if (l.isScrolling === 'smooth' && !pending) return false; // an anchor glide is running: let it land
    if (pending && Math.sign(dy) !== Math.sign(pending)) pending = 0; // reversed: drop the old budget (drive brakes)
    cap = VMAX();
    pending = Math.max(-MAX_PENDING(), Math.min(MAX_PENDING(), pending + dy));
    glide();
    return false; // played out by drive()
  }
  pending = vel = 0; // left the story: Lenis's own wheel smoothing takes over from here
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
