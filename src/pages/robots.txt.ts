import type { APIRoute } from 'astro';

// Preview builds keep search engines out; PUBLIC_LAUNCH=true opens the site.
export const GET: APIRoute = ({ site }) => {
  const launched = import.meta.env.PUBLIC_LAUNCH === 'true';
  const sitemap = new URL('/sitemap.xml', site ?? 'https://www.fattpundit.co.uk').href;
  const body = launched
    // The share images (/og/*.png) stay fetchable for link-preview crawlers that obey robots.txt (X);
    // only their HTML source pages (/og/<id>/) are kept out (AUDIT B-07). Allow first for first-match parsers.
    ? `User-agent: *\nAllow: /\nAllow: /og/*.png\nDisallow: /og/\nDisallow: /styleguide/\n\nSitemap: ${sitemap}\n`
    : `User-agent: *\nDisallow: /\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
