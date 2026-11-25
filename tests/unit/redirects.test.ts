import { describe, it, expect } from 'vitest';
import vercel from '../../vercel.json';

// Owner, 25 Nov 2026: there is no private dining; the groups page lives at /groups/ and old links keep working.
describe('redirects', () => {
  it('sends /private-dining (with or without the slash) to /groups/ permanently', () => {
    for (const source of ['/private-dining', '/private-dining/']) {
      const r = vercel.redirects.find((x: { source: string }) => x.source === source) as { destination: string; statusCode?: number; permanent?: boolean } | undefined;
      expect(r, source).toBeDefined();
      expect(r!.destination).toBe('/groups/');
      expect(r!.statusCode === 308 || r!.permanent === true).toBe(true);
    }
  });
});
