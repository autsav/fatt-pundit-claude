/**
 * Reads the surface blocks in tokens.css and measures every colour pair the components use
 * (WCAG 2.2 relative luminance). Used by scripts/check-contrast.ts (build gate) and /styleguide/.
 * Plain TypeScript with no imports, so Node runs it directly.
 */
export interface Pair { fg: string; bg: string; min: number; use: string }
export interface Result extends Pair { surface: string; fgHex: string; bgHex: string; ratio: number; ok: boolean }

/** The pairs that matter, as semantic token names. 4.5 = text, 3 = UI edges and focus rings. */
export const PAIRS: Pair[] = [
  { fg: 'fg', bg: 'bg', min: 4.5, use: 'Body text' },
  { fg: 'fg-muted', bg: 'bg', min: 4.5, use: 'Secondary text, hints' },
  { fg: 'label', bg: 'bg', min: 4.5, use: 'Section numbers, today' },
  { fg: 'accent', bg: 'bg', min: 4.5, use: 'Accent word' },
  { fg: 'link', bg: 'bg', min: 4.5, use: 'Links' },
  { fg: 'link-hover', bg: 'bg', min: 4.5, use: 'Links, hover' },
  { fg: 'fg', bg: 'hover-tint', min: 4.5, use: 'Row text on hover' },
  { fg: 'fg-muted', bg: 'hover-tint', min: 4.5, use: 'Row note on hover' },
  { fg: 'label', bg: 'hover-tint', min: 4.5, use: 'Row number on hover' },
  { fg: 'control', bg: 'bg', min: 3, use: 'Field and chip edges' },
  { fg: 'control', bg: 'field-bg', min: 3, use: 'Field edge, inside' },
  { fg: 'field-fg', bg: 'field-bg', min: 4.5, use: 'Typed text' },
  { fg: 'fg-muted', bg: 'field-bg', min: 4.5, use: 'Placeholder' },
  { fg: 'selected-fg', bg: 'selected-bg', min: 4.5, use: 'Selected chip' },
  { fg: 'selected-bg', bg: 'bg', min: 3, use: 'Selected chip on surface' },
  { fg: 'invert-fg', bg: 'invert-bg', min: 4.5, use: 'Outline button, hover' },
  { fg: 'action-fg', bg: 'action-bg', min: 4.5, use: 'Primary button' },
  { fg: 'ring', bg: 'bg', min: 3, use: 'Focus ring' },
  { fg: 'error', bg: 'bg', min: 4.5, use: 'Error text' },
  { fg: 'error', bg: 'field-bg', min: 4.5, use: 'Error in a status box' },
  { fg: 'success', bg: 'bg', min: 4.5, use: 'Success text' },
  { fg: 'success', bg: 'field-bg', min: 4.5, use: 'Success in a status box' },
  { fg: 'warning', bg: 'bg', min: 4.5, use: 'Warning text' },
  { fg: 'warning', bg: 'field-bg', min: 4.5, use: 'Warning in a status box' },
  { fg: 'info', bg: 'field-bg', min: 4.5, use: 'Info in a status box' },
];

const hexRe = /^#([0-9a-f]{6})$/i;

function luminance(hex: string): number {
  const v = hexRe.exec(hex)![1];
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function ratio(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return Math.round(((x + 0.05) / (y + 0.05)) * 100) / 100;
}

/** --color-* values from the @theme block of global.css. */
export function readPalette(globalCss: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of globalCss.matchAll(/--color-([a-z-]+):\s*(#[0-9a-f]{6})/gi)) out[m[1]] = m[2].toLowerCase();
  return out;
}

/** Every block in tokens.css that defines --fp-bg, keyed by its first selector, with values resolved to hex. */
export function readSurfaces(tokensCss: string, palette: Record<string, string>): Record<string, Record<string, string>> {
  const out: Record<string, Record<string, string>> = {};
  for (const m of tokensCss.matchAll(/([^{}]+)\{([^{}]*--fp-bg:[^{}]*)\}/g)) {
    const name = m[1].replace(/\/\*[\s\S]*?\*\//g, '').trim().split(',')[0].trim().replace(/^\./, '');
    const raw: Record<string, string> = {};
    for (const d of m[2].matchAll(/--fp-([a-z-]+):\s*([^;]+);/g)) raw[d[1]] = d[2].trim();
    const resolve = (v: string, depth = 0): string => {
      if (hexRe.test(v)) return v.toLowerCase();
      const c = /^var\(--color-([a-z-]+)\)$/.exec(v);
      if (c && palette[c[1]]) return palette[c[1]];
      const f = /^var\(--fp-([a-z-]+)\)$/.exec(v);
      if (f && raw[f[1]] && depth < 5) return resolve(raw[f[1]], depth + 1);
      return v; // not a plain colour (shadows, rgba): not measured
    };
    out[name] = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, resolve(v)]));
  }
  return out;
}

export function measure(surfaces: Record<string, Record<string, string>>): Result[] {
  const results: Result[] = [];
  for (const [surface, t] of Object.entries(surfaces)) {
    for (const p of PAIRS) {
      const fgHex = t[p.fg];
      const bgHex = t[p.bg];
      if (!fgHex || !bgHex || !hexRe.test(fgHex) || !hexRe.test(bgHex)) {
        results.push({ ...p, surface, fgHex: fgHex ?? '?', bgHex: bgHex ?? '?', ratio: 0, ok: false });
        continue;
      }
      const r = ratio(fgHex, bgHex);
      results.push({ ...p, surface, fgHex, bgHex, ratio: r, ok: r >= p.min });
    }
  }
  return results;
}
