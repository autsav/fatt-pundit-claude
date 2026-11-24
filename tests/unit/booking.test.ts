import { describe, it, expect } from 'vitest';
import branches from '../../src/data/branches.json';
import { slots, nearestSlot, hhmm, toMin } from '../../src/lib/booking';

const room = (id: string) => branches.find((b) => b.id === id)!;
const TUE = '2030-01-01'; // a Tuesday well in the future, so "today's" 30-minute cut-off never applies
const times = (id: string, ymd = TUE, grid?: 'opening' | 'clock') => slots(room(id).hours as never, room(id).timezone, ymd, grid).map(hhmm);

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

// AUDIT B-02 table: both rooms × opening edge × 19:00 × last slot, on a future Tuesday.
describe.each([
  { id: 'soho', first: '12:00', at19: '19:00', last: '21:30' },
  { id: 'covent-garden', first: '16:45', at19: '19:15', last: '21:45' },
])('$id grid', ({ id, first, at19, last }) => {
  const list = slots(room(id).hours as never, room(id).timezone, TUE);
  it(`first bookable time is ${first} (the opening edge)`, () => expect(hhmm(list[0])).toBe(first));
  it(`nearest to 19:00 is ${at19}`, () => expect(hhmm(nearestSlot(list, toMin('19:00'))!)).toBe(at19));
  it(`last seating is ${last} (45 min before 22:30)`, () => expect(hhmm(list.at(-1)!)).toBe(last));
});

// The open client question (CG grid :15/:45 or :00/:30) is one data line: booking.slotGrid = 'clock'.
describe("slotGrid 'clock'", () => {
  it('aligns a 16:45 opening to the half hours', () => {
    const t = times('covent-garden', TUE, 'clock');
    expect(t[0]).toBe('17:00');
    expect(t).toContain('19:00');
    expect(t).not.toContain('19:15');
    expect(t.at(-1)).toBe('21:30');
  });
  it('leaves a room that opens on the hour unchanged', () => {
    expect(times('soho', TUE, 'clock')).toEqual(times('soho'));
  });
});
