import { useMotionValueEvent, useScroll } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Mark, MarkerText } from '@/components/kokonutui/marker-text';
import SplitFlapText from '@/components/kokonutui/split-flap-text';
import world from '@/data/world-route.json';
import { isCalm } from '@/lib/motion-tokens';

/**
 * Scene 3: the voyage, "follow the ship". Pinned while the guest scrolls.
 *
 * A night chart (ink sea, gold engraved ripples, sand land; built by scripts/build-world-map.mjs)
 * fills the screen. A camera follows the brand's gold junk from port to port, pulling back on the
 * long leg. Four ports, about one screen each, each with a postcard (left on desktop, bottom on
 * phones). A ticket strip at the top gets a hole punched per port; tap a hole to jump there.
 *
 * Speed: the chart is one image moved by the GPU (transform only). Route, ship and labels sit in a
 * light SVG on top whose camera group takes the same transform (no per-frame viewBox, so no layout),
 * with `--u` keeping strokes and markers screen-sized.
 * Calm mode: no pinning; the whole route is drawn and the postcards sit in a grid.
 */

export interface VoyageArt {
  sea: string;
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
type Seg = { a: number; b: number } & ({ hold: number } | { leg: number; peak: number });
const SEGS: Seg[] = [
  { a: 0, b: 0.1, hold: 0 },
  { a: 0.1, b: 0.27, leg: 0, peak: 520 },
  { a: 0.27, b: 0.41, hold: 1 },
  { a: 0.41, b: 0.69, leg: 1, peak: 1180 },
  { a: 0.69, b: 0.79, hold: 2 },
  { a: 0.79, b: 0.92, leg: 2, peak: 860 },
  { a: 0.92, b: 1.0001, hold: 3 },
];
/** Map units that fit the short side of the stage when the camera is in close. */
const CLOSE = 360;
// The sea picture is 3200 px wide. Lay it out no bigger than that in device
// pixels; the camera's scale() makes up the rest (slightly soft at the
// closest zoom, but drawn once instead of every frame).
const seaScale = (k: number) => Math.min(k, 3200 / (SEA.w * (typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1)));
const SHIP_PX = 64;

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
  const svgRef = useRef<SVGSVGElement>(null);
  /** Everything drawn in map units; the camera moves this one group. */
  const camRef = useRef<SVGGElement>(null);
  const shipRef = useRef<SVGGElement>(null);
  const hullRef = useRef<SVGGElement>(null);
  const legRefs = useRef<(SVGPathElement | null)[]>([]);
  const lens = useRef<number[]>([]);
  // Scroll-frame caches: route points sampled once, and the last values written, so a frame only
  // touches what changed (the per-frame getPointAtLength, the four dash writes and the --u write on
  // the whole overlay showed up as most of the voyage's frame time at 4x CPU).
  const samples = useRef<Float32Array[]>([]);
  const dashes = useRef<string[]>([]);
  const lastU = useRef(0);
  const layout = useRef({ w: 1, h: 1, fx: 0, fy: 0, fit: 1, k: 1 });
  const facing = useRef(1);
  const [calm, setCalm] = useState(false);
  const [port, setPort] = useState(0);
  const [leg, setLeg] = useState(-1);
  const [reached, setReached] = useState(0);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });

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
      if (seaRef.current) {
        seaRef.current.style.width = `${SEA.w * k}px`;
        seaRef.current.style.height = `${SEA.h * k}px`;
      }
      return;
    }
    const desk = w >= 1024;
    const card = desk ? Math.min(460, w * 0.36) : 0;
    const fx = desk ? card + (w - card) / 2 : w / 2;
    const fy = desk ? h * 0.56 : h * 0.33;
    const fit = desk ? Math.min(w - card, h) : Math.min(w, h * 0.56);
    const k = seaScale(fit / CLOSE);
    layout.current = { w, h, fx, fy, fit, k };
    if (seaRef.current) {
      seaRef.current.style.width = `${SEA.w * k}px`;
      seaRef.current.style.height = `${SEA.h * k}px`;
    }
  }, []);

  /**
   * Point the camera at (cx, cy) showing `span` map units across the stage's short side. The chart and
   * the overlay's group take the same move as one transform each (paint, never layout: a viewBox write
   * laid the whole SVG out again every frame, M4 of docs/MOTION-ROADMAP.md).
   */
  const camera = (cx: number, cy: number, span: number) => {
    const { fx, fy, fit, k } = layout.current;
    const ppu = fit / span;
    if (seaRef.current) seaRef.current.style.transform = `translate3d(${fx - (cx - SEA.x) * ppu}px, ${fy - (cy - SEA.y) * ppu}px, 0) scale(${ppu / k})`;
    if (camRef.current) camRef.current.style.transform = `translate(${fx - cx * ppu}px, ${fy - cy * ppu}px) scale(${ppu})`;
    const svg = svgRef.current;
    if (svg) {
      // --u keeps strokes and markers screen-sized; a 0.4% step is invisible and spares most frames
      // a style recalculation of everything that reads it.
      const u = 1 / ppu;
      if (Math.abs(u / (lastU.current || 1) - 1) > 0.004) {
        lastU.current = u;
        svg.style.setProperty('--u', String(u));
      }
    }
  };

  const placeShip = (x: number, y: number, dir: number) => {
    if (dir && dir !== facing.current) {
      facing.current = dir;
      hullRef.current?.setAttribute('transform', `scale(${dir} 1)`);
    }
    shipRef.current?.setAttribute('transform', `translate(${x} ${y})`);
  };

  const apply = (p: number) => {
    const s = SEGS.find((g) => p < g.b) ?? SEGS[SEGS.length - 1];
    const t = clamp((p - s.a) / (s.b - s.a));
    let drawn = 0;
    if ('hold' in s) {
      const [x, y] = PORTS[s.hold].at;
      camera(x, y, CLOSE * (1 - 0.05 * t));
      placeShip(x, y, 0);
      drawn = s.hold;
      if (port !== s.hold) setPort(s.hold);
      if (leg !== -1) setLeg(-1);
      if (reached < s.hold) setReached(s.hold);
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
      placeShip(pt.x, pt.y, Math.abs(dx) > 0.3 ? (dx > 0 ? -1 : 1) : 0);
      drawn = s.leg + e;
      if (port !== -1) setPort(-1);
      if (leg !== s.leg) setLeg(s.leg);
      if (reached < s.leg) setReached(s.leg);
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
    sea.loading = 'eager';
    sea.decode?.().catch(() => {});
  }, []);

  useEffect(() => {
    lens.current = legRefs.current.map((el) => el?.getTotalLength() ?? 0);
    const c = isCalm();
    setCalm(c);
    measure();
    if (c) {
      setReached(3);
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
        apply(scrollYProgress.get());
      }
      if (leg < parts.length) slot = idle(slice, { timeout: 1000 });
    };
    slot = idle(slice, { timeout: 1000 });
    apply(scrollYProgress.get());
    const ro = new ResizeObserver(() => {
      measure();
      apply(scrollYProgress.get());
    });
    if (stageRef.current) ro.observe(stageRef.current);
    // The chart keeps its own layer only while the scene is pinned (will-change in global.css).
    const io = new IntersectionObserver(([e]) => {
      if (sectionRef.current) sectionRef.current.toggleAttribute('data-pinned', e.isIntersecting);
    });
    if (sectionRef.current) io.observe(sectionRef.current);
    return () => {
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
    camera(660, 600, 1080);
    placeShip(...PORTS[2].at, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calm]);

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    if (!calm) apply(p);
  });

  /** Ticket holes jump to a port. */
  const jump = (i: number) => {
    const sec = sectionRef.current;
    const hold = SEGS.find((g) => 'hold' in g && g.hold === i)!;
    if (!sec) return;
    const top = sec.getBoundingClientRect().top + window.scrollY;
    const travel = sec.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + travel * (hold.a + (hold.b - hold.a) * 0.3), behavior: 'smooth' });
  };

  return (
    <section ref={sectionRef} id="story" className="voyage relative bg-ink text-ink" style={{ height: calm ? 'auto' : '340vh' }} aria-label="The journey from Guangdong to Calcutta, London and Dubai">
      <h2 className="sr-only">The voyage: Guangdong to Calcutta, London and Dubai</h2>
      <div ref={stageRef} className={calm ? 'relative h-[min(80svh,760px)] overflow-hidden' : 'sticky top-[68px] h-[calc(100svh-68px)] overflow-hidden'}>
        {/* The chart: one image, moved only by transform. */}
        <img ref={seaRef} src={art.sea} alt="" aria-hidden="true" className="voyage-sea absolute left-0 top-0 max-w-none origin-top-left" width={SEA.w} height={SEA.h} loading="lazy" decoding="async" />
        {/* No viewBox: SVG units are stage pixels, and the camera group below scales map units into them. */}
        <svg ref={svgRef} className="voyage-ink absolute inset-0 h-full w-full" aria-hidden="true">
          <defs>
            {/* The hull in sand: the art's own alpha as a mask, instead of a filter on something that moves every frame. */}
            <mask id="voyage-hull" maskUnits="userSpaceOnUse" x={-SHIP_PX} y={-SHIP_PX} width={SHIP_PX * 2} height={SHIP_PX * 2} style={{ maskType: 'alpha' }}>
              <image href={art.ship} width={SHIP_PX * 0.78} height={SHIP_PX * 0.78} x={-SHIP_PX * 0.39} y={-SHIP_PX * 0.43} />
            </mask>
          </defs>
          <g ref={camRef} style={{ transform: `translate(0px, 0px) scale(1)` }}>
          <image href={art.mountainsB} x={world.mountains.himalaya[0] - 150} y={world.mountains.himalaya[1] - 70} width="260" opacity="0.85" />
          <image href={art.mountainA} x={world.mountains.alps[0] - 70} y={world.mountains.alps[1] - 40} width="150" opacity="0.85" />
          <image href={art.mountainsC} x={world.mountains.caucasus[0] - 60} y={world.mountains.caucasus[1] - 34} width="130" opacity="0.85" />
          <image href={art.compass} x={world.compass[0] - 70} y={world.compass[1] - 100} width="140" className="voyage-compass" />
          {/* The course ahead: gold dots. */}
          {LEGS.map((d, i) => (
            <path key={`c${i}`} d={d} className="voyage-course" />
          ))}
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
            <g key={pt.id} transform={`translate(${pt.at[0]} ${pt.at[1]})`} className={`voyage-port ${i <= reached ? 'is-reached' : ''} ${i === port && !calm ? 'is-here' : ''}`}>
              <g className="voyage-mk">
                <circle r="13" className="voyage-ring" />
                <circle r="6" className="voyage-dot" />
                <text x={pt.anchor === 'end' ? -pt.dx - 6 : pt.dx + 6} y={pt.dy} textAnchor={pt.anchor} className="voyage-name">
                  {pt.name}
                </text>
              </g>
            </g>
          ))}
          <g ref={shipRef} transform={`translate(${PORTS[0].at[0]} ${PORTS[0].at[1]})`}>
            {/* The brand's junk on a tiger badge, so it reads against the busy chart. */}
            <g className="voyage-mk">
              {/* A hard offset shadow (no blur: the badge moves every frame). */}
              <circle r={SHIP_PX / 2} cy={4} className="voyage-badge-shadow" />
              <circle r={SHIP_PX / 2} className="voyage-badge" />
              <g ref={hullRef}>
                <rect x={-SHIP_PX / 2} y={-SHIP_PX / 2} width={SHIP_PX} height={SHIP_PX} className="voyage-hull" mask="url(#voyage-hull)" />
              </g>
            </g>
          </g>
          </g>
        </svg>
        <div className="voyage-vignette pointer-events-none absolute inset-0" aria-hidden="true" />

        {/* Ticket strip: one hole punched per port; each hole jumps there. */}
        <div className="absolute inset-x-0 top-3 z-10 flex justify-center px-3">
          <nav aria-label="Ports on the voyage" className="voyage-ticket flex items-center gap-1 bg-sand px-3 py-1.5 text-ink sm:gap-3 sm:px-5">
            <span className="hidden font-label text-[12px] font-bold uppercase tracking-[0.24em] text-tiger-deep sm:inline">Admit one</span>
            {PORTS.map((pt, i) => (
              <button key={pt.id} type="button" onClick={() => jump(i)} disabled={calm} aria-label={`Jump to ${pt.name}`} className={`voyage-hole group flex min-h-11 items-center gap-1.5 px-1 font-label text-[12px] font-bold uppercase tracking-[0.18em] sm:text-[12px] ${i <= reached ? 'is-punched' : ''} ${i === port && !calm ? 'is-here' : ''}`}>
                <span className="voyage-punch" aria-hidden="true" />
                <span>{pt.name}</span>
              </button>
            ))}
          </nav>
        </div>
        {!calm && (
          <p key={leg} className={`voyage-sea-note absolute inset-x-0 top-[72px] z-10 m-0 text-center font-note text-[clamp(15px,1.6vw,19px)] italic text-sand ${leg >= 0 ? 'is-on' : ''}`} aria-hidden={leg < 0}>
            {leg >= 0 ? AT_SEA[leg] : ''}
          </p>
        )}

        {/* Postcards, one per port. All stay in the page for screen readers; only the current one shows. */}
        {!calm && (
          <ol className="m-0 list-none p-0">
            {PORTS.map((pt, i) => (
              <li key={pt.id} className={`voyage-card ${port === i ? 'is-on' : ''}`}>
                <Postcard i={i} art={art} live={port === i} />
              </li>
            ))}
          </ol>
        )}
      </div>

      {calm && (
        <ol className="mx-auto grid max-w-[1240px] list-none gap-6 px-[clamp(16px,4vw,40px)] py-10 md:grid-cols-2">
          {PORTS.map((pt, i) => (
            <li key={pt.id} className="voyage-card is-on is-static">
              <Postcard i={i} art={art} live={false} still />
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

/** A postcard from each port: kicker, place in Lora italic, a line or two, and its picture. */
function Postcard({ i, art, live, still = false }: { i: number; art: VoyageArt; live: boolean; still?: boolean }) {
  const text = 'm-0 text-[clamp(15px,1.4vw,18px)] leading-snug';
  return (
    <article className="voyage-postcard">
      <header className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
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
          <MarkerText as="p" className={text} show={live || still}>
            They make a new home in Calcutta. In <Mark type="circle">Tangra</Mark>, its Chinatown, the wok meets Indian spice: Indo-Chinese food is born, <Mark type="underline">new, yet familiar</Mark>.
          </MarkerText>
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
              {live ? <SplitFlapText className="text-[clamp(18px,2vw,26px)]" length={4} maxFlips={8} text="FATT" tileClassName="w-[0.86em] bg-ink text-sand" /> : <span className="text-[clamp(18px,2vw,26px)] font-bold tracking-[0.2em]">FATT</span>}
              <span className="text-[13px]">a common Chinese surname</span>
            </div>
            <div className="flex flex-col gap-1">
              {live ? <SplitFlapText className="text-[clamp(18px,2vw,26px)]" length={6} maxFlips={8} text="PUNDIT" tileClassName="w-[0.86em] bg-ink text-sand" /> : <span className="text-[clamp(18px,2vw,26px)] font-bold tracking-[0.2em]">PUNDIT</span>}
              <span className="text-[13px]">the Indian word for a scholar</span>
            </div>
          </div>
        </>
      )}
    </article>
  );
}
