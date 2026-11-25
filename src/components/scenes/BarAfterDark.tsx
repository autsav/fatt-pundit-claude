import { useEffect, useRef, useState } from 'react';
import { isCalm } from '@/lib/motion-tokens';

/**
 * Scene 6: the bar after dark. Black apron weave, "THE BAR" embroidered in sand.
 * The bar is in darkness; a warm spotlight follows the cursor and reveals the room and the drinks.
 * Phones: a still light in the middle; tap to move it there. Calm mode: fully lit, no light moving.
 * The drinks are on a leather apron card with a debossed tiger; names and prices come from the data.
 */

export interface BarPhoto {
  src: string;
  alt: string;
  srcset?: string;
  sizes?: string;
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
  const [lit, setLit] = useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    if (isCalm()) {
      setCalm(true);
      return;
    }
    const coarse = window.matchMedia('(hover: none)').matches;
    setTouch(coarse);

    // Light position in stage px, eased towards a target. The veil layer is moved by transform only,
    // and the loop stops once it settles (restarts on pointermove / tap). Touch: static light, tap to move it.
    const veil = stage.querySelector<HTMLElement>('.bar-dark-veil');
    if (!veil) return;
    const pos = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    let raf = 0;
    let visible = false;
    const place = () => {
      veil.style.transform = `translate3d(${pos.x.toFixed(1)}px, ${pos.y.toFixed(1)}px, 0)`;
    };
    const frame = () => {
      raf = 0;
      const dx = target.x - pos.x;
      const dy = target.y - pos.y;
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
        pos.x = target.x;
        pos.y = target.y;
        place();
        return;
      }
      pos.x += dx * 0.09;
      pos.y += dy * 0.09;
      place();
      raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (!raf && visible) raf = requestAnimationFrame(frame);
    };
    const home = () => {
      pos.x = target.x = stage.clientWidth * 0.5;
      pos.y = target.y = stage.clientHeight * 0.5;
      place();
    };
    const to = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect();
      target.x = e.clientX - r.left;
      target.y = e.clientY - r.top;
      kick();
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') to(e);
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') to(e);
    };
    home();
    stage.addEventListener('pointermove', onMove);
    stage.addEventListener('pointerdown', onDown);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (!visible) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else kick();
    });
    io.observe(stage);
    // A rotation or resize moves the stage: bring the light back to it.
    const ro = new ResizeObserver(home);
    ro.observe(stage);
    return () => {
      io.disconnect();
      ro.disconnect();
      cancelAnimationFrame(raf);
      stage.removeEventListener('pointermove', onMove);
      stage.removeEventListener('pointerdown', onDown);
    };
  }, []);

  return (
    <section id="bar" className="bar-dark relative overflow-clip text-sand" aria-labelledby="bar-title">
      <div className="wrap relative py-[var(--section-pad)]">
        <header className="fp-section-head chapter-head fp-reveal">
          <p className="fp-section-label"><span className="fp-section-no">03</span> The bar</p>
          <h2 id="bar-title" className="fp-h2 bar-title m-0">
            <span className="sr-only">The bar</span>
            <svg viewBox="0 0 760 150" className="block h-auto w-full" aria-hidden="true">
              <defs>
                {/* Satin stitch: thread laid on the diagonal. */}
                <pattern id="bar-satin" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">
                  <rect width="5" height="5" fill="#dac7b5" />
                  <rect width="1.6" height="5" fill="#b9a38c" />
                </pattern>
              </defs>
              <text x="6" y="122" className="bar-embroidery" fill="url(#bar-satin)">
                THE BAR
              </text>
              <text x="6" y="122" className="bar-embroidery bar-stitch">
                THE BAR
              </text>
            </svg>
          </h2>
          <p className="chapter-intro">Fruit coolers inspired by India's street fruit vendors, spiced and salted. Have one straight, or spike it with a paired spirit.</p>
        </header>

        <div className="grid items-center gap-[clamp(24px,4vw,56px)] lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
          <figure className="m-0 flex flex-col gap-3">
            <div
              ref={stageRef}
              tabIndex={0}
              role="group"
              aria-label="The bar after dark"
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              className={`bar-stage relative aspect-[4/5] w-full overflow-hidden sm:aspect-[3/2] ${calm || lit || focused ? 'is-lit' : ''}`}
            >
              <img src={room.src} srcSet={room.srcset} sizes={room.srcset ? room.sizes : undefined} alt={room.alt} className="fp-photo absolute inset-0 h-full w-full object-cover" loading="lazy" decoding="async" />
              <img src={prints[0].src} srcSet={prints[0].srcset} sizes={prints[0].srcset ? prints[0].sizes : undefined} alt={prints[0].alt} className="fp-photo bar-print left-[5%] top-[52%] w-[50%] -rotate-3 sm:left-[4%] sm:top-[44%] sm:w-[38%]" loading="lazy" decoding="async" />
              <img src={prints[1].src} srcSet={prints[1].srcset} sizes={prints[1].srcset ? prints[1].sizes : undefined} alt={prints[1].alt} className="fp-photo bar-print right-[6%] top-[8%] w-[44%] rotate-2 sm:right-[5%] sm:top-[10%] sm:w-[30%]" loading="lazy" decoding="async" />
              <div className="bar-dark-veil" style={touch ? { opacity: 0.45 } : undefined} aria-hidden="true" />
              {/* Direction C scene 8: light catches the bottles along the shelf as the bar comes into view. */}
              <span className="bar-sheen" aria-hidden="true" />
            </div>
            <figcaption className="flex items-center justify-between gap-3 font-note text-[16px] italic text-sand/80">
              <span>{calm ? 'The bar at Covent Garden, lit for the evening.' : 'The bar after dark.'}</span>
              {!calm && (
                <button type="button" className="fp-btn fp-btn--text shrink-0 font-label text-[12px] font-bold uppercase not-italic tracking-copy text-gold" aria-pressed={lit} onClick={() => setLit((v) => !v)}>
                  Lights up
                </button>
              )}
            </figcaption>
          </figure>

          {/* The menu on a leather apron. */}
          <div className="bar-apron relative">
            <span className="bar-deboss" aria-hidden="true" style={{ WebkitMaskImage: `url(${tiger})`, maskImage: `url(${tiger})` }} />
            <h3 className="relative m-0 mb-2 font-note text-[20px] font-medium normal-case italic tracking-copy text-gold">From the bar</h3>
            <ul className="relative m-0 list-none p-0">
              {drinks.map((d) => (
                <li key={d.id} className="flex items-baseline justify-between gap-4 border-b border-dashed border-sand/35 py-3.5 last:border-b-0">
                  <div className="min-w-0">
                    <p className="m-0 text-[17px] font-bold uppercase tracking-title [text-wrap:balance]">{d.name}</p>
                    {d.description && <p className="m-0 mt-1 font-note text-[15px] italic leading-snug text-sand/80">{d.description}</p>}
                  </div>
                  {d.price && <span className="min-w-[7ch] max-w-[42%] shrink-0 text-right font-bold text-tiger-bright">{d.price}</span>}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
