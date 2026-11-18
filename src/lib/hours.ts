// Open/closed status for a branch, computed in the branch's own timezone.
// Pure function: pass `now` in tests.

export type Day = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
export type Hours = Record<Day, [string, string][]>;
export type OpenStatus =
  | { open: true; until: string }
  | { open: false; opens: string | null; opensDay: 'today' | 'tomorrow' | Day | null };

const DAYS: Day[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/** "17:00" -> "5pm", "22:30" -> "10.30pm" (British style). */
export function prettyTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h < 12 ? 'am' : 'pm';
  const h12 = h % 12 || 12;
  return `${h12}${m ? '.' + String(m).padStart(2, '0') : ''}${suffix}`;
}

/** Day and minutes-since-midnight for `now` in `timeZone`. */
function localParts(now: Date, timeZone: string): { day: Day; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  const day = get('weekday').slice(0, 3).toLowerCase() as Day;
  return { day, minutes: Number(get('hour')) * 60 + Number(get('minute')) };
}

export function openStatus(hours: Hours, timeZone: string, now: Date = new Date()): OpenStatus {
  const { day, minutes } = localParts(now, timeZone);
  for (const [from, to] of hours[day]) {
    if (minutes >= toMin(from) && minutes < toMin(to)) return { open: true, until: prettyTime(to) };
  }
  const laterToday = hours[day].find(([from]) => toMin(from) > minutes);
  if (laterToday) return { open: false, opens: prettyTime(laterToday[0]), opensDay: 'today' };
  const idx = DAYS.indexOf(day);
  for (let i = 1; i <= 7; i++) {
    const d = DAYS[(idx + i) % 7];
    if (hours[d].length) return { open: false, opens: prettyTime(hours[d][0][0]), opensDay: i === 1 ? 'tomorrow' : d };
  }
  return { open: false, opens: null, opensDay: null };
}

/** One short line for the hero pill. */
export function statusLine(name: string, s: OpenStatus): string {
  if (s.open) return `${name} · Open now · until ${s.until}`;
  if (!s.opens) return `${name} · Closed`;
  const when = s.opensDay === 'today' ? '' : s.opensDay === 'tomorrow' ? ' tomorrow' : ` ${s.opensDay![0].toUpperCase()}${s.opensDay!.slice(1)}`;
  return `${name} · Opens${when} ${s.opens}`;
}
