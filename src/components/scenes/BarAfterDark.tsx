import { useEffect, useRef, useState } from 'react';
import { isCalm } from '@/lib/motion-tokens';

/**
 * Scene 6: the bar after dark. Black apron weave, "THE BAR" embroidered in sand.
 * The bar is in darkness; a warm spotlight follows the cursor and reveals the room and the drinks.
 * Phones: the light sweeps by itself; tap to move it there. Calm mode: fully lit, no light moving.
 * The drinks are on a leather apron card with a debossed tiger; names and prices come from the data.
 */

export interface BarPhoto {
  src: string;
  alt: string;
}
export interface BarDrink {
  id: string;
  name: string;
  description?: string;
  price: string | null;
}

export default function BarAfterDark({ room, prints, drinks, tiger }: { room: BarPhoto; prints: [BarPhoto, BarPhoto]; drinks: BarDrink[]; tiger: string }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [calm, setCalm] = useState(false);
  const [touch, setTouch] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    if (isCalm()) {
      setCalm(true);
      return;
    }
    const coarse = window.matchMedia('(hover: none)').matches;
    setTouch(coarse);

    // Light position in % of the stage, eased towards a target every frame.
    const pos = { x: 30, y: 45 };
    const target = { x: 30, y: 45 };
    let mode: 'sweep' | 'follow' = coarse ? 'sweep' : 'follow';
    let tapUntil = 0;
    let raf = 0;
    let t0 = performance.now();

    const frame = (now: number) => {
      if (mode === 'sweep' && now > tapUntil) {
        // A slow figure-of-eight across the bar.
        const t = (now - t0) / 1000;
        target.x = 50 + 34 * Math.sin(t * 0.45);
        target.y = 50 + 20 * Math.sin(t * 0.9);
      }
      pos.x += (target.x - pos.x) * 0.09;
      pos.y += (target.y - pos.y) * 0.09;
      stage.style.setProperty('--lx', `${pos.x.toFixed(2)}%`);
      stage.style.setProperty('--ly', `${pos.y.toFixed(2)}%`);
      raf = requestAnimationFrame(frame);
    };
    const at = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect();
      return { x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 };
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      mode = 'follow';
      Object.assign(target, at(e));
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') return;
      Object.assign(target, at(e));
      tapUntil = performance.now() + 3500;
      t0 = performance.now() + 3500; // after the tap, the sweep restarts from the middle
    };
    stage.addEventListener('pointermove', onMove);
    stage.addEventListener('pointerdown', onDown);
    const io = new IntersectionObserver(([e]) => {
      cancelAnimationFrame(raf);
      if (e.isIntersecting) raf = requestAnimationFrame(frame);
    });
    io.observe(stage);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      stage.removeEventListener('pointermove', onMove);
      stage.removeEventListener('pointerdown', onDown);
    };
  }, []);

  return (
    <section id="bar" className="bar-dark relative overflow-hidden text-sand" aria-labelledby="bar-title">
      <div className="relative mx-auto flex max-w-[1240px] flex-col gap-[clamp(28px,4vw,48px)] px-[clamp(16px,4vw,40px)] py-[clamp(64px,8vw,110px)]">
        <header className="flex flex-col items-center gap-3 text-center">
          <p className="m-0 font-note font-medium normal-case italic tracking-normal text-[20px] text-gold">After dark</p>
          <h2 id="bar-title" className="m-0 w-full max-w-[760px]">
            <span className="sr-only">The bar</span>
            <svg viewBox="0 0 760 150" className="block h-auto w-full" aria-hidden="true">
              <defs>
                {/* Satin stitch: thread laid on the diagonal. */}
                <pattern id="bar-satin" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">
                  <rect width="5" height="5" fill="#dac7b5" />
                  <rect width="1.6" height="5" fill="#b9a38c" />
                </pattern>
              </defs>
              <text x="380" y="122" textAnchor="middle" className="bar-embroidery" fill="url(#bar-satin)">
                THE BAR
              </text>
              <text x="380" y="122" textAnchor="middle" className="bar-embroidery bar-stitch">
                THE BAR
              </text>
            </svg>
          </h2>
          <p className="m-0 max-w-[560px] text-[clamp(16px,1.5vw,18px)] leading-snug">Fruit coolers inspired by India's street fruit vendors, spiced and salted. Have one straight, or spike it with a paired spirit.</p>
        </header>

        <div className="grid items-center gap-[clamp(24px,4vw,56px)] lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
          <figure className="m-0 flex flex-col gap-3">
            <div ref={stageRef} className={`bar-stage relative aspect-[4/5] w-full overflow-hidden sm:aspect-[3/2] ${calm ? 'is-lit' : ''}`}>
              <img src={room.src} alt={room.alt} className="fp-photo absolute inset-0 h-full w-full object-cover" loading="lazy" decoding="async" />
              <img src={prints[0].src} alt={prints[0].alt} className="fp-photo bar-print left-[5%] top-[52%] w-[50%] -rotate-3 sm:left-[4%] sm:top-[44%] sm:w-[38%]" loading="lazy" decoding="async" />
              <img src={prints[1].src} alt={prints[1].alt} className="fp-photo bar-print right-[6%] top-[8%] w-[44%] rotate-2 sm:right-[5%] sm:top-[10%] sm:w-[30%]" loading="lazy" decoding="async" />
              <div className="bar-dark-veil pointer-events-none absolute inset-0" aria-hidden="true" />
            </div>
            <figcaption className="font-note text-[16px] italic text-sand/80">
              {calm ? 'The bar at Covent Garden, lit for the evening.' : touch ? 'Tap the bar to move the light.' : 'Move your light across the bar.'}
            </figcaption>
          </figure>

          {/* The menu on a leather apron. */}
          <div className="bar-apron relative">
            <span className="bar-deboss" aria-hidden="true" style={{ WebkitMaskImage: `url(${tiger})`, maskImage: `url(${tiger})` }} />
            <h3 className="relative m-0 mb-2 font-note text-[20px] font-medium normal-case italic tracking-normal text-gold">From the bar</h3>
            <ul className="relative m-0 list-none p-0">
              {drinks.map((d) => (
                <li key={d.id} className="flex items-baseline justify-between gap-4 border-b border-dashed border-sand/35 py-3.5 last:border-b-0">
                  <div className="min-w-0">
                    <p className="m-0 text-[17px] font-bold uppercase tracking-[0.08em]">{d.name}</p>
                    {d.description && <p className="m-0 mt-1 font-note text-[15px] italic leading-snug text-sand/80">{d.description}</p>}
                  </div>
                  {d.price && <span className="max-w-[42%] shrink-0 text-right font-bold text-tiger-bright">{d.price}</span>}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
