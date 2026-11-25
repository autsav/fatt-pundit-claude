import { lazy, Suspense, useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import world from '@/data/world-route.json';
import { isCalm } from '@/lib/motion-tokens';
import { scrollToEl } from '../../lib/smooth-scroll';

// Neither is on screen at first paint (Calcutta and Dubai cards), so they load after it.
const SplitFlapText = lazy(() => import('@/components/kokonutui/split-flap-text'));
const VoyageCalcutta = lazy(() => import('./VoyageCalcutta'));

/**
 * Scene 3: the voyage, "follow the ship". Pinned while the guest scrolls.
 *
 * A night chart (ink sea, gold engraved ripples, sand land; built by scripts/build-world-map.mjs)
 * fills the screen. A camera follows the brand's gold junk from port to port, pulling back on the
 * long leg. Four ports, about one screen each, each with a postcard (left on desktop, bottom on
 * phones). A ticket strip at the top gets a hole punched per port; tap a hole to jump there.
 *
 * Speed: the chart, the static art and the route are one "pan layer" moved by the GPU (one transform,
 * sized at the closest zoom so it never needs re-rasterising). The sailed line and port markers sit in
 * their own promoted SVG so a dash write repaints only that. The ship is an HTML badge moved with
 * translate3d. Port, leg and punched-hole state are classes toggled straight on the DOM from the
 * scroll callback: React never re-renders mid-scroll (only a postcard's own reveal does, at a port).
 * `--u` keeps strokes and markers screen-sized and is only rewritten on a 3% zoom step.
 * Calm mode: no pinning; the whole route is drawn and the postcards sit in a grid.
 */

export interface VoyageArt {
  sea: string;
  /** Sea at 1600/2400/3200 w; the browser picks by the laid-out width (see `size`). */
  seaSet?: string;
  map: string;
  ship: string;
  compass: string;
  stampGold: string;
  stampOrange: string;
  mountainA: string;
  mountainsB: string;
  mountainsC: string;
}

type Pt = [number, number];
/** The chart image runs past the route box on every side. */
const SEA = world.sea;
const PORTS: { id: string; name: string; at: Pt; dx: number; dy: number; anchor: 'start' | 'end' }[] = [
  { id: 'canton', name: 'Guangdong', at: world.points.canton as Pt, dx: 14, dy: -40, anchor: 'end' },
  // Below its point (the Bay of Bengal): "Guangdong" is longer than "Canton" was and ran into it at phone width.
  { id: 'kolkata', name: 'Calcutta', at: world.points.kolkata as Pt, dx: 14, dy: 30, anchor: 'end' },
  { id: 'london', name: 'London', at: world.points.london as Pt, dx: 14, dy: 30, anchor: 'start' },
  { id: 'dubai', name: 'Dubai', at: world.points.dubai as Pt, dx: 14, dy: -14, anchor: 'end' },
];
const LEGS = [world.leg1, world.leg2, world.toDubai];
const AT_SEA = [
  'At sea: the South China Sea and the Bay of Bengal',
  'Westward: the Arabian Sea, Suez, the Mediterranean',
  'Onward: back through Suez to the Gulf',
];

/** The scroll script: a hold at each port, sailing in between. `peak` = widest view on that leg. */
type Seg = { a: number; b: number } & ({ hold: number } | { leg: number; peak: number } | { out: true });
// Every port hold is 16% of the track (about 620 px), so a flick can't skip one. The last 6% eases out to the whole route.
const SEGS: Seg[] = [
  { a: 0, b: 0.16, hold: 0 },
  { a: 0.16, b: 0.23, leg: 0, peak: 520 },
  { a: 0.23, b: 0.39, hold: 1 },
  { a: 0.39, b: 0.54, leg: 1, peak: 1180 },
  { a: 0.54, b: 0.7, hold: 2 },
  { a: 0.7, b: 0.78, leg: 2, peak: 860 },
  { a: 0.78, b: 0.94, hold: 3 },
  { a: 0.94, b: 1.0001, out: true },
];
/** The whole-route view (also the calm-mode camera). */
const WHOLE: [number, number, number] = [660, 600, 1080];
/** Map units that fit the short side of the stage when the camera is in close. */
const CLOSE = 360;
// The sea picture is 3200 px wide. Lay it out no bigger than that in device
// pixels; the camera's scale() makes up the rest (slightly soft at the
// closest zoom, but drawn once instead of every frame).
const seaScale = (k: number) => Math.min(k, 3200 / (SEA.w * (typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1)));
const SHIP_PX = 64;
/** Where the ship docks at Dubai, east of the port: clears the "Dubai" label (Phase 10 nit; Direction C S6). */
const DOCK = SHIP_PX * 0.7;
/** Which port is current, shared with the postcards so only the one that changes re-renders. */
type LiveStore = { v: number; subs: Set<() => void> };
const NO_STORE: LiveStore = { v: -2, subs: new Set() };
const useLive = (store: LiveStore, i: number) =>
  useSyncExternalStore(
    (cb) => {
      store.subs.add(cb);
      return () => void store.subs.delete(cb);
    },
    () => store.v === i,
    () => i === 0,
  );
/** Mountain art at 0.55x, about its own centre (the Calcutta stop was a void with oversized peaks). */
const MTN = { transformBox: 'fill-box', transformOrigin: 'center', transform: 'scale(0.55)' } as const;

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);
/** Points sampled along each leg once (x, y pairs), so a scroll frame never asks the SVG for geometry.
 *  240 is a chord every ~6 map units: 14 px at the closest zoom, under what the ship moves between frames. */
const SAMPLES = 240;

/** A point part-way (0 to 1) along a sampled leg, by straight interpolation between samples. */
function pointAt(pts: Float32Array, f: number) {
  const x = clamp(f) * SAMPLES;
  const k = Math.min(SAMPLES - 1, Math.floor(x));
  const r = x - k;
  return { x: lerp(pts[k * 2], pts[k * 2 + 2], r), y: lerp(pts[k * 2 + 1], pts[k * 2 + 3], r) };
}

export default function Voyage({ art }: { art: VoyageArt }) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const seaRef = useRef<HTMLImageElement>(null);
  /** The pan layer: chart, static art and route, moved by one transform. */
  const panRef = useRef<HTMLDivElement>(null);
  const baseRef = useRef<SVGSVGElement>(null);
  const liveRef = useRef<SVGSVGElement>(null);
  const shipRef = useRef<HTMLDivElement>(null);
  const hullRef = useRef<HTMLDivElement>(null);
  const noteRef = useRef<HTMLParagraphElement>(null);
  const ticketRef = useRef<HTMLElement>(null);
  const legRefs = useRef<(SVGPathElement | null)[]>([]);
  const lens = useRef<number[]>([]);
  // Scroll-frame caches: route points sampled once, and the last values written, so a frame only
  // touches what changed.
  const samples = useRef<Float32Array[]>([]);
  const dashes = useRef<string[]>([]);
  const lastU = useRef(0);
  const layout = useRef({ w: 1, h: 1, fx: 0, fy: 0, fit: 1, k: 1 });
  const cam = useRef({ cx: 0, cy: 0, ppu: 1 });
  const facing = useRef(1);
  const shipShown = useRef(false);
  /** What the DOM currently shows (port, leg, furthest port reached); never React state. */
  const shown = useRef({ port: 0, leg: -1, reached: 0 });
  const store = useRef<LiveStore>({ v: 0, subs: new Set() }).current;
  const [calm, setCalm] = useState(false);

  /** How far through the pinned track the page is (0 to 1). */
  const progress = () => {
    const sec = sectionRef.current;
    if (!sec) return 0;
    return clamp(-sec.getBoundingClientRect().top / (sec.offsetHeight - window.innerHeight || 1));
  };

  /** The chart image and both SVG layers share one size: map units × k, so they take one transform. */
  const size = (k: number) => {
    for (const el of [seaRef.current, baseRef.current, liveRef.current]) {
      if (!el) continue;
      el.style.width = `${SEA.w * k}px`;
      el.style.height = `${SEA.h * k}px`;
    }
    if (seaRef.current) seaRef.current.sizes = `${Math.round(SEA.w * k)}px`;
  };

  /** Stage size → focal point (where the camera's centre lands) and the scale for the chart image. */
  const measure = useCallback((still = false) => {
    const st = stageRef.current;
    if (!st) return;
    const w = st.clientWidth;
    const h = st.clientHeight;
    if (still) {
      const fit = Math.min(w, h);
      const k = seaScale(fit / CLOSE);
      layout.current = { w, h, fx: w / 2, fy: h / 2, fit, k };
      size(k);
      return;
    }
    const desk = w >= 1024;
    const card = desk ? Math.min(460, w * 0.36) : 0;
    const fx = desk ? card + (w - card) / 2 : w / 2;
    const fy = desk ? h * 0.56 : h * 0.33;
    const fit = desk ? Math.min(w - card, h) : Math.min(w, h * 0.56);
    const k = seaScale(fit / CLOSE);
    layout.current = { w, h, fx, fy, fit, k };
    size(k);
  }, []);

  /**
   * Point the camera at (cx, cy) showing `span` map units across the stage's short side: one transform
   * on the pan layer (compositor only; a viewBox write laid the whole SVG out every frame).
   */
  const camera = (cx: number, cy: number, span: number) => {
    const { fx, fy, fit, k } = layout.current;
    const ppu = fit / span;
    cam.current = { cx, cy, ppu };
    if (panRef.current) panRef.current.style.transform = `translate3d(${fx - (cx - SEA.x) * ppu}px, ${fy - (cy - SEA.y) * ppu}px, 0) scale(${ppu / k})`;
    // --u keeps strokes and markers screen-sized; a 3% step is invisible and spares most frames a repaint.
    const u = 1 / ppu;
    if (Math.abs(u / (lastU.current || 1) - 1) > 0.03) {
      lastU.current = u;
      baseRef.current?.style.setProperty('--u', String(u));
      liveRef.current?.style.setProperty('--u', String(u));
    }
  };

  /** The ship is an HTML badge: its screen position follows from the camera, so it needs no SVG write. */
  /** ox: a screen-pixel nudge east, so the docked ship sits beside its port instead of over the label. */
  const placeShip = (x: number, y: number, dir: number, ox = 0) => {
    if (dir && dir !== facing.current) {
      facing.current = dir;
      if (hullRef.current) hullRef.current.style.transform = `scaleX(${dir})`;
    }
    const ship = shipRef.current;
    if (!ship) return;
    const { fx, fy } = layout.current;
    const { cx, cy, ppu } = cam.current;
    ship.style.transform = `translate3d(${fx + (x - cx) * ppu - SHIP_PX / 2 + ox}px, ${fy + (y - cy) * ppu - SHIP_PX / 2}px, 0)`;
    if (!shipShown.current) {
      shipShown.current = true;
      ship.style.opacity = '1';
    }
  };

  /** Port, leg and punched holes straight on the DOM (no React render); only changed state touches it. */
  const paint = (port: number, leg: number, reachedAt: number) => {
    const sec = sectionRef.current;
    const s = shown.current;
    const reached = Math.max(s.reached, reachedAt);
    if (!sec || (port === s.port && leg === s.leg && reached === s.reached)) return;
    if (port !== s.port || reached !== s.reached) {
      sec.querySelectorAll<SVGGElement>('.voyage-port').forEach((el, i) => {
        el.classList.toggle('is-reached', i <= reached);
        el.classList.toggle('is-here', i === port);
        const ring = el.querySelector<SVGElement>('.voyage-ring');
        if (ring) ring.style.animationIterationCount = i === port ? '3' : '';
      });
      sec.querySelectorAll('.voyage-hole').forEach((el, i) => {
        el.classList.toggle('is-punched', i <= reached);
        el.classList.toggle('is-here', i === port);
      });
    }
    if (port !== s.port) {
      sec.querySelectorAll('.voyage-card:not(.is-static)').forEach((el, i) => el.classList.toggle('is-on', i === port));
      store.v = port;
      store.subs.forEach((f) => f());
      // Phones: the ticket strip scrolls sideways; keep the current stop in view (no page scroll).
      const nav = ticketRef.current;
      const here = nav?.querySelectorAll<HTMLElement>('.voyage-hole')[port];
      if (nav && here && nav.scrollWidth > nav.clientWidth) nav.scrollTo({ left: nav.scrollLeft + here.getBoundingClientRect().left - nav.getBoundingClientRect().left - (nav.clientWidth - here.offsetWidth) / 2, behavior: isCalm() ? 'auto' : 'smooth' });
    }
    if (leg !== s.leg && noteRef.current) {
      noteRef.current.textContent = leg >= 0 ? AT_SEA[leg] : '';
      noteRef.current.classList.toggle('is-on', leg >= 0);
      noteRef.current.setAttribute('aria-hidden', String(leg < 0));
    }
    shown.current = { port, leg, reached };
  };

  const apply = (p: number) => {
    const s = SEGS.find((g) => p < g.b) ?? SEGS[SEGS.length - 1];
    const t = clamp((p - s.a) / (s.b - s.a));
    let drawn = 0;
    if ('hold' in s) {
      const [x, y] = PORTS[s.hold].at;
      camera(x, y, CLOSE * (1 - 0.05 * t));
      placeShip(x, y, 0, s.hold === 3 ? DOCK : 0);
      drawn = s.hold;
      paint(s.hold, -1, s.hold);
    } else if ('out' in s) {
      // Dubai to the whole route: the camera eases out, the ship stays put.
      const [x, y] = PORTS[3].at;
      const e = smooth(t);
      camera(lerp(x, WHOLE[0], e), lerp(y, WHOLE[1], e), lerp(CLOSE * 0.95, WHOLE[2], e));
      placeShip(x, y, 0, DOCK);
      drawn = 3;
      paint(3, -1, 3);
    } else {
      const len = lens.current[s.leg];
      const pts = samples.current[s.leg];
      const el = legRefs.current[s.leg];
      if (!len || !el) return;
      // A leg reached before its idle sampling is done asks the path itself for this frame (two calls).
      const at = (f: number) => (pts ? pointAt(pts, f) : el.getPointAtLength(clamp(f) * len));
      const e = smooth(t);
      const pt = at(e);
      const ahead = at(Math.min(1, e + 4 / len));
      const a = PORTS[s.leg].at;
      const b = PORTS[s.leg + 1].at;
      const pull = Math.sin(Math.PI * e);
      camera(lerp(pt.x, (a[0] + b[0]) / 2, pull), lerp(pt.y, (a[1] + b[1]) / 2, pull), lerp(CLOSE, s.peak, pull));
      // The drawing faces west; mirror it when sailing east.
      const dx = ahead.x - pt.x;
      // Arriving in Dubai, the ship eases a little east to dock beside the port, clear of its label.
      placeShip(pt.x, pt.y, Math.abs(dx) > 0.3 ? (dx > 0 ? -1 : 1) : 0, s.leg === 2 ? DOCK * smooth(clamp((e - 0.8) / 0.2)) : 0);
      drawn = s.leg + e;
      paint(-1, s.leg, s.leg);
    }
    legRefs.current.forEach((el, i) => {
      if (!el) return;
      const f = clamp(drawn - i);
      const dash = `${(f * lens.current[i]).toFixed(1)} ${lens.current[i] + 1}`;
      if (dashes.current[i] === dash) return;
      dashes.current[i] = dash;
      el.style.strokeDasharray = dash;
    });
  };

  useEffect(() => {
    // The chart is lazy in the HTML (210 KB that must not compete with the first screen; React would
    // otherwise emit a preload for it). The scene hydrates one screen before it is reached, so fetch
    // and decode it now, and the first close-up isn't a stalled frame.
    const sea = seaRef.current;
    if (!sea) return;
    measure(); // sets `sizes` so the right sea width is the one fetched
    sea.loading = 'eager';
    sea.decode?.().catch(() => {});
    // The art drawn on the chart and the ship's hull: decoded now too, not on first sight.
    for (const src of [art.mountainA, art.mountainsB, art.mountainsC, art.compass, art.ship]) {
      const im = new Image();
      im.src = src;
      im.decode().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    lens.current = legRefs.current.map((el) => el?.getTotalLength() ?? 0);
    const c = isCalm();
    setCalm(c);
    measure();
    if (c) {
      paint(-1, -1, 3);
      legRefs.current.forEach((el) => el && (el.style.strokeDasharray = 'none'));
      return;
    }
    // Sampling the legs (723 getPointAtLength calls; 1,443 at 480 a leg) is the heavy part of waking the
    // scene: 750 ms at 4x CPU for 480, which landed in one frame of the first scroll. Done in idle slices
    // instead, first leg first; a leg reached before its samples exist asks the path per frame meanwhile.
    samples.current = [];
    const parts = legRefs.current.map(() => new Float32Array((SAMPLES + 1) * 2));
    let leg = 0;
    let k = 0;
    const hasIdle = 'requestIdleCallback' in window;
    const idle = (f: (d?: IdleDeadline) => void, o: IdleRequestOptions) => (hasIdle ? window.requestIdleCallback(f, o) : window.setTimeout(f, 16));
    let slot = 0;
    const slice = (deadline?: IdleDeadline) => {
      const until = performance.now() + (deadline ? Math.max(4, deadline.timeRemaining()) : 8);
      while (leg < parts.length) {
        const el = legRefs.current[leg];
        const out = parts[leg];
        for (; k <= SAMPLES && el; k++) {
          const q = el.getPointAtLength((k / SAMPLES) * lens.current[leg]);
          out[k * 2] = q.x;
          out[k * 2 + 1] = q.y;
          if (k % 24 === 23 && performance.now() > until) break;
        }
        if (k <= SAMPLES && el) break;
        samples.current[leg] = out;
        leg++;
        k = 0;
        apply(progress());
      }
      if (leg < parts.length) slot = idle(slice, { timeout: 1000 });
    };
    slot = idle(slice, { timeout: 1000 });
    apply(progress());
    // One write per frame, whatever the scroll event rate.
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        apply(progress());
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    const ro = new ResizeObserver(() => {
      measure();
      apply(progress());
    });
    if (stageRef.current) ro.observe(stageRef.current);
    // The chart keeps its own layer only while the scene is pinned (will-change in global.css).
    const io = new IntersectionObserver(([e]) => {
      if (sectionRef.current) sectionRef.current.toggleAttribute('data-pinned', e.isIntersecting);
      // Layers are promoted only while the scene is on screen.
      for (const el of [panRef.current, liveRef.current, shipRef.current]) if (el) el.style.willChange = e.isIntersecting ? 'transform' : '';
    });
    if (sectionRef.current) io.observe(sectionRef.current);
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      if (hasIdle) window.cancelIdleCallback(slot);
      else window.clearTimeout(slot);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calm mode: one wide, still view of the whole route.
  useEffect(() => {
    if (!calm) return;
    measure(true);
    camera(...WHOLE);
    placeShip(...PORTS[2].at, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calm]);

  /** Ticket holes jump to a port. */
  const jump = (i: number) => {
    const sec = sectionRef.current;
    const hold = SEGS.find((g) => 'hold' in g && g.hold === i)!;
    if (!sec) return;
    const top = sec.getBoundingClientRect().top + window.scrollY;
    const travel = sec.offsetHeight - window.innerHeight;
    scrollToEl(top + travel * (hold.a + (hold.b - hold.a) * 0.3));
  };

  return (
    <section ref={sectionRef} id="story" className="voyage relative bg-ink text-ink" style={{ height: calm ? 'auto' : 'calc(100svh + 13 * 300px)' }} aria-label="The journey from Guangdong to Calcutta, London and Dubai">
      <h2 className="sr-only">The voyage: Guangdong to Calcutta, London and Dubai</h2>
      <div ref={stageRef} className={calm ? 'relative h-[min(80svh,760px)] overflow-hidden' : 'sticky top-[var(--header-h,68px)] h-[calc(100svh-var(--header-h,68px))] overflow-hidden'}>
        {/* The pan layer: chart, static art and route share one transform. */}
        <div ref={panRef} className="absolute left-0 top-0 origin-top-left" style={{ width: SEA.w, height: SEA.h }}>
          <img ref={seaRef} src={art.sea} srcSet={art.seaSet} alt="" aria-hidden="true" className="voyage-sea absolute left-0 top-0 max-w-none origin-top-left" width={SEA.w} height={SEA.h} loading="lazy" decoding="async" />
          {/* viewBox = the chart's box in map units, so the SVG and the image scale together. */}
          <svg ref={baseRef} className="voyage-ink absolute left-0 top-0" viewBox={`${SEA.x} ${SEA.y} ${SEA.w} ${SEA.h}`} style={{ width: SEA.w, height: SEA.h }} aria-hidden="true">
            <image href={art.mountainsB} x={world.mountains.himalaya[0] - 150} y={world.mountains.himalaya[1] - 70} width="260" opacity="0.7" style={MTN} />
            <image href={art.mountainA} x={world.mountains.alps[0] - 70} y={world.mountains.alps[1] - 40} width="150" opacity="0.7" style={MTN} />
            <image href={art.mountainsC} x={world.mountains.caucasus[0] - 60} y={world.mountains.caucasus[1] - 34} width="130" opacity="0.7" style={MTN} />
            <image href={art.compass} x={world.compass[0] - 70} y={world.compass[1] - 100} width="140" className="voyage-compass" />
            {/* The course ahead: gold dots. */}
            {LEGS.map((d, i) => (
              <path key={`c${i}`} d={d} className="voyage-course" />
            ))}
          </svg>
          {/* The live layer: the sailed line (dash writes) and the port markers, promoted on their own so a write repaints only this. */}
          <svg ref={liveRef} className="voyage-ink absolute left-0 top-0" viewBox={`${SEA.x} ${SEA.y} ${SEA.w} ${SEA.h}`} style={{ width: SEA.w, height: SEA.h }} aria-hidden="true">
            {/* The course sailed: drawn as the ship goes. Tiger for the story so far, gold for what's next. */}
            {/* The Dubai leg goes underneath, so where it retraces the London leg the tiger line stays on top. */}
            {[2, 0, 1].map((i) => (
              <path
                key={`l${i}`}
                ref={(el) => {
                  legRefs.current[i] = el;
                }}
                d={LEGS[i]}
                className={i === 2 ? 'voyage-sailed voyage-sailed-next' : 'voyage-sailed'}
                style={{ strokeDasharray: '0 100000' }}
              />
            ))}
            {PORTS.map((pt, i) => (
              <g key={pt.id} transform={`translate(${pt.at[0]} ${pt.at[1]})`} className={i === 0 ? 'voyage-port is-reached is-here' : 'voyage-port'}>
                <g className="voyage-mk">
                  <circle r="13" className="voyage-ring" style={i === 0 ? { animationIterationCount: 3 } : undefined} />
                  <circle r="6" className="voyage-dot" />
                  <text x={pt.anchor === 'end' ? -pt.dx - 6 : pt.dx + 6} y={pt.dy} textAnchor={pt.anchor} className="voyage-name">
                    {pt.name}
                  </text>
                </g>
              </g>
            ))}
          </svg>
        </div>
        {/* The brand's junk on a tiger badge, so it reads against the busy chart. A hard offset shadow (no blur: it moves every frame). */}
        <div ref={shipRef} aria-hidden="true" className="pointer-events-none absolute left-0 top-0 rounded-full" style={{ width: SHIP_PX, height: SHIP_PX, opacity: 0, background: 'var(--color-tiger)', border: '3px solid var(--color-sand)', boxShadow: '0 4px 0 rgb(0 0 0 / 0.45)', boxSizing: 'border-box' }}>
          {/* The hull in sand: the art's own alpha as a mask. Mirrored when sailing east. */}
          <div ref={hullRef} className="absolute" style={{ left: SHIP_PX * 0.11 - 3, top: SHIP_PX * 0.07 - 3, width: SHIP_PX * 0.78, height: SHIP_PX * 0.78, background: 'var(--color-sand)', transition: 'transform 450ms var(--curve-out)', WebkitMask: `url(${art.ship}) center / 100% 100% no-repeat`, mask: `url(${art.ship}) center / 100% 100% no-repeat` }} />
        </div>
        <div className="voyage-vignette pointer-events-none absolute inset-0" aria-hidden="true" />

        {/* Ticket strip: one hole punched per port; each hole jumps there. */}
        <div className="absolute inset-x-0 top-3 z-10 flex justify-center px-3">
          {/* Calm mode disables the jump buttons, so the strip grows to show every port instead of scrolling
              (a scroll box with nothing focusable can't be scrolled by keyboard: AUDIT B-19). */}
          <nav ref={ticketRef} aria-label="Ports on the voyage" className={calm
            ? 'voyage-ticket flex max-w-full flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-sand px-3 py-1.5 text-ink sm:px-5'
            : 'voyage-ticket flex max-w-full snap-x snap-mandatory items-center gap-1 overflow-x-auto bg-sand px-3 py-1.5 text-ink [scrollbar-width:none] max-sm:[mask-image:linear-gradient(90deg,transparent,#000_14px,#000_calc(100%-14px),transparent)] sm:gap-3 sm:snap-none sm:overflow-visible sm:px-5'}>
            <span className="hidden font-label text-[12px] font-bold uppercase tracking-[0.24em] text-tiger-deep sm:inline">Admit one</span>
            {PORTS.map((pt, i) => (
              <button key={pt.id} type="button" onClick={() => jump(i)} disabled={calm} aria-label={`Jump to ${pt.name}`} className={`voyage-hole group flex shrink-0 snap-center min-h-11 items-center gap-1.5 px-1 font-label text-[12px] font-bold uppercase tracking-[0.18em] sm:text-[12px] ${i === 0 ? 'is-punched is-here' : ''}`}>
                <span className="voyage-punch" aria-hidden="true" />
                <span>{pt.name}</span>
              </button>
            ))}
          </nav>
        </div>
        {!calm && (
          <p ref={noteRef} className="voyage-sea-note absolute inset-x-0 top-[72px] z-10 m-0 text-center font-note text-[clamp(15px,1.6vw,19px)] italic text-sand" aria-hidden="true" />
        )}

        {/* Postcards, one per port. All stay in the page for screen readers; only the current one shows. */}
        {!calm && (
          <ol className="m-0 list-none p-0">
            {PORTS.map((pt, i) => (
              <li key={pt.id} className={i === 0 ? 'voyage-card is-on' : 'voyage-card'}>
                <Postcard i={i} art={art} store={store} />
              </li>
            ))}
          </ol>
        )}
      </div>

      {calm && (
        <ol className="mx-auto grid max-w-[1240px] list-none gap-6 px-[clamp(16px,4vw,40px)] py-10 md:grid-cols-2">
          {PORTS.map((pt, i) => (
            <li key={pt.id} className="voyage-card is-on is-static">
              <Postcard i={i} art={art} store={NO_STORE} still />
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

/** A postcard from each port: kicker, place in Lora italic, a line or two, and its picture. */
function Postcard({ i, art, store, still = false }: { i: number; art: VoyageArt; store: LiveStore; still?: boolean }) {
  const live = useLive(store, i);
  const text = 'm-0 text-[clamp(15px,1.4vw,18px)] leading-snug';
  return (
    <article className="voyage-postcard">
      <header className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          {i === 0 && (
            <p className="fp-section-label">
              <span className="fp-section-no">01</span> Our story
            </p>
          )}
          <p className="m-0 font-note font-medium normal-case italic tracking-normal text-[17px] text-tiger-deep">Stop {i + 1} of 4</p>
          <h3 className="voyage-title m-0">{['Guangdong', 'Calcutta', 'London', 'Dubai'][i]}</h3>
        </div>
        <span className="voyage-postmark" aria-hidden="true">
          <span>{['China', 'Tangra', 'W1 and WC2', 'UAE'][i]}</span>
        </span>
      </header>

      {i === 0 && <p className={text}>Hakka families leave Guangdong, southern China, carrying their recipes across the sea.</p>}

      {i === 1 && (
        <>
          <img src={art.map} alt="The hand-drawn map from the Fatt Pundit menu: southern China, the Bay of Bengal and India" className="voyage-pic" width={1295} height={1320} loading="lazy" />
          <Suspense fallback={<p className={text}>They make a new home in Calcutta. In Tangra, its Chinatown, the wok meets Indian spice: Indo-Chinese food is born, new, yet familiar.</p>}>
            <VoyageCalcutta className={text} show={live || still} />
          </Suspense>
        </>
      )}

      {i === 2 && (
        <>
          <div className="flex items-end justify-center gap-6">
            <figure className="m-0 flex flex-col items-center gap-1">
              <img src={art.stampGold} alt="" className="h-auto w-[clamp(64px,8vw,96px)]" width={508} height={564} loading="lazy" decoding="async" />
              <figcaption className="font-note font-medium normal-case italic tracking-normal text-[15px]">Soho, 2019</figcaption>
            </figure>
            <figure className="m-0 flex flex-col items-center gap-1">
              <img src={art.stampOrange} alt="" className="h-auto w-[clamp(68px,8.5vw,102px)]" width={431} height={564} loading="lazy" decoding="async" />
              <figcaption className="font-note font-medium normal-case italic tracking-normal text-[15px]">Covent Garden, 2021</figcaption>
            </figure>
          </div>
          <p className={text}>The recipes reach London: Soho in 2019, Covent Garden in 2021.</p>
        </>
      )}

      {i === 3 && (
        <>
          <p className={text}>
            Next stop: Dubai, opening soon. <span className="voyage-boarding">Boarding soon</span>
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-3 border-t border-ink/20 pt-3">
            <div className="flex flex-col gap-1">
              {live ? (
                <Suspense fallback={<span className="text-[clamp(18px,2vw,26px)] font-bold tracking-[0.2em]">FATT</span>}>
                  <SplitFlapText className="text-[clamp(18px,2vw,26px)]" length={4} maxFlips={8} text="FATT" tileClassName="w-[0.86em] bg-ink text-sand" />
                </Suspense>
              ) : <span className="text-[clamp(18px,2vw,26px)] font-bold tracking-[0.2em]">FATT</span>}
              <span className="text-[13px]">a common Chinese surname</span>
            </div>
            <div className="flex flex-col gap-1">
              {live ? (
                <Suspense fallback={<span className="text-[clamp(18px,2vw,26px)] font-bold tracking-[0.2em]">PUNDIT</span>}>
                  <SplitFlapText className="text-[clamp(18px,2vw,26px)]" length={6} maxFlips={8} text="PUNDIT" tileClassName="w-[0.86em] bg-ink text-sand" />
                </Suspense>
              ) : <span className="text-[clamp(18px,2vw,26px)] font-bold tracking-[0.2em]">PUNDIT</span>}
              <span className="text-[13px]">the Indian word for a scholar</span>
            </div>
          </div>
        </>
      )}
    </article>
  );
}
