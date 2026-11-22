#!/usr/bin/env node
/**
 * Renders the 1200x630 link-preview (Open Graph) cards to PNG.
 *
 * WhatsApp, Facebook, LinkedIn and X do NOT accept SVG for og:image, so these
 * have to be real raster images. Malayalam needs correct shaping, which means a
 * real Malayalam webfont and a browser to lay it out — hence Chromium.
 *
 * Output goes to content/og/*.png and is COMMITTED to the repo. build.mjs just
 * copies it, so normal builds and CI need no browser at all. Re-run this only
 * when a title in site.config.json changes:  npm run og
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const CFG = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.config.json'), 'utf8'));
const OUT = path.join(ROOT, 'content', 'og');
fs.mkdirSync(OUT, { recursive: true });

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const card = (ml, en, n) => `<!doctype html><html lang="ml"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anek+Malayalam:wght@600;700&family=Manjari:wght@400;700&family=IBM+Plex+Sans:wght@500;600&display=swap">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:1200px;height:630px;background:#f3f4ee;overflow:hidden;position:relative}
  .top{height:12px;background:#245f46}
  .top2{position:absolute;top:12px;left:0;width:400px;height:6px;background:#a04a35}
  .pad{position:absolute;top:18px;bottom:112px;left:0;right:0;padding:0 80px;
       display:flex;flex-direction:column;justify-content:center}
  .route{font-family:'IBM Plex Sans',sans-serif;font-size:23px;font-weight:600;letter-spacing:3px;color:#a04a35}
  .n{position:absolute;top:96px;right:80px;font-family:'IBM Plex Sans',sans-serif;font-size:27px;font-weight:600;color:#8f9a94}
  h1{font-family:'Anek Malayalam','Manjari',sans-serif;font-weight:700;font-size:64px;line-height:1.2;
     color:#131c18;margin-top:40px;max-width:1010px;letter-spacing:-.5px}
  h2{font-family:'IBM Plex Sans',sans-serif;font-weight:500;font-size:31px;line-height:1.35;
     color:#4e5a54;margin-top:26px;max-width:960px}
  .foot{position:absolute;left:80px;right:80px;bottom:44px;display:flex;justify-content:space-between;
        align-items:baseline;border-top:2px solid #d6dad1;padding-top:22px;
        font-family:'IBM Plex Sans',sans-serif;font-size:24px;color:#4e5a54}
  .foot span:last-child{color:#8f9a94}
</style></head><body>
<div class="top"></div><div class="top2"></div>
${n ? `<div class="n">${esc(n)}</div>` : ''}
<div class="pad">
  <div class="route">KERALA &nbsp;———&nbsp; AUSTRALIA</div>
  <h1>${esc(ml)}</h1>
  <h2>${esc(en)}</h2>
</div>
<div class="foot"><span>${esc(CFG.siteNameEn)}</span><span>${esc(CFG.author)}</span></div>
</body></html>`;

const jobs = [
  { file: 'og.png', ml: CFG.tagline, en: CFG.taglineEn, n: '' },
  ...CFG.sections.map((s, i) => ({
    file: `og-${s.slug}.png`, ml: s.title, en: s.titleEn, n: String(i + 1).padStart(2, '0'),
  })),
];

const browser = await chromium.launch();
const pg = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
for (const j of jobs) {
  await pg.setContent(card(j.ml, j.en, j.n), { waitUntil: 'load' });
  await pg.evaluate(() => document.fonts.ready);
  await pg.waitForTimeout(250);
  await pg.screenshot({ path: path.join(OUT, j.file), type: 'png' });
  console.log('  ' + j.file);
}
await browser.close();
console.log(`rendered ${jobs.length} link-preview cards to content/og/`);
