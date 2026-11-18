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
 * light SVG on top whose viewBox follows the same camera, so they stay sharp and screen-sized.
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
const W = world.w;
const H = world.h;
/** The chart image runs past the route box on every side. */
const SEA = world.sea;
const PORTS: { id: string; name: string; at: Pt; dx: number; dy: number; anchor: 'start' | 'end' }[] = [
  { id: 'canton', name: 'Canton', at: world.points.canton as Pt, dx: 14, dy: -14, anchor: 'end' },
  { id: 'kolkata', name: 'Kolkata', at: world.points.kolkata as Pt, dx: 14, dy: -14, anchor: 'end' },
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
const SHIP_PX = 64;

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);

export default function Voyage({ art }: { art: VoyageArt }) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const seaRef = useRef<HTMLImageElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const shipRef = useRef<SVGGElement>(null);
  const hullRef = useRef<SVGGElement>(null);
  const legRefs = useRef<(SVGPathElement | null)[]>([]);
  const lens = useRef<number[]>([]);
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
      layout.current = { w, h, fx: w / 2, fy: h / 2, fit, k: fit / CLOSE };
      if (seaRef.current) {
        seaRef.current.style.width = `${SEA.w * (fit / CLOSE)}px`;
        seaRef.current.style.height = `${SEA.h * (fit / CLOSE)}px`;
      }
      return;
    }
    const desk = w >= 1024;
    const card = desk ? Math.min(460, w * 0.36) : 0;
    const fx = desk ? card + (w - card) / 2 : w / 2;
    const fy = desk ? h * 0.56 : h * 0.33;
    const fit = desk ? Math.min(w - card, h) : Math.min(w, h * 0.56);
    const k = fit / CLOSE;
    layout.current = { w, h, fx, fy, fit, k };
    if (seaRef.current) {
      seaRef.current.style.width = `${SEA.w * k}px`;
      seaRef.current.style.height = `${SEA.h * k}px`;
    }
  }, []);

  /** Point the camera at (cx, cy) showing `span` map units across the stage's short side. */
  const camera = (cx: number, cy: number, span: number) => {
    const { w, h, fx, fy, fit, k } = layout.current;
    const ppu = fit / span;
    if (seaRef.current) seaRef.current.style.transform = `translate3d(${fx - (cx - SEA.x) * ppu}px, ${fy - (cy - SEA.y) * ppu}px, 0) scale(${ppu / k})`;
    const svg = svgRef.current;
    if (svg) {
      svg.setAttribute('viewBox', `${cx - fx / ppu} ${cy - fy / ppu} ${w / ppu} ${h / ppu}`);
      svg.style.setProperty('--u', String(1 / ppu));
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
      const path = legRefs.current[s.leg];
      const len = lens.current[s.leg];
      if (!path || !len) return;
      const e = smooth(t);
      const pt = path.getPointAtLength(e * len);
      const ahead = path.getPointAtLength(Math.min(len, e * len + 4));
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
      el.style.strokeDasharray = `${f * lens.current[i]} ${lens.current[i] + 1}`;
    });
  };

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
    apply(scrollYProgress.get());
    const ro = new ResizeObserver(() => {
      measure();
      apply(scrollYProgress.get());
    });
    if (stageRef.current) ro.observe(stageRef.current);
    return () => ro.disconnect();
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
    <section ref={sectionRef} id="story" className="voyage relative bg-ink text-ink" style={{ height: calm ? 'auto' : '460vh' }} aria-label="The journey from Canton to Kolkata, London and Dubai">
      <div ref={stageRef} className={calm ? 'relative h-[min(80svh,760px)] overflow-hidden' : 'sticky top-[68px] h-[calc(100svh-68px)] overflow-hidden'}>
        {/* The chart: one image, moved only by transform. */}
        <img ref={seaRef} src={art.sea} alt="" aria-hidden="true" className="voyage-sea absolute left-0 top-0 max-w-none origin-top-left" width={SEA.w} height={SEA.h} decoding="async" />
        <svg ref={svgRef} className="voyage-ink absolute inset-0 h-full w-full" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
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
              <circle r={SHIP_PX / 2} className="voyage-badge" />
              <g ref={hullRef}>
                <image href={art.ship} width={SHIP_PX * 0.78} height={SHIP_PX * 0.78} x={-SHIP_PX * 0.39} y={-SHIP_PX * 0.43} className="voyage-hull" />
              </g>
            </g>
          </g>
        </svg>
        <div className="voyage-vignette pointer-events-none absolute inset-0" aria-hidden="true" />

        {/* Ticket strip: one hole punched per port; each hole jumps there. */}
        <div className="absolute inset-x-0 top-3 z-10 flex justify-center px-3">
          <nav aria-label="Ports on the voyage" className="voyage-ticket flex items-center gap-1 bg-sand px-3 py-1.5 text-ink sm:gap-3 sm:px-5">
            <span className="hidden font-label text-[11px] font-bold uppercase tracking-[0.24em] text-tiger sm:inline">Admit one</span>
            {PORTS.map((pt, i) => (
              <button key={pt.id} type="button" onClick={() => jump(i)} disabled={calm} aria-label={`Jump to ${pt.name}`} className={`voyage-hole group flex min-h-11 items-center gap-1.5 px-1 font-label text-[11px] font-bold uppercase tracking-[0.18em] sm:text-[12px] ${i <= reached ? 'is-punched' : ''} ${i === port && !calm ? 'is-here' : ''}`}>
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
          <p className="m-0 font-label text-[11px] font-bold uppercase tracking-[0.24em] text-tiger">Stop {i + 1} of 4</p>
          <h3 className="voyage-title m-0">{['Canton', 'Kolkata', 'London', 'Dubai'][i]}</h3>
        </div>
        <span className="voyage-postmark" aria-hidden="true">
          <span>{['China', 'Tangra', 'W1 · WC2', 'UAE'][i]}</span>
        </span>
      </header>

      {i === 0 && <p className={text}>Hakka families leave Canton, southern China, carrying their recipes across the sea.</p>}

      {i === 1 && (
        <>
          <img src={art.map} alt="The hand-drawn map from the Fatt Pundit menu: southern China, the Bay of Bengal and India" className="voyage-pic" width={1295} height={1320} loading="lazy" />
          <MarkerText as="p" className={text} show={live || still}>
            They make a new home in Kolkata. In <Mark type="circle">Tangra</Mark>, its Chinatown, the wok meets Indian spice: Indo-Chinese food is born, <Mark type="underline">new, yet familiar</Mark>.
          </MarkerText>
        </>
      )}

      {i === 2 && (
        <>
          <div className="flex items-end justify-center gap-6">
            <figure className="m-0 flex flex-col items-center gap-1">
              <img src={art.stampGold} alt="" className="w-[clamp(64px,8vw,96px)] -rotate-6" loading="lazy" />
              <figcaption className="font-label text-[11px] font-bold uppercase tracking-[0.2em]">Soho · 2019</figcaption>
            </figure>
            <figure className="m-0 flex flex-col items-center gap-1">
              <img src={art.stampOrange} alt="" className="w-[clamp(68px,8.5vw,102px)] rotate-6" loading="lazy" />
              <figcaption className="font-label text-[11px] font-bold uppercase tracking-[0.2em]">Covent Garden · 2021</figcaption>
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
