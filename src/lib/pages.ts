/** Every public page, for the sitemap. Add new pages here. */
import { getBranches } from './site-data';

export const INFO_PAGES = ['/private-dining/', '/allergens/', '/accessibility/', '/privacy/', '/booking-terms/'];

export async function publicPaths() {
  const branches = await getBranches();
  return ['/', '/our-story/', ...branches.flatMap((b) => [`/${b.id}/`, ...(b.status === 'open' ? [`/${b.id}/menu/`] : [])]), ...INFO_PAGES];
}
