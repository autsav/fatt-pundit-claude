import { useEffect, useState } from 'react';
import { openStatus, statusLine, type Hours } from '@/lib/hours';
import { isPaused } from '@/lib/motion-tokens';

export interface PillBranch {
  shortName: string;
  timezone: string;
  hours: Hours | null;
  status: string;
}

/** Live "Soho · Open now · until 10.30pm" pill, cycling through branches. */
/** `nameless`: drop the branch name, for pages that already say it ("Open now · until 10.30pm"). */
export default function OpenNowPill({ branches, nameless = false }: { branches: PillBranch[]; nameless?: boolean }) {
  const [lines, setLines] = useState<{ text: string; open: boolean }[]>([]);
  const [i, setI] = useState(0);

  useEffect(() => {
    const compute = () =>
      setLines(
        branches.map((b) => {
          const drop = (t: string) => (nameless ? t.replace(`${b.shortName} is `, '').replace(`${b.shortName} `, '').replace(/^./, (c) => c.toUpperCase()) : t);
          if (b.status === 'opening-soon' || !b.hours) return { text: drop(`${b.shortName} is opening soon`), open: false };
          const s = openStatus(b.hours, b.timezone);
          return { text: drop(statusLine(b.shortName, s)), open: s.open };
        }),
      );
    compute();
    const tick = window.setInterval(compute, 60_000);
    // Auto-updating content (WCAG 2.2.2): the footer's Pause motion holds the line that is showing.
    const cycle = window.setInterval(() => { if (!isPaused()) setI((n) => n + 1); }, 3400);
    return () => {
      window.clearInterval(tick);
      window.clearInterval(cycle);
    };
  }, [branches, nameless]);

  // Both states reserve the same width (min-w), so the pill never grows sideways when the clock fills in.
  if (!lines.length) return <span className={`block h-11 ${nameless ? 'min-w-[16rem]' : 'min-w-[20rem]'} max-w-full`} aria-hidden="true" />;
  const line = lines[i % lines.length];
  // CSS-only swap (keyed remount + keyframes): keeps ~30 KB of Motion off the first load.
  return (
    <p className={`inline-flex ${nameless ? 'min-w-[16rem]' : 'min-w-[20rem]'} h-11 max-w-full items-center gap-3 overflow-hidden rounded-full border border-gold/60 bg-ink/70 px-5 text-[15px] text-sand backdrop-blur-sm`} aria-live="off">
      {/* System status (design-system §5): open = filled dot in the night success colour (slate, no green),
          closed = a ring. Shape and words carry the state, not colour; no pulsing glow (physical motion only). */}
      <span className={`inline-flex size-2.5 rounded-full ${line.open ? 'bg-slate-bright' : 'shadow-[inset_0_0_0_2px_var(--color-gold)]'}`} />
      <span key={line.text} className="fp-pill-swap whitespace-nowrap">{line.text}</span>
    </p>
  );
}

