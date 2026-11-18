import { useMotionValueEvent, useScroll } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { Mark, MarkerText } from '@/components/kokonutui/marker-text';
import SplitFlapText from '@/components/kokonutui/split-flap-text';
import TypewriterTitle from '@/components/kokonutui/type-writer';
import world from '@/data/world-route.json';
import { isCalm } from '@/lib/motion-tokens';

/**
 * Scene 3: the voyage. Pinned while the guest scrolls. Built from the brand's own drawings
 * (guidelines p.24): the menu map, its gold junk, gold mountains, compass, border, and the two
 * stamps (gold and orange).
 *
 * One driver (Motion's scroll progress) scrubs one anime.js timeline:
 *   leg 1 on the menu map: Canton → Kolkata ("Tangra" gets hand-marked);
 *   the map pulls back to a wider map drawn in the same engraved style;
 *   leg 2: Kolkata → Suez → London, where the two stamps land; then a gold branch to Dubai.
 */

const LEG1 = 'M1038 718 C1000 900 950 1170 820 1170 C700 1170 640 1060 605 960 C578 880 548 805 505 752';
const W = world.w;
const H = world.h;
const T1 = 1000;
const T2 = 2600;
const T3 = 3000;

export interface VoyageArt {
  map: string;
  world: string;
  ship: string;
  compass: string;
  frame: string;
  stampGold: string;
  stampOrange: string;
  mountainA: string;
  mountainsB: string;
  mountainsC: string;
}

type Stop = { label: string; text: string; chapter: 'east' | 'west' };
const STOPS: Stop[] = [
  { label: 'Canton', chapter: 'east', text: 'Hakka families leave Canton, southern China, carrying their recipes.' },
  { label: 'At sea', chapter: 'east', text: 'Across the South China Sea and the Bay of Bengal.' },
  { label: 'Kolkata', chapter: 'east', text: 'They make a new home in Kolkata.' },
  { label: 'Westward', chapter: 'west', text: 'The recipes travel on: the Arabian Sea, Suez, the Mediterranean.' },
  { label: 'London', chapter: 'west', text: 'London. Soho in 2019, Covent Garden in 2021.' },
  { label: 'Dubai', chapter: 'west', text: 'Next stop: Dubai, opening soon.' },
];

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const range = (p: number, a: number, b: number) => clamp((p - a) / (b - a));

/** Scroll progress → timeline time, with holds at Kolkata (Tangra) and during the pull-back. */
function timeAt(p: number) {
  if (p < 0.4) return range(p, 0.05, 0.4) * T1;
  if (p < 0.56) return T1;
  if (p < 0.82) return T1 + range(p, 0.56, 0.82) * (T2 - T1);
  return T2 + range(p, 0.82, 0.88) * (T3 - T2);
}

function stopAt(p: number) {
  const r1 = range(p, 0.05, 0.4);
  if (p >= 0.86) return 5;
  if (p >= 0.8) return 4;
  if (p >= 0.58) return 3;
  if (r1 >= 0.97) return 2;
  if (r1 >= 0.42) return 1;
  if (p >= 0.05) return 0;
  return -1;
}

/** The brand's gold junk (from the menu map), centred on the route, bow to the west. */
function Ship({ href, size }: { href: string; size: number }) {
  return <image href={href} width={size} height={size} x={-size / 2} y={-size * 0.82} />;
}

/** Place name in the menu map's manner: italic, ink, small. */
function Place({ at, label, dx = 18, dy = -14, anchor = 'start', show = true }: { at: number[]; label: string; dx?: number; dy?: number; anchor?: 'start' | 'end'; show?: boolean }) {
  return (
    <g style={{ opacity: show ? 1 : 0, transition: 'opacity .5s' }}>
      <circle cx={at[0]} cy={at[1]} r="9" fill="none" stroke="#f15d3d" strokeWidth="4" />
      <text x={at[0] + (anchor === 'end' ? -dx : dx)} y={at[1] + dy} textAnchor={anchor} className="voyage-place">
        {label}
      </text>
    </g>
  );
}

export default function Voyage({ art }: { art: VoyageArt }) {
  const sectionRef = useRef<HTMLElement>(null);
  const figureRef = useRef<HTMLElement>(null);
  const leg1Ref = useRef<SVGPathElement>(null);
  const leg2Ref = useRef<SVGPathElement>(null);
  const dubaiRef = useRef<SVGPathElement>(null);
  const boat1Ref = useRef<SVGGElement>(null);
  const boat2Ref = useRef<SVGGElement>(null);
  const tlRef = useRef<{ seek: (t: number) => unknown } | null>(null);
  const [calm, setCalm] = useState(false);
  const [stop, setStop] = useState(-1);
  const [tangra, setTangra] = useState(false);
  const [west, setWest] = useState(false);
  const [named, setNamed] = useState(false);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });

  const apply = (p: number) => {
    tlRef.current?.seek(timeAt(p));
    figureRef.current?.style.setProperty('--swap', range(p, 0.48, 0.56).toFixed(3));
    setStop(stopAt(p));
    setTangra(p > 0.43);
    setWest(p > 0.52);
    setNamed(p > 0.91);
  };

  useEffect(() => {
    const c = isCalm();
    setCalm(c);
    if (c) {
      figureRef.current?.style.setProperty('--swap', '1');
      setStop(5);
      setTangra(true);
      setWest(true);
      setNamed(true);
      return;
    }
    let alive = true;
    import('animejs').then(({ createTimeline, svg }) => {
      if (!alive || !leg1Ref.current || !leg2Ref.current || !dubaiRef.current || !boat1Ref.current || !boat2Ref.current) return;
      const m1 = svg.createMotionPath(leg1Ref.current);
      const m2 = svg.createMotionPath(leg2Ref.current);
      const tl = createTimeline({ autoplay: false, defaults: { ease: 'linear' } })
        .add(svg.createDrawable(leg1Ref.current), { draw: ['0 0', '0 1'], duration: T1 }, 0)
        // Translate only, so the ship keeps its drawn pose (bow west), never tilting upside down.
        .add(boat1Ref.current, { translateX: m1.translateX, translateY: m1.translateY, duration: T1 }, 0)
        .add(svg.createDrawable(leg2Ref.current), { draw: ['0 0', '0 1'], duration: T2 - T1 }, T1)
        .add(boat2Ref.current, { translateX: m2.translateX, translateY: m2.translateY, duration: T2 - T1 }, T1)
        .add(svg.createDrawable(dubaiRef.current), { draw: ['0 0', '0 1'], duration: T3 - T2 }, T2);
      tlRef.current = tl;
      apply(scrollYProgress.get());
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollYProgress]);

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    if (!calm) apply(p);
  });

  const visible = (i: number) => {
    if (i > stop) return false;
    if (STOPS[i].chapter !== (west ? 'west' : 'east')) return false;
    if (named && i !== 5) return false;
    return true;
  };
  const labelStyle = 'font-label text-[13px] font-bold uppercase tracking-[0.24em] text-tiger';
  const textStyle = 'text-[clamp(16px,1.5vw,19px)] leading-snug';
  const L = world.points.london;
  const M = world.mountains;

  return (
    <section ref={sectionRef} id="story" className="voyage relative bg-sand text-ink" style={{ height: calm ? 'auto' : '560vh' }} aria-label="The journey from Canton to Kolkata, London and Dubai">
      <div className={calm ? 'relative' : 'sticky top-0 h-[100svh] overflow-hidden'}>
        <div className="voyage-paper absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto flex h-full max-w-[1240px] flex-col gap-5 px-[clamp(16px,4vw,40px)] pb-6 pt-[86px] lg:flex-row lg:items-center lg:gap-16 lg:pb-10">
          <figure
            ref={figureRef}
            className="voyage-maps relative m-0 max-h-[46svh] shrink-0 self-center overflow-hidden border-[10px] border-ink bg-white shadow-[0_30px_80px_rgb(44_41_37/0.35)] lg:max-h-none lg:self-auto"
            style={{ width: 'min(100%, calc((100svh - 130px) * 0.98), 660px)', aspectRatio: `${W} / ${H}` }}
          >
            {/* East: the menu map itself. */}
            <div className="voyage-layer voyage-east absolute inset-0">
              <img src={art.map} alt="The hand-drawn map from the Fatt Pundit menu: southern China, the Bay of Bengal and India" className="block h-full w-full" width={W} height={H} />
              <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
                <path d={LEG1} fill="none" stroke="#2c2925" strokeOpacity="0.18" strokeWidth="6" strokeDasharray="4 14" strokeLinecap="round" />
                <path ref={leg1Ref} d={LEG1} fill="none" stroke="#f15d3d" strokeWidth="11" strokeLinecap="round" strokeDasharray={calm ? undefined : '0 100000'} />
                <circle cx="1038" cy="718" r="16" fill="#f15d3d" />
                <circle cx="505" cy="752" r="18" fill={stop >= 2 ? '#f15d3d' : 'none'} stroke="#f15d3d" strokeWidth="5" className={stop === 2 && !calm ? 'voyage-pulse' : ''} />
                <g ref={boat1Ref} style={{ transform: 'translate(1038px, 718px)' }}>
                  <Ship href={art.ship} size={190} />
                </g>
              </svg>
            </div>

            {/* West: the wider map, drawn in the menu map's engraved style, framed with its border. */}
            <div className="voyage-layer voyage-west absolute inset-0">
              <img src={art.world} alt="A map in the same engraved style from London to the South China Sea, with the route from Canton to Kolkata, on to London, and a branch to Dubai" className="block h-full w-full" width={W} height={H} loading="lazy" />
              <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
                <image href={art.mountainsB} x={M.himalaya[0] - 150} y={M.himalaya[1] - 70} width="260" />
                <image href={art.mountainA} x={M.alps[0] - 70} y={M.alps[1] - 40} width="150" />
                <image href={art.mountainsC} x={M.caucasus[0] - 60} y={M.caucasus[1] - 34} width="130" />
                <image href={art.compass} x={world.compass[0] - 60} y={world.compass[1] - 90} width="120" />
                <path d={world.leg1} fill="none" stroke="#f15d3d" strokeWidth="7" strokeLinecap="round" />
                <path d={world.leg2} fill="none" stroke="#2c2925" strokeOpacity="0.2" strokeWidth="4" strokeDasharray="3 10" strokeLinecap="round" />
                <path ref={leg2Ref} d={world.leg2} fill="none" stroke="#f15d3d" strokeWidth="8" strokeLinecap="round" strokeDasharray={calm ? undefined : '0 100000'} />
                <path ref={dubaiRef} d={world.dubai} fill="none" stroke="#cba052" strokeWidth="7" strokeLinecap="round" strokeDasharray={calm ? '2 12' : '0 100000'} />
                <Place at={world.points.canton} label="Canton" anchor="end" dx={14} dy={-18} />
                <Place at={world.points.kolkata} label="Kolkata" anchor="end" dx={14} dy={40} />
                <Place at={world.points.dubai} label="Dubai" anchor="end" dx={16} dy={-16} show={stop >= 5} />
                {/* London: the two restaurant stamps land on the city, gold for Soho, orange for Covent Garden. */}
                <g className={`voyage-stamp ${stop >= 4 ? 'is-in' : ''}`} style={{ transformOrigin: `${L[0]}px ${L[1]}px` }}>
                  <image href={art.stampGold} x={L[0] + 6} y={L[1] - 250} width="150" transform={`rotate(-8 ${L[0] + 80} ${L[1] - 120})`} />
                  <image href={art.stampOrange} x={L[0] + 120} y={L[1] - 210} width="160" transform={`rotate(7 ${L[0] + 200} ${L[1] - 90})`} />
                </g>
                <Place at={L} label="London" dx={16} dy={44} show={stop >= 4} />
                <g ref={boat2Ref} style={{ transform: `translate(${(calm ? L : world.points.kolkata)[0]}px, ${(calm ? L : world.points.kolkata)[1]}px)` }}>
                  <Ship href={art.ship} size={160} />
                </g>
              </svg>
              <div className="pointer-events-none absolute inset-0" style={{ borderStyle: 'solid', borderWidth: '28px', borderImage: `url(${art.frame}) 60 stretch` }} />
            </div>
          </figure>

          <div className="flex min-w-0 flex-1 flex-col gap-3 lg:min-w-[420px] lg:gap-5">
            <p className="note m-0 hidden text-[20px] lg:block">The journey</p>
            <h2 key={west ? 'w' : 'e'} className="voyage-heading m-0 text-[clamp(26px,4vw,54px)]">
              {west ? 'From Kolkata to London' : 'From Canton to Kolkata'}
            </h2>

            <ol className="m-0 flex list-none flex-col gap-3 p-0" aria-live="off">
              {STOPS.map((st, i) =>
                visible(i) ? (
                  <li key={st.label} className={`${i === stop ? 'grid' : 'hidden lg:grid'} grid-cols-[auto_1fr] items-baseline gap-x-4 transition-opacity duration-500`} style={{ opacity: i === stop ? 1 : 0.55 }}>
                    <span className={labelStyle}>{st.label}</span>
                    {i === stop && !calm ? (
                      <TypewriterTitle as="p" key={`t-${i}`} autoLoop={false} naturalVariance sequences={[{ text: st.text, deleteAfter: false }]} startDelay={80} textClassName={`whitespace-pre-wrap ${textStyle} @lg:text-[clamp(16px,1.5vw,19px)] @2xl:text-[clamp(16px,1.5vw,19px)] tracking-[0.04em]`} typingSpeed={22} className="m-0 justify-start font-body text-ink tracking-normal" />
                    ) : (
                      <p className={`m-0 ${textStyle}`}>{st.text}</p>
                    )}
                  </li>
                ) : null,
              )}
            </ol>

            {!west && (
              <MarkerText as="p" className={`m-0 ${textStyle} ${stop === 2 ? '' : 'hidden lg:block'}`} show={tangra}>
                <span style={{ opacity: tangra ? 1 : 0, transition: 'opacity .5s' }}>
                  In <Mark type="circle">Tangra</Mark>, Kolkata's Chinatown, the wok meets Indian spice. Indo-Chinese food is born: <Mark type="underline">new, yet familiar</Mark>.
                </span>
              </MarkerText>
            )}

            {named && (
              <div className="mt-1 flex flex-wrap gap-x-8 gap-y-4">
                <div className="flex flex-col gap-2">
                  <SplitFlapText className="text-[clamp(22px,2.6vw,34px)]" length={4} maxFlips={8} text="FATT" tileClassName="w-[0.86em] bg-ink text-sand" />
                  <span className="text-[14px]">a common Chinese surname</span>
                </div>
                <div className="flex flex-col gap-2">
                  <SplitFlapText className="text-[clamp(22px,2.6vw,34px)]" length={6} maxFlips={8} text="PUNDIT" tileClassName="w-[0.86em] bg-ink text-sand" />
                  <span className="text-[14px]">the Indian word for a scholar</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
