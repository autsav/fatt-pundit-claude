import { useEffect, useRef, useState } from 'react';
import AttractButton from '@/components/kokonutui/attract-button';
import RainGlassBackground from '@/components/kokonutui/rain-glass-background';
import SplitFlapText from '@/components/kokonutui/split-flap-text';
import { openStatus, statusLine, type Hours } from '@/lib/hours';
import { isCalm } from '@/lib/motion-tokens';

interface BranchLite {
  shortName: string;
  timezone: string;
  hours: Hours | null;
  status: 'open' | 'opening-soon' | 'closed';
}

interface Props {
  /** The dining room behind the rainy window (same-origin URL). */
  src: string;
  branches: BranchLite[];
}

/** Live "Soho · Open now · until 10.30pm" pill, cycling through branches. */
function OpenNowPill({ branches }: { branches: BranchLite[] }) {
  const [lines, setLines] = useState<{ text: string; open: boolean }[]>([]);
  const [i, setI] = useState(0);

  useEffect(() => {
    const compute = () =>
      setLines(
        branches.map((b) => {
          if (b.status === 'opening-soon' || !b.hours) return { text: `${b.shortName} · Opening soon`, open: false };
          const s = openStatus(b.hours, b.timezone);
          return { text: statusLine(b.shortName, s), open: s.open };
        }),
      );
    compute();
    const tick = window.setInterval(compute, 60_000);
    const cycle = window.setInterval(() => setI((n) => n + 1), 3400);
    return () => {
      window.clearInterval(tick);
      window.clearInterval(cycle);
    };
  }, [branches]);

  if (!lines.length) return <span className="h-11" aria-hidden="true" />;
  const line = lines[i % lines.length];
  // CSS-only swap (keyed remount + keyframes): keeps ~30 KB of Motion off the first load.
  return (
    <p className="inline-flex h-11 items-center gap-3 overflow-hidden rounded-full border border-gold/60 bg-ink/70 px-5 text-[15px] text-sand backdrop-blur-sm" aria-live="off">
      <span className={`relative inline-flex size-2.5 rounded-full ${line.open ? 'bg-[#7fbf6a]' : 'bg-gold'}`}>
        {line.open && <span className="absolute inset-0 animate-ping rounded-full bg-[#7fbf6a]/70" />}
      </span>
      <span key={line.text} className="fp-pill-swap whitespace-nowrap">{line.text}</span>
    </p>
  );
}

/**
 * Scene 1: rain on the window. The dining room glows behind fogged glass;
 * guests can wipe the glass to look inside. The title rises letter by letter
 * once the arrival board has opened (or straight away for returning guests).
 */
export default function RainHero({ src, branches }: Props) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [ready, setReady] = useState(false);

  // Wait for the arrival board (first visit) before the rain and the title play.
  useEffect(() => {
    const start = () => setReady(true);
    if (document.documentElement.dataset.arrival === 'play') {
      window.addEventListener('fp:arrived', start, { once: true });
      return () => window.removeEventListener('fp:arrived', start);
    }
    start();
  }, []);

  // Title rises letter by letter once the rainy window is mounted.
  useEffect(() => {
    const el = titleRef.current;
    if (!ready || !el || isCalm()) return;
    let cancelled = false;
    import('animejs').then(({ animate, stagger, splitText }) => {
      if (cancelled) return;
      const { chars } = splitText(el, { chars: { wrap: 'clip' } });
      animate(chars, { y: ['110%', '0%'], rotate: { from: 8, to: 0 }, duration: 900, ease: 'outExpo', delay: stagger(45) });
    });
    return () => {
      cancelled = true;
    };
  }, [ready]);

  const toTables = () => document.getElementById('tables')?.scrollIntoView({ behavior: isCalm() ? 'auto' : 'smooth' });

  const content = (
      <div className="pointer-events-none flex w-full max-w-5xl flex-col items-center gap-6 text-center">
        <p className="note text-[19px] text-gold">Hakka cooking from Kolkata's Chinatown</p>
        <h1
          ref={titleRef}
          className="text-[clamp(56px,11vw,150px)] leading-[0.9] text-sand [text-shadow:0_6px_40px_rgb(0_0_0/0.55)]"
          style={{ opacity: ready ? 1 : 0 }}
        >
          Fatt Pundit
        </h1>
        <div className="flex flex-col items-center gap-3">
          <span className="note text-[18px] text-sand/90">Tonight, a table at</span>
          <SplitFlapText
            className="text-[clamp(20px,3.4vw,40px)]"
            interval={6500}
            length={13}
            maxFlips={7}
            tileClassName="bg-ink/85 text-gold"
            words={['Soho', 'Covent Garden', 'Dubai soon']}
          />
        </div>
        <div className="pointer-events-auto mt-4 flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          <AttractButton onClick={toTables} radius={70}>Book a table</AttractButton>
          <a
            className="inline-flex min-h-[52px] items-center border-2 border-sand px-7 text-[19px] font-bold uppercase tracking-[0.08em] text-sand no-underline transition-colors hover:bg-sand hover:text-ink"
            href="#kitchen"
          >
            See the menus
          </a>
        </div>
        <div className="pointer-events-auto mt-2">
          <OpenNowPill branches={branches} />
        </div>
        <p className="note mt-1 text-[16px] text-sand/80">Wipe the glass to look inside</p>
      </div>
  );

  // The WebGL rain starts only after the arrival board opens, so the two never fight for the CPU.
  if (!ready) {
    return <div className="relative flex min-h-[100svh] w-full flex-col items-center justify-center overflow-hidden bg-ink px-6 py-16 text-center text-sand">{content}</div>;
  }
  return (
    <RainGlassBackground className="min-h-[100svh]" rain={0.55} src={src}>
      {content}
    </RainGlassBackground>
  );
}
