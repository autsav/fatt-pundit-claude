/**
 * Tonight's board: a small departures board on each branch page whose lines
 * staff change in a Google Sheet (see src/lib/specials.ts). Rows come in from
 * the build; if the sheet's public CSV link is set, the board re-reads it in the
 * browser so today's lines show without waiting for a rebuild.
 */
import { useEffect, useState } from 'react';
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
  const [lines, setLines] = useState(() => pick(rows, branch, todayIn(tz)));

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
        <ul className="tonight-rows">
          {lines.map((l, i) => (
            <li key={`${i}-${l.line}`}>
              <SplitFlapText align="start" className="text-[clamp(13px,3.6vw,26px)]" length={length} maxFlips={10} text={clean(l.line)} tileClassName="bg-ink text-sand" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
