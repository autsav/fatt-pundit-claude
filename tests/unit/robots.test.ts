import { describe, it, expect, vi, afterEach } from 'vitest';
import { GET } from '../../src/pages/robots.txt';

const body = async () => (await (GET as (c: { site: URL }) => Response)({ site: new URL('https://www.fattpundit.co.uk') })).text();
afterEach(() => vi.unstubAllEnvs());

describe('robots.txt', () => {
  it('preview builds block everything', async () => {
    vi.stubEnv('PUBLIC_LAUNCH', '');
    expect(await body()).toContain('Disallow: /\n');
  });
  // AUDIT B-07: share images must stay fetchable by link-preview crawlers that honour robots.txt.
  it('launch builds leave /og/ crawlable (noindex comes from the header)', async () => {
    vi.stubEnv('PUBLIC_LAUNCH', 'true');
    const t = await body();
    expect(t).not.toContain('Disallow: /og/');
    expect(t).toContain('Disallow: /styleguide/');
    expect(t).toContain('Sitemap: https://www.fattpundit.co.uk/sitemap.xml');
  });
});

it('the /og/ header rule keeps share images out of search', async () => {
  const { readFileSync } = await import('node:fs');
  const v = JSON.parse(readFileSync('vercel.json', 'utf8'));
  const og = v.headers.find((h: { source: string }) => h.source === '/og/(.*)');
  expect(og.headers).toContainEqual({ key: 'X-Robots-Tag', value: 'noindex' });
  expect(readFileSync('public/_headers', 'utf8')).toMatch(/\/og\/\*\n(.+\n)*\s+X-Robots-Tag: noindex/);
});
