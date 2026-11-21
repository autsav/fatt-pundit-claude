import type { ImageMetadata } from 'astro';

/** Approved dish photographs, keyed by dish id (file name = dish id). Only the dishes folder is globbed. */
const files = import.meta.glob<{ default: ImageMetadata }>('../assets/images/dishes/*.jpg', { eager: true });
export const dishPhotos: Record<string, ImageMetadata> = Object.fromEntries(
  Object.entries(files).map(([path, mod]) => [path.split('/').pop()!.replace(/\.jpg$/, ''), mod.default]),
);
export const dishPhoto = (id: string): ImageMetadata | undefined => dishPhotos[id];
