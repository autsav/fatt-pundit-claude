/**
 * Soho's signature moment: walk the long, narrow room from the door to the pass.
 * Scrolling down pans sideways along the room, one stop at a time.
 * Until the Soho photo shoot, each stop is an honest "photo to come" frame that says
 * what will hang there (details from the DesignMyNight review of the room).
 * Calm mode: a plain sideways-scrolling strip.
 */
import { useMotionValueEvent, useScroll } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { isCalm } from '@/lib/motion-tokens';

export interface RoomStop {
  title: string;
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
        <img src={s.image} alt={s.alt ?? ''} className="absolute inset-0 size-full object-cover" loading="lazy" />
      ) : (
        <span className="absolute left-6 top-6 border border-dashed border-sand/50 px-3 py-1 font-label text-[12px] font-bold uppercase tracking-[0.22em] text-sand/70">
          Photo to come
        </span>
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
