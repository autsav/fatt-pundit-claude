import { type ReactNode, useEffect, useRef, useState } from 'react';
import RainGlassBackground from '@/components/kokonutui/rain-glass-background';
import { isCalm } from '@/lib/motion-tokens';

interface Props {
  /** The dining room behind the rainy window (same-origin URL). */
  src: string;
  /** The restaurant chooser (GateBoard), rendered by Astro as static HTML so its links stay plain links. */
  children?: ReactNode;
}

/**
 * Scene 1: rain on the window. The dining room glows behind fogged glass;
 * guests can wipe the glass to look inside. The title rises letter by letter
 * once the arrival board has opened (or straight away for returning guests).
 */
export default function RainHero({ src, children }: Props) {
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

  const content = (
      <div className="pointer-events-none flex w-full max-w-5xl flex-col items-center gap-6 text-center">
        <p className="note text-[19px] text-gold">Hakka cooking from Kolkata's Chinatown</p>
        <h1
          ref={titleRef}
          className="text-[clamp(52px,10vw,140px)] leading-[0.9] text-sand [text-shadow:0_6px_40px_rgb(0_0_0/0.55)]"
          style={{ opacity: ready ? 1 : 0 }}
        >
          Fatt Pundit
        </h1>
        {/* The first choice: which restaurant. Each row opens that branch's page. */}
        <div className="pointer-events-auto mt-2 w-full [&>*]:block [&>*]:w-full">{children}</div>
        <a className="pointer-events-auto note text-[17px] text-sand underline decoration-gold underline-offset-4" href="#menu">
          Or see the menus first
        </a>
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
