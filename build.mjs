#!/usr/bin/env node
/**
 * Splits content/guide.html (the single source of truth) into a static site in dist/.
 *
 * Normal editing never touches this file — edit content/guide.html for the
 * writing and site.config.json for slugs, titles, domain and dates.
 * The look lives in theme.css.mjs.
 */
import fs from 'node:fs';
import path from 'node:path';
import { THEME_CSS } from './theme.css.mjs';
import { scene, hasScene } from './art.mjs';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const CFG = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.config.json'), 'utf8'));
const SRC = fs.readFileSync(path.join(ROOT, 'content', 'guide.html'), 'utf8');
const DIST = path.join(ROOT, 'dist');
const BP = CFG.basePath || '';
const BASE = CFG.siteUrl.replace(/\/+$/, '') + BP;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const strip = (h) => h.replace(/<(script|style)[\s\S]*?<\/\1>/g, ' ').replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/\s+/g, ' ').trim();

const url = (slug) => (slug ? `${BASE}/${slug}/` : `${BASE}/`);
const href = (slug) => (slug ? `${BP}/${slug}/` : `${BP}/`);

/* ------------------------------------------------ 1. parse the source */
const marks = [...SRC.matchAll(/<section[^>]*\bid="(s\d+)"[^>]*>/g)]
  .map((m) => ({ id: m[1], start: m.index }));
const sectionHtml = {};
marks.forEach((m, i) => {
  const end = marks[i + 1] ? marks[i + 1].start : SRC.lastIndexOf('</main>');
  sectionHtml[m.id] = SRC.slice(m.start, end)
    .replace(/^<section[^>]*>/, '').replace(/<\/section>\s*$/, '').trim();
});
const sections = CFG.sections.filter((s) => sectionHtml[s.id]);
const missing = CFG.sections.filter((s) => !sectionHtml[s.id]).map((s) => s.id);
if (missing.length) console.warn('! config lists sections not in guide.html:', missing.join(', '));

/* ------------------------------------------------ 2. icons */
const I = {
  calendar: '<path d="M7 3v3M17 3v3M3.5 9h17M5 5.5h14a1.5 1.5 0 0 1 1.5 1.5v12A1.5 1.5 0 0 1 19 20.5H5A1.5 1.5 0 0 1 3.5 19V7A1.5 1.5 0 0 1 5 5.5Z"/>',
  speech: '<path d="M20.5 11.5c0 3.9-3.8 7-8.5 7-1 0-2-.15-2.9-.42L4 20l1.3-3.6C4.2 15.1 3.5 13.4 3.5 11.5c0-3.9 3.8-7 8.5-7s8.5 3.1 8.5 7Z"/>',
  home: '<path d="M4 10.5 12 4l8 6.5M6 9.8V20h12V9.8M10 20v-5.5h4V20"/>',
  food: '<path d="M7 3v8a2.5 2.5 0 0 0 5 0V3M9.5 11v10M17 3c1.7 1.3 2.5 3 2.5 5.5S18.7 13 17 14v7"/>',
  health: '<path d="M12 20.5S4 15.6 4 10.2A4.2 4.2 0 0 1 12 8a4.2 4.2 0 0 1 8 2.2c0 5.4-8 10.3-8 10.3Z"/>',
  work: '<path d="M3.5 8.5h17v11h-17zM9 8.5V6a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 6v2.5M3.5 13h17"/>',
  road: '<path d="M8 4 5 20M16 4l3 16M12 4.5v3M12 11v3M12 17.5v3"/>',
  school: '<path d="M12 4 3 8.5l9 4.5 9-4.5L12 4ZM6.5 11v5.5c0 1.4 2.5 2.5 5.5 2.5s5.5-1.1 5.5-2.5V11"/>',
  money: '<path d="M3.5 7.5h17v9h-17zM12 9.8a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4"/>',
  table: '<path d="M3.5 6h17v12h-17zM3.5 10.5h17M3.5 14.5h17M9.5 6v12"/>',
  check: '<path d="M20.5 11.2V18a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9M8.5 12.2l3 3 8-8.5"/>',
  plane: '<path d="M3 14l18-7-5 13-3.5-5.5L3 14Z"/>',
  alert: '<path d="M12 8.5v5M12 17h.01M10.3 3.9 2.6 17.4A2 2 0 0 0 4.3 20.4h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/>',
  card: '<path d="M3 7.5h18v10H3zM3 11h18M6.5 14.5h3"/>',
  cash: '<path d="M2.5 6.5h19v11h-19zM12 9.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5"/>',
  wage: '<path d="M4 17 9 11l4 3.5L20 6M20 6h-5M20 6v5"/>',
  phone: '<path d="M8 3.5H5.5A2 2 0 0 0 3.5 5.7c.4 6.8 7 13.4 13.8 13.8a2 2 0 0 0 2.2-2V15l-4-1.5-2 2a14 14 0 0 1-4-4l2-2L8 3.5Z"/>',
  globe: '<path d="M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17ZM3.5 12h17M12 3.5c2.2 2.3 3.4 5.3 3.4 8.5S14.2 18.2 12 20.5c-2.2-2.3-3.4-5.3-3.4-8.5S9.8 5.8 12 3.5Z"/>',
  people: '<path d="M9.5 11.5a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5ZM3.5 20v-1.2c0-2.2 2.7-4 6-4s6 1.8 6 4V20M16.2 5.4a3.25 3.25 0 0 1 0 6.2M17.5 14.9c1.8.5 3 1.7 3 3.1V20"/>',
  bank: '<path d="M3.5 9.5 12 4l8.5 5.5M5.5 10v8M18.5 10v8M9.5 10v8M14.5 10v8M3 20h18"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m16.4 16.4 4.1 4.1"/>',
  arrow: '<path d="M5 12h13M13 6.5 18.5 12 13 17.5"/>',
  back: '<path d="M19 12H6M11 6.5 5.5 12 11 17.5"/>',
  sun: '<circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 0 0 16Z" class="half"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
};
const ic = (n, cls = '') => `<svg${cls ? ` class="${cls}"` : ''} viewBox="0 0 24 24" aria-hidden="true">${I[n] || I.table}</svg>`;

const TINT = {
  calendar: 'var(--indigo)', speech: '#7C3AED', home: 'var(--bin-purple)', food: '#C2410C',
  health: '#0891B2', work: '#DB2777', road: 'var(--rose)', school: '#059669',
  money: '#475569', table: '#D97706', check: 'var(--teal)',
  globe: 'var(--teal-deep)', plane: 'var(--indigo-deep)', phone: '#0E7490', people: '#9333EA',
};

/* a photo for a slug, if one has been dropped in content/photos/ */
const photo = (name) => {
  for (const ext of ['jpg', 'jpeg', 'png', 'webp']) {
    if (fs.existsSync(path.join(ROOT, 'content', 'photos', `${name}.${ext}`))) return `${name}.${ext}`;
  }
  return null;
};

/* Section artwork. Every section has a drawn scene in art.mjs, so this composes
   the shared parts around it: a two-tone wash in the section's colour, a dot
   screen, the scene, and a small numeral badge. Sections without a scene fall
   back to their line icon so a new slug is never a blank panel.

   The scenes paint with currentColor, so `color` is set on the group: that is
   what currentColor resolves against, and it lets one drawing carry the
   section's own hue without duplicating the file per colour. */
const grad = (iconName) =>
  `linear-gradient(120deg,${TINT[iconName] || 'var(--teal)'},#0F172A)`;

const tile = (slug, iconName, fit = 'slice') => {
  const c = TINT[iconName] || 'var(--teal)';
  const uid = slug.replace(/[^a-z0-9]/g, '') + (fit === 'meet' ? 'b' : '');
  const dots = [];
  for (let y = 18; y < 300; y += 38) for (let x = 18; x < 640; x += 38) dots.push(`<circle cx="${x}" cy="${y}" r="1.7"/>`);
  const art = hasScene(slug)
    ? `<g style="color:#0F172A" opacity=".97">${scene(slug)}</g>`
    : `<g transform="translate(290 126) scale(3.9) translate(-12 -12)" fill="none" stroke="#fff"
         stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity=".92">${I[iconName] || I.table}</g>`;
  /* A banner is far wider than the 640x300 artboard, so slicing it would crop
     the scene to a thin middle band. There the scene is fitted whole and the
     wash moves to the container, which can fill any shape. */
  const bg = fit === 'meet' ? '' :
    `<defs><linearGradient id="w${uid}" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="${c}"/><stop offset="1" stop-color="#0F172A" stop-opacity=".72"/></linearGradient></defs>
<rect width="640" height="300" fill="${c}"/><rect width="640" height="300" fill="url(#w${uid})"/>
<g fill="#fff" opacity=".1">${dots.join('')}</g>`;
  return `<svg viewBox="0 0 640 300" preserveAspectRatio="xMidYMid ${fit}" role="presentation">
${bg}
${art}</svg>`;
};

/* ------------------------------------------------ 3. shared chrome */
function navBar(active) {
  const items = (CFG.navHighlights || []).map((slug) => {
    const s = sections.find((x) => x.slug === slug);
    /* navLabel, not title: full section titles are long enough in Malayalam to
       fill the bar and squeeze the wordmark into an ellipsis. */
    return s ? `<a class="item${s.slug === active ? ' on' : ''}" href="${href(s.slug)}">${s.navLabel || s.title}</a>` : '';
  }).join('');
  /* The checklist is what most readers actually come for, so the nav button goes
     straight to it. Found by slug, not by position, so reordering the sections in
     the config cannot silently repoint it somewhere else. */
  const ck = sections.find((s) => s.slug === 'first-30-days') || sections[sections.length - 1];
  return `<div class="topbar"><nav class="nav wrap" aria-label="Main">
  <a class="logo" href="${href('')}">
    <span class="mark">${ic('plane')}</span>
    <span class="nm">${CFG.siteName}<small>${esc(CFG.siteNameEn)}</small></span>
  </a>
  ${items}
  <button class="iconbtn" id="themebtn" aria-label="Light or dark theme" title="Light / dark">${ic('sun')}</button>
  <button class="navbtn" id="navbtn" aria-expanded="false" aria-controls="sheet"
    aria-label="ഉള്ളടക്കം">${ic('menu')}<span>ഉള്ളടക്കം</span></button>
  <a class="cta" href="${href(ck.slug)}">${ic('check')}<span>ചെക്ക്‌ലിസ്റ്റ്</span></a>
</nav></div>`;
}

function sheet(active) {
  const links = sections.map((s, i) =>
    `<a href="${href(s.slug)}"${s.slug === active ? ' class="on"' : ''}>
      <i>${String(i + 1).padStart(2, '0')}</i><span>${s.title}<em>${esc(s.titleEn)}</em></span></a>`).join('');
  return `<div class="sheet" id="sheet"><div class="panel">
    <div class="ttl">ഉള്ളടക്കം · Contents</div>${links}</div></div>`;
}

function emergency() {
  const rows = (CFG.emergency || []).map((e) =>
    `<div class="row"><span class="l">${e.what}</span><span class="n">${esc(e.number)}</span></div>`).join('');
  if (!rows) return '';
  return `<button class="fab" id="fab" aria-expanded="false" aria-controls="drawer">${ic('alert')}<span class="t">അടിയന്തര നമ്പറുകൾ</span></button>
<div class="drawer" id="drawer"><div class="head">അടിയന്തര നമ്പറുകൾ · Emergency numbers</div>
<div class="body">${rows}</div></div>`;
}

function footer() {
  const src = (CFG.officialSources || []).map((o) =>
    `<a href="${esc(o.url)}" rel="noopener nofollow" target="_blank">${esc(o.label)}</a>`).join('');
  const fb = CFG.feedbackUrl ? `<a href="${esc(CFG.feedbackUrl)}" rel="noopener">തെറ്റ് കണ്ടോ? അറിയിക്കുക</a>`
    : (CFG.feedbackEmail ? `<a href="mailto:${esc(CFG.feedbackEmail)}?subject=Guide%20correction">തെറ്റ് കണ്ടോ? അറിയിക്കുക</a>` : '');

  /* The byline links to the author's own site. rel is "author me", not nofollow:
     this is a real attribution, and nofollow here would tell search engines to
     ignore the one link that establishes who wrote the guide. */
  const byline = CFG.authorUrl
    ? `<a class="me" href="${esc(CFG.authorUrl)}" rel="author me noopener" target="_blank">${esc(CFG.author)}</a>`
    : esc(CFG.author);

  const h = CFG.hire || {};
  const hire = h.ml || h.en ? `<div class="hire">
      ${h.ml ? `<p>${h.ml}</p>` : ''}
      ${h.en ? `<p${h.ml ? ' class="en"' : ''}>${esc(h.en)}</p>` : ''}
      ${h.url ? `<a href="${esc(h.url)}" rel="noopener" target="_blank">${esc(h.cta || h.url)}<span>&rsaquo;</span></a>` : ''}
    </div>` : '';
  return `<footer><div class="wrap foot">
    <div><h4>ശ്രദ്ധിക്കുക · Please note</h4><p>${CFG.disclaimer}</p></div>
    <div><h4>ഔദ്യോഗിക ഉറവിടങ്ങൾ</h4><div class="list">${src}</div></div>
    <div><h4>ഈ ഗൈഡിനെക്കുറിച്ച്</h4>
      <p>${byline} എഴുതിയത്. ഓരോ വിഭാഗവും വേറെ പേജാണ്, ആവശ്യമുള്ള ലിങ്ക് മാത്രം പങ്കുവെക്കാം.</p>
      <p style="margin-top:9px">അവസാനം പരിശോധിച്ചത്: ${esc(CFG.lastVerified)}</p>
      ${hire}</div>
  </div>
  <div class="wrap legal"><span>നിയമങ്ങൾ സംസ്ഥാനവും കൗൺസിലും അനുസരിച്ച് മാറും. അവസാന വാക്ക് ഔദ്യോഗിക ഉറവിടമാണ്.</span>${fb ? `<span>${fb}</span>` : ''}</div>
</footer>`;
}

/* One author identity for every page's structured data. url is the author's own
   site and sameAs carries the other profiles, which is how a search engine ties
   the byline to a person rather than to a bare name string. */
const PERSON = {
  '@type': 'Person',
  name: CFG.author,
  url: CFG.authorUrl || undefined,
  sameAs: (CFG.authorProfiles || []).length ? CFG.authorProfiles : undefined,
};

/* ------------------------------------------------ 4. page shell */
function page({ slug, title, titleEn, desc, descEn, keywords, body, jsonld, isHome, prog }) {
  const canonical = url(slug);
  /* Cards are JPEG now; .png is still accepted so a half-finished migration
     never leaves a page with no preview image at all. */
  const ogDir = path.join(ROOT, 'content', 'og');
  const names = slug
    ? [`og-${slug}.jpg`, `og-${slug}.png`, 'og.jpg', 'og.png']
    : ['og.jpg', 'og.png'];
  const ogFile = names.find((f) => fs.existsSync(path.join(ogDir, f))) || 'og.jpg';
  const ogImg = `${BASE}/assets/${ogFile}`;
  const ogType = ogFile.endsWith('.png') ? 'image/png' : 'image/jpeg';
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
<meta name="theme-color" content="#F5F7FB" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0B1120" media="(prefers-color-scheme: dark)">
<link rel="manifest" href="${BP}/manifest.webmanifest">
<link rel="icon" href="${BP}/assets/icon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Anek+Malayalam:wght@500;600;700&family=Manjari:wght@400;700&display=swap">
<link rel="stylesheet" href="${BP}/assets/styles.css">
<script>try{var t=localStorage.getItem('kag-theme');if(t)document.documentElement.setAttribute('data-theme',t)}catch(e){}</script>
<script type="application/ld+json">${JSON.stringify(jsonld)}</script>
${CFG.analytics || ''}
</head>
<body>
<a class="skip" href="#main">ഉള്ളടക്കത്തിലേക്ക് പോകുക</a>
${prog ? '<div class="prog" id="prog"></div>' : ''}
${navBar(slug)}
${body}
${footer()}
${sheet(slug)}
${emergency()}
<script src="${BP}/assets/app.js" defer></script>
</body>
</html>`;
}

/* Remove an element and everything inside it, counting nested <div>s so the
   cut lands on the matching close. A lazy regex cannot do this: it stops at
   the first </div>, which for any wrapper with children is the wrong one. */
function cutBlock(html, openTag) {
  const start = html.indexOf(openTag);
  if (start < 0) return html;
  let depth = 0, i = start;
  const re = /<div\b[^>]*>|<\/div>/g;
  re.lastIndex = start;
  let m;
  while ((m = re.exec(html))) {
    depth += m[0] === '</div>' ? -1 : 1;
    if (depth === 0) { i = m.index + m[0].length; break; }
  }
  return html.slice(0, start) + html.slice(i);
}

/* ------------------------------------------------ 5. section pages */
/* The single-page source opens each section with its own .sechead + .lede.
   Those are replaced here by a proper article header, so strip them. */
function prepare(html, n, s) {
  html = html.replace(/<div class="sechead">[\s\S]*?<\/div>/, '');
  html = html.replace(/<p class="lede">[\s\S]*?<\/p>/, '');

  const heads = [...html.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/g)].map((m) => strip(m[1])).filter(Boolean);
  let i = 0;
  html = html.replace(/<h3([^>]*)>/g, (m, a) => `<h3${a} id="h${++i}">`);

  const jump = heads.length >= 3
    ? `<div class="onpage"><span>ഈ പേജിൽ</span>${heads.map((t, k) => `<a href="#h${k + 1}">${esc(t)}</a>`).join('')}</div>`
    : '';

  /* The source carries the checklist as a bare <ul class="cklist"> preceded by
     its own progress bar, whose reset button is also id="ckreset". Leaving it
     in and hiding it with CSS duplicates that id, and getElementById then
     returns the hidden one — so the ring's reset silently does nothing.
     Remove the old bar outright, then wrap the list in the ring card. */
  html = cutBlock(html, '<div class="ckhead">');
  /* Server-render the real total so the ring never flashes a stale number
     before app.js runs. Counting the source beats hard-coding it, which went
     wrong the moment the checklist grew. */
  const ckTotal = (html.match(/<input[^>]+type="checkbox"/g) || []).length;
  html = html.replace(/<ul class="cklist"[^>]*>/, (m) =>
    `<div class="checkcard"><div class="side">
      <div class="ring"><svg width="148" height="148" aria-hidden="true">
        <circle cx="74" cy="74" r="64" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="12"/>
        <circle id="ringfg" cx="74" cy="74" r="64" fill="none" stroke="#fff" stroke-width="12"
          stroke-linecap="round" stroke-dasharray="402" stroke-dashoffset="402"/></svg>
        <div class="val" id="ringval">0/${ckTotal}</div></div>
      <div class="lbl">പൂർത്തിയായത് · done</div>
      <button type="button" id="ckreset">വീണ്ടും തുടങ്ങുക</button></div>${m}`);
  /* Close the card at the checklist's OWN </ul>. Matching the last </ul> in the
     section instead swallowed everything after the list — the closing note ended
     up rendered inside the two-column card, which is what made it look
     misaligned. Walk the ul nesting from the opening tag and close there. */
  if (html.includes('class="checkcard"')) {
    const open = html.indexOf('<ul class="cklist"');
    const re = /<ul\b[^>]*>|<\/ul>/g;
    re.lastIndex = open;
    let depth = 0, m, cut = -1;
    while ((m = re.exec(html))) {
      depth += m[0] === '</ul>' ? -1 : 1;
      if (depth === 0) { cut = m.index + m[0].length; break; }
    }
    if (cut < 0) throw new Error('checklist <ul class="cklist"> is not closed in the source');
    html = html.slice(0, cut) + '</div>' + html.slice(cut);
  }

  const ph = photo(s.slug);
  /* The section art is square and the banner is a wide strip, so cropping to
     fill would behead every figure in it. The same image is used twice instead:
     blurred and scaled to fill the strip, with the untouched square centred on
     top. Nothing is cut, and the wash picks up each picture's own colours. */
  const banner = ph
    ? `<div class="banner photo" style="--img:url('${BP}/assets/photos/${ph}')">
         <img src="${BP}/assets/photos/${ph}" alt="" loading="lazy" decoding="async"></div>`
    : `<div class="banner art" style="background:${grad(s.icon)}">${tile(s.slug, s.icon, 'meet')}</div>`;

  const head = `<header class="ahead">
    <a class="crumb" href="${href('')}">${ic('back')}${esc(CFG.siteName)}</a>
    <h1>${s.title}<span class="en-sub">${String(n).padStart(2, '0')} · ${esc(s.titleEn)}</span></h1>
    <p class="lede">${s.blurb}</p>${banner}</header>`;

  return head + jump + `<div class="inner">${html}</div>`;
}

function volatileBox(s) {
  if (!s.volatile || !s.volatile.length) return '';
  const rows = s.volatile.map((v) =>
    `<li>${v.what} — <a href="${esc(v.source)}" rel="noopener nofollow" target="_blank">ഔദ്യോഗിക ഉറവിടം</a></li>`).join('');
  return `<aside class="verify"><span class="tag">⟳ ഇവ മാറുന്ന വിവരങ്ങളാണ്</span><ul>${rows}</ul>
    <p>നിരക്കുകളും പരിധികളും സാധാരണ ജൂലൈ 1-ന് പുതുക്കും. തീരുമാനമെടുക്കുന്നതിന് മുൻപ് ഉറവിടം നോക്കുക.</p></aside>`;
}

function rail(active) {
  return `<nav class="rail" aria-label="Sections"><div class="ttl">ഉള്ളടക്കം</div><ol>${
    sections.map((s, i) => `<li><a href="${href(s.slug)}"${s.slug === active ? ' class="on"' : ''}>
      <i>${String(i + 1).padStart(2, '0')}</i><span>${s.title}<em>${esc(s.titleEn)}</em></span></a></li>`).join('')
  }</ol></nav>`;
}

/* ------------------------------------------------ 6. home */
function homeBody() {
  const ph = photo('hero');
  const heroArt = ph
    ? `<img src="${BP}/assets/photos/${ph}" alt="" fetchpriority="high" decoding="async">`
    : tile('hero', 'plane');

  const floats = (CFG.heroStats || []).map((f, i) =>
    `<div class="float f${i + 1}"><span class="ic" style="background:${i ? 'var(--teal)' : 'var(--indigo)'}">${ic(f.icon)}</span>
      <div><b>${esc(f.value)}</b><span>${f.label}</span></div></div>`).join('');

  const chips = (CFG.quickChips || []).map((c) =>
    `<a class="chip" href="${href(c.slug)}">${c.label}</a>`).join('');

  const steps = (CFG.journey || []).map((j) =>
    `<a class="step reveal" href="${href(j.slug)}"><div class="n">${esc(j.phase)}</div>
      <h3>${j.title}</h3><p>${j.body}</p></a>`).join('');

  /* Every card carries artwork. A photo for some and nothing for the rest reads
     as an unfinished page, so the cards use the drawn scenes throughout and the
     set stays consistent however many sections there are. */
  const guides = sections.map((s, i) => {
    const p = photo(s.slug);
    const thumb = `<span class="thumb">${p
      ? `<img src="${BP}/assets/photos/${p}" alt="" loading="lazy" decoding="async">`
      : tile(s.slug, s.icon)}</span>`;
    return `<a class="g reveal" href="${href(s.slug)}">
      ${thumb}<span class="ico" style="background:${TINT[s.icon] || 'var(--teal)'}">${ic(s.icon)}</span>
      <small class="lbl">${esc(s.titleEn)}</small><h3>${s.title}</h3><p>${s.blurb}</p></a>`;
  }).join('');

  const notifs = (CFG.changes2026 || []).map((c) =>
    `<div class="notif reveal"><span class="dot" style="background:${c.tintBg};color:${c.tint}">${ic(c.icon)}</span>
      <div><span class="when" style="color:${c.tint}">${esc(c.when)}</span><h3>${c.title}</h3><p>${c.body}</p></div></div>`).join('');

  const cof = CFG.coffee || [];
  const coffeePh = photo('coffee');
  const coffeeArt = coffeePh
    ? `<img src="${BP}/assets/photos/${coffeePh}" alt="" loading="lazy" decoding="async">`
    : tile('coffee', 'food');
  const coffeeTabs = cof.map((c, i) =>
    `<button class="tab${i ? '' : ' on'}" data-c="${i}">${esc(c.name)}</button>`).join('');

  return `<main id="main">
<section class="hero"><div class="blob"></div><div class="wrap grid">
  <div>
    <div class="eyebrow"><span>${CFG.heroPill}</span><em>${esc(CFG.heroPillEn || '')}</em></div>
    <h1>${CFG.tagline}</h1>
    <p class="lede">${CFG.description}</p>
    <div class="find">
      <form class="box" role="search" onsubmit="return false">
        ${ic('search', 'mag')}
        <input type="search" id="q" autocomplete="off" aria-label="Search the guide"
          placeholder="തിരയുക — Medicare, ബിൻ, പാർക്കിംഗ്…">
        <button class="go" type="button" id="qgo">Search</button>
      </form>
      <div class="res" id="results" hidden></div>
    </div>
    <div class="chips">${chips}</div>
    <div class="meta"><span>അവസാനം പരിശോധിച്ചത്: ${esc(CFG.lastVerified)}</span><span>സൗജന്യം · ലോഗിൻ വേണ്ട</span></div>
  </div>
  <div class="heroimg reveal"><div class="frame">${heroArt}</div>${floats}</div>
</div></section>

<section class="sec tight"><div class="wrap">
  <div class="sechead"><div><h2>നിങ്ങളുടെ യാത്ര · Your journey</h2>
    <p class="sub">എവിടെ നിന്നും തുടങ്ങാം — ഓരോ ഘട്ടത്തിലും ആവശ്യമുള്ളത് മാത്രം വായിക്കാം.</p></div></div>
  <div class="stepper">${steps}</div>
</div></section>

<section class="sec" id="guides"><div class="wrap">
  <div class="sechead"><div><h2>വിഭാഗങ്ങൾ · Sections</h2>
    <p class="sub">ഓരോ വിഭാഗവും വേറെ പേജാണ്. ആവശ്യമുള്ളത് മാത്രം വായിക്കാം, ആ ലിങ്ക് മാത്രം പങ്കുവെക്കാം.</p></div></div>
  <div class="ggrid">${guides}</div>
</div></section>

<section class="sec tight" id="y2026"><div class="wrap">
  <div class="sechead"><div><h2>2026-ൽ മാറിയവ · What changed</h2>
    <p class="sub">നിങ്ങൾ എത്തിയ സമയത്ത് ഇവയെല്ലാം പ്രാബല്യത്തിൽ വന്നുകഴിഞ്ഞു. പഴയ ഉപദേശം ശ്രദ്ധിക്കുക.</p></div>
    <a class="pill" href="${href(sections[0].slug)}">വിശദമായി ${ic('arrow')}</a></div>
  <div class="notifwrap">${notifs}</div>
</div></section>

${cof.length ? `<section class="sec tight" id="coffee"><div class="wrap"><div class="coffee reveal">
  <div>
    <h2>കോഫി ഓർഡർ ചെയ്യുന്ന ഭാഷ</h2>
    <p class="sub">നാട്ടിലെ "കാപ്പി" പോലെയല്ല — ഇവിടെയുള്ളതെല്ലാം എസ്പ്രെസ്സോ അടിസ്ഥാനമാക്കിയുള്ളതാണ്.</p>
    <div class="tabs" id="coftabs">${coffeeTabs}</div>
    <div class="desc" id="cofdesc"></div>
    <p class="note">ഓർഡർ ചെയ്യുന്ന രീതി: "Can I get a large flat white, please?" · പാൽ മാറ്റം: oat / soy / almond (സാധാരണ 50–80 സെന്റ് അധികം) · പഞ്ചസാര സ്വയം ചേർക്കുന്നതാണ് പതിവ്.</p>
  </div>
  <div class="pic">${coffeeArt}</div>
</div></div></section>` : ''}
</main>`;
}

/* ------------------------------------------------ 7. assets */
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(path.join(DIST, 'assets'), { recursive: true });
fs.writeFileSync(path.join(DIST, 'assets', 'styles.css'), THEME_CSS.trim());

const APP_JS = `/* built by build.mjs — edit the source there, not here */
(function(){
  "use strict";
  var BASE=${JSON.stringify(BP)};
  var COFFEE=${JSON.stringify((CFG.coffee || []).map((c) => c.desc))};
  function get(k){try{return localStorage.getItem(k)}catch(e){return null}}
  function set(k,v){try{localStorage.setItem(k,v)}catch(e){}}

  /* theme */
  var tb=document.getElementById('themebtn');
  if(tb)tb.addEventListener('click',function(){
    var cur=document.documentElement.getAttribute('data-theme'),dark;
    if(cur)dark=cur==='dark';
    else dark=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;
    var next=dark?'light':'dark';
    document.documentElement.setAttribute('data-theme',next);set('kag-theme',next);
  });

  /* mobile sheet */
  var nb=document.getElementById('navbtn'),sh=document.getElementById('sheet');
  if(nb&&sh){
    var open=function(v){sh.classList.toggle('open',v);nb.setAttribute('aria-expanded',v?'true':'false')};
    nb.addEventListener('click',function(){open(!sh.classList.contains('open'))});
    sh.addEventListener('click',function(e){if(e.target===sh||e.target.closest('a'))open(false)});
    document.addEventListener('keydown',function(e){if(e.key==='Escape')open(false)});
  }

  /* emergency drawer */
  var fab=document.getElementById('fab'),dr=document.getElementById('drawer');
  if(fab&&dr){
    fab.addEventListener('click',function(e){
      e.stopPropagation();
      var o=dr.classList.toggle('open');fab.setAttribute('aria-expanded',o?'true':'false');
    });
    document.addEventListener('click',function(e){
      if(!dr.contains(e.target)&&!fab.contains(e.target)){dr.classList.remove('open');fab.setAttribute('aria-expanded','false')}
    });
    document.addEventListener('keydown',function(e){
      if(e.key==='Escape'){dr.classList.remove('open');fab.setAttribute('aria-expanded','false')}
    });
  }

  /* coffee tabs */
  var tabs=document.getElementById('coftabs'),desc=document.getElementById('cofdesc');
  if(tabs&&desc){
    var pick=function(i){
      desc.innerHTML=COFFEE[i]||'';
      [].forEach.call(tabs.querySelectorAll('.tab'),function(t){t.classList.toggle('on',+t.dataset.c===i)});
    };
    tabs.addEventListener('click',function(e){
      var t=e.target.closest('.tab');if(t)pick(+t.dataset.c);
    });
    pick(0);
  }

  /* checklist + ring, remembered per browser */
  var list=document.getElementById('cklist');
  if(list){
    var boxes=[].slice.call(list.querySelectorAll('input[type=checkbox]'));
    var ring=document.getElementById('ringfg'),val=document.getElementById('ringval');
    var C=2*Math.PI*64;
    var draw=function(){
      var n=boxes.filter(function(b){return b.checked}).length;
      if(val)val.textContent=n+'/'+boxes.length;
      if(ring)ring.style.strokeDashoffset=C-(boxes.length?n/boxes.length:0)*C;
    };
    boxes.forEach(function(b,i){
      var key='kag-ck'+(b.id||i);
      if(get(key)==='1')b.checked=true;
      b.addEventListener('change',function(){set(key,b.checked?'1':'0');draw()});
    });
    var rs=document.getElementById('ckreset');
    if(rs)rs.addEventListener('click',function(){
      boxes.forEach(function(b,i){b.checked=false;set('kag-ck'+(b.id||i),'0')});draw();
    });
    draw();
  }

  /* reading progress */
  var pr=document.getElementById('prog');
  if(pr){
    var tick=function(){
      var h=document.documentElement,max=h.scrollHeight-h.clientHeight;
      pr.style.width=(max>0?Math.min(100,h.scrollTop/max*100):0)+'%';
    };
    addEventListener('scroll',tick,{passive:true});addEventListener('resize',tick);tick();
  }

  /* search */
  var q=document.getElementById('q'),box=document.getElementById('results');
  if(q&&box){
    var idx=null,t=null;
    var load=function(){
      if(idx)return Promise.resolve(idx);
      return fetch(BASE+'/search-index.json').then(function(r){return r.json()}).then(function(j){idx=j;return j});
    };
    var run=function(){
      var s=q.value.trim().toLowerCase();
      if(s.length<2){box.hidden=true;box.innerHTML='';return}
      load().then(function(rows){
        var hits=[];
        for(var i=0;i<rows.length&&hits.length<14;i++){
          var r=rows[i];
          if(r.h.toLowerCase().indexOf(s)>-1||r.t.toLowerCase().indexOf(s)>-1)hits.push(r);
        }
        box.innerHTML=hits.length
          ?hits.map(function(r){return '<a href="'+r.u+'"><b>'+r.s+'</b>'+r.h+'</a>'}).join('')
          :'<p class="none">ഒന്നും കിട്ടിയില്ല · No matches</p>';
        box.hidden=false;
      }).catch(function(){box.hidden=true});
    };
    q.addEventListener('input',function(){clearTimeout(t);t=setTimeout(run,110)});
    q.addEventListener('focus',load);
    var go=document.getElementById('qgo');if(go)go.addEventListener('click',function(){q.focus();run()});
    document.addEventListener('click',function(e){
      if(!box.contains(e.target)&&e.target!==q)box.hidden=true;
    });
  }

  /* reveal on scroll */
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}});
    },{threshold:.12});
    [].forEach.call(document.querySelectorAll('.reveal'),function(el){io.observe(el)});
  }else{
    [].forEach.call(document.querySelectorAll('.reveal'),function(el){el.classList.add('in')});
  }

  /* offline cache */
  if('serviceWorker' in navigator)addEventListener('load',function(){
    navigator.serviceWorker.register(BASE+'/sw.js').catch(function(){});
  });
})();`;
fs.writeFileSync(path.join(DIST, 'assets', 'app.js'), APP_JS);

/* photos */
const PH = path.join(ROOT, 'content', 'photos');
let photoCount = 0;
if (fs.existsSync(PH)) {
  const out = path.join(DIST, 'assets', 'photos');
  fs.mkdirSync(out, { recursive: true });
  /* Only files, and only real image types. Keeping source art in a subfolder
     here is a reasonable thing to do, and a flat copyFileSync throws EISDIR on
     the first directory it meets, which fails the whole build. */
  const OK = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.svg']);
  for (const f of fs.readdirSync(PH)) {
    const from = path.join(PH, f);
    if (!fs.statSync(from).isFile()) continue;
    if (!OK.has(path.extname(f).toLowerCase())) continue;
    fs.copyFileSync(from, path.join(out, f));
    photoCount++;
  }
}

/* search index */
const index = [];
sections.forEach((s) => {
  sectionHtml[s.id].split(/(?=<h[34])/).forEach((b) => {
    const head = strip((b.match(/<h[34][^>]*>([\s\S]*?)<\/h[34]>/) || [])[1] || '') || s.title;
    const text = strip(b).slice(0, 600);
    if (text.length > 40) index.push({ s: s.titleEn, u: href(s.slug), h: head, t: text });
  });
});
fs.writeFileSync(path.join(DIST, 'search-index.json'), JSON.stringify(index));

/* ------------------------------------------------ 8. write pages */
sections.forEach((s, i) => {
  const prev = sections[i - 1], next = sections[i + 1];
  const pager = `<div class="pager">
    ${prev ? `<a class="prev" href="${href(prev.slug)}"><span>← മുൻപത്തേത്</span>${prev.title}</a>`
      : `<a class="prev" href="${href('')}"><span>← ആദ്യ പേജ്</span>${CFG.siteName}</a>`}
    ${next ? `<a class="next" href="${href(next.slug)}"><span>അടുത്തത് →</span>${next.title}</a>` : ''}</div>`;

  const body = `<div class="page">${rail(s.slug)}<main class="doc" id="main">
    ${prepare(sectionHtml[s.id], i + 1, s)}${volatileBox(s)}${pager}</main></div>`;

  fs.mkdirSync(path.join(DIST, s.slug), { recursive: true });
  fs.writeFileSync(path.join(DIST, s.slug, 'index.html'), page({
    slug: s.slug, title: s.title, titleEn: s.titleEn,
    desc: s.blurb, descEn: s.descriptionEn, keywords: s.keywords,
    body, prog: true,
    jsonld: {
      '@context': 'https://schema.org', '@type': 'Article',
      headline: `${s.title} — ${s.titleEn}`, description: s.descriptionEn,
      inLanguage: CFG.lang, url: url(s.slug), dateModified: CFG.lastVerified,
      author: PERSON,
      isPartOf: { '@type': 'WebSite', name: CFG.siteNameEn, url: url('') },
    },
  }));
});

fs.writeFileSync(path.join(DIST, 'index.html'), page({
  slug: '', title: CFG.tagline, titleEn: CFG.taglineEn,
  desc: CFG.description, descEn: CFG.descriptionEn, isHome: true,
  keywords: 'malayali australia guide, kerala to australia, moving to australia malayalam, australian culture for indians, new migrant australia checklist',
  body: homeBody(),
  jsonld: {
    '@context': 'https://schema.org', '@type': 'WebSite',
    name: CFG.siteNameEn, alternateName: CFG.siteName,
    description: CFG.descriptionEn, inLanguage: CFG.lang, url: url(''),
    author: PERSON,
    hasPart: sections.map((s) => ({ '@type': 'Article', name: s.titleEn, url: url(s.slug) })),
  },
}));

fs.writeFileSync(path.join(DIST, '404.html'), page({
  slug: '', title: 'പേജ് കണ്ടെത്താനായില്ല', titleEn: 'Page not found',
  desc: 'ഈ വിലാസത്തിൽ ഒന്നുമില്ല.', descEn: 'Nothing at this address.',
  body: `<main id="main" class="wrap" style="padding-block:70px 90px;max-width:62ch">
    <h1 style="font-size:clamp(1.8rem,5vw,2.6rem)">പേജ് കണ്ടെത്താനായില്ല</h1>
    <p style="margin-top:15px;color:var(--soft)">ഈ വിലാസത്തിൽ ഒന്നുമില്ല. മുകളിലെ മെനുവിൽ നിന്ന് തിരഞ്ഞെടുക്കുക, അല്ലെങ്കിൽ <a style="color:var(--indigo);text-decoration:underline" href="${href('')}">ആദ്യ പേജിലേക്ക്</a> പോകുക.</p></main>`,
  jsonld: { '@context': 'https://schema.org', '@type': 'WebPage', name: 'Page not found' },
}));

/* icon, manifest, sw, sitemap, robots */
fs.writeFileSync(path.join(DIST, 'assets', 'icon.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4F46E5"/><stop offset="1" stop-color="#0D9488"/></linearGradient></defs><rect width="64" height="64" rx="15" fill="url(#g)"/><path d="M14 38 L50 20 L40 46 L33 34 Z" fill="none" stroke="#fff" stroke-width="4.5" stroke-linejoin="round" stroke-linecap="round"/></svg>`);

fs.writeFileSync(path.join(DIST, 'manifest.webmanifest'), JSON.stringify({
  name: CFG.siteNameEn, short_name: 'KL → AU', description: CFG.descriptionEn,
  start_url: BP + '/', display: 'standalone',
  background_color: '#F5F7FB', theme_color: '#4F46E5', lang: CFG.lang,
  icons: [{ src: BP + '/assets/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
}, null, 2));

const cacheList = ['', ...sections.map((s) => s.slug)].map(href)
  .concat([BP + '/assets/styles.css', BP + '/assets/app.js', BP + '/search-index.json']);
fs.writeFileSync(path.join(DIST, 'sw.js'), `const C='guide-${CFG.lastVerified}-${sections.length}-v2';
const PRE=${JSON.stringify(cacheList)};
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(PRE)).then(()=>self.skipWaiting()).catch(()=>{}))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;
  e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(C).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request)));
});`);

const today = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path.join(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  [{ loc: url(''), p: '1.0' }, ...sections.map((s) => ({ loc: url(s.slug), p: '0.8' }))]
    .map((u) => `  <url><loc>${u.loc}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>${u.p}</priority></url>`).join('\n') +
  `\n</urlset>\n`);

const OG = path.join(ROOT, 'content', 'og');
let ogCount = 0;
if (fs.existsSync(OG)) for (const f of fs.readdirSync(OG)) {
  if (/\.(jpe?g|png)$/.test(f)) { fs.copyFileSync(path.join(OG, f), path.join(DIST, 'assets', f)); ogCount++; }
}

fs.writeFileSync(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${BASE}/sitemap.xml\n`);
fs.writeFileSync(path.join(DIST, '.nojekyll'), '');

console.log(`built ${sections.length} section pages + home`);
console.log(`  base url : ${BASE}`);
console.log(`  search   : ${index.length} entries`);
console.log(`  photos   : ${photoCount}   og cards: ${ogCount}`);
if (CFG.siteUrl.includes('example.com')) console.log('\n!! siteUrl is still the placeholder.');
