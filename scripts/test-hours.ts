// Run: node scripts/test-hours.ts  (Node 22.18+ strips TypeScript types)
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { openStatus, statusLine, prettyTime } from '../src/lib/hours.ts';

const branches = JSON.parse(readFileSync(new URL('../src/data/branches.json', import.meta.url), 'utf8'));
const soho = branches.find((b: { id: string }) => b.id === 'soho');
const cg = branches.find((b: { id: string }) => b.id === 'covent-garden');
const at = (iso: string) => new Date(iso);

// prettyTime
assert.equal(prettyTime('17:00'), '5pm');
assert.equal(prettyTime('22:30'), '10.30pm');
assert.equal(prettyTime('12:00'), '12pm');

// Winter (GMT): Wed 18 Nov 2026 13:00 London = 13:00 UTC → Soho open until 2.30pm
assert.deepEqual(openStatus(soho.hours, 'Europe/London', at('2026-11-18T13:00:00Z')), { open: true, until: '2.30pm' });
// Between lunch and dinner → opens today 5pm
assert.equal(statusLine('Soho', openStatus(soho.hours, 'Europe/London', at('2026-11-18T15:00:00Z'))), 'Soho · Opens 5pm');
// Saturday late → Soho closed Sunday → opens Monday 12pm
assert.equal(statusLine('Soho', openStatus(soho.hours, 'Europe/London', at('2026-11-21T23:00:00Z'))), 'Soho · Opens Mon 12pm');
// Covent Garden Sunday 20:30 → open until 9pm
assert.deepEqual(openStatus(cg.hours, 'Europe/London', at('2026-11-22T20:30:00Z')), { open: true, until: '9pm' });
// Covent Garden Sunday 22:00 → Monday closed → opens Tuesday 5pm
assert.equal(statusLine('Covent Garden', openStatus(cg.hours, 'Europe/London', at('2026-11-22T22:00:00Z'))), 'Covent Garden · Opens Tue 5pm');

// Summer (BST = UTC+1): Wed 15 Jul 2026 16:45 UTC = 17:45 London → open until 10.30pm
assert.deepEqual(openStatus(soho.hours, 'Europe/London', at('2026-07-15T16:45:00Z')), { open: true, until: '10.30pm' });
// 16:45 UTC in winter = 16:45 London → closed, opens 5pm (proves the clock change is handled)
assert.equal(statusLine('Soho', openStatus(soho.hours, 'Europe/London', at('2026-11-18T16:45:00Z'))), 'Soho · Opens 5pm');
// Tue 22:45 (after close) → opens tomorrow (Wed) noon
assert.equal(statusLine('Soho', openStatus(soho.hours, 'Europe/London', at('2026-11-17T22:45:00Z'))), 'Soho · Opens tomorrow 12pm');

console.log('hours: all tests passed');
