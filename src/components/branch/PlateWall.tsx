/**
 * Covent Garden's signature moment: the wall of blue-and-white plates from the dining room.
 * When the wall comes into view the plates turn over one after another to show what the
 * kitchen sends out, then turn back. Hover (or tap) any plate to turn it yourself.
 * Plates are drawn, not photographed, so they never pretend to be a dish photo.
 * Names and prices come from dishes.json via the page.
 */
import { useEffect, useRef, useState } from 'react';
import { isCalm } from '@/lib/motion-tokens';

export interface PlateDish {
  id: string;
  name: string;
  price?: string;
  kind: 'food' | 'drink';
}

/** Where each plate hangs, as % of the wall, and its size. Loosely after the photo. */
/** Name size in % of the plate back's writing width: the longest word fits the safe width, and the whole name fits about three lines. */
function nameSize(name: string) {
  const words = name.split(/\s+/);
  const longest = Math.max(...words.map((w) => w.length));
  const total = name.length;
  // cqi here = the plate's writing area (inside the rim and padding), so the longest word gets ~92% of it.
  return Math.min(17, 92 / (longest * 0.74), Math.sqrt(5000 / total)).toFixed(2);
}

const SPOTS: [number, number, number][] = [
  [34, 30, 15], [50, 22, 13], [66, 30, 15], [26, 58, 12], [42, 56, 17], [59, 58, 14], [75, 54, 12], [50, 84, 12], [67, 84, 13],
];

const COBALT = '#23428f';

function PlateArt({ v }: { v: number }) {
  const dots = Array.from({ length: 24 }, (_, i) => (i / 24) * Math.PI * 2);
  return (
    <svg viewBox="0 0 100 100" className="size-full" aria-hidden="true">
      <circle cx="50" cy="50" r="48" fill="#fbfaf6" />
      <circle cx="50" cy="50" r="44" fill="none" stroke={COBALT} strokeWidth="6" />
      {dots.map((a, i) => (
        <circle key={i} cx={50 + Math.cos(a) * 44} cy={50 + Math.sin(a) * 44} r="1.2" fill="#fbfaf6" />
      ))}
      <circle cx="50" cy="50" r="37.5" fill="none" stroke={COBALT} strokeWidth="1.2" />
      <circle cx="50" cy="50" r="27" fill="none" stroke={COBALT} strokeWidth="1" strokeDasharray="2 2.4" />
      {v === 0 && (
        <g fill={COBALT}>
          {[0, 72, 144, 216, 288].map((r) => (
            <ellipse key={r} cx="50" cy="38" rx="5.5" ry="11" transform={`rotate(${r} 50 50)`} />
          ))}
          <circle cx="50" cy="50" r="5" fill="#fbfaf6" stroke={COBALT} strokeWidth="2" />
        </g>
      )}
      {v === 1 && (
        <g fill="none" stroke={COBALT} strokeWidth="2.2" strokeLinecap="round">
          {[-8, 0, 8].map((dy) => (
            <path key={dy} d={`M30 ${50 + dy} q5 -6 10 0 t10 0 t10 0 t10 0`} />
          ))}
        </g>
      )}
      {v === 2 && (
        <g fill={COBALT}>
          {[0, 60, 120, 180, 240, 300].map((r) => (
            <circle key={r} cx="50" cy="41" r="5" transform={`rotate(${r} 50 50)`} />
          ))}
          <circle cx="50" cy="50" r="4" />
        </g>
      )}
    </svg>
  );
}

export default function PlateWall({ dishes }: { dishes: PlateDish[] }) {
  const wallRef = useRef<HTMLDivElement>(null);
  const [flipped, setFlipped] = useState<Set<number>>(new Set());
  // The plate the guest turned last: its full name is captioned under the wall, where it is always readable.
  const [last, setLast] = useState<number | null>(null);
  const [calm, setCalm] = useState(false);

  const set = (i: number, on: boolean) =>
    setFlipped((f) => {
      const n = new Set(f);
      if (on) n.add(i);
      else n.delete(i);
      return n;
    });

  // The wave: plates turn in turn the first time the wall is seen.
  useEffect(() => {
    const c = isCalm();
    setCalm(c);
    const el = wallRef.current;
    if (c || !el) return;
    const timers: number[] = [];
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        dishes.forEach((_, i) => {
          timers.push(window.setTimeout(() => set(i, true), 300 + i * 170));
          timers.push(window.setTimeout(() => set(i, false), 2300 + i * 170));
        });
      },
      { threshold: 0.55 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [dishes]);

  return (
    <div>
      <div
        ref={wallRef}
        className="relative mx-auto aspect-[4/3] w-full max-w-[980px] overflow-hidden border-2 border-gold sm:aspect-[16/9]"
        style={{
          background:
            'radial-gradient(60% 50% at 30% 20%, rgb(255 236 200 / 0.55), transparent 70%), radial-gradient(50% 40% at 70% 15%, rgb(255 236 200 / 0.45), transparent 70%), radial-gradient(rgb(44 41 37 / 0.05) 1px, transparent 1.4px) 0 0 / 6px 6px, #e9e1d3',
        }}
      >
        {/* Two brass pendant lamps, as in the room. */}
        {[30, 70].map((x) => (
          <svg key={x} className="pointer-events-none absolute top-0 h-[16%] w-[10%] -translate-x-1/2" style={{ left: `${x}%` }} viewBox="0 0 40 60" aria-hidden="true">
            <line x1="20" y1="0" x2="20" y2="34" stroke="#2c2925" strokeWidth="1.2" />
            <path d="M6 48 Q20 30 34 48 Z" fill="#2c2925" />
            <ellipse cx="20" cy="49" rx="9" ry="3" fill="#ffd27a" />
          </svg>
        ))}
        {dishes.slice(0, SPOTS.length).map((d, i) => {
          const [x, y, size] = SPOTS[i];
          const on = flipped.has(i);
          return (
            <button
              key={d.id}
              type="button"
              aria-pressed={on}
              aria-label={`${d.name}${d.price ? `, ${d.price}` : ''}`}
              data-plate=""
              className="group absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full [perspective:800px] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[var(--fp-ring)]"
              style={{ left: `${x}%`, top: `${y}%`, width: `${size}%`, aspectRatio: '1' }}
              onClick={() => {
                set(i, !on);
                setLast(i);
              }}
              onPointerEnter={(e) => {
                if (e.pointerType !== 'mouse') return;
                set(i, true);
                setLast(i);
              }}
              onPointerLeave={(e) => e.pointerType === 'mouse' && set(i, false)}
            >
              <span
                className="relative block size-full rounded-full [transform-style:preserve-3d]"
                style={{
                  transform: `rotateY(${on ? 180 : 0}deg)`,
                  // The plate has weight: a spring on the turn (transform only). A CSS transition reverses
                  // from wherever it is, so a second tap mid-flip turns the plate back, never restarts it.
                  transition: calm ? 'none' : 'transform var(--dur-spring) var(--curve-spring)',
                }}
              >
                <span className="absolute inset-0 rounded-full shadow-[0_6px_10px_rgb(44_41_37/0.28)] [backface-visibility:hidden]">
                  <PlateArt v={i % 3} />
                </span>
                <span className="@container absolute inset-0 flex flex-col items-center justify-center rounded-full border-[0.35em] border-[#23428f] bg-[#fbfaf6] p-[14%] text-center shadow-[0_6px_10px_rgb(44_41_37/0.28)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
                  {/* Sized so the longest word fits the plate and the name stays within three lines.
                      Plates whose writing area is under 90px (phones, tablets and the small plates on any wall)
                      show only the price, at 30cqi (12–27px); the name is captioned below. At 13cqi the price was
                      8px on a 60px plate (Phase 10). Under 40px even that would be ~5px type, so the plate back
                      stays blank and the caption carries both. */}
                  <span className="font-bold uppercase leading-[1.1] text-ink @max-[90px]:hidden" style={{ fontSize: `${nameSize(d.name)}cqi` }}>
                    {d.name}
                  </span>
                  {/* The price is an effect, not a thing: it fades (out-curve) once the plate has turned. */}
                  {d.price && (
                    <span
                      className="mt-[0.35em] text-[13cqi] font-bold text-tiger-deep @max-[90px]:mt-0 @max-[90px]:text-[30cqi] @max-[40px]:hidden"
                      style={{ opacity: on ? 1 : 0, transition: calm ? 'none' : 'opacity var(--dur-fast) var(--curve-out)', transitionDelay: on && !calm ? 'var(--dur-fast)' : '0ms' }}
                    >
                      {d.price}
                    </span>
                  )}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-4 min-h-[3em] text-center text-[17px] leading-snug text-ink" aria-live="polite">
        {last !== null && dishes[last] ? (
          <>
            <span className="font-bold">{dishes[last].name}</span>
            {dishes[last].price && <span className="text-tiger-deep">, {dishes[last].price}</span>}
          </>
        ) : (
          <span className="font-note italic text-ink/75">{calm ? 'Tap a plate to turn it over.' : 'Hover or tap a plate to turn it over.'}</span>
        )}
      </p>
    </div>
  );
}
