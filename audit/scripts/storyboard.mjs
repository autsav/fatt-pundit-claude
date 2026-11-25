// Renders audit/storyboard/index.html to JPEG pages for review away from the repo.
import { chromium } from '@playwright/test';
import { join } from 'node:path';
const dir = join(import.meta.dirname, '..', 'storyboard');
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
await p.goto('file://' + join(dir, 'index.html')); await p.waitForTimeout(800);
await p.screenshot({ path: join(dir, 'storyboard--1280.jpg'), fullPage: true, type: 'jpeg', quality: 70 });
await b.close();
