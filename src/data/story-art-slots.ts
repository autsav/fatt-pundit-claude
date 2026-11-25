/**
 * Every art slot in "The tale of Fatt & Pundit" (/our-story/): the 13 comic panels and the scene layers.
 * Plain data, so both the site (src/data/story-art.ts adds the files) and the illustrator brief
 * (scripts/illustrator-brief.ts → docs/ILLUSTRATOR-BRIEF.md) read the same list.
 *
 * placeholder: true = the art in place is a stand-in waiting for commissioned art.
 * Owner's decision, 25 Nov 2026: keep the tiger art we have (comic panels and character cut-outs) as the
 * final art, so every slot is placeholder: false and nothing is commissioned. No new character art is generated.
 */
import { chapters } from './story.ts';

export type SlotKind = 'panel' | 'character' | 'backdrop' | 'prop';
export interface ArtSlotSpec {
  id: string;
  kind: SlotKind;
  chapter: string;
  /** What happens in the picture: the illustrator's brief. */
  what: string;
  /** Alt text where the art carries meaning (comic panels). Scene layers are decorative: the scene says it once. */
  alt: string;
  placeholder: boolean;
  /** Delivery spec: pixel size, transparency and how it is split. */
  deliver: { width: number; height: number; transparent: boolean; layers: string };
  /** Where the file goes; dropping it in replaces the stand-in, no code change. */
  file: string;
}

const panels: ArtSlotSpec[] = chapters.flatMap((c) =>
  c.panels.map((p) => ({
    id: p.id,
    kind: 'panel' as const,
    chapter: c.label,
    what: p.scene,
    alt: p.alt,
    placeholder: false,
    deliver: p.size === 'wide'
      ? { width: 2520, height: 1080, transparent: false, layers: 'One flat picture (21:9); keep the top 30% calm for the caption' }
      : { width: 1800, height: 1350, transparent: false, layers: 'One flat picture (4:3); keep the top 30% calm for the caption' },
    file: `src/assets/images/story/${p.id}.jpg`,
  })),
);

type L = [id: string, kind: Exclude<SlotKind, 'panel'>, chapter: string, what: string, width: number, height: number, transparent: boolean, placeholder: boolean];
const LAYERS: L[] = [
  ['opening-harbour', 'backdrop', 'Opening', 'The opening backdrop: a paper-cut harbour at dawn', 2688, 1520, false, false],
  ['harbour-hills-far', 'backdrop', 'Guangdong', 'Far hills behind the harbour (parallax, slowest layer)', 2688, 697, true, false],
  ['harbour-hills-near', 'backdrop', 'Guangdong', 'Near hills and village (parallax)', 2688, 978, true, false],
  ['harbour-water', 'backdrop', 'Guangdong', 'The harbour water strip (used twice: dawn and at sea)', 2688, 395, true, false],
  ['harbour-ship', 'prop', 'Guangdong', 'The junk with orange sails, sailing out', 1078, 821, true, false],
  ['harbour-fatt', 'character', 'Guangdong', 'Fatt on deck, his wok strapped to his bundle', 1411, 2017, true, false],
  ['harbour-compass', 'prop', 'Guangdong', 'A brass compass (brand drawing until replaced)', 400, 400, true, false],
  ['at-sea-compass', 'prop', 'Guangdong', 'The compass at sea (brand drawing until replaced)', 400, 400, true, false],
  ['tangra-lane-far', 'backdrop', 'Tangra', 'Tangra lane, far: shop fronts with signs in Chinese and Bengali', 2688, 1152, true, false],
  ['tangra-lane-near', 'backdrop', 'Tangra', 'Rickshaws and passers-by in the lane', 2688, 1146, true, false],
  ['spice-sacks', 'prop', 'Tangra', 'Sacks of red and green chillies, ginger, garlic, cumin', 2688, 586, true, false],
  ['tangra-stall', 'prop', 'Tangra', "Fatt's roadside stall, wok and flame", 1121, 880, true, false],
  ['tangra-pundit', 'character', 'Tangra', 'Pundit tastes from a bowl, doubtful', 1357, 1924, true, false],
  ['spice-fatt', 'character', 'Tangra', 'Fatt at the stall, chillies in his paw', 1576, 1968, true, false],
  ['wok-street-night', 'backdrop', 'Something new', 'The wok street at night, lanterns overhead', 2688, 1520, false, false],
  ['wok-fatt', 'character', 'Something new', 'Fatt tossing a roaring wok', 1813, 1733, true, false],
  ['wok-pundit', 'character', 'Something new', 'Pundit throwing in chillies', 1922, 1803, true, false],
  ['wok-queue', 'character', 'Something new', 'A long queue of hungry neighbours', 2436, 1063, true, false],
  ['momos-plate', 'prop', 'Something new', 'A plate of momos (owner photo cut-out until replaced)', 1200, 900, true, false],
  ['susan-0', 'prop', 'Something new', 'Lazy susan dish 1: momos (owner photo cut-out until replaced)', 960, 960, true, false],
  ['susan-1', 'prop', 'Something new', 'Lazy susan dish 2: sticky sesame vegetables (owner photo cut-out)', 960, 960, true, false],
  ['susan-2', 'prop', 'Something new', 'Lazy susan dish 3: Malabar curry (owner photo cut-out)', 960, 960, true, false],
  ['susan-3', 'prop', 'Something new', 'Lazy susan dish 4: vegetable Hakka noodles (owner photo cut-out)', 960, 960, true, false],
  ['steamer-lid', 'prop', 'Something new', 'The steamer lid lifting', 1026, 736, true, false],
  ['friends-table', 'character', 'Something new', 'Fatt and Pundit at a long table after service, sharing a feast', 1776, 1336, true, false],
  ['dubai-skyline', 'backdrop', 'Next stop', 'Dubai skyline at dusk, a tall spire', 2688, 1144, true, false],
  ['dubai-dunes', 'backdrop', 'Next stop', 'Gold dunes, low buildings, palms', 2688, 680, true, false],
  ['dubai-travellers', 'character', 'Next stop', 'Fatt and Pundit with stamped suitcases, looking out', 1554, 1642, true, false],
  ['your-table', 'backdrop', 'Next stop', 'A laid table, an empty chair turned to the reader', 1980, 1508, true, false],
  ['table-tigers', 'character', 'Next stop', 'Fatt and Pundit waving the reader in', 1815, 1424, true, false],
  ['table-momos', 'prop', 'Next stop', 'Momos on the table (owner photo cut-out until replaced)', 1200, 900, true, false],
];

const layers: ArtSlotSpec[] = LAYERS.map(([id, kind, chapter, what, width, height, transparent, placeholder]) => ({
  id, kind, chapter, what, alt: '', placeholder,
  deliver: { width, height, transparent, layers: kind === 'character' ? 'Cut-out figure on transparency; separate arm/prop layer welcome for animation' : transparent ? 'Single layer on transparency' : 'Single flat layer' },
  file: `src/assets/images/story/layers/${id}.webp`,
}));

export const ART_SLOTS: ArtSlotSpec[] = [...panels, ...layers];
