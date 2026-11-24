// Screenshot the two direction mocks (audit/mocks/*.html) at 1280 and 375, full page.
import { chromium } from '@playwright/test';
import { join } from 'node:path';
const dir = join(import.meta.dirname, '..', 'mocks');
const b = await chromium.launch();
for (const d of ['direction-a', 'direction-b']) for (const w of [1280, 375]) {
  const p = await b.newPage({ viewport: { width: w, height: w > 700 ? 800 : 812 }, deviceScaleFactor: 1 });
  await p.goto('file://' + join(dir, d + '.html')); await p.waitForTimeout(800);
  await p.screenshot({ path: join(dir, `${d}--${w}.jpg`), fullPage: true, type: 'jpeg', quality: 72 });
  await p.close();
}
await b.close();
