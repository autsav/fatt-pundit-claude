/**
 * Build-time helpers shared by the home page and the branch pages.
 * Everything a page prints about a branch, a dish or a menu goes through here,
 * so prices, hours and phone numbers are formatted one way everywhere.
 */
import { getCollection, getEntry } from 'astro:content';
import type { MenuLite } from '@/components/scenes/MenuBook';
import { formatPrice } from './format';

export async function getBranches() {
  return (await getCollection('branches')).sort((a, b) => a.data.order - b.data.order).map((b) => b.data);
}
export type Branch = Awaited<ReturnType<typeof getBranches>>[number];

export async function dish(id: string) {
  const d = (await getEntry('dishes', id))?.data;
  if (!d) throw new Error(`dish ${id} missing from src/data/dishes.json`);
  return d;
}
export type Dish = Awaited<ReturnType<typeof dish>>;

export const priceOf = (d: Dish) =>
  d.price ? formatPrice(d.price, 'GBP') : (d.options?.map((o) => `${o.label} ${formatPrice(o.price, 'GBP')}`).join(', ') ?? null);

const DAYS = [['mon', 'Mon'], ['tue', 'Tue'], ['wed', 'Wed'], ['thu', 'Thu'], ['fri', 'Fri'], ['sat', 'Sat'], ['sun', 'Sun']] as const;
const t = (s: string) => {
  const [h, m] = s.split(':').map(Number);
  const hh = h % 12 || 12;
  return `${hh}${m ? '.' + String(m).padStart(2, '0') : ''}${h < 12 ? 'am' : 'pm'}`;
};

/** Consecutive days with the same hours grouped: "Mon–Fri · 12–2.30pm, 5–10.30pm". */
export function hoursLines(hours: NonNullable<Branch['hours']>) {
  const lines: { days: string; text: string; keys: string[] }[] = [];
  for (const [key, label] of DAYS) {
    const text = hours[key].length ? hours[key].map(([a, b]) => `${t(a).replace(/(am|pm)$/, (x) => (t(b).endsWith(x) ? '' : x))}–${t(b)}`).join(', ') : 'Closed';
    const last = lines.at(-1);
    if (last && last.text === text) {
      last.days = last.days.split('–')[0] + '–' + label;
      last.keys.push(key);
    } else lines.push({ days: label, text, keys: [key] });
  }
  return lines;
}

/** +442072877900 → 020 7287 7900 */
export const prettyPhone = (p: string) => p.replace(/^\+44(\d{2})(\d{4})(\d{4})$/, '0$1 $2 $3');

export const fullAddress = (b: Branch) =>
  [b.address.street, b.address.locality, b.address.city, b.address.postcode].filter(Boolean).join(', ');

/** Opens the guest's own maps app; no API key, no tracking. */
export const directionsUrl = (b: Branch) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Fatt Pundit, ${fullAddress(b)}`)}`;

/** Same, for iPhones that prefer Apple Maps. */
export const appleMapsUrl = (b: Branch) => `https://maps.apple.com/?q=${encodeURIComponent(`Fatt Pundit, ${fullAddress(b)}`)}`;

/** "17:00" → "5pm" for page copy. */
export const timeText = t;

/**
 * Group and deposit rules in words, from branches.json `groups` (ux-structure.md D6).
 * One wording everywhere: drawer, Index, home, Good to know, groups page, booking terms.
 */
export function groupRules(b: Branch) {
  const g = b.groups;
  if (!g) return null;
  const money = formatPrice({ [b.currency]: g.depositPerHead } as Parameters<typeof formatPrice>[0], b.currency);
  return {
    online: `${b.shortName} books online for up to ${g.onlineMax} guests.`,
    call: g.callAbove && g.setMenuFrom - 1 > g.onlineMax ? `For ${g.onlineMax + 1} to ${g.setMenuFrom - 1}, please call the restaurant.` : null,
    setMenu: `Groups of ${g.setMenuFrom} or more dine from the set menu.`,
    deposit: `Tables of ${g.depositFrom} or more pay a ${money} a person deposit, taken off the bill or refunded in full if you cancel at least ${g.refundHours} hours before.`,
    depositShort: `Tables of ${g.depositFrom} or more: ${money} a person deposit, refundable up to ${g.refundHours} hours before.`,
  };
}

/** "Online up to 7 at Soho, 4 at Covent Garden" */
export const onlineSummary = (branches: Branch[]) =>
  'Online up to ' + branches.filter((b) => b.groups).map((b) => `${b.groups!.onlineMax} at ${b.shortName}`).join(', ');

/** "5–5.45pm" */
export const preTheatreText = (b: Branch) => (b.preTheatre ? `${t(b.preTheatre[0]).replace(/(am|pm)$/, (x) => (t(b.preTheatre![1]).endsWith(x) ? '' : x))}–${t(b.preTheatre[1])}` : null);

export const BOOKING_NAMES ={ opentable: 'OpenTable', sevenrooms: 'SevenRooms', resdiary: 'ResDiary', other: 'online' } as const;

/** Bookmark label for each menu in the menu book. */
export const MENU_TABS: Record<string, string> = {
  'a-la-carte': 'À la carte',
  'pre-theatre': 'Pre-theatre',
  'vegetarian-pre-theatre': 'Veg pre-theatre',
  'set-menu': 'Set menu',
  vegan: 'Vegan',
  halal: 'Halal',
  'gluten-free': 'Gluten free',
  'dairy-free': 'Dairy free',
  pescatarian: 'Pescatarian',
  drinks: 'Drinks',
};

/** Menus as the page-flip book prints them, in the order given. Prices only where the menu shows them. */
export async function menuBooks(ids: string[]): Promise<MenuLite[]> {
  return Promise.all(
    ids.map(async (id) => {
      const m = (await getEntry('menus', id))?.data;
      if (!m) throw new Error(`menu ${id} missing from src/data/menus.json`);
      return {
        id,
        tab: MENU_TABS[id] ?? m.title,
        title: m.kind === 'drinks' ? 'Drinks' : m.title,
        allergyNote: m.allergyNote,
        sections: await Promise.all(
          m.sections.map(async (sec) => ({
            title: sec.title,
            note: sec.note,
            items: await Promise.all(
              sec.items.map(async ({ dish: did }) => {
                const d = await dish(did);
                return { name: d.name, desc: d.description, price: m.showPrices ? (priceOf(d) ?? undefined) : undefined, options: !!d.options, tags: d.tags };
              }),
            ),
          })),
        ),
      };
    }),
  );
}
