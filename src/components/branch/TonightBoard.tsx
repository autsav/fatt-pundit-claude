/**
 * Tonight's board: a small departures board on each branch page whose lines
 * staff change in a Google Sheet (see src/lib/specials.ts). Rows come in from
 * the build; if the sheet's public CSV link is set, the board re-reads it in the
 * browser so today's lines show without waiting for a rebuild.
 */
import { useEffect, useState, type CSSProperties } from 'react';
import SplitFlapText from '@/components/kokonutui/split-flap-text';
import { parseCsv, pick, todayIn, type Special } from '@/lib/specials';

interface Props {
  branch: string;
  name: string;
  tz: string;
  rows: Special[];
  csvUrl?: string;
}

const clean = (s: string) => s.toUpperCase().replace(/[^ A-Z0-9:.\-/&!?]/g, ' ').slice(0, 24);

export default function TonightBoard({ branch, name, tz, rows, csvUrl }: Props) {
  // Start empty: this initialiser also runs at build time, where "today" is the build day, so the static HTML
  // held stale lines until hydration (AUDIT B-17). The effect picks today's lines in the guest's browser.
  const [lines, setLines] = useState<Special[]>([]);

  useEffect(() => {
    setLines(pick(rows, branch, todayIn(tz)));
    if (!csvUrl) return;
    let alive = true;
    fetch(csvUrl)
      .then((r) => (r.ok ? r.text() : Promise.reject(r.status)))
      .then((t) => alive && setLines(pick(parseCsv(t), branch, todayIn(tz))))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [branch, csvUrl, rows, tz]);

  if (!lines.length) return null;
  const length = Math.max(...lines.map((l) => clean(l.line).length));
  return (
    <section className="tonight" aria-labelledby="tonight-h">
      <div className="tonight-board">
        <p className="tonight-head">
          <span id="tonight-h">Tonight at {name}</span>
          {lines.some((l) => l.demo) && <span className="tonight-demo">sample lines</span>}
        </p>
        {/* --n = tiles per row; .tonight-flap sizes them so the longest line fits the board (global.css). */}
        <ul className="tonight-rows" style={{ '--n': length } as CSSProperties}>
          {lines.map((l, i) => (
            <li key={`${i}-${l.line}`}>
              <SplitFlapText align="start" className="tonight-flap" length={length} maxFlips={10} text={clean(l.line)} tileClassName="bg-ink text-sand" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
