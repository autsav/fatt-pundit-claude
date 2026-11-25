import type { APIRoute } from 'astro';

// Preview builds keep search engines out; PUBLIC_LAUNCH=true opens the site.
export const GET: APIRoute = ({ site }) => {
  const launched = import.meta.env.PUBLIC_LAUNCH === 'true';
  const sitemap = new URL('/sitemap.xml', site ?? 'https://www.fattpundit.co.uk').href;
  const body = launched
    // /og/ stays crawlable so link-preview crawlers that obey robots.txt (X) can fetch the share images;
    // the X-Robots-Tag: noindex header on /og/* (vercel.json, public/_headers) keeps it out of search (AUDIT B-07).
    ? `User-agent: *\nAllow: /\nDisallow: /styleguide/\n\nSitemap: ${sitemap}\n`
    : `User-agent: *\nDisallow: /\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
