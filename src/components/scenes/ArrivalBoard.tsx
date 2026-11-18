import { useEffect, useState } from 'react';
import SplitFlapText from '@/components/kokonutui/split-flap-text';

/**
 * Scene 0 board. Starts blank, then clatters into FATT PUNDIT.
 * Announces `fp:board-done` on window when the flaps have settled,
 * so the Astro arrival script can thud the stamp down.
 */
// Same drum order as SplitFlapText. Each tile starts a few flaps before its letter,
// so the board clatters briefly instead of spinning the whole drum (fast on slow phones too).
const CHARSET = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:.-/&!?';
const TARGET = 'FATT PUNDIT';
const LEAD = [7, 5, 9, 6, 0, 8, 6, 10, 5, 7, 9];
const START = [...TARGET].map((c, i) => (c === ' ' ? ' ' : CHARSET[(CHARSET.indexOf(c) - LEAD[i] + CHARSET.length) % CHARSET.length])).join('');

export default function ArrivalBoard() {
  const [text, setText] = useState(START);

  useEffect(() => {
    const go = window.setTimeout(() => setText(TARGET), 250);
    return () => window.clearTimeout(go);
  }, []);

  // Stamp the moment the last flap lands, plus a short beat so the eye reads the name.
  const settled = () => {
    if (text === TARGET) window.setTimeout(() => window.dispatchEvent(new Event('fp:board-done')), 260);
  };

  return (
    <SplitFlapText
      className="font-display text-[clamp(30px,7.4vw,92px)] tracking-normal"
      length={11}
      onSettled={settled}
      text={text}
      tileClassName="bg-[#3a3631] text-sand shadow-[inset_0_0_0_1px_rgb(203_160_82/0.35),0_6px_14px_rgb(0_0_0/0.45)]"
    />
  );
}
