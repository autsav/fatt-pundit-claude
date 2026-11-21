/**
 * Tonight's board: a few lines per branch that staff change themselves.
 *
 * Source, in order:
 *  1. A Google Sheet published as CSV (File → Share → Publish to web → CSV),
 *     URL in SPECIALS_CSV_URL at build time. The page also re-reads it in the
 *     browser (PUBLIC_SPECIALS_CSV_URL) so a change shows without a rebuild.
 *  2. src/data/specials.json.
 * Columns: branch, line, from, to. `branch` = a branch id or "all".
 */
import fallback from '@/data/specials.json';

export interface Special { branch: string; line: string; from?: string; to?: string; demo?: boolean }

/** Small CSV reader: quoted fields, commas inside quotes, CRLF. */
export function parseCsv(text: string): Special[] {
  const rows: string[][] = [];
  let row: string[] = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
    else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const [head, ...body] = rows;
  if (!head) return [];
  const idx = (k: string) => head.findIndex((h) => h.trim().toLowerCase() === k);
  const [b, l, f, t] = ['branch', 'line', 'from', 'to'].map(idx);
  return body
    .map((r) => ({ branch: (r[b] ?? '').trim().toLowerCase(), line: (r[l] ?? '').trim(), from: f >= 0 ? r[f]?.trim() || undefined : undefined, to: t >= 0 ? r[t]?.trim() || undefined : undefined }))
    .filter((r) => r.branch && r.line);
}

/** Today's date (YYYY-MM-DD) in a branch's own time zone. */
export const todayIn = (tz: string, d = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(d);

/** Lines for one branch on one day: dated rows that cover today, plus undated ones; at most 3. */
export function pick(rows: Special[], branch: string, today: string) {
  return rows
    .filter((r) => (r.branch === branch || r.branch === 'all') && (!r.from || r.from <= today) && (!r.to || r.to >= today))
    .slice(0, 3);
}

export async function loadSpecials(): Promise<Special[]> {
  const url = import.meta.env.SPECIALS_CSV_URL as string | undefined;
  if (url) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (res.ok) return parseCsv(await res.text());
      console.warn(`[specials] ${res.status} from the sheet; using specials.json`);
    } catch (e) {
      console.warn(`[specials] sheet unreachable (${(e as Error).message}); using specials.json`);
    }
  }
  // D5: sample lines never reach a launched site; with no sheet the board simply doesn't show.
  const rows = fallback.rows as Special[];
  return import.meta.env.PUBLIC_LAUNCH === 'true' ? rows.filter((r) => !r.demo) : rows;
}
