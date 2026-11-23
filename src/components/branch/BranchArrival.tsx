/**
 * Branch page, beat 1: the departure board flips to this room's name, then the live
 * open-now pill appears. Everything else in the hero (Book, Call, Directions, address)
 * is plain HTML from the Astro page, so it works before and without this island.
 */
import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import SplitFlapText from '@/components/kokonutui/split-flap-text';
import OpenNowPill, { type PillBranch } from '@/components/scenes/OpenNowPill';
import { openStatus } from '@/lib/hours';

interface Props {
  words: string[];
  branch: PillBranch;
  /** Phase 8: the branch page shows today's status once, in the facts strip, so it turns the pill off. */
  pill?: boolean;
  /** Street line for the "Open now · 6 Maiden Lane" line under the name. */
  address?: string;
}

export default function BranchArrival({ words, branch, pill = true, address }: Props) {
  // Plain words from the same hours helper the pill uses; before hydration the line is just the address.
  const [state, setState] = useState('');
  useEffect(() => {
    const tick = () => setState(branch.status === 'opening-soon' || !branch.hours ? 'Opening soon' : openStatus(branch.hours, branch.timezone).open ? 'Open now' : 'Closed now');
    tick();
    const t = window.setInterval(tick, 60_000);
    return () => window.clearInterval(t);
  }, [branch]);
  const length = Math.max(...words.map((w) => w.length));
  return (
    // --n = tiles per word; .arrival-flap (global.css) fits them to the hero column.
    <div className="flex flex-col items-start gap-4" style={{ '--n': length } as CSSProperties}>
      {/* The page's h1 names the room, so the board stays hidden from screen readers. */}
      <div aria-hidden="true">
        {/* shadow-none: no dotted tile outline around the letters, settled or at rest. */}
        <SplitFlapText
          className="arrival-flap"
          interval={words.length > 1 ? 4200 : 0}
          length={length}
          maxFlips={8}
          tileClassName="bg-ink/90 text-gold shadow-none"
          words={words}
        />
      </div>
      {address && <p className="arrival-line m-0 min-h-[1.5em] text-[length:var(--step-body)] text-sand">{[state, address].filter(Boolean).join(' · ')}</p>}
      {pill && <OpenNowPill branches={[branch]} nameless />}
    </div>
  );
}
