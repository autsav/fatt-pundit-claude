// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

const at = './src/assets/fonts/american-typewriter';
// Licence backup (tasks/todo.md "Launch blockers"): build with FONT_BACKUP=1 to swap the unlicensed
// American Typewriter files for Kameron (SIL Open Font Licence), the closest free proportional slab
// with a real bold. Same CSS variable, so nothing else changes. Default stays the guideline font.
const backup = process.env.FONT_BACKUP === '1';
const kam = '@fontsource/kameron/files/kameron-latin';
// Variants are written inline in `fonts` below: a separate const widens to string[]
// and fails astro check (Astro wants a non-empty tuple of Variant).

export default defineConfig({
  site: 'https://www.fattpundit.co.uk',
  trailingSlash: 'always',
  // 'auto' (inline only tiny sheets): measured 18 Nov, inlining all 88 KB of CSS
  // made first paint slower (1.2 s -> 2.2 s on home) than three cached files.
  build: { inlineStylesheets: 'auto' },
  integrations: [react()],
  // Small per-component CSS (header, footer, scene styles) goes inline; only
  // the big shared sheet stays a file. Images under the limit are unaffected
  // in practice (the smallest real image is 8 KB of palette PNG and stays a file at 6 KB).
  vite: { plugins: [tailwindcss()], build: { assetsInlineLimit: 6144 } },
  fonts: [
    {
      // Brand guidelines: titles Bold, copy Regular.
      // LICENCE: these files came from ufonts.com, not a licensed foundry.
      // Replace with licensed ITC American Typewriter web fonts before launch
      // (same filenames = no code change). See tasks/todo.md "Launch blockers".
      provider: fontProviders.local(),
      name: backup ? 'Kameron' : 'American Typewriter',
      cssVariable: '--font-typewriter',
      fallbacks: ['Courier New', 'monospace'],
      options: {
        variants: backup
          ? [
              { src: [`${kam}-400-normal.woff2`], weight: 400, style: 'normal' },
              { src: [`${kam}-700-normal.woff2`], weight: 700, style: 'normal' },
            ]
          : [
              { src: [`${at}/american-typewriter-light.woff2`], weight: 300, style: 'normal' },
              { src: [`${at}/american-typewriter-regular.woff2`], weight: 400, style: 'normal' },
              { src: [`${at}/american-typewriter-bold.woff2`], weight: 700, style: 'normal' },
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
