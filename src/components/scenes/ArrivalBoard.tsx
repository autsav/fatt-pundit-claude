import { useEffect, useState } from 'react';
import SplitFlapText from '@/components/kokonutui/split-flap-text';

/**
 * Scene 0 board. Starts blank, then clatters into FATT PUNDIT.
 * Announces `fp:board-done` on window when the flaps have settled,
 * so the Astro arrival script can thud the stamp down.
 */
// The board starts on numbers and signs and clatters through more of them before each letter lands
// (maxFlips), so it never spells anything but the name, and settles fast on slow phones too.
const TARGET = 'FATT PUNDIT';
const START = [...TARGET].map((c, i) => (c === ' ' ? ' ' : '7&2:9-4/38'[i % 10])).join('');

export default function ArrivalBoard() {
  const [text, setText] = useState(START);

  useEffect(() => {
    const go = window.setTimeout(() => setText(TARGET), 150);
    return () => window.clearTimeout(go);
  }, []);

  // Stamp the moment the last flap lands, plus a short beat so the eye reads the name.
  const settled = () => {
    if (text === TARGET) window.setTimeout(() => window.dispatchEvent(new Event('fp:board-done')), 120);
  };

  return (
    <SplitFlapText
      className="font-display text-[clamp(30px,7.4vw,92px)] tracking-normal"
      length={11}
      maxFlips={4}
      onSettled={settled}
      text={text}
      tileClassName="bg-[#3a3631] text-sand shadow-[inset_0_0_0_1px_rgb(203_160_82/0.35),0_6px_14px_rgb(0_0_0/0.45)]"
    />
  );
}
