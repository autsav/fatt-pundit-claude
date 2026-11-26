/**
 * Menu page DOM -> ImageBitmap, for the WebGL page-turn book. Built at run time as an SVG
 * <foreignObject> holding a clone of the page, with its CSS, fonts and images all inlined as data: URLs so
 * the SVG image is self-contained (an external resource would not load there, and would taint the canvas).
 */

const NS = 'http://www.w3.org/1999/xhtml';
const SVG = 'http://www.w3.org/2000/svg';
const urls = new Map<string, Promise<string>>();
let cssP: Promise<string> | undefined;

/** Fetch a URL once, as a data: URL. */
function dataUrl(url: string): Promise<string> {
  let p = urls.get(url);
  if (!p) {
    p = fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status} ${url}`);
        return r.blob();
      })
      .then((b) => new Promise<string>((ok, no) => {
        const fr = new FileReader();
        fr.onload = () => ok(fr.result as string);
        fr.onerror = () => no(fr.error);
        fr.readAsDataURL(b);
      }));
    urls.set(url, p);
    p.catch(() => urls.delete(url)); // a failure isn't cached: the next face tries again
  }
  return p;
}

/** Replace every url(...) in `text` (resolved against `base`) with a data: URL. */
async function inlineUrls(text: string, base: string): Promise<string> {
  const re = /url\(\s*(["']?)(?!data:|#)(.+?)\1\s*\)/g;
  const found = [...text.matchAll(re)];
  const out = await Promise.all(found.map((m) => {
    try {
      return dataUrl(new URL(m[2], base).href).catch(() => m[2]);
    } catch {
      return m[2]; // a malformed url() stays as written
    }
  }));
  let i = 0;
  return text.replace(re, (m) => (out[i].startsWith('data:') ? `url("${out[i++]}")` : (i++, m)));
}

/** All the page's CSS in one string, @font-face fonts inlined. Same-origin sheets only. */
function pageCss(): Promise<string> {
  cssP ??= (async () => {
    const parts: string[] = [];
    for (const sheet of document.styleSheets) {
      let rules: CSSRuleList;
      try { rules = sheet.cssRules; } catch { continue; }
      const base = sheet.href || document.baseURI;
      for (const r of rules) {
        // Only @font-face has urls worth embedding; the page's other urls sit in inline styles.
        parts.push(r instanceof CSSFontFaceRule ? await inlineUrls(r.cssText, base) : r.cssText);
      }
    }
    return parts.join('\n');
  })();
  cssP.catch(() => (cssP = undefined));
  return cssP;
}

/** Draws `el` (laid out at its own CSS width) into an ImageBitmap `width` device px wide, same aspect as el. */
export async function rasterPage(el: HTMLElement, width: number): Promise<ImageBitmap> {
  const w = el.offsetWidth;
  const h = el.offsetHeight;
  const cs = getComputedStyle(el);
  const clone = el.cloneNode(true) as HTMLElement;

  // Images and inline-style urls (frame border-image, masks) -> data: URLs.
  const src = [el, ...el.querySelectorAll('*')] as HTMLElement[];
  const dst = [clone, ...clone.querySelectorAll('*')] as HTMLElement[];
  await Promise.all(dst.map(async (n, i) => {
    const o = src[i];
    if (o instanceof HTMLImageElement) {
      // An <svg><image> stands in for the <img>: WebKit draws no <img> (nor background) holding a webp
      // inside foreignObject, but does draw <image>. object-fit maps onto preserveAspectRatio.
      const s = document.createElementNS(SVG, 'svg');
      const im = document.createElementNS(SVG, 'image');
      const fit = getComputedStyle(o).objectFit;
      s.setAttribute('class', n.className);
      s.setAttribute('style', n.getAttribute('style') ?? '');
      // A lazy img that never loaded has no natural size yet; its width/height attributes give the ratio.
      const iw = o.naturalWidth || o.width || 1;
      const ih = o.naturalHeight || o.height || 1;
      s.setAttribute('viewBox', `0 0 ${iw} ${ih}`);
      s.setAttribute('preserveAspectRatio', fit === 'cover' ? 'xMidYMid slice' : fit === 'fill' ? 'none' : 'xMidYMid meet');
      // An image that can't be fetched keeps its URL: the face still draws, maybe without that photo.
      const url = o.currentSrc || o.src;
      im.setAttribute('href', url ? await dataUrl(url).catch(() => url) : '');
      im.setAttribute('width', String(iw));
      im.setAttribute('height', String(ih));
      s.append(im);
      n.replaceWith(s);
      return;
    }
    const st = n.getAttribute('style');
    if (st?.includes('url(')) n.setAttribute('style', await inlineUrls(st, document.baseURI));
  }));

  // The clone sits in a stand-in for the page's container (cqw units) and inherited text styles.
  const box = document.createElement('div');
  box.setAttribute('style', `width:${w}px;height:${h}px;container-type:inline-size;position:relative;overflow:hidden;color:${cs.color};font:${cs.font}`);
  box.append(clone);
  clone.style.cssText += ';position:relative;width:100%;height:100%;inset:0;transform:none';
  box.setAttribute('xmlns', NS);

  const css = await pageCss();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><foreignObject width="100%" height="100%"><style xmlns="${NS}">${css.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</style>${new XMLSerializer().serializeToString(box)}</foreignObject></svg>`;

  const img = new Image();
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  await img.decode();

  // Through a canvas so the target size is exact; `width` is device px.
  const hh = Math.round((width * h) / w);
  const c = new OffscreenCanvas(width, hh);
  c.getContext('2d')!.drawImage(img, 0, 0, width, hh);
  return createImageBitmap(c);
}
