import { useCallback, useEffect, useRef, useState } from 'react';
import { MS } from '@/lib/motion-tokens';
import { lockScroll, unlockScroll } from '@/lib/smooth-scroll';

/**
 * Scene 7: the room, as a photographer's contact sheet on a halftone print.
 * Film frames with sprocket holes and edge numbers; two picks circled in gold grease pencil.
 * Tap a frame for the lightbox: arrows, swipe and Escape (native <dialog>, so focus is handled).
 */

export interface SheetFrame {
  thumb: string;
  /** Smaller cuts of `thumb` ("url 360w, url 480w, url 640w"), picked by the strip's `sizes`. */
  thumbSet?: string;
  full: string;
  alt: string;
}

const FIRST = 12;
/** The strip is four frames across, two on phones (global.css .room-strip); the wrap tops out at 1240 px. */
const THUMB_SIZES = '(min-width: 761px) 310px, 50vw';
/** The lead frame is the first one, large; the rest follow as the strip. Class names are local to the sheet. */
const CSS = `
.room-sheet{display:grid;gap:clamp(16px,2.5vw,28px)}
.room-sheet .room-lead{width:100%;background-color:#1b1917;box-shadow:0 20px 50px rgb(44 41 37 / .35)}
@media (min-width:761px){.room-sheet .room-lead{width:60%}}
.room-sheet .room-lead .room-shot{aspect-ratio:3/2}
.room-sheet .room-pick{inset:-10px;width:calc(100% + 20px);height:calc(100% + 20px)}
`;

export default function RoomContactSheet({ frames, picks }: { frames: SheetFrame[]; picks: number[] }) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const unmount = useRef(0);
  const [open, setOpen] = useState<number | null>(null);
  const [drawn, setDrawn] = useState(false);

  // Circle the picks once the sheet is on screen.
  useEffect(() => {
    const el = sheetRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setDrawn(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const show = (i: number, from: HTMLButtonElement) => {
    opener.current = from;
    window.clearTimeout(unmount.current);
    setOpen(i);
    dialogRef.current?.showModal();
    document.documentElement.style.overflow = 'hidden';
    lockScroll();
  };
  const close = () => dialogRef.current?.close();
  const step = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + frames.length) % frames.length)), [frames.length]);

  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    const onClose = () => {
      document.documentElement.style.overflow = '';
      unlockScroll();
      opener.current?.focus();
      // The photo stays while the dark room fades out (global.css .room-lightbox); the guest is not held.
      unmount.current = window.setTimeout(() => setOpen(null), MS.fast);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    dlg.addEventListener('close', onClose);
    dlg.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(unmount.current);
      dlg.removeEventListener('close', onClose);
      dlg.removeEventListener('keydown', onKey);
    };
  }, [step]);

  const cur = open === null ? null : frames[open];

  const frame = (f: SheetFrame, i: number, lead = false) => (
    <li key={f.thumb} className={`room-frame ${lead ? 'room-lead' : ''}`}>
      <span className="room-edge" aria-hidden="true">
        FATT PUNDIT 400 <span className="room-edge-n">▸{FIRST + i}</span>
      </span>
      <button type="button" className="room-shot" onClick={(e) => show(i, e.currentTarget)} aria-label={`Open photo ${i + 1} of ${frames.length}: ${f.alt}`}>
        {lead ? (
          <img className="fp-photo" src={f.full} alt="" loading="lazy" decoding="async" />
        ) : (
          <img className="fp-photo" src={f.thumb} srcSet={f.thumbSet} sizes={f.thumbSet ? THUMB_SIZES : undefined} alt="" loading="lazy" decoding="async" />
        )}
      </button>
      <span className="room-edge" aria-hidden="true">
        <span className="room-edge-n">{FIRST + i}A</span> ◂
      </span>
      {picks.includes(i) && (
        <svg className="room-pick" viewBox="0 0 200 140" preserveAspectRatio="none" aria-hidden="true">
          <path d="M24 74 C18 30 92 12 150 20 C196 28 198 98 150 118 C96 138 20 124 12 84 C6 52 46 30 92 24" pathLength="1" />
        </svg>
      )}
    </li>
  );

  return (
    <>
      <div ref={sheetRef} className="room-sheet" data-drawn={drawn || undefined}>
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        {frames[0] && <ol className="m-0 list-none p-0">{frame(frames[0], 0, true)}</ol>}
        {frames.length > 1 && <ol className="room-strip m-0 list-none p-0">{frames.slice(1).map((f, k) => frame(f, k + 1))}</ol>}
      </div>

      <dialog
        ref={dialogRef}
        className="room-lightbox"
        data-lenis-prevent
        aria-label="Photo of the room"
        onClick={(e) => e.target === e.currentTarget && close()}
        onPointerDown={(e) => (swipe.current = { x: e.clientX, y: e.clientY })}
        onPointerUp={(e) => {
          const s = swipe.current;
          swipe.current = null;
          if (!s || e.pointerType === 'mouse') return;
          const dx = e.clientX - s.x;
          if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(e.clientY - s.y)) step(dx < 0 ? 1 : -1);
        }}
      >
        {cur && open !== null && (
          <figure className="m-0 flex h-full flex-col items-center justify-center gap-4">
            <img key={cur.full} src={cur.full} alt={cur.alt} className="fp-photo room-lightbox-img" />
            <figcaption className="flex w-full max-w-[1100px] items-center justify-between gap-4 px-2 text-sand">
              <span className="font-note text-[16px] italic">{cur.alt}</span>
              <span className="shrink-0 font-label text-[12px] font-bold uppercase tracking-[0.24em] text-gold">
                Frame {FIRST + open}, {open + 1} of {frames.length}
              </span>
            </figcaption>
          </figure>
        )}
        <button type="button" className="room-lb-btn room-lb-prev" onClick={() => step(-1)} aria-label="Previous photo">
          ←
        </button>
        <button type="button" className="room-lb-btn room-lb-next" onClick={() => step(1)} aria-label="Next photo">
          →
        </button>
        <button type="button" className="room-lb-btn right-3 top-3" onClick={close} aria-label="Close">
          ✕
        </button>
      </dialog>
    </>
  );
}
