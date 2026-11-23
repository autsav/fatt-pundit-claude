import { useEffect, useState } from 'react';
import RainGlassBackground, { FoggedStill } from '@/components/kokonutui/rain-glass-background';

interface Props {
  /** The dining room behind the rainy window (same-origin URL). */
  src: string;
  /** Small soft still of the same room, painted at once and kept if WebGL can't run. */
  poster: string;
  /** Optional responsive candidates for the poster. */
  posterSrcset?: string;
  posterSizes?: string;
}

/**
 * Scene 1: rain on the window, full screen. Only the glass is an island: the words, the restaurant
 * board and Book on top of it are static HTML (HomeHero.astro), painted finished. The rain starts once
 * the arrival board has opened, so the two never fight for the CPU. Guests can wipe the glass to look
 * inside; a hand wipes one streak first, so they see that they can.
 */
export default function RainHero({ src, poster, posterSrcset, posterSizes }: Props) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const start = () => setReady(true);
    if (document.documentElement.dataset.arrival === 'play') {
      window.addEventListener('fp:arrived', start, { once: true });
      return () => window.removeEventListener('fp:arrived', start);
    }
    start();
  }, []);

  // The still stays mounted the whole time; the glass mounts over it (no swap, so no flash). The glass is
  // transparent until its canvas fades in, and if WebGL cannot run the still is what remains.
  return (
    <div className="absolute inset-0 overflow-hidden bg-ink">
      <FoggedStill src={poster} srcSet={posterSrcset} sizes={posterSizes} priority />
      {!ready && <Pool />}
      {ready && <RainGlassBackground className="absolute inset-0 h-full min-h-0 bg-transparent" rain={0.55} streak src={src} />}
    </div>
  );
}

/** The soft dark pool behind the words (the glass draws the same one), for the still before the rain. */
function Pool() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{ background: 'radial-gradient(ellipse 60% 55% at 50% 50%, rgb(28 25 22 / 0.78) 0%, rgb(28 25 22 / 0.55) 45%, transparent 80%)' }}
    />
  );
}
