/**
 * Soho's signature moment: walk the long, narrow room from the door to the pass.
 * Scrolling down pans sideways along the room, one stop at a time.
 * Until the Soho photo shoot, each stop shows a floor plan of the room (drawn from the
 * DesignMyNight review of it) with that part lit and the walk so far dotted in.
 * A stop's photo replaces the plan as soon as it is set.
 * Calm mode: a plain sideways-scrolling strip.
 */
import { useMotionValueEvent, useScroll } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { isCalm } from '@/lib/motion-tokens';

export type Zone = 'door' | 'bar' | 'tables' | 'graffiti' | 'kitchen';

export interface RoomStop {
  title: string;
  zone: Zone;
  note: string;
  /** Photo URL once the client sends it; until then the frame says what is coming. */
  image?: string;
  alt?: string;
}

export default function WalkTheRoom({ stops, accent }: { stops: RoomStop[]; accent: string }) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [calm, setCalm] = useState(false);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });

  useEffect(() => setCalm(isCalm()), []);

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    const track = trackRef.current;
    if (calm || !track) return;
    const max = track.scrollWidth - track.parentElement!.clientWidth;
    track.style.transform = `translate3d(${-p * max}px, 0, 0)`;
    setActive(Math.min(stops.length - 1, Math.round(p * (stops.length - 1))));
  });

  const frames = stops.map((s, i) => (
    <figure
      key={s.title}
      className={`relative m-0 flex h-[58svh] w-[78vw] max-w-[760px] shrink-0 flex-col justify-end overflow-hidden border-2 p-6 transition-[opacity,transform] duration-500 sm:w-[60vw] ${calm || i === active ? 'opacity-100' : 'opacity-60'}`}
      style={{ borderColor: accent, background: `linear-gradient(160deg, ${accent}2e, transparent 55%), repeating-linear-gradient(90deg, rgb(218 199 181 / 0.06) 0 2px, transparent 2px 46px), #24211e` }}
    >
      {s.image ? (
        <img src={s.image} alt={s.alt ?? ''} className="fp-photo absolute inset-0 size-full object-cover" loading="lazy" />
      ) : (
        <RoomPlan zone={s.zone} accent={accent} />
      )}
      <figcaption className="relative">
        <p className="m-0 font-label text-[13px] font-bold uppercase tracking-[0.24em]" style={{ color: accent }}>
          Stop {i + 1} of {stops.length}
        </p>
        <p className="m-0 mt-2 text-[clamp(24px,3.2vw,40px)] font-bold uppercase leading-none tracking-[0.05em] text-sand">{s.title}</p>
        <p className="m-0 mt-3 max-w-md font-note text-[19px] leading-snug text-sand/85">{s.note}</p>
      </figcaption>
    </figure>
  ));

  if (calm) {
    return (
      <section aria-label="Walk the room" className="bg-ink py-16">
        <div className="flex gap-6 overflow-x-auto px-[6vw] pb-4">{frames}</div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} aria-label="Walk the room" className="relative h-[320svh] bg-ink max-sm:h-[240svh]">
      <div className="sticky top-[68px] flex h-[calc(100svh-68px)] flex-col justify-center overflow-hidden">
        <p className="m-0 px-[6vw] pb-6 font-label text-[13px] font-bold uppercase tracking-[0.26em] text-gold">Walk the room · door to pass</p>
        <div ref={trackRef} className="flex gap-6 px-[6vw] will-change-transform">
          {frames}
        </div>
        <div className="mx-[6vw] mt-6 h-[3px] bg-sand/15" aria-hidden="true">
          <div className="h-full origin-left" style={{ background: accent, transform: `scaleX(${(active + 1) / stops.length})`, transition: 'transform .4s ease' }} />
        </div>
      </div>
    </section>
  );
}

/** Where each part of the room sits on the plan (x centre, map units). */
const CENTRE: Record<Zone, number> = { door: 150, bar: 280, tables: 420, graffiti: 620, kitchen: 860 };
const SPAN = 440;

/**
 * The long, narrow Soho room from above: door on Berwick Street at the left, bar along the
 * left-hand wall, tables along the right, the graffiti wall, the kitchen pass at the far end.
 * Each stop frames its own part of the room; the rest stays faint.
 */
function RoomPlan({ zone, accent }: { zone: Zone; accent: string }) {
  const x = Math.min(1000 - SPAN, Math.max(0, CENTRE[zone] - SPAN / 2));
  const on = (z: Zone) => (z === zone ? { stroke: accent, fill: `${accent}26` } : { stroke: 'rgb(218 199 181 / 0.42)', fill: 'none' });
  const label = (z: Zone) => ({ fill: z === zone ? accent : 'rgb(218 199 181 / 0.55)' });
  const walkTo = CENTRE[zone];
  return (
    <svg
      viewBox={`${x} 0 ${SPAN} 320`}
      preserveAspectRatio="xMidYMid meet"
      className="pointer-events-none absolute inset-x-6 top-6 h-[calc(100%-13rem)] w-[calc(100%-3rem)] max-sm:h-[calc(100%-14rem)]"
      aria-hidden="true"
      fontFamily="var(--font-label)"
      fontWeight="700"
      fontSize="13"
      letterSpacing="2.4"
    >
      <g fill="none" strokeWidth="2" strokeLinejoin="round">
        {/* Walls, with the door gap on Berwick Street. */}
        <path d="M20 130 V30 H980 V290 H20 V190" stroke="rgb(218 199 181 / 0.7)" strokeWidth="6" />
        {/* The door and its swing. */}
        <g {...on('door')} strokeWidth="2.5">
          <path d="M20 190 L76 166" />
          <path d="M76 166 A60 60 0 0 0 20 130" strokeDasharray="4 5" />
          <rect x="34" y="132" width="70" height="56" rx="2" fill={zone === 'door' ? `${accent}26` : 'none'} stroke="none" />
        </g>
        {/* The bar along the left-hand wall, with stools. */}
        <g {...on('bar')}>
          <rect x="120" y="44" width="300" height="38" />
          {[150, 190, 230, 270, 310, 350, 390].map((cx) => <circle key={cx} cx={cx} cy="104" r="10" />)}
          {[170, 270, 370].map((cx) => <path key={cx} d={`M${cx} 30 V58`} strokeDasharray="2 4" />)}
        </g>
        {/* Tables for two and four along the right-hand wall. */}
        <g {...on('tables')}>
          {[150, 300, 450, 600].map((tx, i) =>
            i % 2 ? (
              <g key={tx}>
                <rect x={tx} y="218" width="64" height="40" />
                {[tx + 10, tx + 38].map((c) => <rect key={c} x={c} y="200" width="16" height="12" />)}
                {[tx + 10, tx + 38].map((c) => <rect key={c} x={c} y="264" width="16" height="12" />)}
              </g>
            ) : (
              <g key={tx}>
                <rect x={tx + 12} y="220" width="38" height="38" />
                <rect x={tx + 23} y="202" width="16" height="12" />
                <rect x={tx + 23} y="264" width="16" height="12" />
              </g>
            ),
          )}
        </g>
        {/* The graffiti wall: lettering painted on the wall and tiffin carriers on the shelves. */}
        <g {...on('graffiti')}>
          <rect x="470" y="34" width="300" height="20" />
          {[490, 530, 570, 610, 650, 690, 730].map((gx, i) => (
            <path key={gx} d={i % 2 ? `M${gx} 62 h18 M${gx + 9} 62 v22 M${gx} 74 h18` : `M${gx} 64 h18 v18 h-18 z M${gx + 9} 64 v18`} />
          ))}
          {[500, 600, 700].map((tx) => (
            <g key={tx}>
              <rect x={tx} y="96" width="26" height="9" rx="4" />
              <rect x={tx} y="107" width="26" height="9" rx="4" />
              <rect x={tx} y="118" width="26" height="9" rx="4" />
            </g>
          ))}
        </g>
        {/* The kitchen pass at the far end. */}
        <g {...on('kitchen')}>
          <rect x="806" y="60" width="26" height="200" />
          <path d="M850 40 V280 M880 40 V280 M910 40 V280 M940 40 V280" strokeDasharray="3 7" />
          <circle cx="819" cy="110" r="7" />
          <circle cx="819" cy="160" r="7" />
          <circle cx="819" cy="210" r="7" />
        </g>
      </g>
      {/* The walk so far: footsteps from the door to here. */}
      <path d={`M24 160 H${walkTo}`} stroke={accent} strokeWidth="3" strokeDasharray="2 10" strokeLinecap="round" fill="none" />
      <circle cx={walkTo} cy="160" r="9" fill={accent} />
      <circle cx={walkTo} cy="160" r="17" fill="none" stroke={accent} strokeWidth="2" opacity="0.5" />
      <g textAnchor="middle">
        <text x="66" y="318" {...label('door')} fontSize="11">BERWICK ST</text>
        <text x="270" y="70" {...label('bar')}>BAR</text>
        <text x="420" y="306" {...label('tables')}>TABLES</text>
        <text x="620" y="150" {...label('graffiti')}>GRAFFITI WALL</text>
        <text x="900" y="300" {...label('kitchen')}>PASS</text>
      </g>
    </svg>
  );
}
