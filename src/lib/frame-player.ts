// Canvas frame player for the scroll-scrubbed door scene: fetch every frame as a compressed Blob,
// decode off-thread only a window of frames around the one being shown, draw.
import { loadOrder, nearestLoaded } from './frame-seq';

export type Cut = 'land' | 'port';
export type Manifest = {
  version: string;
  cuts: Record<Cut, { count: number; w: number; h: number; front: [number, number, number, number] }>;
};

export interface FramePlayer {
  manifest(): Promise<Manifest>;
  /** Resolves when frame 0 of that cut is decoded; frees the other cut. */
  setCut(cut: Cut): Promise<void>;
  /** Idempotent; follows loadOrder, max 6 fetches in flight. */
  startLoading(): void;
  /** Frames whose Blob is downloaded (decoded or not). */
  loadedCount(): number;
  /** Canvas px = css px x min(devicePixelRatio, 2, 1 / cover scale of a frame on this box). */
  resize(w: number, h: number): void;
  /** Draws the nearest decoded frame to i at x, y, scale s (stage css px) and decodes toward i. */
  draw(i: number, x: number, y: number, s: number): void;
  free(): void;
}

const MAX_IN_FLIGHT = 6;
// Decoded bitmaps are ~5.8 MB each at 1600x900: hold only a window around the shown frame,
// biased ahead in the scroll direction (plus frame 0, which the handoff needs instantly).
const AHEAD = 16;
const BEHIND = 8;
const MAX_DECODING = 4;
// A 1px AVIF, decoded from bytes (no fetch: CSP connect-src would block a data: URL).
const AVIF_1PX =
  'AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=';

export function createFramePlayer(canvas: HTMLCanvasElement, base = '/doors/v1'): FramePlayer {
  const ctx = canvas.getContext('2d');
  let manifestP: Promise<Manifest> | null = null;
  let extP: Promise<'avif' | 'webp'> | null = null;

  let gen = 0; // bumped on every reset; stale async work checks it before touching state
  let ctrl: AbortController | null = null;
  let cut: Cut | null = null;
  let ready: Promise<void> | null = null;
  let blobs: (Blob | undefined)[] = []; // every downloaded frame, compressed
  let bmps: (ImageBitmap | undefined)[] = []; // decoded frames: the window (+ frame 0) only
  let pending: boolean[] = []; // fetch in flight
  let decoding: boolean[] = [];
  let order: number[] = [];
  let info: Manifest['cuts'][Cut] | null = null;
  let loaded = 0, next = 0, inFlight = 0, nDecoding = 0;
  let started = false;
  let center = 0, dir = 1; // the window follows the last requested frame and its direction
  let cssW = 0, cssH = 0;
  let last = { i: -2, x: NaN, y: NaN, s: NaN }; // last drawn (nearest frame, x, y, s)
  const want = { i: -1, x: 0, y: 0, s: 0 }; // last requested draw, repainted as closer frames decode

  const manifest = () =>
    (manifestP ??= fetch(`${base}/manifest.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`manifest ${r.status}`);
        return r.json() as Promise<Manifest>;
      })
      .catch((e) => {
        manifestP = null; // allow a retry
        throw e;
      }));

  const ext = () =>
    (extP ??= (async () => {
      try {
        const bytes = Uint8Array.from(atob(AVIF_1PX), (c) => c.charCodeAt(0));
        (await createImageBitmap(new Blob([bytes], { type: 'image/avif' }))).close();
        return 'avif' as const;
      } catch {
        return 'webp' as const;
      }
    })());

  const reset = () => {
    gen++;
    ctrl?.abort();
    ctrl = null;
    for (const b of bmps) b?.close();
    blobs = []; bmps = []; pending = []; decoding = []; order = [];
    info = null; cut = null; ready = null;
    loaded = next = inFlight = nDecoding = center = 0;
    dir = 1;
    started = false;
    last = { i: -2, x: NaN, y: NaN, s: NaN };
    want.i = -1;
    ctx?.clearRect(0, 0, cssW, cssH);
  };

  const lo = () => center - (dir > 0 ? BEHIND : AHEAD);
  const hi = () => center + (dir > 0 ? AHEAD : BEHIND);
  const keep = (j: number) => j === 0 || (j >= lo() && j <= hi());

  async function decode(j: number): Promise<void> {
    const g = gen;
    decoding[j] = true;
    nDecoding++;
    try {
      const bmp = await createImageBitmap(blobs[j]!);
      if (g !== gen || !keep(j)) return bmp.close(); // freed, or scrolled out of the window meanwhile
      bmps[j] = bmp;
    } finally {
      if (g === gen) {
        decoding[j] = false;
        nDecoding--;
      }
    }
  }

  /** Close bitmaps outside the window; decode missing ones inside it, nearest the centre first. */
  function schedule() {
    const a = lo();
    const b = hi();
    for (let j = 1; j < bmps.length; j++) {
      if (bmps[j] && (j < a || j > b)) {
        bmps[j]!.close();
        bmps[j] = undefined;
      }
    }
    for (let d = 0; d <= AHEAD && nDecoding < MAX_DECODING; d++) {
      request(center + dir * d, a, b);
      request(center - dir * d, a, b);
    }
  }

  function request(j: number, a: number, b: number) {
    if (j < a || j > b || !blobs[j] || bmps[j] || decoding[j] || nDecoding >= MAX_DECODING) return;
    const g = gen;
    decode(j)
      .catch(() => { if (g === gen) blobs[j] = undefined; }) // undecodable: skip it for good
      .finally(() => {
        if (g !== gen) return;
        schedule();
        if (want.i >= 0) paint(want.i, want.x, want.y, want.s); // a closer frame may be ready now
      });
  }

  async function load(i: number): Promise<void> {
    const g = gen;
    const signal = ctrl!.signal;
    const c = cut!;
    pending[i] = true;
    try {
      const e = await ext();
      const res = await fetch(`${base}/${c}/${String(i).padStart(3, '0')}.${e}`, { signal });
      if (!res.ok) throw new Error(`frame ${i} ${res.status}`);
      const blob = await res.blob();
      if (g !== gen) return; // cut changed or freed mid-flight
      blobs[i] = blob;
      loaded++;
    } finally {
      if (g === gen) pending[i] = false;
    }
  }

  function pump() {
    const g = gen;
    while (inFlight < MAX_IN_FLIGHT && next < order.length) {
      const i = order[next++];
      if (blobs[i] || pending[i]) continue;
      inFlight++;
      load(i)
        .then(() => { if (g === gen && keep(i)) schedule(); })
        .catch(() => {}) // a bad frame is skipped; nearestLoaded covers the gap
        .finally(() => {
          if (g !== gen) return;
          inFlight--;
          pump();
        });
    }
  }

  function fit() {
    // No sharper than the source: past 1 canvas px per frame px at cover scale is wasted fill.
    const cover = info ? Math.max(cssW / info.w, cssH / info.h) : 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2, cover > 0 ? Math.max(1, 1 / cover) : 2);
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    last.i = -2; // resizing wipes the canvas
  }

  function paint(i: number, x: number, y: number, s: number) {
    if (!ctx || !info) return;
    const n = nearestLoaded(i, bmps);
    if (n < 0) return;
    if (n === last.i && x === last.x && y === last.y && s === last.s) return;
    last.i = n; last.x = x; last.y = y; last.s = s;
    ctx.clearRect(0, 0, cssW, cssH);
    ctx.drawImage(bmps[n]!, x, y, info.w * s, info.h * s);
  }

  return {
    manifest,
    setCut(c) {
      if (c === cut && ready) return ready;
      reset();
      cut = c;
      ctrl = new AbortController();
      const g = gen;
      return (ready = (async () => {
        try {
          const m = await manifest();
          if (g !== gen) return;
          info = m.cuts[c];
          const n = info.count;
          blobs = new Array(n).fill(undefined); bmps = new Array(n).fill(undefined);
          pending = new Array(n).fill(false); decoding = new Array(n).fill(false);
          order = loadOrder(info.count); // once per cut: it allocates
          fit();
          inFlight++; // frame 0 counts toward the fetch cap
          try {
            await load(0);
          } finally {
            if (g === gen) inFlight--;
          }
          if (g !== gen) return;
          await decode(0);
          if (g === gen && started) pump();
        } catch (e) {
          if (g !== gen) return; // superseded: settle quietly
          ready = null; // real failure: let setCut(sameCut) retry
          throw e;
        }
      })());
    },
    startLoading() {
      if (started || !info) return;
      started = true;
      pump();
    },
    loadedCount: () => loaded,
    resize(w, h) {
      cssW = w;
      cssH = h;
      fit();
    },
    draw(i, x, y, s) {
      want.i = i; want.x = x; want.y = y; want.s = s;
      if (i !== center && info) {
        dir = i > center ? 1 : -1;
        center = i;
        schedule();
      }
      paint(i, x, y, s);
    },
    free: reset,
  };
}
