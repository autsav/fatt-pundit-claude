/**
 * The story-art manifest (AUDIT B-08): slot id → file, alt, width, height, placeholder.
 * StoryComic and SceneArt read story art only through storyArt(); a name that isn't a slot fails the build,
 * so every picture on /our-story/ is accounted for in src/data/story-art-slots.ts and docs/ILLUSTRATOR-BRIEF.md.
 */
import { ART_SLOTS, type ArtSlotSpec } from './story-art-slots.ts';

const files = import.meta.glob<{ default: ImageMetadata }>('../assets/images/story/{*,layers/*}.{jpg,jpeg,png,webp,avif}', { eager: true });
// Key: 'p01-harbour' for a panel, 'layers/harbour-fatt' for a scene layer.
const byKey = new Map(Object.entries(files).map(([path, m]) => [`${path.includes('/layers/') ? 'layers/' : ''}${path.split('/').pop()!.replace(/\.\w+$/, '')}`, m.default]));

export interface ArtSlot extends ArtSlotSpec {
  /** The art in place (illustrator's or stand-in); undefined when the slot still shows a storyboard card or a fallback. */
  image?: ImageMetadata;
  width: number;
  height: number;
}

export const STORY_ART: Record<string, ArtSlot> = Object.fromEntries(
  ART_SLOTS.map((s) => {
    const image = byKey.get(`${s.kind === 'panel' ? '' : 'layers/'}${s.id}`);
    return [s.id, { ...s, image, width: image?.width ?? s.deliver.width, height: image?.height ?? s.deliver.height }];
  }),
);

export const storyArt = (id: string): ArtSlot => {
  const slot = STORY_ART[id];
  if (!slot) throw new Error(`story-art: "${id}" is not a slot in src/data/story-art-slots.ts`);
  return slot;
};
