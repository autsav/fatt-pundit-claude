// Turns a door-scene clip into numbered AVIF + WebP frames and merges the cut into public/doors/v1/manifest.json.
//   node scripts/extract-door-frames.mjs --cut land|port --src clip.mp4 --front l,t,w,h [--count 96] [--allow-aspect]
//   node scripts/extract-door-frames.mjs --cut land|port --placeholder      (ffmpeg testsrc2, front 0,0,1,1)
// --front is SOURCE-relative: fractions of the source clip frame (may overflow 0..1). Measure it on the clip's
// own frame 0, not copied from plates.json: the generator may have stretched or cropped the plate.
// It is converted through the cover scale + centre crop into cut-frame fractions before it goes in the manifest,
// and must then keep the coded front's aspect (4096/3089) within 0.5 %, or the run fails (--allow-aspect skips it).
// ffmpeg decodes (no AVIF/WebP encoder in the Homebrew build); sharp, already shipped with Astro, encodes.
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';
import { frontToCut, frontAspectError, FRONT_ASPECT } from './door-front.mjs';

const SIZE = { land: [1600, 900], port: [900, 1600] };
// AVIF set budgets in bytes (docs: land <= 3 MB, port <= 1.5 MB); 3% headroom.
const BUDGET = { land: 3 * 1024 * 1024 * 0.97, port: 1.5 * 1024 * 1024 * 0.97 };
const FFMPEG = process.env.FFMPEG || (existsSync('/opt/homebrew/bin/ffmpeg') ? '/opt/homebrew/bin/ffmpeg' : 'ffmpeg');
const OUT = 'public/doors/v1';

const args = process.argv.slice(2);
const flag = (n) => args.includes(`--${n}`);
const opt = (n, d) => (args.includes(`--${n}`) ? args[args.indexOf(`--${n}`) + 1] : d);

const cut = opt('cut');
if (!SIZE[cut]) throw new Error('--cut must be land or port');
const [w, h] = SIZE[cut];
const count = Number(opt('count', 96));
const placeholder = flag('placeholder');
const src = opt('src');
const srcFront = placeholder ? [0, 0, 1, 1] : (opt('front', '') || '').split(',').map(Number);
if (!placeholder && (!src || srcFront.length !== 4 || srcFront.some((n) => !Number.isFinite(n)))) {
  throw new Error('need --src <mp4> and --front l,t,w,h (or --placeholder)');
}

// Placeholder source already matches the cut, so the conversion is the identity.
const srcSize = placeholder
  ? [w, h]
  : execFileSync(FFMPEG.replace(/ffmpeg$/, 'ffprobe'), ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', src])
      .toString().trim().split(',').map(Number);
const front = frontToCut(srcFront, srcSize, [w, h]).map((n) => Math.round(n * 1e5) / 1e5);
const aspectErr = frontAspectError(front, [w, h]);
if (!placeholder && !flag('allow-aspect') && aspectErr > 0.005) {
  const got = ((front[2] * w) / (front[3] * h)).toFixed(4);
  throw new Error(`front box aspect ${got} is ${(aspectErr * 100).toFixed(1)} % off the coded front's ${FRONT_ASPECT.toFixed(4)}: ` +
    `re-measure --front on the clip's own frame 0 (or pass --allow-aspect)`);
}

const tmp = mkdtempSync(join(tmpdir(), 'doors-'));
try {
  // Decode to PNGs: cover-scale + centre-crop to the cut size.
  const input = placeholder
    ? ['-f', 'lavfi', '-i', `testsrc2=size=${w}x${h}:rate=24`, '-frames:v', String(count)]
    // in_color_matrix pins YUV->RGB to BT.709 (format=rgb24 keeps that conversion in this scaler), so frame 0
    // matches the coded front's colour whatever the clip's tags say.
    : ['-i', src, '-vf', `scale=${w}:${h}:force_original_aspect_ratio=increase:in_color_matrix=bt709,format=rgb24,crop=${w}:${h}`];
  execFileSync(FFMPEG, ['-v', 'error', '-y', ...input, join(tmp, 'f%04d.png')], { stdio: 'inherit' });
  const all = readdirSync(tmp).filter((f) => f.endsWith('.png')).sort();
  if (all.length < count) throw new Error(`clip has ${all.length} frames, need ${count}`);
  // Evenly spaced, first and last included.
  const picks = Array.from({ length: count }, (_, i) => all[Math.round((i * (all.length - 1)) / (count - 1))]);

  const dir = join(OUT, cut);
  mkdirSync(dir, { recursive: true });
  // Lower AVIF quality until the set fits the budget.
  let q = 55;
  let total = Infinity;
  for (; q >= 20 && total > BUDGET[cut]; q -= 5) {
    total = 0;
    for (let i = 0; i < count; i++) {
      const name = String(i).padStart(3, '0');
      total += (await sharp(join(tmp, picks[i])).avif({ quality: q, effort: 4 }).toFile(join(dir, `${name}.avif`))).size;
    }
  }
  for (let i = 0; i < count; i++) {
    await sharp(join(tmp, picks[i])).webp({ quality: 72 }).toFile(join(dir, `${String(i).padStart(3, '0')}.webp`));
  }
  const sum = (ext) => readdirSync(dir).filter((f) => f.endsWith(ext)).reduce((t, f) => t + statSync(join(dir, f)).size, 0);
  if (sum('.avif') > BUDGET[cut] / 0.97) throw new Error(`AVIF set ${sum('.avif')} B over budget even at q=${q + 5}`);

  const mpath = join(OUT, 'manifest.json');
  const manifest = existsSync(mpath) ? JSON.parse(readFileSync(mpath, 'utf8')) : { version: 'v1', cuts: {} };
  manifest.cuts[cut] = { count, w, h, front };
  writeFileSync(mpath, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`${cut}: ${count} frames, AVIF ${(sum('.avif') / 1024).toFixed(0)} KB (q=${q + 5}), WebP ${(sum('.webp') / 1024).toFixed(0)} KB`);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
