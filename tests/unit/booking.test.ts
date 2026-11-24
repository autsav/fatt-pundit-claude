import { describe, it, expect } from 'vitest';
import branches from '../../src/data/branches.json';
import { slots, nearestSlot, hhmm, toMin } from '../../src/lib/booking';

const room = (id: string) => branches.find((b) => b.id === id)!;
const TUE = '2030-01-01'; // a Tuesday well in the future, so "today's" 30-minute cut-off never applies
const times = (id: string, ymd = TUE) => slots(room(id).hours as never, room(id).timezone, ymd).map(hhmm);

describe('slots()', () => {
  it('Soho: half-hourly from opening, last seating 45 min before close', () => {
    const t = times('soho');
    expect(t[0]).toBe('12:00');
    expect(t).toContain('13:30');
    expect(t).not.toContain('14:00'); // closes 14:30
    expect(t).toContain('17:00');
    expect(t.at(-1)).toBe('21:30'); // closes 22:30
  });
  it('Covent Garden opens 16:45, so its grid is :15/:45', () => {
    const t = times('covent-garden');
    expect(t[0]).toBe('16:45');
    expect(t).toContain('19:15');
    expect(t).not.toContain('19:00');
  });
  it('closed days have no slots (Soho on Sunday)', () => {
    expect(times('soho', '2030-01-06')).toEqual([]);
  });
});

// AUDIT B-02: the /book/ desk shares one time between rooms on different grids.
describe('nearestSlot()', () => {
  const cg = slots(room('covent-garden').hours as never, 'Europe/London', TUE);
  it('finds the closest bookable time, the later one on a tie', () => {
    expect(hhmm(nearestSlot(cg, toMin('19:00'))!)).toBe('19:15');
    expect(hhmm(nearestSlot(cg, toMin('19:15'))!)).toBe('19:15');
  });
  it('gives up beyond the window (default 45 min)', () => {
    expect(nearestSlot(cg, toMin('12:00'))).toBeUndefined();
    expect(nearestSlot(cg, toMin('16:00'))).toBe(toMin('16:45'));
  });
  it('an empty day has no nearest time', () => {
    expect(nearestSlot([], toMin('19:00'))).toBeUndefined();
  });
});
