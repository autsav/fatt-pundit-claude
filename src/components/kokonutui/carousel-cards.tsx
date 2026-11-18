"use client";

/**
 * Momentum Rail, from KokonutUI (MIT, @dorianbaffier, kokonutui.com), restyled for Fatt Pundit.
 * Kept: the flick physics (release velocity → projected end point → spring to the nearest card,
 * rubber-banded ends) and the scroll-driven cover-flow tilt. Changed: cards are postage stamps
 * (perforated edge, brand paper), no favourites, no drawn scenes, no icon library.
 */

import { type CSSProperties, type ReactNode, type RefObject, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface RailItem {
  id: string;
  title: string;
  /** Under the title: what's in it. */
  note?: string;
  price?: string;
  tags?: string[];
  /** Photo URL. Without one the card is a typed menu slip. */
  image?: string;
  imageAlt?: string;
  /** Small label on the card, e.g. "Signature". */
  badge?: string;
  /** Extra art inside a slip card. */
  slip?: ReactNode;
}

const RAIL_CSS = `
@keyframes fp-rail-tilt {
  0% { transform: perspective(900px) translateZ(-180px) rotateY(-14deg); }
  50% { transform: perspective(900px) translateZ(0) rotateY(0deg); }
  100% { transform: perspective(900px) translateZ(-180px) rotateY(14deg); }
}
@keyframes fp-rail-parallax {
  from { transform: translate3d(calc(var(--rail-depth) * -1), 0, 0); }
  to { transform: translate3d(var(--rail-depth), 0, 0); }
}
@keyframes fp-rail-details {
  0%, 32% { opacity: 0; transform: translate3d(0, 6px, 0); }
  45%, 55% { opacity: 1; transform: translate3d(0, 0, 0); }
  68%, 100% { opacity: 0; transform: translate3d(0, 6px, 0); }
}
@supports (animation-timeline: view()) {
  .fp-rail-card { view-timeline: --fp-rail inline; }
  .fp-rail-details {
    animation: fp-rail-details linear both;
    animation-timeline: --fp-rail;
  }
  @media (prefers-reduced-motion: no-preference) {
    .fp-rail-tilt {
      animation: fp-rail-tilt linear both;
      animation-timeline: --fp-rail;
    }
    .fp-rail-layer {
      animation: fp-rail-parallax linear both;
      animation-timeline: --fp-rail;
    }
  }
}
`;

const STIFFNESS = 170;
const DAMPING = 26; // about 2·√170: critically damped, so no bounce at the card
const DECELERATION = 0.997; // UIScrollView's normal rate, per ms
const DRAG_THRESHOLD = 4;

const rubber = (overshoot: number, size: number) =>
  Math.sign(overshoot) *
  (1 - 1 / ((Math.abs(overshoot) * 0.55) / size + 1)) *
  size;

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

interface RailState {
  mode: "idle" | "pressing" | "dragging" | "spring";
  pointerId: number;
  startX: number;
  startPos: number;
  pos: number;
  vel: number;
  target: number;
  samples: { t: number; x: number }[];
  raf: number;
  last: number;
  suppressClick: boolean;
  /** The press caught a moving rail, so letting go must settle it. */
  caught: boolean;
}

const maxScroll = (scroller: HTMLElement) =>
  scroller.scrollWidth - scroller.clientWidth;

const snapPoints = (scroller: HTMLElement, track: HTMLUListElement) => {
  const max = maxScroll(scroller);
  return Array.from(track.children, (child) => {
    const card = child as HTMLElement;
    const center = track.offsetLeft + card.offsetLeft + card.offsetWidth / 2;
    return clamp(center - scroller.clientWidth / 2, 0, max);
  });
};

const nearestIndex = (points: number[], pos: number) => {
  let best = 0;
  for (let i = 1; i < points.length; i++) {
    if (Math.abs(points[i] - pos) < Math.abs(points[best] - pos)) {
      best = i;
    }
  }
  return best;
};

// Release velocity in px/ms from the last 100ms of samples; a pause before
// letting go means no flick.
const releaseVelocity = (samples: RailState["samples"], now: number) => {
  const first = samples[0];
  const last = samples.at(-1) ?? first;
  const dt = last.t - first.t;
  if (dt <= 0 || now - last.t > 60) {
    return 0;
  }
  return -(last.x - first.x) / dt;
};

function useMomentumRail(
  scrollerRef: RefObject<HTMLElement | null>,
  trackRef: RefObject<HTMLUListElement | null>,
  onIndex: (index: number) => void
) {
  const state = useRef<RailState>({
    mode: "idle",
    pointerId: -1,
    startX: 0,
    startPos: 0,
    pos: 0,
    vel: 0,
    target: 0,
    samples: [],
    raf: 0,
    last: 0,
    suppressClick: false,
    caught: false,
  });
  const onIndexRef = useRef(onIndex);
  onIndexRef.current = onIndex;

  // Write a virtual position: the in-range part scrolls natively, the rest
  // becomes a damped translate on the track (the rubber band).
  const apply = useCallback(
    (pos: number) => {
      const scroller = scrollerRef.current;
      const track = trackRef.current;
      if (!(scroller && track)) {
        return;
      }
      const inRange = clamp(pos, 0, maxScroll(scroller));
      scroller.scrollLeft = inRange;
      const over = pos - inRange;
      track.style.transform =
        Math.abs(over) > 0.1
          ? `translate3d(${(-rubber(over, scroller.clientWidth)).toFixed(2)}px,0,0)`
          : "";
    },
    [scrollerRef, trackRef]
  );

  // Native scroll snap is off while JS owns the position.
  const setFree = useCallback(
    (free: boolean) => {
      const scroller = scrollerRef.current;
      if (scroller) {
        scroller.dataset.free = String(free);
      }
    },
    [scrollerRef]
  );

  const step = useCallback(
    (now: number) => {
      const s = state.current;
      const dt = Math.min((now - s.last) / 1000, 1 / 30);
      s.last = now;
      // Semi-implicit Euler substeps keep the spring stable at any frame rate.
      const h = dt / 4;
      for (let i = 0; i < 4; i++) {
        const accel = -STIFFNESS * (s.pos - s.target) - DAMPING * s.vel;
        s.vel += accel * h;
        s.pos += s.vel * h;
      }
      if (Math.abs(s.pos - s.target) < 0.5 && Math.abs(s.vel) < 8) {
        s.pos = s.target;
        s.vel = 0;
        s.mode = "idle";
        apply(s.target);
        setFree(false);
        return;
      }
      apply(s.pos);
      s.raf = requestAnimationFrame(step);
    },
    [apply, setFree]
  );

  const springTo = useCallback(
    (target: number, velocity: number) => {
      const s = state.current;
      const scroller = scrollerRef.current;
      if (!scroller) {
        return;
      }
      cancelAnimationFrame(s.raf);
      // A spring, drag or caught press carries its own virtual position,
      // overshoot included.
      if (s.mode === "idle") {
        s.pos = scroller.scrollLeft;
      }
      s.target = target;
      s.vel = velocity;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        s.mode = "idle";
        s.pos = target;
        apply(target);
        setFree(false);
        return;
      }
      s.mode = "spring";
      setFree(true);
      s.last = performance.now();
      s.raf = requestAnimationFrame(step);
    },
    [apply, scrollerRef, setFree, step]
  );

  const goTo = useCallback(
    (index: number) => {
      const scroller = scrollerRef.current;
      const track = trackRef.current;
      if (!(scroller && track)) {
        return;
      }
      const s = state.current;
      const points = snapPoints(scroller, track);
      const i = clamp(index, 0, points.length - 1);
      springTo(points[i], s.mode === "spring" ? s.vel : 0);
    },
    [scrollerRef, springTo, trackRef]
  );

  const currentIndex = useCallback(() => {
    const scroller = scrollerRef.current;
    const track = trackRef.current;
    if (!(scroller && track)) {
      return 0;
    }
    const s = state.current;
    const pos = s.mode === "spring" ? s.target : scroller.scrollLeft;
    return nearestIndex(snapPoints(scroller, track), pos);
  }, [scrollerRef, trackRef]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    const track = trackRef.current;
    if (!(scroller && track)) {
      return;
    }
    const s = state.current;
    let scrollRaf = 0;

    const onScroll = () => {
      cancelAnimationFrame(scrollRaf);
      scrollRaf = requestAnimationFrame(() => {
        onIndexRef.current(
          nearestIndex(snapPoints(scroller, track), scroller.scrollLeft)
        );
      });
    };

    const suppressNextClick = () => {
      s.suppressClick = true;
      setTimeout(() => {
        s.suppressClick = false;
      }, 0);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) {
        return;
      }
      if ((e.target as Element).closest("button:not([data-rail-link])")) {
        return;
      }
      cancelAnimationFrame(s.raf);
      // Catching a moving rail keeps its virtual position, overshoot included.
      s.caught = s.mode === "spring";
      s.pos = s.caught ? s.pos : scroller.scrollLeft;
      s.mode = "pressing";
      s.pointerId = e.pointerId;
      s.startX = e.clientX;
      s.startPos = s.pos;
      s.samples = [{ t: e.timeStamp, x: e.clientX }];
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerId !== s.pointerId) {
        return;
      }
      const dx = e.clientX - s.startX;
      if (s.mode === "pressing" && Math.abs(dx) > DRAG_THRESHOLD) {
        s.mode = "dragging";
        scroller.setPointerCapture(e.pointerId);
        scroller.dataset.dragging = "true";
        setFree(true);
      }
      if (s.mode !== "dragging") {
        return;
      }
      s.pos = s.startPos - dx;
      apply(s.pos);
      s.samples.push({ t: e.timeStamp, x: e.clientX });
      while (s.samples.length > 2 && e.timeStamp - s.samples[0].t > 100) {
        s.samples.shift();
      }
    };

    const onRelease = (e: PointerEvent) => {
      if (e.pointerId !== s.pointerId) {
        return;
      }
      s.pointerId = -1;
      if (s.mode !== "dragging") {
        if (s.caught) {
          // A rail caught mid-flight (or mid-rubber-band) and let go
          // settles on the nearest card instead of freezing there. Like a
          // native list, the tap that stopped it does not open a card.
          suppressNextClick();
          const points = snapPoints(scroller, track);
          springTo(points[nearestIndex(points, s.pos)], 0);
          return;
        }
        // A press that never became a drag hands back to native snapping.
        s.mode = "idle";
        setFree(false);
        return;
      }
      scroller.dataset.dragging = "false";
      suppressNextClick();
      const v = releaseVelocity(s.samples, e.timeStamp);
      const projected = s.pos + (v * DECELERATION) / (1 - DECELERATION);
      const points = snapPoints(scroller, track);
      springTo(points[nearestIndex(points, projected)], v * 1000);
    };

    // A drag that ends over a card must not follow its link.
    const onClickCapture = (e: MouseEvent) => {
      if (s.suppressClick) {
        e.preventDefault();
        e.stopPropagation();
        s.suppressClick = false;
      }
    };

    // Wheel or touch takes over from a running spring.
    const onNativeInput = () => {
      if (s.mode !== "spring") {
        return;
      }
      cancelAnimationFrame(s.raf);
      s.mode = "idle";
      apply(clamp(s.pos, 0, maxScroll(scroller)));
      setFree(false);
    };

    // Arrow keys step one card; Home and End jump to the ends.
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target !== scroller) {
        return;
      }
      const last = track.children.length - 1;
      const index = nearestIndex(
        snapPoints(scroller, track),
        s.mode === "spring" ? s.target : scroller.scrollLeft
      );
      let next = -1;
      switch (e.key) {
        case "ArrowLeft":
          next = index - 1;
          break;
        case "ArrowRight":
          next = index + 1;
          break;
        case "Home":
          next = 0;
          break;
        case "End":
          next = last;
          break;
        default:
          return;
      }
      e.preventDefault();
      goTo(next);
    };

    scroller.addEventListener("keydown", onKeyDown);
    scroller.addEventListener("scroll", onScroll, { passive: true });
    scroller.addEventListener("pointerdown", onPointerDown);
    scroller.addEventListener("pointermove", onPointerMove);
    scroller.addEventListener("pointerup", onRelease);
    scroller.addEventListener("pointercancel", onRelease);
    scroller.addEventListener("lostpointercapture", onRelease);
    scroller.addEventListener("click", onClickCapture, true);
    scroller.addEventListener("wheel", onNativeInput, { passive: true });
    scroller.addEventListener("touchstart", onNativeInput, { passive: true });
    return () => {
      cancelAnimationFrame(scrollRaf);
      cancelAnimationFrame(s.raf);
      scroller.removeEventListener("keydown", onKeyDown);
      scroller.removeEventListener("scroll", onScroll);
      scroller.removeEventListener("pointerdown", onPointerDown);
      scroller.removeEventListener("pointermove", onPointerMove);
      scroller.removeEventListener("pointerup", onRelease);
      scroller.removeEventListener("pointercancel", onRelease);
      scroller.removeEventListener("lostpointercapture", onRelease);
      scroller.removeEventListener("click", onClickCapture, true);
      scroller.removeEventListener("wheel", onNativeInput);
      scroller.removeEventListener("touchstart", onNativeInput);
    };
  }, [apply, goTo, scrollerRef, setFree, springTo, trackRef]);

  return { goTo, currentIndex };
}

/* ------------------------------------------------------------------ */
/* Rail                                                               */
/* ------------------------------------------------------------------ */

// `aria-disabled` rather than `disabled` at the ends, so focus stays put.

const ARROW =
  "grid size-11 cursor-pointer place-items-center border-2 border-current transition-[background-color,color,opacity] duration-150 ease-out hover:bg-sand hover:text-ink focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2 aria-disabled:cursor-default aria-disabled:opacity-35 aria-disabled:hover:bg-transparent aria-disabled:hover:text-current";

/** Perforated stamp edge: a row of punched holes all round the paper. */
const PERF: CSSProperties = {
  WebkitMask: "radial-gradient(circle at 6px 6px, #0000 4.2px, #000 4.6px) -6px -6px / 12px 12px round, linear-gradient(#000 0 0) 8px 8px / calc(100% - 16px) calc(100% - 16px) no-repeat",
  mask: "radial-gradient(circle at 6px 6px, #0000 4.2px, #000 4.6px) -6px -6px / 12px 12px round, linear-gradient(#000 0 0) 8px 8px / calc(100% - 16px) calc(100% - 16px) no-repeat",
};

const StampCard = ({ item }: { item: RailItem }) => (
  <li className="fp-rail-card w-(--rail-card) flex-none snap-center">
    <div className="fp-rail-tilt relative drop-shadow-[0_12px_14px_rgb(44_41_37/0.32)]">
      <article className="relative bg-white p-[16px] text-ink" style={PERF}>
        <div className="relative aspect-[4/5] overflow-hidden bg-ink">
          {item.image ? (
            <div className="fp-rail-layer absolute inset-[-5%] [--rail-depth:4%]">
              <img alt={item.imageAlt ?? ""} className="h-full w-full object-cover" decoding="async" draggable={false} height={500} loading="lazy" src={item.image} width={400} />
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col bg-[#f6efe3] p-5">{item.slip}</div>
          )}
          {item.badge && (
            <span className="absolute left-3 top-3 bg-tiger px-2 py-1 font-label text-[11px] font-bold uppercase tracking-[0.2em] text-white">{item.badge}</span>
          )}
        </div>
        <div className="px-1 pb-1 pt-4">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="m-0 text-[15px] font-bold uppercase leading-tight tracking-[0.08em]">{item.title}</h3>
            {item.price && <span className="shrink-0 font-bold text-tiger">{item.price}</span>}
          </div>
          {item.note && <p className="fp-rail-details mt-1.5 text-[13.5px] leading-snug text-ink/80">{item.note}</p>}
          {item.tags && item.tags.length > 0 && (
            <p className="mt-2 font-label text-[11.5px] font-bold uppercase tracking-[0.22em] text-gold">{item.tags.join(" · ")}</p>
          )}
        </div>
      </article>
    </div>
  </li>
);

export interface CarouselCardsProps {
  items: RailItem[];
  title: string;
  className?: string;
  /** Header slot, left of the arrows. */
  head?: ReactNode;
}

export default function CarouselCards({ items, title, className, head }: CarouselCardsProps) {
  const scrollerRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  const { goTo, currentIndex } = useMomentumRail(scrollerRef, trackRef, setActive);
  const step = (delta: number) => goTo(currentIndex() + delta);

  return (
    <section aria-label={title} aria-roledescription="carousel" className={cn("@container/rail w-full [--rail-card:15rem] @3xl/rail:[--rail-card:17.5rem]", className)}>
      <div className="mx-auto mb-2 flex max-w-[1200px] items-end justify-between gap-4 px-5">
        <div className="min-w-0">{head}</div>
        <div className="flex shrink-0 items-center gap-2">
          <span aria-live="polite" className="mr-2 font-label text-sm font-bold tabular-nums tracking-[0.2em]">
            <span className="sr-only">Dish </span>
            {String(active + 1).padStart(2, "0")}
            <span aria-hidden="true"> / </span>
            <span className="sr-only"> of </span>
            {String(items.length).padStart(2, "0")}
          </span>
          <button aria-disabled={active === 0} aria-label="Previous dish" className={ARROW} onClick={() => step(-1)} type="button">
            <svg aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 16 16"><path d="M10 3 5 8l5 5" /></svg>
          </button>
          <button aria-disabled={active === items.length - 1} aria-label="Next dish" className={ARROW} onClick={() => step(1)} type="button">
            <svg aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 16 16"><path d="m6 3 5 5-5 5" /></svg>
          </button>
        </div>
      </div>

      <section
        aria-label={`${title}, use arrow keys to move`}
        className="relative snap-x snap-mandatory overflow-x-auto overscroll-x-contain py-10 outline-none [scrollbar-width:none] focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-inset data-[dragging=true]:cursor-grabbing data-[free=true]:snap-none [&::-webkit-scrollbar]:hidden [@media(pointer:fine)]:cursor-grab [@media(pointer:fine)]:select-none"
        ref={scrollerRef}
        // biome-ignore lint/a11y/noNoninteractiveTabindex: a focusable scroller is how keyboard users reach the arrow keys
        tabIndex={0}
      >
        <ul className="relative m-0 flex w-max list-none gap-6 p-0 px-[calc(50cqw-var(--rail-card)/2)]" ref={trackRef}>
          {items.map((item) => <StampCard item={item} key={item.id} />)}
        </ul>
      </section>

      <style href="fp-carousel-cards" precedence="default">{RAIL_CSS}</style>
    </section>
  );
}
