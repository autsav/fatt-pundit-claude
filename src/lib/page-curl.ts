/**
 * A book whose leaves bend as paper (docs/MOTION-ROADMAP.md §M6). Raw WebGL2, like rain-glass.ts.
 * The open book lies in the z = 0 plane, spine on x = 0, each page 1 wide and `aspect` tall.
 * A turning leaf is a strip of circular arcs (constant curvature, closed form in the shader), each row
 * offset a little so the grabbed corner leads; it is lit by a warm lamp and shadows the page below.
 * Draws only while a leaf moves. Returns null where WebGL2 can't run (caller keeps the CSS PageFlip).
 */
import { SPRING } from './motion-tokens';

export interface CurlStats {
  fps: number;
  worstMs: number;
  frames: number;
}
export interface CurlBook {
  next(): void;
  prev(): void;
  destroy(): void;
}
interface Options {
  /** Page height / width. */
  aspect: number;
  onStats?: (s: CurlStats) => void;
  onSpread?: (spread: number, count: number) => void;
  onLost?: () => void;
}

const LEAF = `
uniform vec2 uSize; uniform float uA, uB, uTwist;
vec3 leaf(vec2 uv) {
  float s = uv.x * uSize.x;
  float a = uA + uTwist * (uv.y - 0.5);
  float x, z;
  if (abs(uB) < 1e-4) { x = s * cos(a); z = s * sin(a); }
  else { x = (sin(a + uB * s) - sin(a)) / uB; z = (cos(a) - cos(a + uB * s)) / uB; }
  return vec3(x, (uv.y - 0.5) * uSize.y, z);
}`;
const HEAD = '#version 300 es\nprecision highp float;\n';
const LEAF_VS = `${HEAD}${LEAF}
uniform mat4 uMVP; in vec2 aUV; out vec2 vUV; out vec3 vN; out vec3 vP;
void main() {
  vec3 p = leaf(aUV);
  vN = normalize(cross(leaf(aUV + vec2(0.01, 0.)) - p, leaf(aUV + vec2(0., 0.01)) - p));
  p.z += 0.004;
  vP = p; vUV = aUV;
  gl_Position = uMVP * vec4(p, 1.);
}`;
const LEAF_FS = `${HEAD}
uniform sampler2D uFront, uBack; uniform vec3 uLight, uEye, uLamp;
in vec2 vUV; in vec3 vN; in vec3 vP; out vec4 o;
void main() {
  float f = gl_FrontFacing ? 1. : 0.;
  vec3 n = normalize(vN) * (f * 2. - 1.);
  vec3 c = mix(texture(uBack, vec2(1. - vUV.x, vUV.y)).rgb, texture(uFront, vUV).rgb, f);
  vec3 L = normalize(uLight);
  float dif = max(dot(n, L), 0.);
  float sheen = pow(max(dot(n, normalize(L + normalize(uEye - vP))), 0.), 30.) * 0.1;
  float gutter = mix(0.8, 1., smoothstep(0., 0.14, vUV.x));
  o = vec4(c * (0.5 + 0.55 * dif) * gutter * uLamp + sheen, 1.);
}`;
const PAGE_VS = `${HEAD}
uniform mat4 uMVP; uniform vec2 uSize; uniform float uSide; in vec2 aUV; out vec2 vUV; out vec3 vP;
void main() {
  vP = vec3((uSide > 0. ? aUV.x : aUV.x - 1.) * uSize.x, (aUV.y - 0.5) * uSize.y, 0.);
  vUV = aUV;
  gl_Position = uMVP * vec4(vP, 1.);
}`;
const PAGE_FS = `${HEAD}${LEAF}
uniform sampler2D uTex; uniform float uSide, uHasLeaf; uniform vec3 uLight, uLamp;
in vec2 vUV; in vec3 vP; out vec4 o;
void main() {
  vec3 c = texture(uTex, vUV).rgb;
  float gutter = mix(0.78, 1., smoothstep(0., 0.14, uSide > 0. ? vUV.x : 1. - vUV.x));
  float shade = 1.;
  if (uHasLeaf > 0.5) {
    // The leaf's shadow falls from the spine to past its edge, pushed away from the lamp, softer the higher it is.
    vec3 e = leaf(vec2(1., vUV.y));
    float se = e.x - uLight.x / uLight.z * e.z;
    float sf = 0.04 + 0.45 * e.z;
    float x = vP.x;
    float inside = se > 0. ? step(0., x) * (1. - smoothstep(se - sf, se + sf, x)) : step(x, 0.) * smoothstep(se - sf, se + sf, x);
    shade -= 0.38 * inside * smoothstep(0., 0.12, e.z);
  }
  float dif = max(normalize(uLight).z, 0.);
  o = vec4(c * (0.5 + 0.55 * dif) * gutter * shade * uLamp, 1.);
}`;

type Vec3 = [number, number, number];
const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm = (a: Vec3): Vec3 => {
  const l = Math.hypot(...a);
  return [a[0] / l, a[1] / l, a[2] / l];
};

function program(gl: WebGL2RenderingContext, vs: string, fs: string) {
  const p = gl.createProgram();
  for (const [type, src] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]] as const) {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader');
    gl.attachShader(p, s);
  }
  gl.bindAttribLocation(p, 0, 'aUV');
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? 'link');
  const u = (n: string) => gl.getUniformLocation(p, n);
  return { p, u };
}

/** A (cols+1) × (rows+1) grid over [0,1]², counter-clockwise from +z. */
function grid(gl: WebGL2RenderingContext, cols: number, rows: number) {
  const uv: number[] = [];
  const idx: number[] = [];
  for (let j = 0; j <= rows; j++) for (let i = 0; i <= cols; i++) uv.push(i / cols, j / rows);
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++) {
      const a = j * (cols + 1) + i;
      idx.push(a, a + 1, a + cols + 2, a, a + cols + 2, a + cols + 1);
    }
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW);
  gl.bindVertexArray(null);
  return { vao, count: idx.length };
}

export function mountPageCurl(canvas: HTMLCanvasElement, pages: TexImageSource[], opts: Options): CurlBook | null {
  const gl = canvas.getContext('webgl2', { antialias: true, alpha: true, premultipliedAlpha: true });
  if (!gl || pages.length < 2) return null;
  // No GPU (SwiftShader, llvmpipe): every frame on the CPU; keep the CSS book (as rain-glass.ts).
  const info = gl.getExtension('WEBGL_debug_renderer_info');
  if (/swiftshader|llvmpipe|softpipe|software/i.test(String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER)))) return null;

  const leafProg = program(gl, LEAF_VS, LEAF_FS);
  const pageProg = program(gl, PAGE_VS, PAGE_FS);
  const leafMesh = grid(gl, 48, 12);
  const quad = grid(gl, 1, 1);
  const aniso = gl.getExtension('EXT_texture_filter_anisotropic');
  const tex = pages.map((img) => {
    const t = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    if (aniso) gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, 8);
    return t;
  });

  const H = opts.aspect;
  const LIGHT: Vec3 = [-0.45, 0.55, 1]; // the lamp: top left, above the table
  const LAMP: Vec3 = [1, 0.95, 0.86];
  const CURL = 1.1; // radians of bend across a leaf at mid-turn
  const TWIST = 0.5; // how far the grabbed corner leads
  const count = Math.floor(pages.length / 2);
  const L = (k: number) => tex[2 * k];
  const R = (k: number) => tex[2 * k + 1];

  // Camera, fitted to the open book.
  const fov = (30 * Math.PI) / 180;
  const tanH = Math.tan(fov / 2);
  const target: Vec3 = [0, 0.04, 0];
  const back = norm([0, -0.38, 0.93]);
  let eye: Vec3 = [0, 0, 3];
  let basis: [Vec3, Vec3, Vec3] = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  let aspect = 1;
  let mvp = new Float32Array(16);

  const camera = () => {
    aspect = canvas.width / Math.max(1, canvas.height);
    const dist = Math.max(1.12 / (tanH * aspect), (H * 0.62) / tanH);
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
    for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) mvp[c * 4 + r] += P[k * 4 + r] * V[c * 4 + k];
  };

  /** The point on the book's plane under the pointer. */
  const hit = (e: PointerEvent): [number, number] => {
    const r = canvas.getBoundingClientRect();
    const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
    const ny = 1 - ((e.clientY - r.top) / r.height) * 2;
    const [x, y, z] = basis;
    const d: Vec3 = [0, 1, 2].map((i) => x[i] * nx * tanH * aspect + y[i] * ny * tanH - z[i]) as Vec3;
    const t = -eye[2] / d[2];
    return [eye[0] + d[0] * t, eye[1] + d[1] * t];
  };

  // State: spread k shows L(k) | R(k). A turn moves one leaf; p = angle / π (0 = on the right, 1 = on the left).
  let k = 0;
  let dir: 1 | -1 | 0 = 0;
  let p = 0;
  let v = 0;
  let goal = 0;
  let bend = 0;
  let grabRow = 0.5;
  let dragging = false;
  let pointer = -1;
  let downAt = 0;
  let downP = 0;
  let raf = 0;
  let last = 0;
  let frames = 0;
  let total = 0;
  let worst = 0;

  const forward = () => k < count - 1;
  const backward = () => k > 0;
  const startTurn = (d: 1 | -1) => {
    dir = d;
    p = goal = d === 1 ? 0 : 1;
    v = 0;
    bend = 0;
  };

  const drawPage = (t: WebGLTexture, side: number, hasLeaf: boolean) => {
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.uniform1f(pageProg.u('uSide'), side);
    gl.uniform1f(pageProg.u('uHasLeaf'), hasLeaf ? 1 : 0);
    gl.drawElements(gl.TRIANGLES, quad.count, gl.UNSIGNED_SHORT, 0);
  };

  const leafShape = () => {
    const th = p * Math.PI;
    const s = Math.sin(th);
    const b = CURL * s * bend;
    const a = Math.min(Math.PI, Math.max(0, th - b / 2));
    const twist = -TWIST * s * (0.5 - grabRow) * 2 * (dir || 1);
    return { a, b, twist };
  };

  const draw = () => {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    const turning = dir !== 0;
    const { a, b, twist } = leafShape();
    const left = turning && dir === -1 ? L(k - 1) : L(k);
    const right = turning && dir === 1 ? R(k + 1) : R(k);

    gl.useProgram(pageProg.p);
    gl.uniformMatrix4fv(pageProg.u('uMVP'), false, mvp);
    gl.uniform2f(pageProg.u('uSize'), 1, H);
    gl.uniform3fv(pageProg.u('uLight'), LIGHT);
    gl.uniform3fv(pageProg.u('uLamp'), LAMP);
    gl.uniform1f(pageProg.u('uA'), a);
    gl.uniform1f(pageProg.u('uB'), b);
    gl.uniform1f(pageProg.u('uTwist'), twist);
    gl.uniform1i(pageProg.u('uTex'), 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindVertexArray(quad.vao);
    drawPage(left, -1, turning);
    drawPage(right, 1, turning);

    if (!turning) return;
    gl.useProgram(leafProg.p);
    gl.uniformMatrix4fv(leafProg.u('uMVP'), false, mvp);
    gl.uniform2f(leafProg.u('uSize'), 1, H);
    gl.uniform3fv(leafProg.u('uLight'), LIGHT);
    gl.uniform3fv(leafProg.u('uLamp'), LAMP);
    gl.uniform3fv(leafProg.u('uEye'), eye);
    gl.uniform1f(leafProg.u('uA'), a);
    gl.uniform1f(leafProg.u('uB'), b);
    gl.uniform1f(leafProg.u('uTwist'), twist);
    gl.uniform1i(leafProg.u('uFront'), 0);
    gl.uniform1i(leafProg.u('uBack'), 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, dir === 1 ? R(k) : R(k - 1));
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, dir === 1 ? L(k + 1) : L(k));
    gl.bindVertexArray(leafMesh.vao);
    gl.drawElements(gl.TRIANGLES, leafMesh.count, gl.UNSIGNED_SHORT, 0);
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
    // Held: a stiff spring to the pointer (the leaf has a little weight). Let go: the page spring.
    const sp = dragging ? { stiffness: 700, damping: 2 * Math.sqrt(700 * 1.2), mass: 1.2 } : SPRING.page;
    v += ((-sp.stiffness * (p - goal) - sp.damping * v) / sp.mass) * dt;
    p += v * dt;
    if (p < 0 || p > 1) {
      p = Math.min(1, Math.max(0, p));
      v = 0;
    }
    // The free edge leads while it is pulled, and trails as the leaf falls.
    const lead = dragging ? (dir || 1) : Math.sign(v) || dir || 1;
    bend += (lead - bend) * Math.min(1, dt * 8);
    const done = !dragging && Math.abs(p - goal) < 0.001 && Math.abs(v) < 0.01;
    if (done) {
      if (dir === 1 && goal === 1) k++;
      if (dir === -1 && goal === 0) k--;
      dir = 0;
      if (frames) opts.onStats?.({ fps: Math.round((frames / total) * 1000), worstMs: Math.round(worst), frames });
      opts.onSpread?.(k, count);
      last = frames = total = worst = 0;
    }
    draw();
    if (!done) raf = requestAnimationFrame(frame);
  };
  const kick = () => {
    if (!raf) raf = requestAnimationFrame(frame);
  };

  const onDown = (e: PointerEvent) => {
    if (dir !== 0 || e.button !== 0) return;
    const [x, y] = hit(e);
    if (Math.abs(y) > H / 2 || Math.abs(x) > 1) return;
    if (x > 0 && forward()) startTurn(1);
    else if (x < 0 && backward()) startTurn(-1);
    else return;
    dragging = true;
    pointer = e.pointerId;
    grabRow = Math.min(1, Math.max(0, y / H + 0.5));
    downAt = performance.now();
    downP = p;
    canvas.setPointerCapture(e.pointerId);
    kick();
  };
  const onMove = (e: PointerEvent) => {
    if (!dragging || e.pointerId !== pointer) return;
    goal = Math.acos(Math.min(1, Math.max(-1, hit(e)[0]))) / Math.PI;
    kick();
  };
  const onUp = (e: PointerEvent) => {
    if (!dragging || e.pointerId !== pointer) return;
    dragging = false;
    const tap = e.type === 'pointerup' && performance.now() - downAt < 250 && Math.abs(goal - downP) < 0.05;
    if (e.type === 'pointercancel') goal = dir === 1 ? 0 : 1; // the browser took the gesture: put the leaf back
    else if (tap) goal = dir === 1 ? 1 : 0;
    else if (Math.abs(v) > 1.2) goal = v > 0 ? 1 : 0;
    else goal = p > 0.5 ? 1 : 0;
    kick();
  };
  const turn = (d: 1 | -1) => {
    if (dir !== 0 || (d === 1 ? !forward() : !backward())) return;
    startTurn(d);
    goal = d === 1 ? 1 : 0;
    kick();
  };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    camera();
    draw();
  };
  const lost = (e: Event) => {
    e.preventDefault();
    cancelAnimationFrame(raf);
    opts.onLost?.();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);
  canvas.addEventListener('webglcontextlost', lost);
  resize();
  // Draw the leaf once now, so the GPU's first use of its program and textures isn't the first turn's frame.
  if (forward()) {
    dir = 1;
    draw();
    dir = 0;
    draw();
  }
  opts.onSpread?.(k, count);

  return {
    next: () => turn(1),
    prev: () => turn(-1),
    destroy() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      canvas.removeEventListener('webglcontextlost', lost);
      for (const t of tex) gl.deleteTexture(t);
      gl.deleteProgram(leafProg.p);
      gl.deleteProgram(pageProg.p);
    },
  };
}
