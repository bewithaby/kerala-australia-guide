#!/usr/bin/env node
/**
 * Splits content/guide.html (single source of truth) into a static multi-page site in dist/.
 * Nothing here needs editing for normal use — edit site.config.json and content/guide.html.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const CFG = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.config.json'), 'utf8'));
const SRC = fs.readFileSync(path.join(ROOT, 'content', 'guide.html'), 'utf8');
const DIST = path.join(ROOT, 'dist');

const BASE = (CFG.siteUrl.replace(/\/+$/, '')) + (CFG.basePath || '');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const strip = (h) => h.replace(/<(script|style)[\s\S]*?<\/\1>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();

/* ---------- 1. pull the shared parts out of the source ---------- */
const styleCss = SRC.slice(SRC.indexOf('<style>') + 7, SRC.indexOf('</style>'));
let appJs = SRC.slice(SRC.lastIndexOf('<script>') + 8, SRC.lastIndexOf('</script>'));

/* The single-page build highlighted the TOC with an IntersectionObserver over #sN
   anchors. Here the TOC links to other pages ("/etiquette/"), and feeding that to
   querySelector throws a SyntaxError that would kill the whole IIFE — taking the
   theme toggle and the checklist with it. Only observe in-page hash links. */
appJs = appJs.replace(
  /var targets = links\.map\(function\(a\)\{[\s\S]*?\.filter\(Boolean\);/,
  `var targets = links
    .filter(function(a){ return (a.getAttribute('href') || '').charAt(0) === '#'; })
    .map(function(a){ try { return document.querySelector(a.getAttribute('href')); } catch (e) { return null; } })
    .filter(Boolean);`
);
if (appJs.includes("document.querySelector(a.getAttribute('href')); }).filter(Boolean);")) {
  console.warn('! could not neutralise the single-page TOC observer — check assets/app.js');
}
const fontLink = (SRC.match(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^"]*">/) || [''])[0];

/* ---------- 2. slice each section out ---------- */
const marks = [...SRC.matchAll(/<section[^>]*\bid="(s\d+)"[^>]*>/g)].map((m) => ({ id: m[1], start: m.index, open: m[0] }));
const bodyOf = (i) => {
  const next = marks[i + 1] ? marks[i + 1].start : SRC.lastIndexOf('</main>');
  const chunk = SRC.slice(marks[i].start, next);
  return chunk.replace(/^<section[^>]*>/, '').replace(/<\/section>\s*$/, '').trim();
};
const sectionHtml = {};
marks.forEach((m, i) => { sectionHtml[m.id] = bodyOf(i); });

const sections = CFG.sections.filter((s) => sectionHtml[s.id]);
const missing = CFG.sections.filter((s) => !sectionHtml[s.id]).map((s) => s.id);
if (missing.length) console.warn('! config lists sections not found in guide.html:', missing.join(', '));

/* ---------- 3. page chrome ---------- */
const ICONS = {
  calendar: 'M7 3v3M17 3v3M3.5 9h17M5 5.5h14a1.5 1.5 0 0 1 1.5 1.5v12A1.5 1.5 0 0 1 19 20.5H5A1.5 1.5 0 0 1 3.5 19V7A1.5 1.5 0 0 1 5 5.5Z',
  speech: 'M20.5 11.5c0 3.9-3.8 7-8.5 7-1 0-2-.15-2.9-.42L4 20l1.3-3.6C4.2 15.1 3.5 13.4 3.5 11.5c0-3.9 3.8-7 8.5-7s8.5 3.1 8.5 7Z',
  home: 'M4 10.5 12 4l8 6.5M6 9.8V20h12V9.8M10 20v-5.5h4V20',
  food: 'M7 3v8a2.5 2.5 0 0 0 5 0V3M9.5 11v10M17 3c1.7 1.3 2.5 3 2.5 5.5S18.7 13 17 14v7',
  health: 'M12 20.5S4 15.6 4 10.2A4.2 4.2 0 0 1 12 8a4.2 4.2 0 0 1 8 2.2c0 5.4-8 10.3-8 10.3Z',
  work: 'M3.5 8.5h17v11h-17zM9 8.5V6a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 6v2.5M3.5 13h17',
  road: 'M8 4 5 20M16 4l3 16M12 4.5v3M12 11v3M12 17.5v3',
  school: 'M12 4 3 8.5l9 4.5 9-4.5L12 4ZM6.5 11v5.5c0 1.4 2.5 2.5 5.5 2.5s5.5-1.1 5.5-2.5V11',
  money: 'M3.5 7.5h17v9h-17zM12 9.8a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4M6.6 12h.01M17.4 12h.01',
  table: 'M3.5 6h17v12h-17zM3.5 10.5h17M3.5 14.5h17M9.5 6v12',
  check: 'M20.5 11.2V18a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9M8.5 12.2l3 3 8-8.5',
};
const icon = (name) => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS[name] || ICONS.table}"/></svg>`;

const url = (slug) => (slug ? `${BASE}/${slug}/` : `${BASE}/`);
const href = (slug) => (slug ? `${CFG.basePath || ''}/${slug}/` : `${CFG.basePath || ''}/`);

function nav(activeSlug) {
  const items = sections.map((s, i) =>
    `<li><a href="${href(s.slug)}"${s.slug === activeSlug ? ' class="active" aria-current="page"' : ''}>` +
    `<span class="n">${String(i + 1).padStart(2, '0')}</span><span>${s.title}<em>${esc(s.titleEn)}</em></span></a></li>`
  ).join('');
  return `<nav class="side" id="side" aria-label="${esc(CFG.siteNameEn)}">
    <a class="brand" href="${href('')}">${CFG.siteName}<em>${esc(CFG.siteNameEn)}</em></a>
    <form class="searchbox" role="search" onsubmit="return false"><input type="search" id="q" placeholder="തിരയുക / Search…" autocomplete="off" aria-label="Search the guide"></form>
    <div id="results" class="results" hidden></div>
    <div class="eyebrow">ഉള്ളടക്കം · Contents</div>
    <ul class="toc" id="toc">${items}</ul>
    <p class="sidenote">നിയമങ്ങൾ സംസ്ഥാനവും കൗൺസിലും അനുസരിച്ച് മാറും. അവസാന വാക്ക് ഔദ്യോഗിക ഉറവിടമാണ്.</p>
  </nav>`;
}

/* Adds anchor ids to every h3, builds an "on this page" strip, and drops it in
   AFTER the section heading and lede rather than above them. Also rewrites the
   hard-coded number badge, which was numbered for the old single-page order. */
function preparePage(html, n, s) {
  if (html.includes('class="sechead"')) {
    html = html.replace(/(<span class="num">)[\s\S]*?(<\/span>)/, `$1${String(n).padStart(2, '0')}$2`);
  } else {
    // s0 had no heading of its own on the single page — it needs one as a page.
    html = `<div class="wrap"><div class="sechead"><span class="num">${String(n).padStart(2, '0')}</span>` +
      `<h2>${s.title}</h2></div><p class="lede">${s.blurb}</p></div>` + html;
  }

  const hs = [...html.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/g)].map((m) => strip(m[1])).filter(Boolean);
  if (hs.length >= 3) {
    let i = 0;
    html = html.replace(/<h3([^>]*)>/g, (m, attrs) => `<h3${attrs} id="h${++i}">`);
    const strip_ = `<div class="onpage"><span>ഈ പേജിൽ</span>${hs.map((t, k) => `<a href="#h${k + 1}">${esc(t)}</a>`).join('')}</div>`;

    const afterLede = html.match(/<p class="lede">[\s\S]*?<\/p>/);
    const afterHead = html.match(/<div class="sechead">[\s\S]*?<\/div>/);
    const anchor = afterLede ? afterLede[0] : (afterHead ? afterHead[0] : null);
    html = anchor ? html.replace(anchor, anchor + strip_) : strip_ + html;
  }
  return html;
}

function volatileBox(s) {
  if (!s.volatile || !s.volatile.length) return '';
  const rows = s.volatile.map((v) => `<li>${v.what} — <a href="${esc(v.source)}" rel="noopener nofollow" target="_blank">ഔദ്യോഗിക ഉറവിടം</a></li>`).join('');
  return `<aside class="verify"><span class="tag">⟳ ഇവ മാറുന്ന വിവരങ്ങളാണ്</span><ul>${rows}</ul>
    <p>നിരക്കുകളും പരിധികളും സാധാരണ ജൂലൈ 1-ന് പുതുക്കും. തീരുമാനമെടുക്കുന്നതിന് മുൻപ് ഉറവിടം നോക്കുക.</p></aside>`;
}

function footer() {
  const src = CFG.officialSources.map((o) => `<a href="${esc(o.url)}" rel="noopener nofollow" target="_blank">${esc(o.label)}</a>`).join('');
  const fb = CFG.feedbackUrl
    ? `<a href="${esc(CFG.feedbackUrl)}" rel="noopener">തെറ്റ് കണ്ടോ? അറിയിക്കുക</a>`
    : (CFG.feedbackEmail ? `<a href="mailto:${esc(CFG.feedbackEmail)}?subject=Guide%20correction">തെറ്റ് കണ്ടോ? അറിയിക്കുക</a>` : '');
  return `<footer class="foot">
    <p class="disc"><strong>ശ്രദ്ധിക്കുക.</strong> ${CFG.disclaimer}</p>
    <p class="srcs"><span>ഔദ്യോഗിക ഉറവിടങ്ങൾ:</span>${src}</p>
    <p class="meta">അവസാനം പരിശോധിച്ചത്: ${esc(CFG.lastVerified)} · ${esc(CFG.author)}${fb ? ' · ' + fb : ''}</p>
  </footer>`;
}

function page({ slug, title, titleEn, desc, descEn, keywords, bodyHtml, jsonld, isHome }) {
  const canonical = url(slug);
  // WhatsApp / Facebook / LinkedIn reject SVG for og:image, so prefer the PNG
  // rendered by `npm run og` and committed to content/og/.
  const png = `og${slug ? '-' + slug : ''}.png`;
  const hasPng = fs.existsSync(path.join(ROOT, 'content', 'og', png));
  const ogImg = `${BASE}/assets/${hasPng ? png : `og${slug ? '-' + slug : ''}.svg`}`;
  const ogType = hasPng ? 'image/png' : 'image/svg+xml';
  return `<!doctype html>
<html lang="${CFG.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)} · ${esc(CFG.siteName)}</title>
<meta name="description" content="${esc(descEn)}">
<meta name="keywords" content="${esc(keywords || '')}">
<meta name="author" content="${esc(CFG.author)}">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="${isHome ? 'website' : 'article'}">
<meta property="og:site_name" content="${esc(CFG.siteNameEn)}">
<meta property="og:locale" content="${esc(CFG.locale)}">
<meta property="og:url" content="${canonical}">
<meta property="og:title" content="${esc(title)} — ${esc(titleEn)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${ogImg}">
<meta property="og:image:type" content="${ogType}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)} — ${esc(titleEn)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${ogImg}">
<meta name="twitter:image:alt" content="${esc(title)} — ${esc(titleEn)}">
<meta name="theme-color" content="#f3f4ee" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#101410" media="(prefers-color-scheme: dark)">
<link rel="manifest" href="${CFG.basePath || ''}/manifest.webmanifest">
<link rel="icon" href="${CFG.basePath || ''}/assets/icon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
${fontLink}
<link rel="stylesheet" href="${CFG.basePath || ''}/assets/styles.css">
<script type="application/ld+json">${JSON.stringify(jsonld)}</script>
${CFG.analytics || ''}
</head>
<body>
<a class="skip" href="#main">ഉള്ളടക്കത്തിലേക്ക് പോകുക</a>
<div class="topbar">
  <a class="mark" href="${href('')}">${CFG.siteName}</a>
  <span class="spacer"></span>
  <button class="iconbtn" id="navbtn" aria-expanded="false" aria-controls="side">ഉള്ളടക്കം</button>
  <button class="iconbtn themebtn" id="themebtn" aria-label="Light or dark theme" title="Light / dark"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 0 0 16Z" class="half"/></svg></button>
</div>
<div class="shell">
${nav(slug)}
<main id="main">
${bodyHtml}
${footer()}
</main>
</div>
<script src="${CFG.basePath || ''}/assets/app.js" defer></script>
</body>
</html>`;
}

/* ---------- 4. OG card images (SVG, generated per page) ---------- */
function ogCard(titleMl, titleEn, n) {
  const wrap = (t, max) => {
    const w = t.split(' '); const out = []; let line = '';
    for (const x of w) { if ((line + ' ' + x).trim().length > max) { out.push(line.trim()); line = x; } else line += ' ' + x; }
    if (line.trim()) out.push(line.trim());
    return out.slice(0, 3);
  };
  const ml = wrap(titleMl, 26);
  const en = wrap(titleEn, 40);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" font-family="system-ui, sans-serif">
<rect width="1200" height="630" fill="#f3f4ee"/>
<rect x="0" y="0" width="1200" height="12" fill="#245f46"/>
<rect x="0" y="12" width="400" height="6" fill="#a04a35"/>
<text x="80" y="118" font-size="24" font-weight="600" letter-spacing="3" fill="#a04a35">KERALA  ———  AUSTRALIA</text>
${n ? `<text x="1120" y="118" text-anchor="end" font-size="26" font-weight="700" fill="#8f9a94">${n}</text>` : ''}
${ml.map((l, i) => `<text x="80" y="${236 + i * 74}" font-size="62" font-weight="700" fill="#131c18">${esc(l)}</text>`).join('')}
${en.map((l, i) => `<text x="80" y="${236 + ml.length * 74 + 34 + i * 40}" font-size="31" fill="#4e5a54">${esc(l)}</text>`).join('')}
<rect x="80" y="540" width="1040" height="2" fill="#d6dad1"/>
<text x="80" y="582" font-size="25" fill="#4e5a54">${esc(CFG.siteNameEn)}</text>
<text x="1120" y="582" text-anchor="end" font-size="25" fill="#8f9a94">${esc(CFG.author)}</text>
</svg>`;
}

/* ---------- 5. write everything ---------- */
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(path.join(DIST, 'assets'), { recursive: true });

const extraCss = `
/* ---- added by build.mjs: site chrome the single-page version did not need ---- */
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
img{max-width:100%;height:auto}
[hidden]{display:none!important}
.themebtn{padding:6px 9px;display:inline-flex;align-items:center}
.themebtn svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.6}
.themebtn .half{fill:currentColor;stroke:none}
.skip{position:absolute;left:-9999px;top:0;background:var(--euc);color:var(--paper);padding:10px 16px;z-index:99;border-radius:0 0 8px 0}
.skip:focus{left:0}
.brand{display:block;font-family:var(--f-display);font-weight:700;font-size:17px;color:var(--ink);text-decoration:none;line-height:1.2;margin-bottom:16px}
.brand em{display:block;font-family:var(--f-ui);font-style:normal;font-size:11px;font-weight:500;color:var(--ink-faint);letter-spacing:.04em;margin-top:3px}
.topbar .mark{color:var(--ink);text-decoration:none}
.searchbox{margin:0 0 10px}
.searchbox input{width:100%;font-family:var(--f-ui);font-size:13.5px;padding:9px 12px;border-radius:8px;border:1px solid var(--rule);background:var(--surface);color:var(--ink)}
.searchbox input:focus{outline:2px solid var(--euc);outline-offset:1px;border-color:var(--euc)}
.results{margin:0 0 14px;max-height:330px;overflow-y:auto;border:1px solid var(--rule);border-radius:8px;background:var(--surface)}
.results a{display:block;padding:9px 12px;border-bottom:1px solid var(--rule);text-decoration:none;font-size:13px;line-height:1.45;color:var(--ink)}
.results a:last-child{border-bottom:none}
.results a:hover,.results a:focus{background:var(--euc-soft)}
.results b{display:block;font-family:var(--f-ui);font-size:10.5px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--euc);margin-bottom:2px}
.results .none{padding:12px;font-size:13px;color:var(--ink-faint)}
.toc a{flex-direction:row}
.toc a em{display:block;font-family:var(--f-ui);font-style:normal;font-size:10.5px;color:var(--ink-faint);margin-top:2px;letter-spacing:.02em}
.toc a.active em{color:var(--euc)}
.ico{width:18px;height:18px;flex:none;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.onpage{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:22px;padding:14px 16px;background:var(--surface);border:1px solid var(--rule);border-radius:10px;font-family:var(--f-ui);font-size:13px}
.onpage span{font-size:10.5px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-faint)}
.onpage a{color:var(--euc);text-decoration:none;padding:3px 9px;border-radius:99px;background:var(--euc-soft)}
.onpage a:hover{text-decoration:underline}
h3{scroll-margin-top:84px}
.verify{margin-top:30px;padding:16px 18px;border-radius:10px;border:1px dashed color-mix(in srgb,var(--signal) 45%,transparent);background:var(--signal-soft)}
.verify .tag{font-family:var(--f-ui);font-size:10.5px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--signal)}
.verify ul{margin:9px 0 0;padding-left:18px;font-size:16px;display:flex;flex-direction:column;gap:6px}
.verify p{margin-top:9px;font-size:15px;color:var(--ink-soft)}
.pager{display:grid;gap:12px;margin-top:48px}
@media(min-width:620px){.pager{grid-template-columns:1fr 1fr}}
.pager a{display:flex;flex-direction:column;gap:3px;padding:16px 18px;border:1px solid var(--rule);border-radius:10px;background:var(--surface);text-decoration:none;color:var(--ink);font-family:var(--f-display);font-weight:600}
.pager a:hover{border-color:var(--euc)}
.pager a span{font-family:var(--f-ui);font-size:10.5px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-faint)}
.pager a.next{text-align:right;align-items:flex-end}
.foot{margin-top:56px;padding-top:24px;border-top:1px solid var(--rule);font-family:var(--f-ui)}
.foot .disc{font-size:13.5px;line-height:1.65;color:var(--ink-soft);font-family:var(--f-body)}
.foot .srcs{margin-top:16px;display:flex;flex-wrap:wrap;gap:8px;align-items:center;font-size:12px}
.foot .srcs span{color:var(--ink-faint);letter-spacing:.04em}
.foot .srcs a{color:var(--euc);text-decoration:none;padding:4px 10px;border:1px solid var(--rule);border-radius:99px}
.foot .srcs a:hover{border-color:var(--euc)}
.foot .meta{margin-top:16px;font-size:12px;color:var(--ink-faint)}
.foot .meta a{color:var(--euc)}
.cards{display:grid;gap:14px;margin-top:30px}
@media(min-width:680px){.cards{grid-template-columns:1fr 1fr}}
.cards a{display:block;padding:20px 22px;border:1px solid var(--rule);border-radius:12px;background:var(--surface);text-decoration:none;color:var(--ink);box-shadow:var(--shadow)}
.cards a:hover{border-color:var(--euc)}
.cards .ct{display:flex;gap:10px;align-items:center;color:var(--euc)}
.cards h3{margin:0;font-size:19px;color:var(--ink)}
.cards em{display:block;font-family:var(--f-ui);font-style:normal;font-size:11.5px;color:var(--ink-faint);margin-top:3px;letter-spacing:.02em}
.cards p{margin-top:10px;font-size:16px;color:var(--ink-soft);line-height:1.65}
.cards .k{font-family:var(--f-ui);font-variant-numeric:tabular-nums;font-size:11px;font-weight:600;color:var(--ink-faint);margin-left:auto}
@media print{
  .topbar,.side,.onpage,.pager,.iconbtn,.ckhead,.skip{display:none!important}
  .shell{display:block;max-width:none}
  main{padding:0!important}
  body{font-size:11.5pt;background:#fff;color:#000}
  figure,.call,.cards a,.tscroll{break-inside:avoid;box-shadow:none}
  .tscroll{overflow:visible}
  table{min-width:0!important}
  a[href^="http"]::after{content:" (" attr(href) ")";font-size:9pt;color:#555}
  .cklist input{-webkit-appearance:none;appearance:none;border:1.5px solid #000}
}`;

const searchJs = `
/* ---- site search (multi-page) ---- */
(function(){
  var q=document.getElementById('q'), box=document.getElementById('results');
  if(!q||!box) return;
  var idx=null, t=null;
  function load(){ if(idx) return Promise.resolve(idx);
    return fetch((window.__BASE__||'')+'/search-index.json').then(function(r){return r.json()}).then(function(j){idx=j;return j}); }
  function run(){
    var s=q.value.trim().toLowerCase();
    if(s.length<2){ box.hidden=true; box.innerHTML=''; return; }
    load().then(function(rows){
      var hits=[];
      for(var i=0;i<rows.length && hits.length<25;i++){
        var r=rows[i];
        if(r.h.toLowerCase().indexOf(s)>-1 || r.t.toLowerCase().indexOf(s)>-1) hits.push(r);
      }
      if(!hits.length){ box.innerHTML='<p class="none">ഒന്നും കിട്ടിയില്ല · No matches</p>'; box.hidden=false; return; }
      box.innerHTML=hits.map(function(r){
        return '<a href="'+r.u+'"><b>'+r.s+'</b>'+r.h+'</a>';
      }).join('');
      box.hidden=false;
    }).catch(function(){ box.hidden=true; });
  }
  q.addEventListener('input',function(){ clearTimeout(t); t=setTimeout(run,120); });
  q.addEventListener('focus',load);
  document.addEventListener('click',function(e){ if(!box.contains(e.target)&&e.target!==q) box.hidden=true; });
})();
/* ---- offline cache ---- */
if('serviceWorker' in navigator) window.addEventListener('load',function(){
  navigator.serviceWorker.register((window.__BASE__||'')+'/sw.js').catch(function(){});
});`;

fs.writeFileSync(path.join(DIST, 'assets', 'styles.css'), styleCss.trim() + '\n' + extraCss);
fs.writeFileSync(path.join(DIST, 'assets', 'app.js'),
  `window.__BASE__=${JSON.stringify(CFG.basePath || '')};\n` + appJs.trim() + '\n' + searchJs);

/* search index */
const index = [];
sections.forEach((s) => {
  const h = sectionHtml[s.id];
  const blocks = h.split(/(?=<h[34])/);
  blocks.forEach((b) => {
    const head = strip((b.match(/<h[34][^>]*>([\s\S]*?)<\/h[34]>/) || [])[1] || '') || s.title;
    const text = strip(b).slice(0, 600);
    if (text.length > 40) index.push({ s: s.titleEn, u: href(s.slug), h: head, t: text });
  });
});
fs.writeFileSync(path.join(DIST, 'search-index.json'), JSON.stringify(index));

/* section pages */
sections.forEach((s, i) => {
  const prev = sections[i - 1], next = sections[i + 1];
  const body = preparePage(sectionHtml[s.id], i + 1, s);
  const pager = `<div class="pager">
    ${prev ? `<a class="prev" href="${href(prev.slug)}"><span>← മുൻപത്തേത്</span>${prev.title}</a>` : `<a class="prev" href="${href('')}"><span>← ആദ്യ പേജ്</span>${CFG.siteName}</a>`}
    ${next ? `<a class="next" href="${href(next.slug)}"><span>അടുത്തത് →</span>${next.title}</a>` : ''}
  </div>`;
  const html = page({
    slug: s.slug, title: s.title, titleEn: s.titleEn,
    desc: s.blurb, descEn: s.descriptionEn, keywords: s.keywords,
    bodyHtml: body + volatileBox(s) + pager,
    jsonld: {
      '@context': 'https://schema.org', '@type': 'Article',
      headline: `${s.title} — ${s.titleEn}`, description: s.descriptionEn,
      inLanguage: CFG.lang, url: url(s.slug), dateModified: CFG.lastVerified,
      author: { '@type': 'Person', name: CFG.author, url: CFG.authorUrl || undefined },
      isPartOf: { '@type': 'WebSite', name: CFG.siteNameEn, url: url('') },
    },
  });
  fs.mkdirSync(path.join(DIST, s.slug), { recursive: true });
  fs.writeFileSync(path.join(DIST, s.slug, 'index.html'), html);
  fs.writeFileSync(path.join(DIST, 'assets', `og-${s.slug}.svg`), ogCard(s.title, s.titleEn, String(i + 1).padStart(2, '0')));
});

/* home page */
const cards = sections.map((s, i) => `<a href="${href(s.slug)}">
  <div class="ct">${icon(s.icon)}<span class="k">${String(i + 1).padStart(2, '0')}</span></div>
  <h3>${s.title}<em>${esc(s.titleEn)}</em></h3><p>${s.blurb}</p></a>`).join('');

const homeBody = `<header class="hero wrap">
  <div class="route"><span class="dot" style="background:var(--lat)"></span><span>കേരളം</span>
  <span style="color:var(--rule)">———</span><span class="dot" style="background:var(--euc)"></span><span>ഓസ്‌ട്രേലിയ</span></div>
  <h1>${CFG.tagline}</h1>
  <p class="sub">${CFG.heroText || CFG.description}</p>
  <div class="meta"><span>അവസാനം പരിശോധിച്ചത്: ${esc(CFG.lastVerified)}</span><span>${sections.length} വിഭാഗം · സൗജന്യം · പങ്കുവെക്കാം</span></div>
</header>
<div class="wrap">
<div class="call warn"><span class="tag">രണ്ട് മുന്നറിയിപ്പ്</span>
  <p><b>ഓസ്‌ട്രേലിയ ഒരൊറ്റ നിയമവ്യവസ്ഥയല്ല.</b> റോഡ് നിയമം, സ്കൂൾ നിയമം, വാടക നിയമം, മാലിന്യ സംസ്കരണം എന്നിവ സംസ്ഥാനവും കൗൺസിലും അനുസരിച്ച് വ്യത്യാസപ്പെടും. NSW-ലെ നിയമം വിക്ടോറിയയിൽ അതേപടി ബാധകമാവണമെന്നില്ല.</p>
  <p><b>നിരക്കുകൾ എല്ലാ വർഷവും മാറും</b> (സാധാരണ ജൂലൈ 1-ന്). ⟳ അടയാളമുള്ള ഭാഗങ്ങൾ ഔദ്യോഗിക ഉറവിടത്തിൽ പരിശോധിക്കുക.</p>
</div>
<h2 style="margin-top:44px;font-size:clamp(22px,3.6vw,28px)">എവിടെ തുടങ്ങണം</h2>
<p style="margin-top:10px;color:var(--ink-soft)">ഓരോ വിഭാഗവും വേറെ പേജാണ് — ആവശ്യമുള്ളത് മാത്രം വായിക്കാം, ആ ലിങ്ക് മാത്രം പങ്കുവെക്കാം.</p>
<div class="cards">${cards}</div>
</div>`;

fs.writeFileSync(path.join(DIST, 'index.html'), page({
  slug: '', title: CFG.tagline, titleEn: CFG.taglineEn,
  desc: CFG.description, descEn: CFG.descriptionEn,
  keywords: 'malayali australia guide, kerala to australia, moving to australia malayalam, australian culture for indians, new migrant australia checklist',
  bodyHtml: homeBody, isHome: true,
  jsonld: {
    '@context': 'https://schema.org', '@type': 'WebSite',
    name: CFG.siteNameEn, alternateName: CFG.siteName,
    description: CFG.descriptionEn, inLanguage: CFG.lang, url: url(''),
    author: { '@type': 'Person', name: CFG.author, url: CFG.authorUrl || undefined },
    hasPart: sections.map((s) => ({ '@type': 'Article', name: s.titleEn, url: url(s.slug) })),
  },
}));
fs.writeFileSync(path.join(DIST, 'assets', 'og.svg'), ogCard(CFG.tagline, CFG.taglineEn, ''));

/* 404 */
fs.writeFileSync(path.join(DIST, '404.html'), page({
  slug: '', title: 'പേജ് കണ്ടെത്താനായില്ല', titleEn: 'Page not found',
  desc: 'ഈ വിലാസത്തിൽ ഒന്നുമില്ല.', descEn: 'Nothing at this address.',
  bodyHtml: `<div class="wrap" style="padding-top:48px"><h1 style="font-family:var(--f-display);font-size:clamp(26px,5vw,40px)">പേജ് കണ്ടെത്താനായില്ല</h1>
    <p style="margin-top:14px;color:var(--ink-soft)">ഈ വിലാസത്തിൽ ഒന്നുമില്ല. ഇടതുവശത്തെ ഉള്ളടക്കത്തിൽ നിന്ന് തിരഞ്ഞെടുക്കുക, അല്ലെങ്കിൽ <a href="${href('')}">ആദ്യ പേജിലേക്ക്</a> പോകുക.</p></div>`,
  jsonld: { '@context': 'https://schema.org', '@type': 'WebPage', name: 'Page not found' },
}));

/* icon, manifest, sw, sitemap, robots */
fs.writeFileSync(path.join(DIST, 'assets', 'icon.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#245f46"/><path d="M20 44 L32 18 L44 44" fill="none" stroke="#f3f4ee" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="32" cy="46" r="4" fill="#e2937c"/></svg>`);

fs.writeFileSync(path.join(DIST, 'manifest.webmanifest'), JSON.stringify({
  name: CFG.siteNameEn, short_name: 'KL→AU', description: CFG.descriptionEn,
  start_url: (CFG.basePath || '') + '/', display: 'standalone',
  background_color: '#f3f4ee', theme_color: '#245f46', lang: CFG.lang,
  icons: [{ src: (CFG.basePath || '') + '/assets/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
}, null, 2));

const cacheList = ['', ...sections.map((s) => s.slug)].map((s) => href(s))
  .concat([(CFG.basePath || '') + '/assets/styles.css', (CFG.basePath || '') + '/assets/app.js', (CFG.basePath || '') + '/search-index.json']);
fs.writeFileSync(path.join(DIST, 'sw.js'), `const C='guide-${CFG.lastVerified}-${sections.length}';
const PRE=${JSON.stringify(cacheList)};
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(PRE)).then(()=>self.skipWaiting()).catch(()=>{}))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin) return;
  e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(C).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request)));
});`);

const today = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path.join(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  [{ loc: url(''), p: '1.0' }, ...sections.map((s) => ({ loc: url(s.slug), p: '0.8' }))]
    .map((u) => `  <url><loc>${u.loc}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>${u.p}</priority></url>`).join('\n') +
  `\n</urlset>\n`);

/* copy the committed link-preview PNGs */
const OGDIR = path.join(ROOT, 'content', 'og');
let ogCopied = 0;
if (fs.existsSync(OGDIR)) {
  for (const f of fs.readdirSync(OGDIR)) {
    if (f.endsWith('.png')) { fs.copyFileSync(path.join(OGDIR, f), path.join(DIST, 'assets', f)); ogCopied++; }
  }
}

fs.writeFileSync(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${BASE}/sitemap.xml\n`);
fs.writeFileSync(path.join(DIST, '.nojekyll'), '');

console.log(`built ${sections.length} section pages + home`);
console.log(`  base url : ${BASE}`);
console.log(`  pages    : ${['index', ...sections.map((s) => s.slug)].join(', ')}`);
console.log(`  search   : ${index.length} entries`);
console.log(`  og cards : ${ogCopied} png` + (ogCopied ? '' : '  <-- run `npm run og` so link previews work'));
if (CFG.siteUrl.includes('example.com')) console.log('\n!! siteUrl is still the placeholder — edit site.config.json before going live.');
