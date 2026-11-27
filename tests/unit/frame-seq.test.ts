import { describe, it, expect } from 'vitest';
import { frameIndex, loadOrder, nearestLoaded, handoffTransform } from '../../src/lib/frame-seq';

describe('frameIndex()', () => {
  it('maps scroll progress onto frame indices, clamped to the range', () => {
    expect(frameIndex(0.24, 0.24, 0.82, 96)).toBe(0);
    expect(frameIndex(0.82, 0.24, 0.82, 96)).toBe(95);
    expect(frameIndex(0.53, 0.24, 0.82, 96)).toBe(48);
    expect(frameIndex(0.1, 0.24, 0.82, 96)).toBe(0);
    expect(frameIndex(0.99, 0.24, 0.82, 96)).toBe(95);
  });
});

describe('loadOrder()', () => {
  it('loads ends, then coarse-to-fine multiples, then the rest ascending', () => {
    expect(loadOrder(17)).toEqual([0, 16, 8, 4, 12, 1, 2, 3, 5, 6, 7, 9, 10, 11, 13, 14, 15]);
  });
  it('visits every index exactly once', () => {
    const o = loadOrder(96);
    expect(o).toHaveLength(96);
    expect(new Set(o).size).toBe(96);
  });
});

describe('nearestLoaded()', () => {
  it('finds the nearest truthy index', () => {
    expect(nearestLoaded(5, [1, 0, 0, 0, 0, 0, 0, 1])).toBe(7);
  });
  it('breaks ties toward the lower index', () => {
    expect(nearestLoaded(4, [0, 0, 1, 0, 0, 0, 1])).toBe(2);
  });
  it('returns -1 when nothing is loaded', () => {
    expect(nearestLoaded(3, [0, 0, 0])).toBe(-1);
  });
});

describe('handoffTransform()', () => {
  const front = { l: 0, t: 0, w: 1, h: 1 };
  const cam = { l: -100, t: 20, w: 1200, h: 900 };
  const stage = { w: 1000, h: 800 };
  const frame = { w: 1600, h: 1200 };

  it('at k=0 lands the front fraction on the camera rect', () => {
    const r = handoffTransform(front, cam, stage, frame, 0);
    expect(r.x).toBeCloseTo(-100, 2);
    expect(r.y).toBeCloseTo(20, 2);
    expect(r.s).toBeCloseTo(0.75, 2);
  });

  it('at k=1 cover-fits the frame to the stage, centred', () => {
    const r = handoffTransform(front, cam, stage, frame, 1);
    expect(r.x).toBeCloseTo(-33.33, 2);
    expect(r.y).toBeCloseTo(0, 2);
    expect(r.s).toBeCloseTo(0.6667, 2);
  });

  it('interpolates linearly, and clamps k to 0..1', () => {
    const a = handoffTransform(front, cam, stage, frame, 0);
    const b = handoffTransform(front, cam, stage, frame, 1);
    const mid = handoffTransform(front, cam, stage, frame, 0.5);
    expect(mid.x).toBeCloseTo((a.x + b.x) / 2, 6);
    expect(mid.y).toBeCloseTo((a.y + b.y) / 2, 6);
    expect(mid.s).toBeCloseTo((a.s + b.s) / 2, 6);
    expect(handoffTransform(front, cam, stage, frame, -1)).toEqual(a);
    expect(handoffTransform(front, cam, stage, frame, 2)).toEqual(b);
  });

  it('at k=0 puts a front that overflows the frame (negative top) on the camera rect', () => {
    const f = { l: 0, t: -0.13433, w: 1, h: 1.34071 };
    const r = handoffTransform(f, cam, stage, frame, 0);
    expect(r.x + f.l * frame.w * r.s).toBeCloseTo(cam.l, 3);
    expect(r.y + f.t * frame.h * r.s).toBeCloseTo(cam.t, 3);
  });
});
