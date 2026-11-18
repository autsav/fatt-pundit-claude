import { useEffect, useState } from 'react';
import { openStatus, statusLine, type Hours } from '@/lib/hours';

export interface PillBranch {
  shortName: string;
  timezone: string;
  hours: Hours | null;
  status: string;
}

/** Live "Soho · Open now · until 10.30pm" pill, cycling through branches. */
export default function OpenNowPill({ branches }: { branches: PillBranch[] }) {
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

