import type { APIRoute } from 'astro';
import { publicPaths } from '../lib/pages';

export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL('https://www.fattpundit.co.uk');
  const urls = (await publicPaths()).map((p) => `  <url><loc>${new URL(p, base).href}</loc></url>`).join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
