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
  it('launch builds allow the share images but not their source pages', async () => {
    vi.stubEnv('PUBLIC_LAUNCH', 'true');
    const t = await body();
    const lines = t.split('\n');
    expect(lines.indexOf('Allow: /og/*.png')).toBeGreaterThan(-1);
    expect(lines.indexOf('Allow: /og/*.png')).toBeLessThan(lines.indexOf('Disallow: /og/'));
    expect(t).toContain('Sitemap: https://www.fattpundit.co.uk/sitemap.xml');
  });
});
