/**
 * A book whose leaves bend as paper (docs/MOTION-ROADMAP.md §M6). Raw WebGL2, like rain-glass.ts.
 * The open book lies in the z = 0 plane, spine on x = 0, each page 1 wide and `aspect` tall; stacks of leaves hang
 * below z = 0. A turning leaf is a strip of circular arcs (constant curvature, closed form in the shader), each row
 * offset a little so the grabbed corner leads; it is lit by a warm lamp and shadows the page below.
 * Spread k shows face 2k (left) | 2k+1 (right); face 0 and the last face are "no page" (the closed book's outside).
 * Leaf j: front = face 2j+1, back = face 2j+2. Draws only while something moves.
 * Returns null where WebGL2 can't run (caller keeps the CSS PageFlip).
 */
import { SPRING } from './motion-tokens';
import { LEAF_VS, LEAF_FS, EDGE_VS, EDGE_FS, QUAD_VS, PAGE_FS, SHADOW_FS, STACK_FS, sub, cross, dot, norm, clamp, program, grid, type Vec3 } from './page-curl-gl';

export interface CurlStats {
  fps: number;
  worstMs: number;
  frames: number;
}
export type CurlSide = 'left' | 'right' | 'both';
export interface CurlBook {
  /** Upload face i (null = forget it). Faces outside the texture window are ignored; unset faces draw as paper. */
  setFace(i: number, src: TexImageSource | null): void;
  next(): void;
  prev(): void;
  /** animate=false jumps; true turns leaf by leaf (single view: pans between pages too). `side` only matters in single view. */
  goTo(spread: number, animate: boolean, side?: 'left' | 'right'): void;
  setSingle(single: boolean): void;
  destroy(): void;
}
interface Options {
  /** Page height / width. */
  aspect: number;
  start?: number;
  single?: boolean;
  onSpread?: (spread: number, count: number, side: CurlSide) => void;
  /** Faces in the texture window that have no texture yet (called on mount and when the window moves). */
  onNeed?: (faces: number[]) => void;
  onStats?: (s: CurlStats) => void;
  onLost?: () => void;
}

export function mountPageCurl(canvas: HTMLCanvasElement, faceCount: number, opts: Options): CurlBook | null {
  if (faceCount < 2 || faceCount % 2) return null;
  const gl = canvas.getContext('webgl2', { antialias: true, alpha: true, premultipliedAlpha: true });
  if (!gl) return null;
  // No GPU (SwiftShader, llvmpipe): every frame on the CPU; keep the CSS book (as rain-glass.ts).
  const info = gl.getExtension('WEBGL_debug_renderer_info');
  if (/swiftshader|llvmpipe|softpipe|software/i.test(String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER)))) return null;

  const leafProg = program(gl, LEAF_VS, LEAF_FS);
  const edgeProg = program(gl, EDGE_VS, EDGE_FS);
  const pageProg = program(gl, QUAD_VS, PAGE_FS);
  const shadowProg = program(gl, QUAD_VS, SHADOW_FS);
  const stackProg = program(gl, QUAD_VS, STACK_FS);
  const programs = [leafProg, edgeProg, pageProg, shadowProg, stackProg];
  const leafMesh = grid(gl, 48, 12);
  const edgeMesh = grid(gl, 1, 12);
  const quad = grid(gl, 1, 1);
  const aniso = gl.getExtension('EXT_texture_filter_anisotropic');

  const H = opts.aspect;
  const LIGHT: Vec3 = [-0.45, 0.55, 1]; // the lamp: top left, above the table
  const LAMP: Vec3 = [1, 0.95, 0.86];
  const PAPER: Vec3 = [0.93, 0.88, 0.78];
  const BOARD: Vec3 = [0.2, 0.13, 0.09];
  const CURL = 1.1; // radians of bend across a leaf at mid-turn
  const TWIST = 0.5; // how far the grabbed corner leads
  const STIFF = 0.35; // covers bend this much as paper does
  const LEAF_T = 0.006; // thickness of a leaf, and of a cover board
  const BOARD_T = 0.012;
  const STACK_CAP = 0.09;
  const PEEK = 0.06; // how far a corner lifts on hover (p)
  const CORNER = 0.28; // hover radius around a page corner
  const count = faceCount / 2; // spreads
  const L = count - 1; // leaves

  const makeTex = (src: TexImageSource | null) => {
    const t = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false); // ignored for ImageBitmap anyway: the shaders flip v for every source
    if (src) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
    else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([246, 239, 228, 255]));
    if (src) {
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      if (aniso) gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, 8);
    } else gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  };
  const paper = makeTex(null);
  const tex = new Map<number, WebGLTexture>();
  const T = (i: number) => tex.get(i) ?? paper;
  const noPage = (i: number) => i <= 0 || i >= faceCount - 1;

  // State. A turn moves one leaf: p = angle / π (0 = on the right, 1 = on the left); dir is its direction (0 = none).
  let k = clamp(Math.round(opts.start ?? 0), 0, count - 1);
  let single = !!opts.single;
  const fixSide = (s: number, sd: 'left' | 'right'): 'left' | 'right' => (s === 0 ? 'right' : s === count - 1 ? 'left' : sd);
  let side: 'left' | 'right' = fixSide(k, 'right'); // single view: the page framed
  const PG = () => (side === 'left' ? -0.5 : 0.5);
  let pan = PG(); // single view: camera x, springs to the framed page
  let panV = 0;
  let dir: 1 | -1 | 0 = 0;
  let p = 0;
  let v = 0;
  let goal = 0;
  let bend = 0;
  let grabRow = 0.5;
  let peek = false;
  let target = -1; // animated goTo
  let targetSide: 'left' | 'right' | undefined;
  let dragging = false;
  let pend: { id: number; x: number; row: number; t: number } | null = null; // single view: a press that hasn't chosen a direction
  let pointer = -1;
  let downAt = 0;
  let downP = 0;
  let raf = 0;
  let dead = false; // context lost or destroyed: draw nothing more
  let last = 0;
  let frames = 0;
  let total = 0;
  let worst = 0;
  let key = -1;

  const notify = () => opts.onSpread?.(k, count, single ? side : 'both');

  // Texture window: spreads k-1..k+1, plus the one beyond a real turn.
  const windowFaces = () => {
    const s = new Set<number>();
    const lo = k - 1 - (dir === -1 && !peek ? 1 : 0);
    const hi = k + 1 + (dir === 1 && !peek ? 1 : 0);
    for (let j = Math.max(0, lo); j <= Math.min(count - 1, hi); j++) for (const i of [2 * j, 2 * j + 1]) if (!noPage(i)) s.add(i);
    return s;
  };
  const sync = () => {
    const kk = k * 4 + (peek ? 0 : dir === 1 ? 3 : dir === -1 ? 1 : 0);
    if (kk === key) return;
    key = kk;
    const win = windowFaces();
    for (const [i, t] of tex) if (!win.has(i)) { gl.deleteTexture(t); tex.delete(i); }
    queueMicrotask(() => {
      if (dead) return;
      const need = [...windowFaces()].filter((i) => !tex.has(i));
      if (need.length) opts.onNeed?.(need);
    });
  };

  // Camera, fitted to the open book (or, in single view, to the page being read).
  const fov = (30 * Math.PI) / 180;
  const tanH = Math.tan(fov / 2);
  const back = norm([0, -0.38, 0.93]);
  let eye: Vec3 = [0, 0, 3];
  let basis: [Vec3, Vec3, Vec3] = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  let aspect = 1;
  let mvp = new Float32Array(16);

  const camera = () => {
    aspect = canvas.width / Math.max(1, canvas.height);
    const dist = single ? Math.max(0.54 / (tanH * aspect), (H * 0.56) / tanH) : Math.max(1.12 / (tanH * aspect), (H * 0.62) / tanH);
    const tx = single ? (dir !== 0 ? 0.5 - p : pan) : 0;
    const target: Vec3 = [tx, 0.04, 0];
    eye = [target[0] + back[0] * dist, target[1] + back[1] * dist, target[2] + back[2] * dist];
    const z = norm(sub(eye, target));
    const x = norm(cross([0, 1, 0], z));
    const y = cross(z, x);
    basis = [x, y, z];
    const f = 1 / tanH;
    const n = 0.1;
    const far = 20;
    const P = [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + n) / (n - far), -1, 0, 0, (2 * far * n) / (n - far), 0];
    const V = [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, eye), -dot(y, eye), -dot(z, eye), 1];
    mvp = new Float32Array(16);
    for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) for (let q = 0; q < 4; q++) mvp[c * 4 + r] += P[q * 4 + r] * V[c * 4 + q];
  };

  /** The pointer on the book's plane (x, y) and across the canvas (f, 0..1). */
  const pos = (e: PointerEvent): [number, number, number] => {
    const r = canvas.getBoundingClientRect();
    const f = (e.clientX - r.left) / r.width;
    const nx = f * 2 - 1;
    const ny = 1 - ((e.clientY - r.top) / r.height) * 2;
    const [x, y, z] = basis;
    const d: Vec3 = [0, 1, 2].map((i) => x[i] * nx * tanH * aspect + y[i] * ny * tanH - z[i]) as Vec3;
    const t = -eye[2] / d[2];
    return [eye[0] + d[0] * t, eye[1] + d[1] * t, f];
  };

  const forward = () => k < count - 1;
  const backward = () => k > 0;
  const startTurn = (d: 1 | -1) => {
    dir = d;
    p = goal = d === 1 ? 0 : 1;
    v = 0;
    bend = 0;
  };
  const turnStart = (d: 1 | -1) => {
    startTurn(d);
    goal = d === 1 ? 1 : 0;
    return true;
  };
  const panTo = (s: 'left' | 'right') => {
    side = s;
    notify();
    return true;
  };

  const leafShape = () => {
    const th = p * Math.PI;
    const s = Math.sin(th);
    const j = dir === 1 ? k : k - 1;
    const stiff = j === 0 || j === L - 1 ? STIFF : 1;
    const b = CURL * stiff * s * bend;
    const a = clamp(th - b / 2, 0, Math.PI);
    const twist = -TWIST * stiff * (peek ? 3 : 1) * s * (0.5 - grabRow) * 2 * (dir || 1);
    return { a, b, twist };
  };

  const place = (P: typeof pageProg, o: Vec3, x: Vec3, y: Vec3) => {
    gl.uniform3fv(P.u('uO'), o);
    gl.uniform3fv(P.u('uX'), x);
    gl.uniform3fv(P.u('uY'), y);
  };
  const lamp = (P: typeof pageProg) => {
    gl.uniformMatrix4fv(P.u('uMVP'), false, mvp);
    gl.uniform3fv(P.u('uLamp'), LAMP);
  };
  const stackH = (n: number, boards: number) => Math.min(STACK_CAP, Math.max(0, n) * LEAF_T + boards * (BOARD_T - LEAF_T) * Math.min(1, n));

  const draw = () => {
    sync();
    camera();
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    const turning = dir !== 0;
    const { a, b, twist } = leafShape();
    // Leaves on each side (fractional while one is in the air), and which of them are the covers.
    const lN = k + (dir === 1 ? p : dir === -1 ? p - 1 : 0);
    const rN = L - lN;
    const rLo = dir === 1 ? k + 1 : k;
    const lHi = dir === -1 ? k - 2 : k - 1;
    const hL = stackH(lN, (lHi >= 0 ? 1 : 0) + (lHi === L - 1 ? 1 : 0));
    const hR = stackH(rN, (rLo === 0 ? 1 : 0) + (rLo <= L - 1 ? 1 : 0));
    const xl = -clamp(lN);
    const xr = clamp(rN);
    const left = noPage(dir === -1 ? 2 * k - 2 : 2 * k) ? null : T(dir === -1 ? 2 * k - 2 : 2 * k);
    const right = noPage(dir === 1 ? 2 * k + 3 : 2 * k + 1) ? null : T(dir === 1 ? 2 * k + 3 : 2 * k + 1);

    gl.bindVertexArray(quad.vao);
    // Contact shadow on the table, offset away from the lamp.
    gl.useProgram(shadowProg.p);
    lamp(shadowProg);
    const tz = -Math.max(hL, hR) - 0.002;
    place(shadowProg, [xl - 0.4, -H / 2 - 0.4, tz], [xr - xl + 0.8, 0, 0], [0, H + 0.8, 0]);
    gl.uniform4f(shadowProg.u('uBox'), (xl + xr) / 2 + 0.05, -0.06, (xr - xl) / 2, H / 2);
    gl.drawElements(gl.TRIANGLES, quad.count, gl.UNSIGNED_SHORT, 0);

    // The stacks' front edges.
    gl.useProgram(stackProg.p);
    lamp(stackProg);
    for (const [h, n, x0, top, bot] of [
      [hL, lN, -1, lHi === L - 1, lHi >= 0],
      [hR, rN, 0, rLo === 0, rLo <= L - 1],
    ] as const) {
      if (n < 0.02 || h < 1e-4) continue;
      gl.uniform1f(stackProg.u('uN'), Math.max(1, n));
      gl.uniform1f(stackProg.u('uTop'), top ? Math.min(0.5, BOARD_T / h) : 0);
      gl.uniform1f(stackProg.u('uBot'), bot ? Math.min(0.5, BOARD_T / h) : 0);
      place(stackProg, [x0, -H / 2 - 0.0005, -h], [1, 0, 0], [0, 0, h]);
      gl.drawElements(gl.TRIANGLES, quad.count, gl.UNSIGNED_SHORT, 0);
    }

    // The two pages lying flat.
    gl.useProgram(pageProg.p);
    lamp(pageProg);
    gl.uniform2f(pageProg.u('uSize'), 1, H);
    gl.uniform3fv(pageProg.u('uLight'), LIGHT);
    gl.uniform1f(pageProg.u('uA'), a);
    gl.uniform1f(pageProg.u('uB'), b);
    gl.uniform1f(pageProg.u('uTwist'), twist);
    gl.uniform1i(pageProg.u('uTex'), 0);
    gl.uniform1f(pageProg.u('uHasLeaf'), turning ? 1 : 0);
    gl.activeTexture(gl.TEXTURE0);
    for (const [t, x0, s] of [[left, -1, -1], [right, 0, 1]] as const) {
      if (!t) continue;
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.uniform1f(pageProg.u('uSide'), s);
      place(pageProg, [x0, -H / 2, 0], [1, 0, 0], [0, H, 0]);
      gl.drawElements(gl.TRIANGLES, quad.count, gl.UNSIGNED_SHORT, 0);
    }
    if (!turning) return;

    const j = dir === 1 ? k : k - 1;
    gl.useProgram(leafProg.p);
    lamp(leafProg);
    gl.uniform2f(leafProg.u('uSize'), 1, H);
    gl.uniform3fv(leafProg.u('uLight'), LIGHT);
    gl.uniform3fv(leafProg.u('uEye'), eye);
    gl.uniform1f(leafProg.u('uA'), a);
    gl.uniform1f(leafProg.u('uB'), b);
    gl.uniform1f(leafProg.u('uTwist'), twist);
    gl.uniform1i(leafProg.u('uFront'), 0);
    gl.uniform1i(leafProg.u('uBack'), 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, T(2 * j + 1));
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, T(2 * j + 2));
    gl.bindVertexArray(leafMesh.vao);
    gl.drawElements(gl.TRIANGLES, leafMesh.count, gl.UNSIGNED_SHORT, 0);
    gl.activeTexture(gl.TEXTURE0);

    const board = j === 0 || j === L - 1;
    gl.useProgram(edgeProg.p);
    lamp(edgeProg);
    gl.uniform2f(edgeProg.u('uSize'), 1, H);
    gl.uniform1f(edgeProg.u('uA'), a);
    gl.uniform1f(edgeProg.u('uB'), b);
    gl.uniform1f(edgeProg.u('uTwist'), twist);
    gl.uniform1f(edgeProg.u('uThick'), board ? BOARD_T : LEAF_T);
    gl.uniform3fv(edgeProg.u('uCol'), board ? BOARD : PAPER);
    gl.bindVertexArray(edgeMesh.vao);
    gl.drawElements(gl.TRIANGLES, edgeMesh.count, gl.UNSIGNED_SHORT, 0);
  };

  const panSettled = () => Math.abs(pan - PG()) < 0.0005 && Math.abs(panV) < 0.01;
  const idle = () => dir === 0 && !dragging && !pend && panSettled();

  /** One more step toward a goTo target; false when there is none. */
  const advance = () => {
    if (target < 0) return false;
    const t = target;
    if (k < t) return single && side === 'left' ? panTo('right') : turnStart(1);
    if (k > t) return single && side === 'right' ? panTo('left') : turnStart(-1);
    const want = targetSide && fixSide(k, targetSide);
    target = -1;
    return !!(single && want && want !== side && panTo(want));
  };

  const frame = (now: number) => {
    raf = 0;
    const dt = Math.min(1 / 30, last ? (now - last) / 1000 : 1 / 60);
    if (last) {
      frames++;
      total += now - last;
      worst = Math.max(worst, now - last);
    }
    last = now;
    const reset = () => (last = frames = total = worst = 0);
    let hold = false;
    if (dir !== 0) {
      // Held: a stiff spring to the pointer (the leaf has a little weight). Let go: the page spring.
      const sp = dragging ? { stiffness: 700, damping: 2 * Math.sqrt(700 * 1.2), mass: 1.2 } : SPRING.page;
      v += ((-sp.stiffness * (p - goal) - sp.damping * v) / sp.mass) * dt;
      p += v * dt;
      if (p < 0 || p > 1) {
        p = clamp(p);
        v = 0;
      }
      // The free edge leads while it is pulled, and trails as the leaf falls.
      const lead = dragging || peek ? dir : Math.sign(v) || dir;
      bend += (lead - bend) * Math.min(1, dt * 8);
      if (!dragging && Math.abs(p - goal) < 0.001 && Math.abs(v) < 0.01) {
        if (peek) hold = true;
        else {
          const moved = (dir === 1 && goal === 1) || (dir === -1 && goal === 0);
          if (dir === 1 && goal === 1) (k++, (side = 'left'));
          if (dir === -1 && goal === 0) (k--, (side = 'right'));
          dir = 0;
          pan = PG();
          panV = 0;
          if (moved) notify();
        }
      }
    }
    if (dir === 0 && single) {
      const sp = SPRING.page;
      panV += ((-sp.stiffness * (pan - PG()) - sp.damping * panV) / sp.mass) * dt;
      pan += panV * dt;
    }
    let more = !hold;
    if (dir === 0 && (!single || panSettled())) {
      pan = PG();
      panV = 0;
      if (!advance()) {
        more = false;
        if (frames > 20) opts.onStats?.({ fps: Math.round((frames / total) * 1000), worstMs: Math.round(worst), frames });
        reset();
      }
    }
    if (hold) reset();
    draw();
    if (more) raf = requestAnimationFrame(frame);
  };
  const kick = () => {
    if (!raf && !dead) raf = requestAnimationFrame(frame);
  };

  /** The turn (or pan) that `d` means from here: 'turn', 'pan' or null. */
  const stepKind = (d: 1 | -1) => {
    if (!single) return (d === 1 ? forward() : backward()) ? 'turn' : null;
    if (d === 1) return side === 'right' ? (forward() ? 'turn' : null) : k < count - 1 ? 'pan' : null;
    return side === 'right' ? (k > 0 ? 'pan' : null) : backward() ? 'turn' : null;
  };
  const turn = (d: 1 | -1) => {
    target = -1;
    if (peek) {
      if (dir === d) {
        peek = false;
        goal = d === 1 ? 1 : 0;
        kick();
      }
      return;
    }
    if (!idle()) return;
    const kind = stepKind(d);
    if (kind === 'turn') turnStart(d);
    else if (kind === 'pan') panTo(d === 1 ? 'right' : 'left');
    else return;
    kick();
  };

  const wideSide = (x: number, y: number): 1 | -1 | 0 => {
    if (Math.abs(y) > H / 2 || Math.abs(x) > 1) return 0;
    const d = x > 0 ? 1 : -1;
    return (d === 1 ? forward() : backward()) ? d : 0;
  };
  const begin = (e: PointerEvent, row: number) => {
    dragging = true;
    pointer = e.pointerId;
    grabRow = row;
    downAt = performance.now();
    downP = p;
    canvas.setPointerCapture(e.pointerId); // released by the browser on pointerup / pointercancel
    kick();
  };

  const onDown = (e: PointerEvent) => {
    if (dead || e.button !== 0) return;
    const [x, y] = pos(e);
    const row = clamp(y / H + 0.5);
    if (single) {
      // Direction is chosen by the first movement; a tap turns by where it lands.
      if (!idle()) return;
      pend = { id: e.pointerId, x: e.clientX, row, t: performance.now() };
      canvas.setPointerCapture(e.pointerId);
      return;
    }
    if (dir !== 0 && !peek) return;
    if (!peek) {
      const d = wideSide(x, y);
      if (!d) return;
      startTurn(d);
    }
    peek = false;
    target = -1;
    begin(e, row);
  };
  const hover = (e: PointerEvent) => {
    if (single || e.pointerType !== 'mouse' || !matchMedia('(hover: hover)').matches) return;
    if (dir !== 0 && !peek) return;
    const [x, y] = pos(e);
    const d = x > 0 ? 1 : -1;
    const near = Math.hypot(Math.abs(x) - 1, Math.abs(y) - H / 2) < CORNER && (d === 1 ? forward() : backward());
    if (near && (!peek || dir === d)) {
      if (!peek) {
        startTurn(d);
        peek = true;
        goal = d === 1 ? PEEK : 1 - PEEK;
      }
      grabRow = clamp(y / H + 0.5);
      kick();
    } else if (peek) unpeek();
  };
  const unpeek = () => {
    peek = false;
    goal = dir === 1 ? 0 : 1;
    kick();
  };
  const onMove = (e: PointerEvent) => {
    if (dead) return;
    if (pend && e.pointerId === pend.id) {
      const dx = e.clientX - pend.x;
      if (Math.abs(dx) < 8) return;
      const d = dx < 0 ? 1 : -1;
      const { row, t } = pend;
      pend = null;
      const kind = stepKind(d);
      if (kind === 'turn') {
        turnStart(d);
        begin(e, row);
        downAt = t;
      } else if (kind === 'pan') turn(d);
      return;
    }
    if (!dragging) return hover(e);
    if (e.pointerId !== pointer) return;
    const [x, , f] = pos(e);
    goal = Math.acos(clamp(single ? 2 * f - 1 : x, -1, 1)) / Math.PI;
    kick();
  };
  const onUp = (e: PointerEvent) => {
    if (pend && e.pointerId === pend.id) {
      const quick = e.type === 'pointerup' && performance.now() - pend.t < 350;
      pend = null;
      if (quick) turn(pos(e)[2] > 1 / 3 ? 1 : -1);
      return;
    }
    if (!dragging || e.pointerId !== pointer) return;
    dragging = false;
    const tap = e.type === 'pointerup' && performance.now() - downAt < 250 && Math.abs(goal - downP) < 0.05;
    if (e.type === 'pointercancel') goal = dir === 1 ? 0 : 1; // the browser took the gesture: put the leaf back
    else if (tap) goal = dir === 1 ? 1 : 0;
    else if (Math.abs(v) > 1.2) goal = v > 0 ? 1 : 0;
    else goal = p > 0.5 ? 1 : 0;
    kick();
  };
  const onLeave = () => {
    if (peek && !dragging) unpeek();
  };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    draw();
  };
  const lost = (e: Event) => {
    e.preventDefault();
    dead = true;
    cancelAnimationFrame(raf);
    raf = 0;
    ro.disconnect();
    opts.onLost?.();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);
  canvas.addEventListener('pointerleave', onLeave);
  canvas.addEventListener('webglcontextlost', lost);
  resize();
  // Draw the leaf once now, so the GPU's first use of its program and textures isn't the first turn's frame.
  if (forward()) {
    dir = 1;
    draw();
    dir = 0;
    draw();
  }
  notify();

  return {
    setFace(i, src) {
      if (dead || i < 0 || i >= faceCount) return;
      const old = tex.get(i);
      if (!src || !windowFaces().has(i)) {
        if (old) {
          gl.deleteTexture(old);
          tex.delete(i);
        }
        return;
      }
      if (old) gl.deleteTexture(old);
      tex.set(i, makeTex(src));
      if (!raf) draw();
    },
    next: () => turn(1),
    prev: () => turn(-1),
    goTo(spread, animate, sd) {
      if (dead) return;
      const s = clamp(Math.round(spread), 0, count - 1);
      if (!animate) {
        if (dragging && canvas.hasPointerCapture(pointer)) canvas.releasePointerCapture(pointer);
        dragging = peek = false;
        pend = null;
        dir = 0;
        p = v = panV = 0;
        target = -1;
        k = s;
        side = fixSide(s, sd ?? (s === count - 1 ? 'left' : 'right'));
        pan = PG();
        draw();
        notify();
        return;
      }
      target = s;
      targetSide = sd;
      if (peek) unpeek();
      if (idle() && advance()) kick();
      else kick();
    },
    setSingle(s) {
      if (dead || s === single) return;
      single = s;
      side = fixSide(k, side);
      pan = PG();
      panV = 0;
      draw();
      notify();
    },
    destroy() {
      dead = true;
      cancelAnimationFrame(raf);
      raf = 0;
      if (pointer >= 0 && canvas.hasPointerCapture(pointer)) canvas.releasePointerCapture(pointer);
      dragging = false;
      ro.disconnect();
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      canvas.removeEventListener('pointerleave', onLeave);
      canvas.removeEventListener('webglcontextlost', lost);
      for (const t of tex.values()) gl.deleteTexture(t);
      tex.clear();
      gl.deleteTexture(paper);
      for (const P of programs) {
        for (const s of P.shaders) gl.deleteShader(s);
        gl.deleteProgram(P.p);
      }
      for (const m of [leafMesh, edgeMesh, quad]) {
        gl.deleteVertexArray(m.vao);
        for (const b of m.buffers) gl.deleteBuffer(b);
      }
    },
  };
}
