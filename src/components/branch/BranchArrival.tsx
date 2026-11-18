/**
 * Branch page, beat 1: the departure board flips to this room's name, then the live
 * open-now pill appears. Everything else in the hero (Book, Call, Directions, address)
 * is plain HTML from the Astro page, so it works before and without this island.
 */
import SplitFlapText from '@/components/kokonutui/split-flap-text';
import OpenNowPill, { type PillBranch } from '@/components/scenes/OpenNowPill';

interface Props {
  words: string[];
  branch: PillBranch;
}

export default function BranchArrival({ words, branch }: Props) {
  const length = Math.max(...words.map((w) => w.length));
  return (
    <div className="flex flex-col items-start gap-4">
      <SplitFlapText
        className="text-[clamp(22px,4.6vw,56px)]"
        interval={words.length > 1 ? 4200 : 0}
        length={length}
        maxFlips={8}
        tileClassName="bg-ink/90 text-gold"
        words={words}
      />
      <OpenNowPill branches={[branch]} nameless />
    </div>
  );
}
