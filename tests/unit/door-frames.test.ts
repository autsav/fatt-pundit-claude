import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { frontToCut, frontAspectError, FRONT_ASPECT } from '../../scripts/door-front.mjs';

const ROOT = join(process.cwd(), 'public/doors/v1');
const manifest = () => JSON.parse(readFileSync(join(ROOT, 'manifest.json'), 'utf8'));
const MB = 1024 * 1024;

describe('door frames', () => {
  it('manifest lists both cuts with count frames', () => {
    const m = manifest();
    for (const cut of ['land', 'port']) {
      const c = m.cuts[cut];
      expect(c.count).toBe(96);
      expect(c.front).toHaveLength(4);
      // The shopfront box may overflow the frame, so allow a margin either side.
      for (const n of c.front) {
        expect(n).toBeGreaterThanOrEqual(-0.5);
        expect(n).toBeLessThanOrEqual(1.6);
      }
      for (let i = 0; i < c.count; i++) {
        const n = String(i).padStart(3, '0');
        for (const ext of ['avif', 'webp']) expect(existsSync(join(ROOT, cut, `${n}.${ext}`))).toBe(true);
      }
    }
  });

  it('AVIF weight within budget', () => {
    const sum = (cut: string) =>
      readdirSync(join(ROOT, cut))
        .filter((f) => f.endsWith('.avif'))
        .reduce((t, f) => t + statSync(join(ROOT, cut, f)).size, 0);
    expect(sum('land')).toBeLessThanOrEqual(3 * MB);
    expect(sum('port')).toBeLessThanOrEqual(1.5 * MB);
  });

  it('frontToCut maps a source-relative front through cover scale + centre crop', () => {
    expect(frontToCut([0, 0, 1, 1], [1600, 900], [1600, 900])).toEqual([0, 0, 1, 1]);
    const H = (496 * 1600) / 864; // 918.5 px tall after cover-scaling to 1600 wide
    const [l, t, w, h] = frontToCut([0, -0.13433, 1, 1.34071], [864, 496], [1600, 900]);
    expect(l).toBeCloseTo(0, 4);
    expect(t).toBeCloseTo((-0.13433 * H - (H - 900) / 2) / 900, 4);
    expect(w).toBeCloseTo(1, 4);
    expect(h).toBeCloseTo((1.34071 * H) / 900, 4);
  });

  it('frontAspectError flags a front box off the coded 4096/3089 aspect', () => {
    // A box with exactly the front's aspect on the land cut: no error.
    const fh = 0.8;
    const fw = (fh * 900 * FRONT_ASPECT) / 1600;
    expect(frontAspectError([0.1, 0.1, fw, fh], [1600, 900])).toBeLessThan(1e-9);
    // Plate fractions applied to an 864x496 source: ~2 % off, past the 0.5 % limit.
    const front = frontToCut([0, -0.13433, 1, 1.34071], [864, 496], [1600, 900]);
    const err = frontAspectError(front, [1600, 900]);
    expect(err).toBeGreaterThan(0.005);
    expect(err).toBeCloseTo(0.02, 2);
  });
});
