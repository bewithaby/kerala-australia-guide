#!/usr/bin/env node
/**
 * Renders the 1200x630 link-preview (Open Graph) cards.
 *
 * WhatsApp, Facebook, LinkedIn and X do NOT accept SVG for og:image, so these
 * have to be real raster images. Malayalam needs correct shaping, which means a
 * real Malayalam webfont and a browser to lay it out, hence Chromium. That also
 * means this has to run somewhere with network access to Google Fonts.
 *
 * JPEG, not PNG. These cards carry a photograph now, and a 1200x630 PNG of a
 * photograph lands around 700KB. WhatsApp stops showing the big preview and
 * falls back to a thumbnail, or nothing, once the image gets heavy. JPEG at
 * quality 84 lands near 120KB and looks identical at preview size.
 *
 * Output goes to content/og/*.jpg and is COMMITTED to the repo. build.mjs just
 * copies it, so normal builds and CI need no browser at all. Re-run this when a
 * title or a section image changes:  npm run og
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const CFG = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.config.json'), 'utf8'));
const OUT = path.join(ROOT, 'content', 'og');
const PHOTOS = path.join(ROOT, 'content', 'photos');
fs.mkdirSync(OUT, { recursive: true });

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* setContent gives the page no base URL, so a file path in <img src> resolves
   against nothing and silently renders an empty box. Inline the bytes instead. */
function dataUri(name) {
  for (const ext of ['jpg', 'jpeg', 'png', 'webp']) {
    const p = path.join(PHOTOS, `${name}.${ext}`);
    if (fs.existsSync(p)) {
      const mime = ext === 'jpg' ? 'jpeg' : ext;
      return `data:image/${mime};base64,${fs.readFileSync(p).toString('base64')}`;
    }
  }
  return null;
}

/* Long Malayalam titles need to come down a step or two, or they overrun the
   card. Measured on the longest title in the config rather than guessed. */
const titleSize = (s) => (s.length > 34 ? 46 : s.length > 24 ? 54 : 62);

const card = (ml, en, n, img) => `<!doctype html><html lang="ml"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anek+Malayalam:wght@600;700&family=Manjari:wght@400;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:1200px;height:630px;background:#F5F7FB;overflow:hidden;position:relative;
       font-family:'Plus Jakarta Sans',sans-serif}
  .bar{position:absolute;top:0;left:0;right:0;height:10px;
       background:linear-gradient(90deg,#4F46E5,#0D9488)}
  ${img ? `
  .art{position:absolute;top:10px;right:0;bottom:0;width:470px;overflow:hidden}
  .art img{width:100%;height:100%;object-fit:cover;display:block}
  /* Feather the inner edge so the photo sits on the card rather than being
     pasted onto it. */
  .art::after{content:"";position:absolute;inset:0;
    background:linear-gradient(90deg,#F5F7FB,rgba(245,247,251,.72) 14%,rgba(245,247,251,0) 42%)}
  ` : ''}
  /* The art panel starts at x=730, so the text column has to end before it.
     Running under the feathered edge looked like a layering mistake. */
  .pad{position:absolute;top:10px;bottom:96px;left:0;width:${img ? '730px' : '1200px'};
       padding:0 ${img ? '28px' : '80px'} 0 70px;
       display:flex;flex-direction:column;justify-content:center}
  .route{font-size:21px;font-weight:700;letter-spacing:3.4px;color:#4F46E5}
  .n{position:absolute;top:0;right:0;font-size:21px;font-weight:700;color:#94A3B8}
  .rt{position:relative;display:flex;align-items:baseline}
  h1{font-family:'Anek Malayalam','Manjari',sans-serif;font-weight:700;
     font-size:${titleSize(ml)}px;line-height:1.24;color:#0F172A;margin-top:26px;letter-spacing:-.4px}
  h2{font-weight:600;font-size:26px;line-height:1.38;color:#5B6B84;margin-top:20px}
  .foot{position:absolute;left:70px;${img ? 'width:632px;' : 'right:80px;'}bottom:40px;
        display:flex;justify-content:space-between;align-items:baseline;
        border-top:2px solid #E4E9F2;padding-top:20px;font-size:22px;font-weight:600;color:#5B6B84}
  .foot span:last-child{color:#94A3B8}
</style></head><body>
<div class="bar"></div>
${img ? `<div class="art"><img src="${img}"></div>` : ''}
<div class="pad">
  <div class="rt"><div class="route">KERALA &nbsp;———&nbsp; AUSTRALIA</div>${n ? `<div class="n">${esc(n)}</div>` : ''}</div>
  <h1>${esc(ml)}</h1>
  <h2>${esc(en)}</h2>
</div>
<div class="foot"><span>${esc(CFG.siteNameEn)}</span><span>${esc(CFG.author)}</span></div>
</body></html>`;

const jobs = [
  { file: 'og.jpg', ml: CFG.tagline, en: CFG.taglineEn, n: '', img: dataUri('hero') },
  ...CFG.sections.map((s, i) => ({
    file: `og-${s.slug}.jpg`,
    ml: s.title,
    en: s.titleEn,
    n: String(i + 1).padStart(2, '0'),
    img: dataUri(s.slug) || dataUri('hero'),
  })),
];

const browser = await chromium.launch();
const pg = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
let biggest = 0;
for (const j of jobs) {
  await pg.setContent(card(j.ml, j.en, j.n, j.img), { waitUntil: 'load' });
  await pg.evaluate(() => document.fonts.ready);
  await pg.waitForTimeout(220);
  const file = path.join(OUT, j.file);
  await pg.screenshot({ path: file, type: 'jpeg', quality: 84 });
  const kb = Math.round(fs.statSync(file).size / 1024);
  biggest = Math.max(biggest, kb);
  /* drop the PNG this replaces, so the build cannot keep serving a stale card */
  const stale = file.replace(/\.jpg$/, '.png');
  if (fs.existsSync(stale)) fs.unlinkSync(stale);
  console.log(`  ${j.file.padEnd(32)} ${String(kb).padStart(4)}KB${j.img ? '' : '   (no image)'}`);
}
await browser.close();
console.log(`\nrendered ${jobs.length} cards to content/og/  (largest ${biggest}KB)`);
if (biggest > 290) {
  console.log('WARNING: over ~290KB, WhatsApp may drop the large preview. Lower the quality.');
}
