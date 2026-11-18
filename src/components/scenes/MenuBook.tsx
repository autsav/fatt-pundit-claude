/**
 * Scene 5 · The menu book.
 * The real printed menu (guidelines p.26–27) as a book you turn by the corner (Page Flip).
 * Pages: an ink cover with the orange stamp, then menu pages in the printed menu's manner
 * (ornate frame, gold and orange stamps, "NAME | £price" over the description), and the
 * map page on the back, as on the real menu. Bookmark tabs swap the menu.
 * Everything printed comes from menus.json + dishes.json via index.astro; nothing is typed here.
 */
import { type KeyboardEvent, type ReactNode, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import PageFlip from '@/components/kokonutui/page-flip';

export interface MenuItemLite {
  name: string;
  desc?: string;
  price?: string;
  /** Several prices ("Veg £13 · Chicken or beef £15"): printed on their own line. */
  options?: boolean;
  tags: string[];
}
export interface MenuLite {
  id: string;
  tab: string;
  title: string;
  sections: { title: string; note?: string; items: MenuItemLite[] }[];
  allergyNote: string;
}
/** A branch the guest can pick: its own menus, its booking link, or (opening soon) a preview. */
export interface MenuPlace {
  id: string;
  name: string;
  street: string;
  menus: string[];
  book?: { href: string; label: string };
  soon?: { dishes: string[]; href: string };
}
const PLACE_KEY = 'fp-menu-at';

interface Art {
  frame: string;
  stampGold: string;
  stampOrange: string;
  map: string;
}

/* ---------- Pagination ----------
 * Every size on a page is in container units (cqw), so a block's height in cqw is the same at
 * any page width. We render each block once in a hidden 1000px-wide page (1cqw = 10px), read
 * the heights, and pack pages from those. Until fonts load we use a rough estimate.
 */

const BODY_H = 133 - 18 - 7; // page height − frame insets − folio
type Sizes = { header: number; heads: number[]; conts: number[]; items: number[][]; allergy: number; gap: number };

function estimate(menu: MenuLite): Sizes {
  const l = (t: string | undefined, cpl: number) => (t ? Math.ceil(t.length / cpl) : 0);
  return {
    header: 30,
    heads: menu.sections.map((x) => 8 + l(x.note, 52) * 4.6),
    conts: menu.sections.map(() => 7),
    items: menu.sections.map((x) => x.items.map((i) => 5.2 + l(i.desc, 44) * 4.5 + (i.options ? 4.6 : 0) + 3)),
    allergy: 4 + l(menu.allergyNote, 60) * 4.1,
    gap: 2,
  };
}

type Chunk = { si: number; head: boolean; items: MenuItemLite[] };
type PageData = { first: boolean; chunks: Chunk[]; last: boolean };

function paginate(menu: MenuLite, z: Sizes): PageData[] {
  const pages: PageData[] = [];
  let page: PageData = { first: true, chunks: [], last: false };
  let room = BODY_H - z.header;
  const turn = () => {
    pages.push(page);
    page = { first: false, chunks: [], last: false };
    room = BODY_H;
  };
  menu.sections.forEach((s, si) => {
    let chunk: Chunk | null = null;
    for (const [i, item] of s.items.entries()) {
      const head = chunk ? 0 : i === 0 ? z.heads[si] : z.conts[si];
      const need = z.items[si][i] + head;
      if (need > room && (page.chunks.length > 0 || chunk)) {
        if (chunk) page.chunks.push(chunk);
        chunk = null;
        turn();
      }
      if (!chunk) {
        chunk = { si, head: i === 0, items: [] };
        room -= i === 0 ? z.heads[si] : z.conts[si];
      }
      chunk.items.push(item);
      room -= z.items[si][i];
    }
    if (chunk) page.chunks.push(chunk);
    room -= z.gap;
  });
  // The allergy note closes the last page, or gets one of its own.
  if (room < z.allergy) turn();
  page.last = true;
  pages.push(page);
  return pages;
}

/* ---------- Pages ---------- */

function Frame({ art, children }: { art: Art; children: ReactNode }) {
  return (
    <div className="relative size-full bg-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-[2.6cqw]" style={{ borderStyle: 'solid', borderWidth: '3.6cqw', borderImage: `url(${art.frame}) 60 stretch` }} />
      <div className="absolute inset-[9cqw] flex flex-col">{children}</div>
    </div>
  );
}

function Item({ i }: { i: MenuItemLite }) {
  return (
    <li className="pb-[3cqw]">
      <p className="m-0 text-[3.9cqw] font-bold uppercase leading-[1.3] tracking-[0.04em]">
        {i.name}
        {i.price && !i.options && <span className="font-bold normal-case text-ink"> | {i.price}</span>}
        {i.tags.length > 0 && <span className="ml-[1.4cqw] align-[0.2cqw] font-label text-[2.6cqw] tracking-[0.18em] text-gold">{i.tags.join(' ')}</span>}
      </p>
      {i.options && i.price && <p className="m-0 text-[3.2cqw] font-bold leading-[1.45]">{i.price}</p>}
      {i.desc && <p className="m-0 text-[3.3cqw] leading-[1.36] text-ink/85">{i.desc}</p>}
    </li>
  );
}

function SectionHead({ title, note, cont }: { title: string; note?: string; cont?: boolean }) {
  return (
    <div className="pb-[1.6cqw]">
      <h4 className="m-0 text-[4.4cqw] font-bold uppercase tracking-[0.12em]">
        {title}
        {cont && <span className="font-note text-[3.2cqw] normal-case tracking-normal text-ink/60"> continued</span>}
      </h4>
      {note && <p className="m-0 pt-[1cqw] pb-[0.8cqw] font-note text-[3.3cqw] leading-[1.38] text-ink/80">{note}</p>}
    </div>
  );
}

const Allergy = ({ text }: { text: string }) => <p className="m-0 pt-[1cqw] text-[2.9cqw] leading-[1.4] text-ink/75">{text}</p>;

function MenuHeader({ menu, art }: { menu: MenuLite; art: Art }) {
  return (
    <header className="flex items-center justify-between gap-[2cqw] pb-[4cqw] text-center">
      <img src={art.stampGold} alt="" width={508} height={564} loading="lazy" decoding="async" className="h-auto w-[15cqw] -rotate-6" draggable={false} />
      <div>
        <p className="m-0 text-[6.6cqw] font-bold uppercase leading-none tracking-[0.1em]">Fatt Pundit</p>
        <p className="m-0 mt-[1.6cqw] font-note text-[4cqw] text-tiger">{menu.title}</p>
        <p className="m-0 mt-[1cqw] font-label text-[2.6cqw] font-bold uppercase tracking-[0.22em]">Soho · Covent Garden</p>
      </div>
      <img src={art.stampOrange} alt="" width={431} height={564} loading="lazy" decoding="async" className="h-auto w-[15cqw] rotate-6" draggable={false} />
    </header>
  );
}

/** Hidden 1000px page: every block rendered once so its real height can be read. */
function Measure({ menu, art, onSizes }: { menu: MenuLite; art: Art; onSizes: (z: Sizes) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const read = () => {
      const el = ref.current;
      if (!el) return;
      const h = (q: string) => (el.querySelector(q) as HTMLElement | null)?.offsetHeight ?? 0;
      const cq = (px: number) => px / 10 + 0.2;
      onSizes({
        header: cq(h('[data-m="header"]')),
        heads: menu.sections.map((_, si) => cq(h(`[data-m="head-${si}"]`))),
        conts: menu.sections.map((_, si) => cq(h(`[data-m="cont-${si}"]`))),
        items: menu.sections.map((s, si) => s.items.map((_, i) => cq(h(`[data-m="item-${si}-${i}"]`)))),
        allergy: cq(h('[data-m="allergy"]')),
        gap: 2,
      });
    };
    read();
    let live = true;
    document.fonts?.ready.then(() => live && read());
    return () => {
      live = false;
    };
  }, [menu, art, onSizes]);
  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none invisible absolute left-0 top-0 text-ink" style={{ width: 1000, containerType: 'inline-size' }}>
      {/* Same inner width as a page: the frame insets take 9cqw each side. */}
      <div style={{ width: '82cqw' }}>
        <div data-m="header"><MenuHeader menu={menu} art={art} /></div>
        {menu.sections.map((s, si) => (
          <div key={si}>
            <div data-m={`head-${si}`}><SectionHead title={s.title} note={s.note} /></div>
            <div data-m={`cont-${si}`}><SectionHead title={s.title} cont /></div>
            <ul className="m-0 list-none p-0">
              {s.items.map((i, k) => <div key={k} data-m={`item-${si}-${k}`}><Item i={i} /></div>)}
            </ul>
          </div>
        ))}
        <div data-m="allergy"><Allergy text={menu.allergyNote} /></div>
      </div>
    </div>
  );
}

function MenuPage({ menu, data, n, art }: { menu: MenuLite; data: PageData; n: number; art: Art }) {
  return (
    <Frame art={art}>
      {data.first && <MenuHeader menu={menu} art={art} />}
      {data.chunks.map((c, k) => {
        const sec = menu.sections[c.si];
        return (
          <section key={k} className="pb-[2cqw]">
            <SectionHead title={sec.title} note={c.head ? sec.note : undefined} cont={!c.head} />
            <ul className="m-0 list-none p-0">
              {c.items.map((i) => <Item i={i} key={i.name} />)}
            </ul>
          </section>
        );
      })}
      {data.last && <Allergy text={menu.allergyNote} />}
      <p className="m-0 mt-auto pt-[2cqw] text-center font-label text-[2.6cqw] font-bold tracking-[0.2em] text-ink/60">{n}</p>
    </Frame>
  );
}

function Cover({ menu, art, place }: { menu: MenuLite; art: Art; place?: MenuPlace }) {
  return (
    <div className="relative flex size-full flex-col items-center justify-center gap-[5cqw] bg-ink px-[10cqw] text-center text-sand">
      <div className="pointer-events-none absolute inset-[3cqw] border-[0.5cqw] border-gold/60" />
      <img src={art.stampOrange} alt="" width={431} height={564} loading="lazy" decoding="async" className="h-auto w-[46cqw]" draggable={false} />
      <div>
        <p className="m-0 text-[8cqw] font-bold uppercase leading-none tracking-[0.12em]">Fatt Pundit</p>
        <p className="m-0 mt-[3cqw] font-note text-[5.4cqw] text-gold">{menu.title}</p>
        {place && <p className="m-0 mt-[4cqw] font-label text-[3.2cqw] font-bold uppercase tracking-[0.22em] text-sand/85">{place.name} · {place.street}</p>}
      </div>
      <p className="absolute bottom-[9cqw] m-0 font-label text-[2.8cqw] font-bold uppercase tracking-[0.26em] text-sand/70">Turn the corner →</p>
    </div>
  );
}

/** The back of the real menu: the story and the map (guidelines p.27). */
function Back({ art }: { art: Art }) {
  return (
    <Frame art={art}>
      <div className="flex items-start justify-between gap-[3cqw]">
        <img src={art.stampGold} alt="" className="w-[18cqw]" draggable={false} />
        <p className="m-0 flex-1 text-center font-note text-[3.3cqw] leading-[1.4]">
          Originating from Kolkata, this unique cuisine was invented when the Hakka people migrated to India from the Chinese province of Canton, bringing their traditional cooking with them and meeting the spices of India.
        </p>
        <img src={art.stampOrange} alt="" className="w-[18cqw]" draggable={false} />
      </div>
      <img src={art.map} alt="The hand-drawn map from the menu: Canton to Kolkata" className="mt-[3cqw] min-h-0 w-full flex-1 object-contain" draggable={false} />
    </Frame>
  );
}

/* ---------- The book ---------- */

const TAB_COLORS = ['bg-tiger text-white', 'bg-gold text-ink', 'bg-sand text-ink', 'bg-slate text-white', 'bg-[#efe6d8] text-ink', 'bg-ink text-sand'];

export default function MenuBook({ menus, art, next, places }: { menus: MenuLite[]; art: Art; next?: { href: string; label: string }; places?: MenuPlace[] }) {
  const [placeId, setPlaceId] = useState(places?.[0]?.id);
  const place = places?.find((p) => p.id === placeId);
  // The menus this branch serves, in the book's order. No places = every menu given.
  const shown = useMemo(() => (place ? menus.filter((m) => place.menus.includes(m.id)) : menus), [menus, place]);
  const [active, setActive] = useState(menus[0]?.id);
  const [opened, setOpened] = useState(false);
  const menu = shown.find((m) => m.id === active) ?? shown[0] ?? menus[0];
  const tagRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Which branch: a shared link (?at=soho) first, then the guest's last pick on this device.
  useEffect(() => {
    if (!places?.length) return;
    const pick = (id: string | null | undefined) => (id && places.some((p) => p.id === id) ? id : null);
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(PLACE_KEY);
    } catch {}
    const first = pick(new URLSearchParams(location.search).get('at')) ?? pick(saved);
    if (first) setPlaceId(first);
    // Other parts of the page (a boarding pass link) can pick a branch without a reload.
    const onPick = (e: Event) => {
      const id = pick((e as CustomEvent<string>).detail);
      if (id) choose(id);
    };
    window.addEventListener('fp:menu-at', onPick);
    return () => window.removeEventListener('fp:menu-at', onPick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [places]);

  const choose = (id: string) => {
    setPlaceId(id);
    setOpened(false);
    try {
      localStorage.setItem(PLACE_KEY, id);
    } catch {}
    const url = new URL(location.href);
    url.searchParams.set('at', id);
    history.replaceState(history.state, '', url);
  };
  // Radio group keys: arrows move and pick, like any set of radio buttons.
  const onTagKey = (e: KeyboardEvent, i: number) => {
    if (!places) return;
    const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const n = (i + d + places.length) % places.length;
    choose(places[n].id);
    tagRefs.current[n]?.focus();
  };
  const [sizes, setSizes] = useState<{ id: string; z: Sizes } | null>(null);
  const onSizes = useCallback((z: Sizes) => setSizes({ id: menu.id, z }), [menu.id]);
  const z = sizes?.id === menu.id ? sizes.z : estimate(menu);

  const pages = useMemo(() => {
    const out: ReactNode[] = [<Cover key="cover" menu={menu} art={art} place={place} />];
    paginate(menu, z).forEach((p, i) => out.push(<MenuPage key={`p${i}`} menu={menu} data={p} n={i + 1} art={art} />));
    out.push(<Back key="back" art={art} />);
    return out;
  }, [menu, art, z, place]);

  return (
    <section id="menu" className="relative overflow-hidden bg-sand py-[clamp(56px,6vw,88px)] text-ink" aria-label="The menus">
      <div className="voyage-paper pointer-events-none absolute inset-0" aria-hidden="true" />
      <Measure menu={menu} art={art} onSizes={onSizes} />
      <div className="relative mx-auto flex max-w-[1200px] flex-col items-center px-5">
        <p className="m-0 font-note text-[22px] text-tiger">The menu</p>
        <h2 className="m-0 mt-2 text-center text-[clamp(30px,4.4vw,56px)] uppercase leading-none tracking-[0.06em]">Turn the pages</h2>
        <p className="m-0 mt-3 max-w-xl text-center text-[16px] leading-snug">{places ? 'Pick a restaurant, then a menu from the bookmarks.' : "The menu you'll be handed at the table. Pick yours from the bookmarks."}</p>

        {places && (
          <div role="radiogroup" aria-label="Restaurant" className="mt-6 flex flex-wrap justify-center gap-2 sm:gap-3">
            {places.map((p, i) => {
              const on = p.id === place?.id;
              return (
                <button
                  key={p.id}
                  ref={(el) => {
                    tagRefs.current[i] = el;
                  }}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  tabIndex={on ? 0 : -1}
                  onClick={() => choose(p.id)}
                  onKeyDown={(e) => onTagKey(e, i)}
                  className={`menu-tag ${on ? 'is-on' : ''}`}
                >
                  <span className="menu-tag-hole" aria-hidden="true" />
                  {p.name}
                </button>
              );
            })}
          </div>
        )}

        {place?.soon ? (
          <div className="menu-soon mt-8 w-full max-w-[560px]">
            <p className="m-0 font-label text-[13px] font-bold uppercase tracking-[0.24em] text-tiger">Opening soon</p>
            <h3 className="m-0 mt-2 font-note text-[clamp(26px,3vw,34px)] font-medium normal-case italic leading-tight tracking-normal">{place.name}, {place.street}</h3>
            <p className="m-0 mt-3 text-[16px] leading-snug">The menu is being written. These are coming with us:</p>
            <ul className="m-0 mt-3 list-none p-0">
              {place.soon.dishes.map((d) => (
                <li key={d} className="border-b border-dashed border-ink/30 py-2.5 text-[17px] font-bold uppercase tracking-[0.06em]">
                  {d}
                </li>
              ))}
            </ul>
            <a href={place.soon.href} className="btn btn-orange mt-6">Join the list</a>
          </div>
        ) : (
        <>
        {/* Phones show one page: capped near half the screen so there is room to scroll past. */}
        <div className="mx-auto mt-7 w-full max-sm:!max-w-[40svh]" style={{ maxWidth: 'min(1000px, calc((100svh - 340px) * 1.5))' }}>
          {/* Bookmarks: paper tabs standing up from the top edge of the book. */}
          <div role="tablist" aria-label="Menus" className="relative z-10 flex items-end gap-[6px] overflow-x-auto px-4 [scrollbar-width:none] sm:flex-wrap sm:justify-center sm:overflow-visible">
            {shown.map((m, i) => {
              const on = m.id === menu.id;
              return (
                <button
                  key={m.id}
                  role="tab"
                  aria-selected={on}
                  type="button"
                  onClick={() => {
                    setActive(m.id);
                    setOpened(true);
                  }}
                  className={`${TAB_COLORS[i % TAB_COLORS.length]} min-h-11 shrink-0 whitespace-nowrap px-4 font-label text-[13px] font-bold uppercase tracking-[0.18em] shadow-[0_-2px_6px_rgb(0_0_0/0.12)] transition-[padding,transform] duration-200 ${on ? 'pb-4 pt-3' : 'translate-y-1 pb-2 pt-2 opacity-90 hover:translate-y-0'}`}
                >
                  {m.tab}
                </button>
              );
            })}
          </div>
          <div className="relative drop-shadow-[0_24px_30px_rgb(0_0_0/0.35)]">
            <PageFlip key={`${place?.id}-${menu.id}`} pages={pages} label={`${place ? `${place.name} ` : ''}${menu.title} menu`} start={opened ? 1 : 0} />
          </div>
        </div>
        <p className="m-0 mt-5 text-center font-label text-[12.5px] font-bold uppercase tracking-[0.2em] text-ink/70 sm:hidden">Swipe sideways or tap a page edge to turn</p>
        {place?.book && (
          <a href={place.book.href} target="_blank" rel="noopener" className="btn btn-orange mt-6">
            {place.book.label}
          </a>
        )}
        </>
        )}
        {next && (
          <a href={next.href} className="mt-6 inline-flex min-h-11 items-center gap-2 border-b-2 border-ink pb-0.5 font-bold uppercase tracking-[0.1em] text-ink no-underline">
            {next.label} <span aria-hidden="true">↓</span>
          </a>
        )}
      </div>
    </section>
  );
}
