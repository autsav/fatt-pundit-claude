/**
 * The arrival board's split-flap letters as plain DOM (AUDIT B-26: a first visit no longer downloads React
 * for the intro). Same look and timing as src/components/kokonutui/split-flap-text.tsx (kokonutui, MIT,
 * @dorianbaffier), which the room pages still use: tiles start a beat apart, clatter through a couple of
 * noise flaps, and land on their letter; the top flap falls on its hinge and the half below darkens.
 */
const CHARSET = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:.-/&!?';
const NOISE = '0123456789:-/&?';
const FLIP = 56;
const STAGGER = 40;

const clean = (v: string) => [...v.toUpperCase()].map((c) => (CHARSET.includes(c) ? c : ' ')).join('');

function half(char: string, which: 'top' | 'bottom', style?: Partial<CSSStyleDeclaration>) {
  const outer = document.createElement('span');
  outer.className = `backface-hidden absolute inset-x-0 h-1/2 overflow-hidden bg-inherit ${which === 'top' ? 'top-0 rounded-t-[0.12em]' : 'bottom-0 rounded-b-[0.12em]'}`;
  if (style) Object.assign(outer.style, style);
  const inner = document.createElement('span');
  inner.className = `absolute inset-x-0 flex h-[200%] items-center justify-center ${which === 'top' ? 'top-0' : 'bottom-0'}`;
  inner.textContent = char;
  outer.append(inner);
  return outer;
}

class Tile {
  el = document.createElement('span');
  private shown: string;
  private target: string;
  private timer = 0;
  private top: HTMLSpanElement;
  private bottom: HTMLSpanElement;
  private shade = document.createElement('span');
  private flipping: HTMLSpanElement[] = [];

  constructor(char: string, className: string, private onSettle: (t: string) => void) {
    this.shown = this.target = char;
    this.el.setAttribute('aria-hidden', 'true');
    this.el.className = className;
    this.top = half(char, 'top');
    this.bottom = half(char, 'bottom');
    this.shade.className = 'pointer-events-none absolute inset-x-0 bottom-0 h-1/2 rounded-b-[0.12em] bg-black/50 opacity-0';
    const hinge = document.createElement('span');
    hinge.className = 'pointer-events-none absolute inset-x-0 top-1/2 h-[0.04em] -translate-y-1/2 bg-black/70';
    hinge.dataset.hinge = '';
    this.el.append(this.top, this.bottom, this.shade, hinge);
    this.paint(null);
  }

  /** Still halves: the next letter's top, the old letter's bottom; a resting blank flap is not drawn. */
  private paint(flip: { from: string; to: string } | null) {
    (this.top.firstChild as HTMLElement).textContent = flip ? flip.to : this.shown;
    (this.bottom.firstChild as HTMLElement).textContent = flip ? flip.from : this.shown;
    for (const h of this.flipping) h.remove();
    this.flipping = [];
    this.el.style.visibility = !flip && this.shown === ' ' ? 'hidden' : '';
    if (!flip) return;
    const ft = half(flip.from, 'top', { transformOrigin: '50% 100%' });
    const fb = half(flip.to, 'bottom', { transformOrigin: '50% 0%', transform: 'rotateX(90deg)' });
    this.flipping = [ft, fb];
    this.shade.before(ft, fb);
    const h = FLIP / 2;
    ft.animate([{ transform: 'rotateX(0deg)' }, { transform: 'rotateX(-90deg)' }], { duration: h, easing: 'cubic-bezier(0.5, 0, 0.9, 0.6)', fill: 'forwards' });
    fb.animate([{ transform: 'rotateX(90deg)' }, { transform: 'rotateX(0deg)' }], { duration: h, delay: h, easing: 'cubic-bezier(0.2, 0.6, 0.3, 1)', fill: 'both' });
    this.shade.animate([{ opacity: 0 }, { opacity: 1 }, { opacity: 0 }], { duration: FLIP, easing: 'linear' });
  }

  set(target: string, delay: number, maxFlips: number | undefined, reduce: boolean) {
    clearTimeout(this.timer);
    this.target = target;
    if (reduce) { this.shown = target; this.paint(null); this.onSettle(target); return; }
    const path: string[] = [];
    if (this.shown !== target) {
      if (maxFlips !== undefined) {
        const k = Math.max(2, Math.min(maxFlips, 8));
        const seed = CHARSET.indexOf(target) + Math.round(delay / STAGGER);
        for (let i = 0; i < k; i++) path.push(NOISE[(seed * 5 + i * 3) % NOISE.length]);
        if (target === ' ') path.length = 1;
      } else {
        for (let c = this.shown; c !== target;) { c = CHARSET[(CHARSET.indexOf(c) + 1) % CHARSET.length]; path.push(c); }
      }
      if (path[path.length - 1] !== target) path.push(target);
    }
    const step = () => {
      const to = path.shift();
      if (to === undefined) { this.paint(null); this.onSettle(this.target); return; }
      this.paint({ from: this.shown, to });
      this.timer = window.setTimeout(() => { this.shown = to; step(); }, FLIP);
    };
    this.timer = window.setTimeout(step, delay);
  }

  stop() { clearTimeout(this.timer); }
}

export interface FlapBoardOptions {
  /** Tiles always shown, so the board doesn't change width. */
  length: number;
  className: string;
  tileClassName: string;
  /** Cap each tile's trip round the drum (a crisp clatter, not a long spin). */
  maxFlips?: number;
  /** Called once every tile shows the current text. */
  onSettled?: (text: string) => void;
}

/** Draws a board showing `text` in `host`; `set()` flips it to new text. */
export function flapBoard(host: HTMLElement, text: string, o: FlapBoardOptions) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wrap = document.createElement('span');
  wrap.className = o.className;
  const sr = document.createElement('span');
  sr.className = 'sr-only';
  sr.setAttribute('aria-live', 'polite');
  wrap.append(sr);
  let padded = '';
  let settled = new Set<number>();
  const tiles: Tile[] = [];
  const settle = (i: number, t: string) => {
    if (padded[i] !== t || settled.has(i)) return;
    settled.add(i);
    if (settled.size === padded.length) o.onSettled?.(padded);
  };
  const set = (next: string) => {
    const value = clean(next);
    const p = value.padEnd(o.length, ' ');
    // Tiles whose letter doesn't change won't flip, so count them as settled now.
    settled = new Set([...p].flatMap((c, i) => (padded[i] === c && settled.has(i) ? [i] : [])));
    padded = p;
    sr.textContent = value;
    [...p].forEach((c, i) => {
      if (!tiles[i]) { tiles[i] = new Tile(c, o.tileClassName, (t) => settle(i, t)); wrap.append(tiles[i].el); }
      tiles[i].set(c, i * STAGGER, o.maxFlips, reduce);
    });
  };
  set(text);
  host.append(wrap);
  return { set, unmount: () => { for (const t of tiles) t.stop(); wrap.remove(); } };
}
