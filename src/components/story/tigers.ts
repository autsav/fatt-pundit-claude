/** The two tigers of "Choose your tiger" (pending client approval, docs/STORY-DIRECTOR-PLAN.md §3, §9).
 *  Delete this file, ChooseTiger.astro, src/pages/our-story/ and the fatt/pundit cards to remove the feature. */
import fatt from '../../assets/images/brand/tiger-head-right.png';
import pundit from '../../assets/images/brand/tiger-head-left.png';

export const TIGERS = {
  fatt: { id: 'fatt', name: 'Fatt', trait: 'Wok', line: 'Hotter wok!', image: fatt, path: '/our-story/fatt/', alt: 'Fatt, the tiger in the beaded crown' },
  pundit: { id: 'pundit', name: 'Pundit', trait: 'Spice', line: 'More chilli!', image: pundit, path: '/our-story/pundit/', alt: 'Pundit, the tiger in the turban' },
} as const;
export type TigerId = keyof typeof TIGERS;
export const TIGER_IDS = Object.keys(TIGERS) as TigerId[];
