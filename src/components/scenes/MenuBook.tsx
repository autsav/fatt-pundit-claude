/**
 * Scene 5 · The menu book.
 * The real printed menu (guidelines p.26–27) as a book you turn by the corner (Page Flip).
 * Pages: an ink cover with the orange stamp, then menu pages in the printed menu's manner
 * (ornate frame, gold and orange stamps, "NAME | £price" over the description), and the
 * map page on the back, as on the real menu. Bookmark tabs swap the menu.
 * Everything printed comes from menus.json + dishes.json via index.astro; nothing is typed here.
 */
import { type KeyboardEvent, type ReactNode, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import PageFlip from '@/components/kokonutui/page-flip';
import namemarkLine from '@/assets/images/brand/namemark-line.svg?raw';
import namemarkStack from '@/assets/images/brand/namemark-stack.svg?raw';

/** The approved namemark (guidelines p.8), never typed: sized by font-size, coloured by currentColor. */
const Namemark = ({ svg, className }: { svg: string; className: string }) => (
  <span aria-hidden="true" className={`inline-block align-middle leading-none [&>svg]:block [&>svg]:h-full [&>svg]:w-auto ${className}`} dangerouslySetInnerHTML={{ __html: svg }} />
);

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
  /** A dietary menu (vegan, halal…): grouped after the general menus on the bookmarks. */
  diet?: boolean;
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
  /** label: the list button's wording (src/lib/waitlist.ts listCta), honest when the list isn't open yet. */
  soon?: { dishes: string[]; href: string; label: string; sr?: string; external?: boolean };
}
const PLACE_KEY = 'fp-menu-at';
/** One choice/tab look for the branch toggle and the book's bookmarks. */
const CHOICE = 'min-h-11 border-2 px-4 font-label text-[15px] font-bold tracking-title';
const CHOICE_ON = 'bg-ink text-sand border-ink';
const CHOICE_OFF = 'bg-paper-light text-ink border-ink/50';
/** A dish for the signature page that opens the à la carte menu (home page). */
export interface SignatureDish {
  name: string;
  price?: string;
  image?: string;
  alt?: string;
  /** Optional responsive sources for the photo. */
  srcset?: string;
  sizes?: string;
}

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
    <div className="relative size-full bg-paper-light">
      <div aria-hidden="true" className="pointer-events-none absolute inset-[2.6cqw]" style={{ borderStyle: 'solid', borderWidth: '3.6cqw', borderImage: `url(${art.frame}) 2.33% 3.25% stretch` }} />
      <div className="absolute inset-[9cqw] flex flex-col">{children}</div>
    </div>
  );
}

function Item({ i }: { i: MenuItemLite }) {
  return (
    <li className="pb-[3cqw]">
      <p className="m-0 text-[3.9cqw] font-bold uppercase leading-[1.3] tracking-title">
        {i.name}
        {i.price && !i.options && <span className="font-bold normal-case text-ink"> | {i.price}</span>}
        {i.tags.length > 0 && <span className="ml-[1.4cqw] align-[0.2cqw] font-label text-[2.6cqw] tracking-title text-gold-deep">{i.tags.join(' ')}</span>}
      </p>
      {i.options && i.price && <p className="m-0 text-[3.2cqw] font-bold leading-[1.45]">{i.price}</p>}
      {i.desc && <p className="m-0 text-[3.3cqw] leading-[1.36] text-ink/85">{i.desc}</p>}
    </li>
  );
}

function SectionHead({ title, note, cont }: { title: string; note?: string; cont?: boolean }) {
  return (
    <div className="pb-[1.6cqw]">
      {/* h3: the book sits under the chapter's h2 and has no heading of its own between. */}
      <h3 className="m-0 text-[4.4cqw] font-bold uppercase tracking-title">
        {title}
        {cont && <span className="font-note text-[3.2cqw] normal-case tracking-normal text-ink/60"> continued</span>}
      </h3>
      {note && <p className="m-0 pt-[1cqw] pb-[0.8cqw] font-note text-[3.3cqw] leading-[1.38] text-ink/80">{note}</p>}
    </div>
  );
}

const Allergy = ({ text }: { text: string }) => <p className="m-0 pt-[1cqw] text-[2.9cqw] leading-[1.4] text-ink/75">{text}</p>;

function MenuHeader({ menu, art }: { menu: MenuLite; art: Art }) {
  return (
    <header className="flex items-center justify-between gap-[2cqw] pb-[4cqw] text-center">
      <img src={art.stampGold} alt="" width={431} height={564} loading="lazy" decoding="async" className="h-auto w-[15cqw]" draggable={false} />
      <div>
        <p className="m-0 text-[6cqw] leading-none"><span className="sr-only">Fatt Pundit</span><Namemark svg={namemarkLine} className="h-[0.7em]" /></p>
        <p className="m-0 mt-[1.6cqw] font-note text-[4cqw] text-tiger-deep">{menu.title}</p>
        <p className="m-0 mt-[1cqw] font-label text-[2.6cqw] font-bold uppercase tracking-title">Soho and Covent Garden</p>
      </div>
      <img src={art.stampOrange} alt="" width={431} height={564} loading="lazy" decoding="async" className="h-auto w-[15cqw]" draggable={false} />
    </header>
  );
}

/** Hidden 1000px page: every block rendered once so its real height can be read. */
function Measure({ menu, art, onSizes }: { menu: MenuLite; art: Art; onSizes: (z: Sizes, final: boolean) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const read = (final: boolean) => {
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
      }, final);
    };
    // Final once the fonts are in: until then the book stays hidden, so text never reflows in view.
    const loaded = !document.fonts || document.fonts.status === 'loaded';
    read(loaded);
    let live = true;
    if (!loaded) document.fonts.ready.then(() => live && read(true));
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
      <p className="m-0 mt-auto pt-[2cqw] text-center font-label text-[2.6cqw] font-bold tracking-title text-ink/60">{n}</p>
    </Frame>
  );
}

function Cover({ menu, art, place }: { menu: MenuLite; art: Art; place?: MenuPlace }) {
  return (
    <div className="relative flex size-full flex-col items-center justify-center gap-[5cqw] bg-ink px-[10cqw] text-center text-sand">
      <div className="pointer-events-none absolute inset-[3cqw] border-[0.5cqw] border-gold/60" />
      <img src={art.stampOrange} alt="" width={431} height={564} loading="lazy" decoding="async" className="h-auto w-[46cqw]" draggable={false} />
      <div>
        <p className="m-0 text-[9cqw] leading-none"><span className="sr-only">Fatt Pundit</span><Namemark svg={namemarkStack} className="h-[1.71em]" /></p>
        <p className="m-0 mt-[3cqw] font-note text-[5.4cqw] text-gold">{menu.title}</p>
        {place && <p className="m-0 mt-[4cqw] font-label text-[3.2cqw] font-bold uppercase tracking-title text-sand/85">{place.name}, {place.street}</p>}
      </div>
      <p className="absolute bottom-[9cqw] m-0 font-note font-medium normal-case italic tracking-normal text-[max(14px,3.4cqw)] text-sand/80">Turn the corner</p>
    </div>
  );
}

/**
 * The signature dishes, as the first page of the à la carte menu: the photographed ones in a
 * grid, the rest named underneath. Replaces the separate kitchen scene on the home page.
 */
function Signatures({ dishes, art }: { dishes: SignatureDish[]; art: Art }) {
  const pics = dishes.filter((d) => d.image).slice(0, 4);
  const rest = dishes.filter((d) => !pics.includes(d));
  return (
    <Frame art={art}>
      <p className="m-0 text-center text-[5.6cqw] font-bold uppercase leading-none tracking-title">From the pass</p>
      <p className="m-0 mt-[1.2cqw] text-center font-note text-[3.6cqw] font-medium italic text-tiger-deep">Our signature dishes</p>
      <div className="mt-[3cqw] grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-[3cqw]">
        {pics.map((d, i) => (
          <figure key={d.name} className="relative m-0 flex min-h-0 flex-col">
            {/* Steam off the first plate (the momos): three wisps, a registered loop that Pause motion stills. */}
            {i === 0 && <span className="menu-steam" aria-hidden="true"><i /><i /><i /></span>}
            <img src={d.image} srcSet={d.srcset} sizes={d.sizes} alt={d.alt ?? ''} width={800} height={600} className="fp-photo min-h-0 w-full flex-1 object-cover" loading="lazy" decoding="async" draggable={false} />
            <figcaption className="mt-[1.2cqw] text-[2.8cqw] font-bold uppercase leading-tight tracking-title">
              {d.name}
              {d.price && <span className="font-normal"> | {d.price}</span>}
            </figcaption>
          </figure>
        ))}
      </div>
      {rest.length > 0 && (
        <p className="m-0 mt-[2.4cqw] text-center font-note text-[3.1cqw] font-medium italic leading-[1.35]">Also from the pass: {rest.map((d) => d.name).join(', ')}.</p>
      )}
    </Frame>
  );
}

/** The back of the real menu: the story and the map (guidelines p.27). */
function Back({ art }: { art: Art }) {
  return (
    <Frame art={art}>
      <div className="flex items-start justify-between gap-[3cqw]">
        <img src={art.stampGold} alt="" width={431} height={564} loading="lazy" decoding="async" className="h-auto w-[18cqw]" draggable={false} />
        <p className="m-0 flex-1 text-center font-note text-[3.3cqw] leading-[1.4]">
          Originating from Calcutta, this unique cuisine was invented when the Hakka people migrated to India from the Chinese province of Guangdong, bringing their traditional cooking with them and meeting the spices of India.
        </p>
        <img src={art.stampOrange} alt="" width={431} height={564} loading="lazy" decoding="async" className="h-auto w-[18cqw]" draggable={false} />
      </div>
      <img src={art.map} alt="The hand-drawn map from the menu: Guangdong to Calcutta" width={1000} height={1019} loading="lazy" decoding="async" className="mt-[3cqw] min-h-0 w-full flex-1 object-contain" draggable={false} />
    </Frame>
  );
}

/* ---------- The book ---------- */


export default function MenuBook({
  menus,
  art,
  next,
  places: allPlaces,
  signatures,
  lists,
}: {
  menus: MenuLite[];
  art: Art;
  next?: { href: string; label: string };
  places?: MenuPlace[];
  /** Home page: the à la carte menu opens on the signature dishes. */
  signatures?: SignatureDish[];
  /** Links to every menu as a list, shown right under the instruction. */
  lists?: { href: string; label: string }[];
}) {
  // Only rooms with a menu can be picked; an opening-soon room is a line of text, not a dead tab.
  const places = allPlaces?.filter((p) => !p.soon);
  const soon = allPlaces?.filter((p) => p.soon) ?? [];
  const [placeId, setPlaceId] = useState(places?.[0]?.id);
  const place = places?.find((p) => p.id === placeId);
  // The menus this branch serves, in the book's order. No places = every menu given.
  // General menus first, then the dietary ones (two groups on the bookmarks).
  const shown = useMemo(() => {
    const list = place ? menus.filter((m) => place.menus.includes(m.id)) : menus;
    return [...list.filter((m) => !m.diet), ...list.filter((m) => m.diet)];
  }, [menus, place]);
  const [active, setActive] = useState(menus[0]?.id);
  // U-03: the bookmarks carry the general menus; the dietary menus and the list views sit behind one Filter.
  const main = useMemo(() => shown.filter((m) => !m.diet), [shown]);
  const diets = useMemo(() => shown.filter((m) => m.diet), [shown]);
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!filterOpen) return;
    const off = (e: Event) => { if (!filterRef.current?.contains(e.target as Node)) setFilterOpen(false); };
    const esc = (e: Event) => { if ((e as globalThis.KeyboardEvent).key === 'Escape') { setFilterOpen(false); filterRef.current?.querySelector<HTMLButtonElement>('[data-filter-toggle]')?.focus(); } };
    document.addEventListener('pointerdown', off); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('pointerdown', off); document.removeEventListener('keydown', esc); };
  }, [filterOpen]);
  const [opened, setOpened] = useState(false);
  // Wide screens open on the first spread (cover beside the first page) instead of a lone cover.
  useEffect(() => {
    if (window.matchMedia('(min-width: 1024px)').matches) setOpened(true);
  }, []);
  const menu = shown.find((m) => m.id === active) ?? shown[0] ?? menus[0];
  const tagRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const menuTabRefs = useRef<(HTMLButtonElement | null)[]>([]);

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

  /** Tab or branch change cross-fades (View Transitions); a plain swap when unsupported or motion is reduced. */
  const swap = (change: () => void) => {
    if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) return change();
    document.startViewTransition(() => flushSync(change));
  };
  const pickTab = (id: string) =>
    swap(() => {
      setActive(id);
      setOpened(true);
    });
  const onTabKey = (e: KeyboardEvent, i: number) => {
    const n = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? main.length - 1 : -1;
    if (n < 0) return;
    e.preventDefault();
    const to = (n + main.length) % main.length;
    pickTab(main[to].id);
    menuTabRefs.current[to]?.focus();
  };

  const choose = (id: string) => {
    swap(() => {
      setPlaceId(id);
      setOpened(false);
    });
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
  const [sizes, setSizes] = useState<{ id: string; z: Sizes; final: boolean } | null>(null);
  const onSizes = useCallback((z: Sizes, final: boolean) => setSizes({ id: menu.id, z, final }), [menu.id]);
  const z = sizes?.id === menu.id ? sizes.z : estimate(menu);
  const measured = sizes?.id === menu.id && sizes.final;

  const pages = useMemo(() => {
    const out: ReactNode[] = [<Cover key="cover" menu={menu} art={art} place={place} />];
    if (signatures?.length && menu.id === 'a-la-carte') out.push(<Signatures key="sig" dishes={signatures} art={art} />);
    paginate(menu, z).forEach((p, i) => out.push(<MenuPage key={`p${i}`} menu={menu} data={p} n={i + 1} art={art} />));
    out.push(<Back key="back" art={art} />);
    return out;
  }, [menu, art, z, place, signatures]);

  // Decode ahead: a lazy picture one and a half screens away loads and decodes now, so no frame stalls when it arrives.
  const sectionRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const img = e.target as HTMLImageElement;
          io.unobserve(img);
          img.loading = 'eager';
          img.decode?.().catch(() => {});
        }
      },
      { rootMargin: '150% 0px' },
    );
    root.querySelectorAll<HTMLImageElement>('img[loading="lazy"]').forEach((img) => io.observe(img));
    return () => io.disconnect();
  }, [menu?.id, place?.id, opened, pages]);

  return (
    <section ref={sectionRef} id="menu" className="relative overflow-clip bg-sand py-[var(--section-pad)] text-ink" aria-label="The menus">
      <Measure menu={menu} art={art} onSizes={onSizes} />
      <div className="wrap relative flex flex-col items-center">
        {/* Chapter head (the home page's numbered chapters), then one toolbar: which room's book, or the list. */}
        <header className="fp-section-head chapter-head fp-reveal w-full" suppressHydrationWarning /* reveal.ts adds is-in before hydration */>
          <p className="fp-section-label"><span className="fp-section-no">02</span> The menus</p>
          <h2 className="fp-h2"><span className="sr-only">The menus: </span>Turn the pages</h2>
          <div className="menu-toolbar">
            {places && (
              <div className="menu-toolbar-group">
                <p className="menu-toolbar-label !text-[13px] text-ink/70" id="menu-where">Open the book for</p>
                <div role="radiogroup" aria-labelledby="menu-where" className="flex flex-wrap gap-2 sm:gap-3">
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
                        className={`${on ? CHOICE_ON : CHOICE_OFF} ${CHOICE} !text-[14px]`}
                      >
                        {p.name}
                      </button>
                    );
                  })}
                  {soon.map((p) => (
                    <button key={p.id} type="button" disabled className={`${CHOICE_OFF} ${CHOICE} cursor-not-allowed opacity-60`}>
                      {p.name} · soon
                    </button>
                  ))}
                </div>
              </div>
            )}
            {!places && <p className="m-0 fp-body">The menu you'll be handed at the table. Pick yours from the bookmarks.</p>}
          </div>
        </header>

        {place?.soon ? (
          <div className="menu-soon mt-8 w-full max-w-[560px]">
            <p className="m-0 font-label text-[13px] font-bold uppercase tracking-title text-tiger-deep">Opening soon</p>
            <h3 className="m-0 mt-2 font-note text-[clamp(26px,3vw,34px)] font-medium normal-case italic leading-tight tracking-normal">{place.name}, {place.street}</h3>
            <p className="m-0 mt-3 text-[16px] leading-snug">The menu is being written. These are coming with us:</p>
            <ul className="m-0 mt-3 list-none p-0">
              {place.soon.dishes.map((d) => (
                <li key={d} className="border-b border-dashed border-ink/30 py-2.5 text-[17px] font-bold uppercase tracking-title">
                  {d}
                </li>
              ))}
            </ul>
            <a href={place.soon.href} {...(place.soon.external ? { target: '_blank', rel: 'noopener' } : {})} className="fp-btn fp-btn--primary mt-6">{place.soon.label}{place.soon.sr && <span className="sr-only">{place.soon.sr}</span>}</a>
          </div>
        ) : (
        <>
        {/* Phones show one page: capped near half the screen so there is room to scroll past. */}
        <div className="mx-auto mt-7 w-full max-w-[1000px]">
          {/* Bookmarks: paper tabs standing up from the top edge of the book. */}
          {/* Bookmarks: one paper style, the open one in ink (no colour without meaning). */}
          <div className="relative z-10 flex items-end gap-[6px] px-4 max-sm:pr-0 sm:justify-center">
          <div role="tablist" aria-label="Menus" className="flex min-w-0 snap-x snap-mandatory items-end gap-[6px] overflow-x-auto [scrollbar-width:none] max-sm:[mask-image:linear-gradient(90deg,#000_calc(100%-40px),transparent)] sm:flex-wrap sm:justify-center sm:snap-none sm:overflow-visible">
            {main.map((m, i) => {
              const on = m.id === menu.id;
              return (
                <button
                  key={m.id}
                  ref={(el) => {
                    menuTabRefs.current[i] = el;
                  }}
                  id={`menu-tab-${m.id}`}
                  role="tab"
                  aria-selected={on}
                  aria-controls="menu-panel"
                  tabIndex={on || (i === 0 && menu.diet) ? 0 : -1}
                  type="button"
                  onClick={() => pickTab(m.id)}
                  onKeyDown={(e) => onTabKey(e, i)}
                  className={`${on ? CHOICE_ON : CHOICE_OFF} ${CHOICE} snap-start shrink-0 whitespace-nowrap !border-b-0 shadow-[0_-2px_6px_rgb(0_0_0/0.10)] [transition:transform_var(--dur-spring)_var(--curve-spring)] pb-4 pt-3 ${on ? '' : 'translate-y-2 hover:translate-y-1'}`}
                >
                  {m.tab}
                </button>
              );
            })}
          </div>
          {(diets.length > 0 || (lists && lists.length > 0)) && (
            <div ref={filterRef} className="relative shrink-0">
              {/* One Filter for dietary menus and the list views (U-03). Shows which diet is open. */}
              <button
                type="button"
                data-filter-toggle
                aria-expanded={filterOpen}
                aria-controls="menu-filter"
                onClick={() => setFilterOpen((v) => !v)}
                className={`${menu.diet ? CHOICE_ON : CHOICE_OFF} ${CHOICE} whitespace-nowrap !border-b-0 shadow-[0_-2px_6px_rgb(0_0_0/0.10)] pb-4 pt-3 ${menu.diet || filterOpen ? '' : 'translate-y-2 hover:translate-y-1'} [transition:transform_var(--dur-spring)_var(--curve-spring)]`}
              >
                {menu.diet ? `Filter: ${menu.tab}` : 'Filter'}
              </button>
              <div id="menu-filter" hidden={!filterOpen} className="menu-filter absolute right-0 top-full z-30 mt-2 w-[min(300px,86vw)] border-2 border-ink bg-paper-light p-4 text-left shadow-[0_14px_28px_rgb(0_0_0/0.25)]">
                {diets.length > 0 && (
                  <div role="group" aria-labelledby="menu-filter-diet">
                    <p id="menu-filter-diet" className="m-0 mb-2 font-note text-[15px] italic text-ink/80">For dietary needs</p>
                    <div className="flex flex-wrap gap-2">
                      {diets.map((m) => (
                        <button key={m.id} type="button" aria-pressed={m.id === menu.id} onClick={() => { setFilterOpen(false); pickTab(m.id); }} className={`${m.id === menu.id ? CHOICE_ON : CHOICE_OFF} ${CHOICE} !text-[14px]`}>
                          {m.tab}
                        </button>
                      ))}
                      {menu.diet && (
                        <button type="button" onClick={() => { setFilterOpen(false); pickTab(main[0].id); }} className={`${CHOICE_OFF} ${CHOICE} !text-[14px]`}>Show all</button>
                      )}
                    </div>
                  </div>
                )}
                {lists && lists.length > 0 && (
                  <div className={diets.length > 0 ? 'mt-4 border-t border-dashed border-ink/30 pt-3' : ''}>
                    <p className="m-0 mb-2 font-note text-[15px] italic text-ink/80">Read it as a list</p>
                    <div className="flex flex-wrap gap-2">
                      {lists.map((l) => <a key={l.href} className="fp-btn fp-btn--sm !border-ink/40 !bg-transparent !text-[13px]" href={l.href}>{l.label}</a>)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          </div>
          {/* Sized from the viewport height so the open book fits one screen, with a floor: on a phone on its
              side (390px tall) the height rule alone gave a 75px book with 2px type. Past the floor it scrolls. */}
          <div id="menu-panel" role="tabpanel" {...(menu.diet ? { "aria-label": `${menu.tab} menu` } : { "aria-labelledby": `menu-tab-${menu.id}` })} className="relative mx-auto shadow-[0_24px_30px_rgb(0_0_0/0.35)] max-sm:!max-w-[max(260px,40svh)] [transition:opacity_var(--dur-fast)_var(--curve-out)]" style={{ maxWidth: 'max(320px, min(1000px, calc((100svh - 340px) * 1.5)))', opacity: measured ? 1 : 0, viewTransitionName: 'menu-book' }}>
            <PageFlip key={`${place?.id}-${menu.id}-${opened ? 'open' : 'shut'}`} pages={pages} label={`${place ? `${place.name} ` : ''}${menu.title} menu`} start={opened ? 1 : 0} />
            {/* Direction C scene 7: on wide screens a copy of the cover lies over the right page and swings open on
                the spine as the book comes on screen (global.css "Menu book"), uncovering the spread beneath. */}
            {opened && <div className="menu-cover-swing" aria-hidden="true"><Cover menu={menu} art={art} place={place} /></div>}
          </div>
        </div>
        {lists && lists.length > 0 && (
          <p className="m-0 mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[15px] sm:hidden">
            <span className="font-note italic text-ink/80">Small print? Read it as a list:</span>
            {lists.map((l) => <a key={l.href} className="fp-link fp-link--strong" href={l.href}>{l.label}</a>)}
          </p>
        )}
        {menu.id === 'a-la-carte' && signatures && signatures.length > 1 && (
          <ul className="m-0 mt-5 grid w-full max-w-[420px] list-none grid-cols-2 gap-3 p-0 sm:hidden" aria-label="Signature dishes">
            {signatures.slice(0, 2).map((d) => (
              <li key={d.name} className="flex flex-col gap-1.5">
                {d.image && <img src={d.image} srcSet={d.srcset} sizes={d.sizes} alt={d.alt ?? ''} width={800} height={600} className="fp-photo aspect-[4/3] w-full object-cover" loading="lazy" decoding="async" />}
                <p className="m-0 text-[14px] font-bold uppercase leading-tight tracking-title">{d.name}{d.price && <span className="font-normal"> | {d.price}</span>}</p>
              </li>
            ))}
          </ul>
        )}
        <p className="m-0 mt-5 text-center font-note text-[16px] italic text-ink/80 sm:hidden"><span className="sr-only">Swipe sideways or tap a page edge to turn. </span><span aria-hidden="true">Every dish gets a page of its own.</span></p>
        {place?.book && (
          <a href={place.book.href} data-book={place.id} className="fp-btn fp-btn--primary mt-6">
            {place.book.label}
          </a>
        )}
        </>
        )}
        {next && (
          <a href={next.href} className="mt-6 inline-flex min-h-11 items-center gap-2 border-b-2 border-ink pb-0.5 font-bold text-ink no-underline">
            {next.label} <span aria-hidden="true">↓</span>
          </a>
        )}
      </div>
    </section>
  );
}
