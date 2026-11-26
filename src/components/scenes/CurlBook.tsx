/**
 * The menu book in depth (docs/MOTION-ROADMAP.md §M6), in place of the CSS PageFlip it replaced (same props).
 * Two layers:
 * - the DOM spread: the real pages, for screen readers always, and the whole book where WebGL2 can't run, the
 *   context is lost or motion is reduced (then a page changes at once: no animation);
 * - on top, a WebGL2 canvas (src/lib/page-curl.ts) whose faces are those same pages rasterised
 *   (src/lib/page-raster.ts) from an invisible 1000px-wide studio, only the ones near the open spread.
 * Both modules load on demand, so the island's first load is unchanged.
 */
import { type KeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import type { CurlBook as Curl } from '@/lib/page-curl';

type Side = 'left' | 'right' | 'both';
type View = { spread: number; side: Side };
/** Frames narrower than this show one page at a time (as PageFlip did). */
const SINGLE_BELOW = 520;
const ASPECT = 4 / 3; // page height / width: a spread is 3:2
const STUDIO_W = 1000; // px; 1cqw = 10px, as MenuBook measures its pages
const NONE = -1; // no page: the table beside a closed book
const BLANK = -2; // plain paper, to land the back cover on a left face

/** Faces in book order: spread k shows face 2k | 2k+1; leaf j carries face 2j+1 (front) and 2j+2 (back). */
function facesOf(count: number): number[] {
  const f = [NONE, ...Array.from({ length: count }, (_, i) => i)];
  if ((f.length + 1) % 2) f.splice(f.length - 1, 0, BLANK); // odd: blank before the back cover
  return [...f, NONE];
}

/** Next or previous view; one page at a time when `single` (left, then right, then turn). */
function step(v: View, dir: 1 | -1, single: boolean, faces: number[]): View | null {
  const spreads = faces.length / 2;
  if (!single) {
    const s = v.spread + dir;
    return s < 0 || s >= spreads ? null : { spread: s, side: 'both' };
  }
  let { spread, side } = v;
  for (;;) {
    if (dir === 1) [spread, side] = side === 'left' ? [spread, 'right'] : [spread + 1, 'left'];
    else [spread, side] = side === 'right' ? [spread, 'left'] : [spread - 1, 'right'];
    if (spread < 0 || spread >= spreads) return null;
    if (faces[2 * spread + (side === 'right' ? 1 : 0)] !== NONE) return { spread, side };
  }
}

export default function CurlBook({ pages, label = 'Menu', start = 0, open = false }: { pages: ReactNode[]; label?: string; start?: number; open?: boolean }) {
  const faces = useMemo(() => facesOf(pages.length), [pages.length]);
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const studioRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<Curl | null>(null);
  const [single, setSingle] = useState(false);
  const [view, setView] = useState<View>({ spread: open ? 1 : start, side: 'both' });
  const [mounted, setMounted] = useState(false); // the 3D book exists (its faces may still be coming)
  const [live, setLive] = useState(false); // ...and the open spread's faces are drawn: the canvas shows
  const queue = useRef<number[]>([]); // faces waiting to be rasterised
  const [cur, setCur] = useState<number | null>(null); // the face in the studio now
  const curRef = useRef<number | null>(null);
  curRef.current = cur;
  const [tick, setTick] = useState(0);
  const swipe = useRef<{ x: number; id: number } | null>(null);

  // One page or two, from the frame's width.
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const ro = new ResizeObserver(() => setSingle(frame.clientWidth < SINGLE_BELOW));
    ro.observe(frame);
    return () => ro.disconnect();
  }, []);
  useEffect(() => {
    setView((v) => (single ? { spread: v.spread, side: faces[2 * v.spread + 1] === NONE ? 'left' : 'right' } : { spread: v.spread, side: 'both' }));
    bookRef.current?.setSingle(single);
  }, [single, faces]);

  // The 3D book: not with reduced motion; null from mountPageCurl (no WebGL2, no GPU) keeps the DOM book.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let gone = false;
    let io: IntersectionObserver | undefined;
    import('@/lib/page-curl').then(({ mountPageCurl }) => {
      if (gone) return;
      const narrow = (frameRef.current?.clientWidth ?? 1000) < SINGLE_BELOW;
      const book = mountPageCurl(canvas, faces.length, {
        aspect: ASPECT,
        start: open ? 0 : start,
        single: narrow,
        onSpread: (spread, _n, side) => setView({ spread, side }),
        onNeed: (f) => {
          // The full list of faces still without a texture: it replaces the queue (faces of a window already
          // left drop out); the one in the studio now isn't queued twice.
          queue.current = f.filter((i) => faces[i] >= 0 && i !== curRef.current);
          setTick((t) => t + 1);
        },
        onLost: () => {
          bookRef.current?.destroy();
          bookRef.current = null;
          setMounted(false);
          setLive(false);
        },
      });
      if (!book) return;
      bookRef.current = book;
      setMounted(true);
      // Wide screens: the cover swings open as the book comes on screen.
      if (open)
        io = new IntersectionObserver(([e]) => {
          if (!e.isIntersecting) return;
          io?.disconnect();
          book.goTo(1, true);
        }, { threshold: 0.4 });
      io?.observe(canvas);
    });
    return () => {
      gone = true;
      io?.disconnect();
      bookRef.current?.destroy();
      bookRef.current = null;
    };
    // Mounted once per book: MenuBook remounts this component (key) for another menu or room.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Faces the book asks for: one worker rasterises them one at a time, at idle, each laid out alone in the studio.
  useEffect(() => {
    if (cur !== null || !queue.current.length || !mounted) return;
    setCur(queue.current.shift()!);
  }, [cur, tick, mounted]);
  useEffect(() => {
    const book = bookRef.current;
    const el = studioRef.current?.firstElementChild as HTMLElement | null;
    if (cur === null || !book || !el) return;
    let stop = false;
    const width = Math.min(1600, Math.round(((frameRef.current?.clientWidth ?? 800) / (single ? 1 : 2)) * Math.min(2, devicePixelRatio || 1) * 1.25));
    (async () => {
      await new Promise((r) => ('requestIdleCallback' in window ? requestIdleCallback(r, { timeout: 300 }) : setTimeout(r, 16)));
      const { rasterPage } = await import('@/lib/page-raster');
      const imgs = [...el.querySelectorAll('img')];
      imgs.forEach((i) => (i.loading = 'eager'));
      await Promise.all(imgs.map((i) => i.decode().catch(() => {})));
      try {
        const bmp = await rasterPage(el, width);
        if (!stop && bookRef.current === book) book.setFace(cur, bmp);
        bmp.close();
      } catch {
        // A face that can't be drawn stays plain paper; the text is still in the DOM spread.
      }
      if (stop) return;
      // The open spread's faces are in: swap the flat book for the 3D one.
      if (!queue.current.length) setLive(true);
      setCur(null);
    })();
    return () => {
      stop = true;
    };
  }, [cur]); // eslint-disable-line react-hooks/exhaustive-deps

  const go = (dir: 1 | -1) => {
    const book = bookRef.current;
    if (book) return dir === 1 ? book.next() : book.prev();
    const to = step(view, dir, single, faces);
    if (to) setView(to);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    go(e.key === 'ArrowRight' ? 1 : -1);
  };
  // The DOM book turns by swipe (the canvas takes its own pointers).
  const onDown = (e: ReactPointerEvent) => {
    if (!live) swipe.current = { x: e.clientX, id: e.pointerId };
  };
  const onUp = (e: ReactPointerEvent) => {
    const s = swipe.current;
    swipe.current = null;
    if (s && s.id === e.pointerId && Math.abs(e.clientX - s.x) > 40) go(e.clientX < s.x ? 1 : -1);
  };

  const at = (side: 'left' | 'right') => faces[2 * view.spread + (side === 'right' ? 1 : 0)];
  const shown = (view.side === 'both' ? [at('left'), at('right')] : [at(view.side)]).filter((f) => f >= 0);
  const first = shown.length ? shown[0] + 1 : 1;
  const last = shown.length ? shown[shown.length - 1] + 1 : 1;
  const prevOk = step(view, -1, single, faces) !== null;
  const nextOk = step(view, 1, single, faces) !== null;

  const page = (f: number, side: 'left' | 'right' | 'one') =>
    f === NONE ? null : (
      <div key={`${side}${f}`} className={`@container relative h-full overflow-hidden bg-[#fdfbf7] text-ink ring-1 ring-black/10 shadow-[0_24px_30px_rgb(0_0_0/0.35)] ${side === 'one' ? 'w-full' : 'w-1/2'}`}>
        {f >= 0 && pages[f]}
        {side !== 'one' && <span aria-hidden="true" className={`pointer-events-none absolute inset-y-0 w-[8%] from-black/[0.12] to-transparent ${side === 'left' ? 'right-0 bg-linear-to-l' : 'left-0 bg-linear-to-r'}`} />}
      </div>
    );

  return (
    <div ref={frameRef} className="flex w-full flex-col items-center">
      <div className={`relative w-full touch-pan-y select-none ${single ? 'aspect-[3/4]' : 'aspect-[3/2]'}`} onPointerDown={onDown} onPointerUp={onUp} onPointerCancel={() => (swipe.current = null)}>
        {/* The DOM spread: the text for screen readers; the book itself when the canvas isn't drawing. */}
        <div className={`flex size-full ${view.side === 'both' && (at('left') === NONE || at('right') === NONE) ? 'justify-center' : ''} ${live ? 'sr-only' : ''}`}>
          {view.side === 'both' ? [page(at('left'), 'left'), page(at('right'), 'right')] : page(at(view.side), 'one')}
        </div>
        {/* Laid out (not display:none) while its first faces are drawn, so the book can size its camera. */}
        <canvas ref={canvasRef} aria-hidden="true" className={`absolute inset-0 size-full touch-pan-y ${live ? '' : 'pointer-events-none opacity-0'}`} />
      </div>

      <div className="mt-6 flex items-center gap-4 font-label text-[15px] font-bold text-ink">
        <NavButton disabled={!prevOk} label="Previous page" onClick={() => go(-1)} onKeyDown={onKeyDown}>
          <path d="M10 4 6 8l4 4" />
        </NavButton>
        <span aria-live="polite" className="min-w-36 text-center tabular-nums">
          <span className="sr-only">{label}, page </span>
          {first === last ? `${first}` : `${first}–${last}`} of {pages.length}
        </span>
        <NavButton disabled={!nextOk} label="Next page" onClick={() => go(1)} onKeyDown={onKeyDown}>
          <path d="m6 4 4 4-4 4" />
        </NavButton>
      </div>

      {/* The studio: pages the 3D book needs, laid out at full size to be rasterised. Never seen or read. */}
      {mounted && (
        <div ref={studioRef} aria-hidden="true" inert className="pointer-events-none fixed left-0 top-0 -z-10 opacity-0" style={{ width: STUDIO_W }}>
          {cur !== null && (
            <div key={cur} className="@container relative overflow-hidden bg-[#fdfbf7] text-ink" style={{ width: STUDIO_W, height: STUDIO_W * ASPECT }}>
              {pages[faces[cur]]}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NavButton({ children, label, disabled, onClick, onKeyDown }: { children: ReactNode; label: string; disabled: boolean; onClick: () => void; onKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => void }) {
  return (
    <button
      // aria-disabled, not disabled: the last press keeps focus on the button, so the arrow keys keep working.
      aria-disabled={disabled || undefined}
      aria-label={label}
      className="flex size-11 items-center justify-center border-2 border-ink text-ink transition-colors duration-150 ease-out hover:bg-ink hover:text-sand focus-visible:outline-2 focus-visible:outline-[var(--fp-ring)] focus-visible:outline-offset-2 aria-disabled:cursor-default aria-disabled:border-dashed aria-disabled:opacity-60 aria-disabled:hover:bg-transparent aria-disabled:hover:text-ink"
      onClick={disabled ? undefined : onClick}
      onKeyDown={onKeyDown}
      type="button"
    >
      <svg aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 16 16">
        {children}
      </svg>
    </button>
  );
}
