/**
 * "The tale of Fatt & Pundit": the brand story told as a comic.
 *
 * The plot comes from the brand guidelines (menu back, p.27): Hakka cooks left Guangdong for Calcutta,
 * met the spices of India in Tangra, and Indo-Chinese food was born. The two characters come from
 * the name itself, as the restaurant explains it ("Fatt", a common Chinese surname; "Pundit", the
 * Indian word for a scholar; quoted in its 2019 launch press). They are an allegory, not the
 * founders (brothers Huzefa and Hamza Sajawal): client to approve before launch.
 *
 * Artwork: each panel's illustration goes in src/assets/images/story/<panel id>.(jpg|png|webp).
 * Until a file exists the panel shows a storyboard sketch; nothing else needs to change.
 * `scene` is the brief for the illustrator; `alt` is the alt text, describing the picture as drawn.
 * Speech bubbles stay as text on the page (readable, translatable), never drawn into the art.
 */

export type Speaker = 'Fatt' | 'Pundit';

export interface Bubble {
  who: Speaker;
  text: string;
  /** Where the bubble sits, as % of the panel (top-left corner of the bubble). */
  x: number;
  y: number;
  /** Which way the tail points, towards the speaker. */
  tail: 'left' | 'right';
}

/** Brand art shown faintly in the storyboard sketch until the illustration arrives. */
export type Sketch = 'ship' | 'mountains' | 'tiger' | 'compass' | 'map' | 'stamp';

export interface Panel {
  id: string;
  /** wide: full width, 21:9. half: half width on desktop, 4:3. */
  size: 'wide' | 'half';
  caption: string;
  scene: string;
  /** What the finished picture actually shows (comic mode alt text). `scene` stays the illustrator's brief. */
  alt: string;
  sketch: Sketch;
  bubbles?: Bubble[];
  /** Also shown in the short version on the home page. */
  short?: boolean;
}

export interface Chapter {
  id: string;
  /** Short label for the chapter rail. */
  label: string;
  title: string;
  panels: Panel[];
}

export const STORY_TITLE = 'The tale of Fatt & Pundit';
export const STORY_LEDE = 'A Hakka cook, a Calcutta scholar, and the food they made together.';

export const chapters: Chapter[] = [
  {
    id: 'canton',
    label: 'Guangdong',
    title: 'A long way from home',
    panels: [
      {
        id: 'p01-harbour',
        size: 'wide',
        short: true,
        sketch: 'mountains',
        caption: 'Guangdong, China. Fatt is a Hakka cook, and the Hakka have always moved on.',
        scene: 'Dawn over a busy Guangdong harbour. Fatt, a young Hakka cook, stands on the quay with a wok strapped to his bundle, looking out at a waiting ship.',
        alt: 'Paper-cut picture: a wooden junk with orange sails crosses a grey-blue sea past green mountains and a white-walled Guangdong village. A small tiger cook with a wok on his bundle stands at the bow.',
        bubbles: [{ who: 'Fatt', text: 'Wherever we land, someone will need dinner.', x: 56, y: 14, tail: 'left' }],
      },
      {
        id: 'p02-packing',
        size: 'half',
        sketch: 'compass',
        caption: "He packs what matters: a wok, a cleaver and his grandmother's recipes.",
        scene: "Close-up of Fatt's hands wrapping a cleaver and a worn recipe book in cloth, next to a well-used wok.",
        alt: 'The same junk under a low gold sun, orange sails full, green mountains and a white village behind. The tiger cook stands at the bow with his wok and bundle.',
      },
      {
        id: 'p03-at-sea',
        size: 'half',
        sketch: 'ship',
        caption: 'Weeks at sea, sailing for India.',
        scene: 'The ship crossing a moonlit sea. Fatt on deck stirs a small pot over a brazier while the crew gathers round.',
        alt: 'A dark map of the sea route from Guangdong in China, down past Malaysia and across to India, drawn as a pale line with a small tiger stamp partway along.',
        bubbles: [{ who: 'Fatt', text: "Soup's ready!", x: 52, y: 12, tail: 'left' }],
      },
    ],
  },
  {
    id: 'tangra',
    label: 'Calcutta',
    title: 'Tangra',
    panels: [
      {
        id: 'p04-tangra',
        size: 'wide',
        sketch: 'tiger',
        caption: "Calcutta. In Tangra, the city's Chinatown, Fatt sets up his wok by the road.",
        scene: "A crowded Tangra lane in Calcutta: rickshaws, shop signs in Chinese and Bengali, and Fatt's small roadside stall glowing with steam and flame.",
        alt: 'A Calcutta lane in Tangra, in paper-cut style: lantern-hung shophouses, a rickshaw, clay pots and crates, and a small roadside stall with a wok on a stove under a striped awning.',
      },
      {
        id: 'p05-first-taste',
        size: 'half',
        short: true,
        sketch: 'tiger',
        caption: 'His first customer is Pundit, a local scholar who lives to eat.',
        scene: 'Pundit, a Calcutta scholar in spectacles with a book under his arm, tastes from a bowl with a doubtful face while Fatt waits for the verdict.',
        alt: 'Pundit, a tiger in a turban and white kurta, stands by the roadside wok stall in front of the shophouses, tasting from a bowl.',
        bubbles: [{ who: 'Pundit', text: 'Good. But where is the fire?', x: 8, y: 10, tail: 'right' }],
      },
      {
        id: 'p06-spice-market',
        size: 'half',
        sketch: 'compass',
        caption: 'So Pundit takes him to the spice market.',
        scene: "A spice market: sacks of red and green chillies, ginger, garlic and cumin. Pundit presses a handful of green chillies into Fatt's hand.",
        alt: "A spice market under strings of red and green chillies. Sacks hold red chillies, green chillies, turmeric, cumin, ginger and garlic, and a tiger in a white chef's coat holds up a green chilli.",
        bubbles: [{ who: 'Fatt', text: 'Show me.', x: 60, y: 12, tail: 'left' }],
      },
    ],
  },
  {
    id: 'something-new',
    label: 'Something new',
    title: 'Something new',
    panels: [
      {
        id: 'p07-the-wok',
        size: 'wide',
        short: true,
        sketch: 'tiger',
        caption: 'Chinese technique, Indian spice. Every day they argue. Every night the queue gets longer.',
        scene: 'Fatt tossing a roaring wok while Pundit throws in chillies beside him; a long queue of hungry neighbours waits in the warm evening light.',
        alt: "Night in Tangra under paper lanterns. Fatt, a tiger in a gold crown and chef's whites, tosses noodles in a flaming wok. Pundit, in a turban, throws chillies in beside him, and a queue of animal neighbours waits on the right.",
        bubbles: [
          { who: 'Pundit', text: 'More chilli!', x: 6, y: 12, tail: 'right' },
          { who: 'Fatt', text: 'Hotter wok!', x: 70, y: 18, tail: 'left' },
        ],
      },
      {
        id: 'p08-momos',
        size: 'half',
        sketch: 'mountains',
        caption: 'Momos from steel steamers. Chilli chicken. Hakka noodles.',
        scene: 'A bamboo steamer lid lifts off a plate of momos with two dipping sauces, in a cloud of steam; then the dishes go round on a lazy Susan: chilli mock chicken, Hakka noodles, pepper crab.',
        alt: 'A plate of four momos on a wooden board with two dipping sauces, one red and one orange. A bamboo steamer lid floats above.',
      },
      {
        id: 'p09-friends',
        size: 'half',
        sketch: 'stamp',
        caption: 'Calcutta calls it Indo-Chinese, and makes it its own. A cook and a scholar: Fatt and Pundit.',
        scene: 'Fatt and Pundit behind a round table after service, laughing as they share the dishes on its lazy Susan.',
        alt: 'Fatt, in his crown, and Pundit, in his turban and glasses, grin over a round orange table. On its lazy Susan are momos, noodles and several curries and stir-fries in steel dishes.',
      },
    ],
  },
  {
    id: 'london',
    label: 'London',
    title: 'London calling',
    panels: [
      {
        id: 'p10-soho',
        size: 'half',
        short: true,
        sketch: 'map',
        caption: 'The recipes travel on. In 2019, Fatt Pundit opens on Berwick Street in Soho.',
        scene: 'Night on Berwick Street, Soho: the Fatt Pundit front with its sign lit and the tiger stamp in the window, in the rain.',
        alt: 'The Fatt Pundit front on Berwick Street in the rain: red doors, a glowing orange sign, a lit dining room and the tiger stamp poster in the window.',
        bubbles: [{ who: 'Pundit', text: 'Another sea, another kitchen.', x: 8, y: 12, tail: 'right' }],
      },
      {
        id: 'p11-covent-garden',
        size: 'half',
        sketch: 'stamp',
        caption: 'Covent Garden follows in 2021, on Maiden Lane.',
        scene: 'Inside Covent Garden: one room opens through an arch into the next; green and red booths, brass lamps, blue-and-white plates, painted lettering on the walls.',
        alt: 'Inside Covent Garden: through an arch, a room with teal booths, wooden tables and bentwood chairs. Brass lamps hang over shelves of blue-and-white pots, and Chinese and Hindi lettering is painted on the walls.',
      },
    ],
  },
  {
    id: 'next-stop',
    label: 'Next stop',
    title: 'Next stop',
    panels: [
      {
        id: 'p12-dubai',
        size: 'wide',
        sketch: 'ship',
        caption: 'Next stop: Dubai, opening soon at The Hangout, Mall of the Emirates.',
        scene: 'Fatt and Pundit sit on suitcases covered in travel stamps in the dunes, looking out at the Dubai skyline at dusk.',
        alt: 'Fatt and Pundit sit with their backs to us on stacked travel-stamped suitcases, a wok beside them. Across the golden dunes, a Dubai skyline of towers rises at dusk.',
        bubbles: [{ who: 'Fatt', text: 'Pack the wok.', x: 58, y: 12, tail: 'left' }],
      },
      {
        id: 'p13-your-table',
        size: 'wide',
        short: true,
        sketch: 'compass',
        caption: 'And the best seat in the house? That one is yours.',
        scene: 'An empty chair with a Reserved card at a laid table with a plate of momos on it; Fatt and Pundit wave the viewer in.',
        alt: 'A laid round table with a steamer basket and a plate of momos, lit by a red paper lantern. A wooden chair beside it has a Reserved card on its seat, and Fatt and Pundit wave hello.',
        bubbles: [{ who: 'Pundit', text: 'Your table is ready.', x: 58, y: 14, tail: 'left' }],
      },
    ],
  },
];

export const allPanels = chapters.flatMap((c) => c.panels);
