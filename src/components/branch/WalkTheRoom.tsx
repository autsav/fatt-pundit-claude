/**
 * Soho's signature moment: walk the long, narrow room from the door to the pass.
 * Phase 8: one stop at a time, moved with Previous / Next (or a swipe); the next stop waits behind a
 * fade, never cut mid-word. It no longer pins and pans with the page scroll (that cost two screens).
 * Until the Soho photo shoot, each stop shows a floor plan of the room (drawn from the
 * DesignMyNight review of it) with that part lit and the walk so far dotted in.
 * A stop's photo replaces the plan as soon as it is set.
 */
import { useEffect, useRef, useState } from 'react';

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
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  // Scroll position at which stop i sits at the track's start (the track is the stops' offset parent).
  const posOf = (track: HTMLElement, i: number) => (track.children[i] as HTMLElement).offsetLeft - parseFloat(getComputedStyle(track).paddingLeft);

  // Which stop is in view: the one nearest the track's start; at the very end, the last one.
  const onScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const x = track.scrollLeft;
    let best = 0;
    for (let i = 1; i < stops.length; i++) if (Math.abs(posOf(track, i) - x) < Math.abs(posOf(track, best) - x)) best = i;
    if (x + track.clientWidth >= track.scrollWidth - 4) best = stops.length - 1;
    setActive(best);
  };
  useEffect(onScroll, []);

  const go = (i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    track.scrollTo({ left: posOf(track, Math.max(0, Math.min(stops.length - 1, i))), behavior: smooth ? 'smooth' : 'auto' });
  };

  const frames = stops.map((s, i) => (
    <figure
      key={s.title}
      aria-label={`Stop ${i + 1} of ${stops.length}: ${s.title}`}
      className="relative m-0 flex h-[min(62svh,540px)] min-h-[440px] w-[84%] max-w-[720px] shrink-0 snap-start flex-col justify-end overflow-hidden border-2 p-6 sm:w-[70%]"
      style={{ borderColor: accent, background: `linear-gradient(160deg, ${accent}2e, transparent 55%), repeating-linear-gradient(90deg, rgb(218 199 181 / 0.06) 0 2px, transparent 2px 46px), #24211e` }}
    >
      {s.image ? (
        <img src={s.image} alt={s.alt ?? ''} className="fp-photo absolute inset-0 size-full object-cover" loading="lazy" />
      ) : (
        <RoomPlan zone={s.zone} accent={accent} />
      )}
      <figcaption className="relative">
        <p className="walk-stop">
          Stop {i + 1} of {stops.length}
        </p>
        <p className="walk-title">{s.title}</p>
        <p className="m-0 mt-3 max-w-md font-note text-[19px] leading-snug text-sand/85">{s.note}</p>
      </figcaption>
    </figure>
  ));

  const atEnd = active === stops.length - 1;
  // Sits inside the room chapter (its head names it); the track lines up with the headline (global.css .walk-*).
  return (
    <section aria-label="Walk the room, from the door to the pass" className="walk" style={{ paddingTop: 'var(--section-gap)' }}>
      <div className="walk-cap walk-head">
        <p className="m-0">From the door to the pass, in {stops.length} stops</p>
        <div className="walk-nav">
          {/* aria-disabled, not disabled: a keyboard user's focus stays on the button at either end. */}
          <button type="button" className="walk-btn" onClick={() => active > 0 && go(active - 1)} aria-disabled={active === 0} aria-controls="walk-track">
            Previous<span className="sr-only"> stop</span>
          </button>
          <span className="walk-count" aria-live="polite">{active + 1} of {stops.length}</span>
          <button type="button" className="walk-btn" onClick={() => !atEnd && go(active + 1)} aria-disabled={atEnd} aria-controls="walk-track">
            Next<span className="sr-only"> stop</span>
          </button>
        </div>
      </div>
      <div
        id="walk-track"
        ref={trackRef}
        onScroll={onScroll}
        tabIndex={0}
        role="group"
        aria-label="Stops in the room"
        className={`walk-track relative flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 ${atEnd ? '' : 'walk-fade'}`}
      >
        {frames}
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
  const on = (z: Zone) => (z === zone ? { stroke: accent, fill: `${accent}26` } : { stroke: 'rgb(218 199 181 / 0.6)', fill: 'none' });
  const label = (z: Zone) => ({ fill: z === zone ? accent : 'rgb(218 199 181 / 0.8)' });
  const walkTo = CENTRE[zone];
  return (
    <svg
      viewBox={`${x} 0 ${SPAN} 320`}
      preserveAspectRatio="xMidYMid meet"
      className="pointer-events-none absolute inset-x-6 top-6 h-[calc(100%-13rem)] w-[calc(100%-3rem)] max-sm:h-[calc(100%-14rem)]"
      aria-hidden="true"
      fontFamily="var(--font-label)"
      fontWeight="700"
      fontSize="20"
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
        <text x="66" y="318" {...label('door')} fontSize="17">BERWICK ST</text>
        <text x="270" y="70" {...label('bar')}>BAR</text>
        <text x="420" y="306" {...label('tables')}>TABLES</text>
        <text x="620" y="150" {...label('graffiti')}>GRAFFITI WALL</text>
        <text x="900" y="300" {...label('kitchen')}>PASS</text>
      </g>
    </svg>
  );
}
