/**
 * Scene 4 · The kitchen.
 * Hero moment: the headline is written in pale ink on the dark pass and steam keeps rising
 * through it (Ink Background). Stir it with the cursor; the letters gather again.
 * Then the signature dishes on a rail you can fling, laid on the brand's greaseproof paper
 * (guidelines p.42). Dishes without a photo are kitchen order tickets, not fake pictures.
 * Prices come from src/data/dishes.json (formatted in index.astro).
 */
import { useEffect, useRef } from 'react';
import CarouselCards, { type RailItem } from '@/components/kokonutui/carousel-cards';
import InkBackground from '@/components/kokonutui/ink-background';
import { isCalm } from '@/lib/motion-tokens';

export interface KitchenDish {
  id: string;
  name: string;
  note?: string;
  price?: string;
  tags: string[];
  image?: string;
  imageAlt?: string;
  section: string;
  signature: boolean;
}

interface Props {
  dishes: KitchenDish[];
  art: { greaseproof: string; stampGold: string };
}

function Ticket({ no, name, section, stamp }: { no: number; name: string; section: string; stamp: string }) {
  return (
    <div className="relative flex h-full w-full flex-col justify-between text-left">
      <div className="flex w-full justify-between border-b-2 border-dotted border-ink/40 pb-2 font-label text-[11px] font-bold uppercase tracking-[0.24em]">
        <span className="text-ink/70">No. {String(no).padStart(2, '0')}</span>
        <span className="text-tiger">Signature</span>
      </div>
      <p className="m-0 font-display text-[21px] font-bold uppercase leading-[1.1] tracking-[0.03em] text-ink [overflow-wrap:anywhere] @3xl/rail:text-[24px]">{name}</p>
      <div className="flex items-end justify-between gap-2">
        <p className="m-0 font-note text-[16px] leading-snug text-ink/80">from the {section.toLowerCase()} section</p>
        <img src={stamp} alt="" width={70} height={81} className="-mb-1 -mr-1 w-[70px] shrink-0 rotate-[-10deg]" draggable={false} />
      </div>
    </div>
  );
}

export default function Kitchen({ dishes, art }: Props) {
  const lineRef = useRef<HTMLParagraphElement>(null);

  // The line under the headline drops in word by word the first time it is seen.
  useEffect(() => {
    const c = isCalm();
    const el = lineRef.current;
    if (c || !el) return;
    // Hidden only once JS is here, so the line still reads without it.
    if (el.getBoundingClientRect().top > window.innerHeight * 0.7) el.style.opacity = '0';
    else return;
    let done = false;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || done) return;
        done = true;
        io.disconnect();
        import('animejs').then(({ animate, splitText, stagger }) => {
          const { words } = splitText(el, { words: { wrap: 'clip' } });
          el.style.opacity = '1';
          animate(words, { y: ['110%', '0%'], duration: 900, delay: stagger(55), ease: 'out(4)' });
        });
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  let ticket = 0;
  const items: RailItem[] = dishes.map((d) => ({
    id: d.id,
    title: d.name,
    note: d.note,
    price: d.price,
    tags: d.tags,
    image: d.image,
    imageAlt: d.imageAlt,
    badge: d.signature && d.image ? 'Signature' : undefined,
    slip: d.image ? undefined : <Ticket no={++ticket + 6} name={d.name} section={d.section} stamp={art.stampGold} />,
  }));

  return (
    <section id="kitchen" className="relative bg-ink text-sand" aria-label="The kitchen">
      <InkBackground text="THE KITCHEN" steam interactive className="min-h-[88svh]">
        <div className="flex max-w-xl flex-col items-center gap-5 text-center">
          <p ref={lineRef} className="m-0 font-note text-[clamp(20px,2.2vw,26px)] leading-snug text-sand">
            All meals in Tangra start with momos, straight from the steel steamers.
          </p>
          <p className="m-0 font-label text-[13px] font-bold uppercase tracking-[0.26em] text-gold">
            <span className="hidden motion-safe:[@media(pointer:fine)]:inline">Move through the steam</span>
            <span className="hidden motion-safe:inline motion-safe:[@media(pointer:fine)]:hidden">Touch the steam</span>
          </p>
        </div>
      </InkBackground>

      {/* The pass: a sheet of the brand's greaseproof paper the dishes are laid on. */}
      <div className="relative -mt-10 pb-16 pt-14 text-ink">
        <div
          aria-hidden="true"
          className="absolute inset-x-[-4%] top-0 bottom-[-40px] origin-left -rotate-[0.8deg] bg-[#faf6ef] shadow-[0_-18px_40px_-20px_rgb(0_0_0/0.8)]"
          style={{ backgroundImage: `linear-gradient(rgb(250 246 239 / 0.5), rgb(250 246 239 / 0.5)), url(${art.greaseproof})`, backgroundSize: 'auto, 300px 300px' }}
        />
        <CarouselCards
          className="relative"
          items={items}
          title="Signature dishes"
          head={
            <div>
              <p className="m-0 font-note text-[19px] text-tiger">On the pass</p>
              <h2 className="m-0 mt-1 text-[clamp(26px,3.4vw,40px)] uppercase leading-none tracking-[0.06em]">Signature dishes</h2>
            </div>
          }
        />
        <p className="relative mx-auto mt-2 max-w-[1200px] px-5 font-label text-[12px] font-bold uppercase tracking-[0.22em] text-ink/70">
          Drag or flick · V vegetarian · VG vegan · GF gluten free · DF dairy free · H halal
        </p>
      </div>
    </section>
  );
}
