import { getImage } from 'astro:assets';

/**
 * Stamps, tiger heads and logos are flat ink with a distressed edge. WebP/AVIF
 * spend most of their bytes on that noise; a palette PNG (sharp quantises a PNG
 * when quality < 100) keeps it crisp at about a third of the size.
 */
export const stampSrc = async (src: ImageMetadata, width: number) =>
  (await getImage({ src, width, format: 'png', quality: 30 })).src;
