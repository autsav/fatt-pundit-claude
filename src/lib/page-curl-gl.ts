/** Shaders and small WebGL2 / vector helpers for src/lib/page-curl.ts (split out to keep that file readable). */
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
export const LEAF_VS = `${HEAD}${LEAF}
uniform mat4 uMVP; in vec2 aUV; out vec2 vUV; out vec3 vN; out vec3 vP;
void main() {
  vec3 p = leaf(aUV);
  vN = normalize(cross(leaf(aUV + vec2(0.01, 0.)) - p, leaf(aUV + vec2(0., 0.01)) - p));
  p.z += 0.004;
  vP = p; vUV = aUV;
  gl_Position = uMVP * vec4(p, 1.);
}`;
export const LEAF_FS = `${HEAD}
uniform sampler2D uFront, uBack; uniform vec3 uLight, uEye, uLamp;
in vec2 vUV; in vec3 vN; in vec3 vP; out vec4 o;
void main() {
  float f = gl_FrontFacing ? 1. : 0.;
  vec3 n = normalize(vN) * (f * 2. - 1.);
  vec3 c = mix(texture(uBack, vec2(1. - vUV.x, 1. - vUV.y)).rgb, texture(uFront, vec2(vUV.x, 1. - vUV.y)).rgb, f);
  vec3 L = normalize(uLight);
  float dif = max(dot(n, L), 0.);
  float sheen = pow(max(dot(n, normalize(L + normalize(uEye - vP))), 0.), 30.) * 0.1;
  float gutter = mix(0.8, 1., smoothstep(0., 0.14, vUV.x));
  o = vec4(c * (0.5 + 0.55 * dif) * gutter * uLamp + sheen, 1.);
}`;
// The leaf's free edge: a ribbon along it, as wide as the paper (or board) is thick.
export const EDGE_VS = `${HEAD}${LEAF}
uniform mat4 uMVP; uniform float uThick; in vec2 aUV;
void main() {
  vec2 uv = vec2(1., aUV.y);
  vec3 p = leaf(uv);
  vec3 n = normalize(cross(p - leaf(uv - vec2(0.01, 0.)), leaf(uv + vec2(0., 0.01)) - p));
  p += n * (aUV.x - 0.5) * uThick;
  p.z += 0.004;
  gl_Position = uMVP * vec4(p, 1.);
}`;
export const EDGE_FS = `${HEAD}
uniform vec3 uCol, uLamp; out vec4 o;
void main() { o = vec4(uCol * uLamp * 0.8, 1.); }`;
// Any flat rectangle: origin uO, edges uX and uY.
export const QUAD_VS = `${HEAD}
uniform mat4 uMVP; uniform vec3 uO, uX, uY; in vec2 aUV; out vec2 vUV; out vec3 vP;
void main() {
  vP = uO + uX * aUV.x + uY * aUV.y;
  vUV = aUV;
  gl_Position = uMVP * vec4(vP, 1.);
}`;
export const PAGE_FS = `${HEAD}${LEAF}
uniform sampler2D uTex; uniform float uSide, uHasLeaf; uniform vec3 uLight, uLamp;
in vec2 vUV; in vec3 vP; out vec4 o;
void main() {
  vec3 c = texture(uTex, vec2(vUV.x, 1. - vUV.y)).rgb;
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
export const SHADOW_FS = `${HEAD}
uniform vec4 uBox; in vec2 vUV; in vec3 vP; out vec4 o;
void main() {
  vec2 q = abs(vP.xy - uBox.xy) - uBox.zw;
  float d = length(max(q, 0.)) + min(max(q.x, q.y), 0.);
  o = vec4(0., 0., 0., 0.55 * (1. - smoothstep(-0.05, 0.2, d)));
}`;
// The edge of a stack of leaves, seen from the front: paper lines between two boards.
export const STACK_FS = `${HEAD}
uniform float uN, uTop, uBot; uniform vec3 uLamp; in vec2 vUV; in vec3 vP; out vec4 o;
void main() {
  float t = vUV.y;
  vec3 c = vec3(0.93, 0.88, 0.78) * (0.8 + 0.2 * sin(t * uN * 6.2832));
  c = mix(c, vec3(0.2, 0.13, 0.09), step(1. - uTop, t) + step(t, uBot) > 0. ? 1. : 0.);
  c *= 0.5 + 0.4 * smoothstep(0., 0.7, t);
  o = vec4(c * uLamp, 1.);
}`;

export type Vec3 = [number, number, number];
export const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const norm = (a: Vec3): Vec3 => {
  const l = Math.hypot(...a);
  return [a[0] / l, a[1] / l, a[2] / l];
};
export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));

export function program(gl: WebGL2RenderingContext, vs: string, fs: string) {
  const p = gl.createProgram();
  const shaders: WebGLShader[] = [];
  for (const [type, src] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]] as const) {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader');
    gl.attachShader(p, s);
    shaders.push(s);
  }
  gl.bindAttribLocation(p, 0, 'aUV');
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? 'link');
  const cache = new Map<string, WebGLUniformLocation | null>();
  const u = (n: string) => {
    if (!cache.has(n)) cache.set(n, gl.getUniformLocation(p, n));
    return cache.get(n)!;
  };
  return { p, u, shaders };
}

/** A (cols+1) × (rows+1) grid over [0,1]², counter-clockwise from +z. */
export function grid(gl: WebGL2RenderingContext, cols: number, rows: number) {
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
  const buffers = [gl.createBuffer(), gl.createBuffer()];
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers[0]);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers[1]);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW);
  gl.bindVertexArray(null);
  return { vao, buffers, count: idx.length };
}
