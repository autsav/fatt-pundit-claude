import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

/**
 * Mouse-wheel smoothing (Lenis), by the owner's request: see docs/MOTION.md principle 3.
 * Only notched mouse wheels are smoothed; trackpads and touch stay native.
 * Off under reduced motion and under Pause motion; both are watched live.
 */
declare global { interface Window { __lenis?: Lenis } }

type Target = Element | number | string;
type Opts = { offset?: number; immediate?: boolean };

// Lazy: this module is also imported by components that render on the server.
const rm = () => matchMedia('(prefers-reduced-motion: reduce)');
const allowed = () => !rm().matches && document.documentElement.dataset.motion !== 'paused';
let locks = 0;
let started = false;

// ponytail: header offset is read once at init; re-init on resize if the bar ever changes height.
const headerOffset = () => -((document.querySelector('.bar')?.getBoundingClientRect().height ?? 0) + 16);

// Smooth every wheel and trackpad gesture (the owner wants one butter-smooth feel on every device with a
// pointer); sideways trackpad swipes stay native so horizontal strips scroll. Touch is never hijacked
// (syncTouch: false). Returning false makes Lenis ignore the event, so the browser scrolls natively.
const wheelOnly = ({ event }: { event: Event }) => {
  if (event.type !== 'wheel') return false;
  const e = event as WheelEvent;
  return Math.abs(e.deltaY) >= Math.abs(e.deltaX);
};

function sync() {
  if (allowed() && !window.__lenis) {
    const l = new Lenis({
      autoRaf: true, lerp: 0.12, smoothWheel: true, syncTouch: false, allowNestedScroll: true,
      anchors: { offset: headerOffset() }, stopInertiaOnNavigate: true, virtualScroll: wheelOnly,
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
  window.addEventListener('fp:motion', sync);
  // Anchor and skip-link jumps clear the header at every size.
  window.addEventListener('resize', () => { if (window.__lenis) window.__lenis.options.anchors = { offset: headerOffset() }; }, { passive: true });
}

/** Freeze page scroll (dialog, drawer, lightbox). Counted, so overlays can stack. */
export function lockScroll(): void { if (locks++ === 0) window.__lenis?.stop(); }
export function unlockScroll(): void { if (locks > 0 && --locks === 0) window.__lenis?.start(); }

export function scrollToEl(target: Target, opts: Opts = {}): void {
  const l = window.__lenis;
  if (l) {
    // scrollIntoView honours scroll-margin-top; Lenis does not, so add it back.
    const margin = target instanceof Element ? parseFloat(getComputedStyle(target).scrollMarginTop) || 0 : 0;
    l.scrollTo(target, { offset: (opts.offset ?? 0) - margin, immediate: opts.immediate });
    return;
  }
  const behavior: ScrollBehavior = opts.immediate || !allowed() ? 'instant' : 'smooth';
  if (target instanceof Element) target.scrollIntoView({ block: 'start', behavior });
  else if (typeof target === 'number') window.scrollTo({ top: target + (opts.offset ?? 0), behavior });
  else document.querySelector(target)?.scrollIntoView({ block: 'start', behavior });
}
