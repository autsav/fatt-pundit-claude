#!/usr/bin/env node
/**
 * Photographs the share cards (/og/<id>/) into public/og/<id>.png.
 * Run after a build, with the preview server up:
 *   npx astro build && npx astro preview --port 4321 &
 *   node scripts/make-og.mjs
 * Re-run when a branch name, address or opening status changes.
 */
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const BASE = process.env.BASE ?? 'http://localhost:4321';
const IDS = ['home', 'soho', 'covent-garden', 'dubai'];
const { chromium } = await import(process.env.PLAYWRIGHT ?? 'playwright');
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome' });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
mkdirSync(new URL('../public/og/', import.meta.url), { recursive: true });
for (const id of IDS) {
  await page.goto(`${BASE}/og/${id}/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  // fileURLToPath, not .pathname: on Windows .pathname is "/C:/…", which the screenshot can't write to.
  const path = fileURLToPath(new URL(`../public/og/${id}.png`, import.meta.url));
  await page.screenshot({ path, type: 'png' });
  console.log('wrote', path);
}
await browser.close();
