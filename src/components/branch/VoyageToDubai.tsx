/**
 * Dubai's signature moment: the voyage continues. The gold junk from the home page sails
 * from London, round through Gibraltar, Suez and the Red Sea, into the Gulf, drawing
 * the route as you scroll, and a "Boarding soon" stamp lands on Dubai.
 * Same map, ship and stamps as Day 2 (brand guidelines p.24). Calm mode: finished map.
 */
import { useMotionValueEvent, useScroll } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import world from '@/data/world-route.json';
import { isCalm } from '@/lib/motion-tokens';

interface Props {
  art: { world: string; ship: string; stampGold: string; compass: string };
}

const VIEW = { x: 70, y: 360, w: 760, h: 560 };

export default function VoyageToDubai({ art }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const shipRef = useRef<SVGGElement>(null);
  const tlRef = useRef<{ seek: (t: number) => unknown } | null>(null);
  const [calm, setCalm] = useState(false);
  const [landed, setLanded] = useState(false);
  const landedRef = useRef(false);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });

  const apply = (p: number) => {
    // 0–0.08 hold at London, 0.08–0.86 sail, then the stamp.
    const t = Math.min(1, Math.max(0, (p - 0.08) / 0.78));
    tlRef.current?.seek(t * 1000);
    const isIn = p > 0.88;
    if (isIn !== landedRef.current) {
      landedRef.current = isIn;
      setLanded(isIn);
    }
  };

  useEffect(() => {
    const c = isCalm();
    setCalm(c);
    if (c) {
      setLanded(true);
      return;
    }
    let alive = true;
    import('animejs').then(({ createTimeline, svg }) => {
      if (!alive || !pathRef.current || !shipRef.current) return;
      const m = svg.createMotionPath(pathRef.current);
      tlRef.current = createTimeline({ autoplay: false, defaults: { ease: 'linear' } })
        .add(svg.createDrawable(pathRef.current), { draw: ['0 0', '0 1'], duration: 1000 }, 0)
        .add(shipRef.current, { translateX: m.translateX, translateY: m.translateY, duration: 1000 }, 0);
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

  const L = world.points.london;
  const D = world.points.dubai;
  const end = calm ? D : L;

  return (
    <section ref={sectionRef} aria-label="The voyage to Dubai" className={calm ? 'bg-sand py-16' : 'relative h-[260svh] bg-sand'}>
      <div className={calm ? '' : 'sticky top-[68px] flex h-[calc(100svh-68px)] flex-col items-center justify-center overflow-hidden px-4'}>
        <p className="m-0 text-center font-note text-[20px] text-tiger-deep">The voyage continues</p>
        <h2 className="m-0 mt-1 text-center text-[clamp(34px,5vw,72px)] uppercase leading-[0.98] tracking-[0.06em] text-ink">London to Dubai</h2>
        <figure className="voyage-paper relative mx-auto mb-0 mt-6 w-full max-w-[min(1000px,calc((100svh-260px)*1.36))] border-2 border-ink bg-white">
          {/* The map itself never changes, so it sits on its own still layer;
              only the thin route and the ship redraw while you scroll. */}
          <svg viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`} className="absolute inset-0 block h-full w-full [transform:translateZ(0)]" aria-hidden="true">
            <image href={art.world} x="0" y="0" width={world.w} height={world.h} />
            <image href={art.compass} x={VIEW.x + 18} y={VIEW.y + VIEW.h - 150} width="130" height="130" opacity="0.9" />
          </svg>
          <svg viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`} className="relative block w-full" role="img" aria-label="Map: the route from London by sea through the Mediterranean, Suez and the Red Sea to Dubai">
            <path ref={pathRef} d={world.toDubai} fill="none" stroke="#cba052" strokeWidth="6" strokeLinecap="round" />
            {[['London', L, -18], ['Dubai', D, 46]].map(([label, at, dy]) => (
              <g key={label as string}>
                <circle cx={(at as number[])[0]} cy={(at as number[])[1]} r="9" fill="none" stroke="#f15d3d" strokeWidth="4" />
                <text x={(at as number[])[0] + 16} y={(at as number[])[1] + (dy as number)} className="voyage-place">{label as string}</text>
              </g>
            ))}
            <g ref={shipRef} style={{ transform: `translate(${end[0]}px, ${end[1]}px)` }}>
              {/* The brand ship faces west; mirrored, it sails east. */}
              <image href={art.ship} width="96" height="96" x="-48" y="-80" transform="scale(-1 1)" />
            </g>
          </svg>
          <div className={`voyage-stamp pointer-events-none absolute flex flex-col items-center ${landed ? 'is-in' : ''}`} style={{ left: `${((D[0] - VIEW.x) / VIEW.w) * 100}%`, top: `${((D[1] - VIEW.y) / VIEW.h) * 100}%`, translate: '-30% -105%' }}>
            <img src={art.stampGold} alt="" className="w-[clamp(64px,9vw,110px)] -rotate-6" />
            <span className="-mt-1 rotate-[-6deg] border-2 border-tiger bg-white/90 px-2 py-0.5 font-label text-[clamp(11px,1.2vw,15px)] font-bold uppercase tracking-[0.22em] text-tiger">Boarding soon</span>
          </div>
        </figure>
      </div>
    </section>
  );
}
