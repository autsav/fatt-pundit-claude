/**
 * Booking helpers shared by the Book drawer and the booking desk (/book/): a room's bookable times on a
 * day (in its own time zone) and the provider deep link with the guest's choices filled in.
 *
 * Deep-link formats (check with each provider at launch, CLIENT-INPUTS #7):
 *   OpenTable  /restref/client/?rid=&restref=&datetime=YYYY-MM-DDTHH:MM&covers=N
 *   SevenRooms /explore/<venue>/reservations/create/search/?date=&party_size=&start_time=HH:MM
 */
export type Span = [string, string];
export const KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
export const PROVIDER: Record<string, string> = { opentable: 'OpenTable', sevenrooms: 'SevenRooms', resdiary: 'ResDiary' };

/** "Now" in a time zone, as Y-M-D and minutes past midnight. */
export const local = (tz: string, d = new Date()) => {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(d).map((x) => [x.type, x.value]));
  return { ymd: `${p.year}-${p.month}-${p.day}`, mins: +p.hour * 60 + +p.minute };
};
export const addDays = (ymd: string, n: number) => { const d = new Date(`${ymd}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
export const wd = (ymd: string) => new Date(`${ymd}T12:00:00Z`).getUTCDay();
export const toMin = (s: string) => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
export const hhmm = (m: number) => `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
export const prettyMin = (m: number) => { const h = Math.floor(m / 60) % 24; return `${h % 12 || 12}${m % 60 ? '.' + String(m % 60).padStart(2, '0') : ''}${h < 12 ? 'am' : 'pm'}`; };

/** How a room's half-hour times line up: from its opening minute (16:45 → :15/:45), or on the clock (:00/:30). */
export type SlotGrid = 'opening' | 'clock';

/**
 * Bookable times (minutes past midnight): every half hour, the last 45 minutes before closing; today only
 * from 30 minutes on. `grid` comes from branches.json `booking.slotGrid` (default 'opening'), so the client's
 * answer on Covent Garden's times is one data line (AUDIT B-02).
 */
export const slots = (hours: Record<string, Span[]>, tz: string, ymd: string, grid: SlotGrid = 'opening') => {
  const spans = hours[KEYS[wd(ymd)]] ?? [];
  const now = local(tz);
  const out: number[] = [];
  for (const [a, z] of spans) {
    let end = toMin(z); if (end <= toMin(a)) end += 24 * 60;
    const start = grid === 'clock' ? Math.ceil(toMin(a) / 30) * 30 : toMin(a);
    for (let m = start; m <= end - 45; m += 30) if (ymd !== now.ymd || m > now.mins + 30) out.push(m);
  }
  return out;
};

/**
 * The room's bookable time closest to `want` (minutes), the later one on a tie, or undefined when none is
 * within `window` minutes. Rooms open at different minutes (Covent Garden 16:45 → :15/:45, Soho :00/:30),
 * so a time shared across rooms must be resolved per room (AUDIT B-02).
 */
export const nearestSlot = (list: number[], want: number, window = 45) => {
  let best: number | undefined;
  for (const m of list) {
    const d = Math.abs(m - want);
    if (d > window) continue;
    if (best === undefined || d < Math.abs(best - want) || (d === Math.abs(best - want) && m > best)) best = m;
  }
  return best;
};

/** The provider's booking page with date, time and party size filled in (or its plain page). */
export const providerLink = (b: { url: string; provider: string; widgetId?: string | null }, day: string, time: string, size: number) => {
  if (b.provider === 'opentable' && b.widgetId) {
    const q = new URL('https://www.opentable.co.uk/restref/client/');
    q.search = new URLSearchParams({ rid: b.widgetId, restref: b.widgetId, datetime: `${day}T${time}`, covers: String(size), lang: 'en-GB' }).toString();
    return q.href;
  }
  if (b.provider === 'sevenrooms' && b.widgetId) {
    const q = new URL(`https://www.sevenrooms.com/explore/${b.widgetId}/reservations/create/search/`);
    q.search = new URLSearchParams({ date: day, party_size: String(size), start_time: time }).toString();
    return q.href;
  }
  return new URL(b.url).href;
};
