/**
 * Branch clocks: the time and light where each restaurant is, not where the
 * guest is. Sunrise/sunset from the standard NOAA approximation (good to a
 * minute or two), so London's 4pm winter dusk and Dubai's 6pm both come out right.
 */
const rad = Math.PI / 180;

/** Sunrise and sunset (UTC ms) for a date at a place; null in polar day/night. */
export function sunTimes(lat: number, lng: number, date = new Date()) {
  const day = Math.floor((Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - Date.UTC(date.getUTCFullYear(), 0, 0)) / 864e5);
  const g = ((2 * Math.PI) / 365) * (day - 1);
  const eqt = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
  const decl = 0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g) - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
  const cosH = (Math.cos(90.833 * rad) - Math.sin(lat * rad) * Math.sin(decl)) / (Math.cos(lat * rad) * Math.cos(decl));
  if (cosH < -1 || cosH > 1) return null;
  const h = Math.acos(cosH) / rad;
  const midnight = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const rise = 720 - 4 * (lng + h) - eqt;
  const set = 720 - 4 * (lng - h) - eqt;
  return { rise: midnight + rise * 6e4, set: midnight + set * 6e4 };
}

export type Daypart = 'day' | 'dusk' | 'night';

/** Day until 40 minutes before sunset, dusk until 40 minutes after, then night until sunrise. */
export function daypart(lat: number, lng: number, now = new Date()): Daypart {
  const s = sunTimes(lat, lng, now);
  if (!s) return 'day';
  const t = now.getTime();
  if (t < s.rise || t > s.set + 40 * 6e4) return 'night';
  if (t > s.set - 40 * 6e4) return 'dusk';
  return 'day';
}

/** "10.41pm" in a time zone. */
export const clockIn = (tz: string, now = new Date()) =>
  new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: 'numeric', minute: '2-digit', hour12: true }).format(now).replace(':', '.').replace(/\s/g, '').toLowerCase();

export const SUN = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><circle cx="12" cy="12" r="4.5" fill="currentColor"/><g stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/></g></svg>';
export const MOON = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" fill="currentColor"/></svg>';
export const DUSK = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M5 17a7 7 0 0 1 14 0Z" fill="currentColor"/><path d="M2 20h20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
export const ICON = { day: SUN, dusk: DUSK, night: MOON } as const;
export const WORD = { day: 'daylight', dusk: 'sunset', night: 'after dark' } as const;
