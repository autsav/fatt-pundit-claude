// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

const at = './src/assets/fonts/american-typewriter';

export default defineConfig({
  site: 'https://www.fattpundit.co.uk',
  trailingSlash: 'always',
  vite: { plugins: [tailwindcss()] },
  fonts: [
    {
      // Brand guidelines: titles Bold, copy Regular.
      // LICENCE: these files came from ufonts.com, not a licensed foundry.
      // Replace with licensed ITC American Typewriter web fonts before launch
      // (same filenames = no code change). See tasks/todo.md "Launch blockers".
      provider: fontProviders.local(),
      name: 'American Typewriter',
      cssVariable: '--font-typewriter',
      fallbacks: ['Courier New', 'monospace'],
      options: {
        variants: [
          { src: [`${at}/american-typewriter-light.woff2`], weight: 300, style: 'normal' },
          { src: [`${at}/american-typewriter-regular.woff2`], weight: 400, style: 'normal' },
          { src: [`${at}/american-typewriter-bold.woff2`], weight: 700, style: 'normal' },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'American Typewriter Condensed',
      cssVariable: '--font-typewriter-condensed',
      fallbacks: ['Courier New', 'monospace'],
      options: {
        variants: [
          { src: [`${at}/american-typewriter-condensed-light.woff2`], weight: 300, style: 'normal' },
          { src: [`${at}/american-typewriter-condensed.woff2`], weight: 400, style: 'normal' },
          { src: [`${at}/american-typewriter-condensed-bold.woff2`], weight: 700, style: 'normal' },
        ],
      },
    },
    {
      // Brand guidelines: notes/captions in Lora Medium Italic (OFL, free).
      provider: fontProviders.local(),
      name: 'Lora',
      cssVariable: '--font-lora',
      fallbacks: ['Georgia', 'serif'],
      options: {
        variants: [
          { src: ['@fontsource/lora/files/lora-latin-500-italic.woff2'], weight: 500, style: 'italic' },
        ],
      },
    },
  ],
});
