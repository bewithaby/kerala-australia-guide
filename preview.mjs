#!/usr/bin/env node
/**
 * Builds design variants into dist/preview/<id>/ so they can be compared live
 * without touching the published site. Every preview page is noindex and is
 * kept out of sitemap.xml.
 *
 *   node preview.mjs          # all variants
 *   node preview.mjs a        # just one
 *
 * Each variant is a theme: a palette, a type pairing, a page shell and a home
 * page. They share the same content, parsed from content/guide.html.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const CFG = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.config.json'), 'utf8'));
const SRC = fs.readFileSync(path.join(ROOT, 'content', 'guide.html'), 'utf8');
const DIST = path.join(ROOT, 'dist');
const BP = CFG.basePath || '';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const strip = (h) => h.replace(/<(script|style)[\s\S]*?<\/\1>/g, ' ').replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

/* ---------- shared content parsing (same rules as build.mjs) ---------- */
const baseCss = SRC.slice(SRC.indexOf('<style>') + 7, SRC.indexOf('</style>'));
let baseJs = SRC.slice(SRC.lastIndexOf('<script>') + 8, SRC.lastIndexOf('</script>'));
baseJs = baseJs.replace(
  /var targets = links\.map\(function\(a\)\{[\s\S]*?\.filter\(Boolean\);/,
  `var targets = links.filter(function(a){return (a.getAttribute('href')||'').charAt(0)==='#';})
    .map(function(a){try{return document.querySelector(a.getAttribute('href'))}catch(e){return null}}).filter(Boolean);`
);
const fontBase = 'https://fonts.googleapis.com/css2?family=Anek+Malayalam:wght@500;600;700&family=Manjari:wght@400;700&family=IBM+Plex+Sans:wght@400;500;600&display=swap';

const marks = [...SRC.matchAll(/<section[^>]*\bid="(s\d+)"[^>]*>/g)].map((m) => ({ id: m[1], start: m.index }));
const sectionHtml = {};
marks.forEach((m, i) => {
  const end = marks[i + 1] ? marks[i + 1].start : SRC.lastIndexOf('</main>');
  sectionHtml[m.id] = SRC.slice(m.start, end).replace(/^<section[^>]*>/, '').replace(/<\/section>\s*$/, '').trim();
});
const sections = CFG.sections.filter((s) => sectionHtml[s.id]);

function prepare(html, n, s) {
  if (html.includes('class="sechead"')) {
    html = html.replace(/(<span class="num">)[\s\S]*?(<\/span>)/, `$1${String(n).padStart(2, '0')}$2`);
  } else {
    html = `<div class="wrap"><div class="sechead"><span class="num">${String(n).padStart(2, '0')}</span>` +
      `<h2>${s.title}</h2></div><p class="lede">${s.blurb}</p></div>` + html;
  }
  const hs = [...html.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/g)].map((m) => strip(m[1])).filter(Boolean);
  let i = 0;
  html = html.replace(/<h3([^>]*)>/g, (m, a) => `<h3${a} id="h${++i}">`);
  return { html, heads: hs };
}

/* ---------- per-section accent + generated hero artwork ---------- */
/* Photographs would go here. Until licensed files exist, each section gets a
   generated SVG band drawn from its own subject, so nothing looks unfinished.
   Drop a file at content/photos/<slug>.jpg and it is used instead. */
const ACCENT = {
  'whats-changed-2026': ['#2f6f52', '#8fc9ad'],
  etiquette: ['#1f6b78', '#86cdd8'],
  'home-bathroom-bins': ['#6b4ea8', '#bda6e6'],
  'food-groceries': ['#a8622a', '#eab489'],
  'health-services': ['#9c2f4a', '#efa0b2'],
  workplace: ['#2b5f9e', '#9ec4ee'],
  'roads-parking-safety': ['#8a5a06', '#e9c477'],
  'children-school': ['#2d7a4e', '#9ad8b3'],
  'money-time-jobs': ['#55596b', '#b4b8c8'],
  comparison: ['#7a3f6b', '#d7a6cb'],
  'first-30-days': ['#245f46', '#8ac9ac'],
};

/* Flat vector scenes, one per section, drawn from that section's own subject.
   Placeholder gradients read as unfinished; a drawn motif does not. These are
   replaced automatically the moment a real photo exists for the slug. */
const SCENE = {
  'whats-changed-2026': (c) => `
    <rect x="470" y="86" width="260" height="212" rx="18" fill="none" stroke="${c}" stroke-width="7"/>
    <path d="M470 150h260" stroke="${c}" stroke-width="7"/>
    <path d="M528 62v42M672 62v42" stroke="${c}" stroke-width="7" stroke-linecap="round"/>
    ${[0,1,2].map(r=>[0,1,2,3].map(k=>`<rect x="${502+k*52}" y="${174+r*40}" width="22" height="22" rx="5" fill="${c}" opacity="${r===1&&k===2?'1':'.34'}"/>`).join('')).join('')}
    <circle cx="658" cy="226" r="30" fill="none" stroke="${c}" stroke-width="6"/>`,
  etiquette: (c) => `
    <path d="M330 110h300a26 26 0 0 1 26 26v104a26 26 0 0 1-26 26H430l-60 48v-48h-40a26 26 0 0 1-26-26V136a26 26 0 0 1 26-26Z" fill="none" stroke="${c}" stroke-width="7"/>
    <path d="M700 168h190a22 22 0 0 1 22 22v86a22 22 0 0 1-22 22h-54v38l-46-38h-90a22 22 0 0 1-22-22v-86a22 22 0 0 1 22-22Z" fill="${c}" opacity=".3"/>
    <path d="M378 170h190M378 206h150" stroke="${c}" stroke-width="7" stroke-linecap="round"/>`,
  'home-bathroom-bins': (c) => [0,1,2,3].map(i=>`
    <g transform="translate(${372+i*126} 96)">
      <rect x="10" y="44" width="92" height="140" rx="10" fill="${c}" opacity=".26"/>
      <rect x="0" y="22" width="112" height="26" rx="9" fill="${c}" opacity="${[1,.78,.56,.36][i]}"/>
      <rect x="42" y="6" width="28" height="18" rx="6" fill="${c}" opacity="${[1,.78,.56,.36][i]}"/>
      <path d="M34 72v88M56 72v88M78 72v88" stroke="${c}" stroke-width="5" opacity=".4"/>
    </g>`).join(''),
  'food-groceries': (c) => `
    <path d="M352 112h44l46 150h236l44-104H452" fill="none" stroke="${c}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="470" cy="300" r="22" fill="${c}"/><circle cx="636" cy="300" r="22" fill="${c}"/>
    <rect x="750" y="128" width="118" height="118" rx="14" fill="${c}" opacity=".3"/>
    <path d="M868 156h30a26 26 0 0 1 0 52h-30" fill="none" stroke="${c}" stroke-width="8"/>
    <path d="M778 96c0 16-14 16-14 32M812 92c0 16-14 16-14 32M846 96c0 16-14 16-14 32" stroke="${c}" stroke-width="6" stroke-linecap="round" opacity=".75"/>`,
  'health-services': (c) => `
    <rect x="398" y="92" width="170" height="216" rx="16" fill="none" stroke="${c}" stroke-width="7"/>
    <path d="M466 140v56M438 168h56" stroke="${c}" stroke-width="12" stroke-linecap="round"/>
    <path d="M596 200h150" stroke="${c}" stroke-width="7" stroke-dasharray="20 16" stroke-linecap="round"/>
    <path d="M746 200l-20-14v28Z" fill="${c}"/>
    <rect x="770" y="92" width="170" height="216" rx="16" fill="${c}" opacity=".26"/>
    <circle cx="855" cy="166" r="30" fill="none" stroke="${c}" stroke-width="7"/>
    <path d="M805 262c0-32 22-52 50-52s50 20 50 52" fill="none" stroke="${c}" stroke-width="7" stroke-linecap="round"/>`,
  workplace: (c) => `
    <rect x="380" y="112" width="296" height="190" rx="14" fill="none" stroke="${c}" stroke-width="7"/>
    <path d="M344 302h368" stroke="${c}" stroke-width="7" stroke-linecap="round"/>
    <path d="M424 160h150M424 196h210M424 232h118" stroke="${c}" stroke-width="7" stroke-linecap="round" opacity=".55"/>
    <circle cx="830" cy="200" r="86" fill="none" stroke="${c}" stroke-width="7"/>
    <path d="M830 148v56l40 26" fill="none" stroke="${c}" stroke-width="8" stroke-linecap="round"/>`,
  'roads-parking-safety': (c) => `
    <rect x="452" y="70" width="178" height="150" rx="12" fill="${c}" opacity=".9"/>
    <text x="541" y="152" text-anchor="middle" font-family="system-ui,sans-serif" font-size="74" font-weight="700" fill="#10251c">2P</text>
    <text x="541" y="192" text-anchor="middle" font-family="system-ui,sans-serif" font-size="25" font-weight="600" fill="#10251c">MON-FRI</text>
    <rect x="532" y="220" width="18" height="128" rx="6" fill="${c}" opacity=".6"/>
    <path d="M700 196h40M780 196h40M860 196h40M940 196h40" stroke="${c}" stroke-width="12" stroke-linecap="round" opacity=".7"/>
    <path d="M238 196h40M318 196h40M398 196h20" stroke="${c}" stroke-width="12" stroke-linecap="round" opacity=".45"/>`,
  'children-school': (c) => `
    <path d="M436 170c0-42 30-64 66-64s66 22 66 64" fill="none" stroke="${c}" stroke-width="8"/>
    <rect x="414" y="170" width="176" height="146" rx="20" fill="${c}" opacity=".3"/>
    <rect x="462" y="206" width="80" height="54" rx="10" fill="none" stroke="${c}" stroke-width="7"/>
    <ellipse cx="790" cy="214" rx="136" ry="30" fill="${c}" opacity=".32"/>
    <path d="M700 214c0-50 40-82 90-82s90 32 90 82" fill="none" stroke="${c}" stroke-width="8"/>
    <path d="M790 132V96" stroke="${c}" stroke-width="7" stroke-linecap="round"/>`,
  'money-time-jobs': (c) => `
    <circle cx="470" cy="196" r="100" fill="none" stroke="${c}" stroke-width="7"/>
    <path d="M470 130v66l44 28" fill="none" stroke="${c}" stroke-width="8" stroke-linecap="round"/>
    <text x="470" y="340" text-anchor="middle" font-family="system-ui,sans-serif" font-size="27" font-weight="600" fill="${c}">KOCHI</text>
    <circle cx="730" cy="196" r="100" fill="${c}" opacity=".26"/>
    <circle cx="730" cy="196" r="100" fill="none" stroke="${c}" stroke-width="7"/>
    <path d="M730 130v66l-54 16" fill="none" stroke="${c}" stroke-width="8" stroke-linecap="round"/>
    <text x="730" y="340" text-anchor="middle" font-family="system-ui,sans-serif" font-size="27" font-weight="600" fill="${c}">SYDNEY</text>`,
  comparison: (c) => `
    <rect x="356" y="84" width="200" height="228" rx="16" fill="${c}" opacity=".26"/>
    <rect x="644" y="84" width="200" height="228" rx="16" fill="none" stroke="${c}" stroke-width="7"/>
    ${[0,1,2,3].map(i=>`<path d="M392 ${134+i*48}h128M680 ${134+i*48}h128" stroke="${c}" stroke-width="7" stroke-linecap="round" opacity="${i?'.5':'.85'}"/>`).join('')}
    <path d="M574 182h52M574 214h52" stroke="${c}" stroke-width="7" stroke-linecap="round"/>
    <path d="M626 182l-16-11v22ZM574 214l16-11v22Z" fill="${c}"/>`,
  'first-30-days': (c) => [0,1,2,3,4].map(i=>`
    <g transform="translate(${330+i*112} ${118+ (i%2?26:0)})" opacity="${.42+i*.145}">
      <rect x="0" y="0" width="74" height="74" rx="17" fill="none" stroke="${c}" stroke-width="7"/>
      <path d="M19 38l16 17 26-31" fill="none" stroke="${c}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M0 108h74" stroke="${c}" stroke-width="7" stroke-linecap="round" opacity=".5"/>
    </g>`).join(''),
};

function artwork(slug, w = 1200, h = 400) {
  const [bg, fg] = ACCENT[slug] || ['#245f46', '#8ac9ac'];
  const scene = (SCENE[slug] || SCENE.etiquette)(fg);
  const dots = [];
  for (let y = 26; y < 400; y += 52) for (let x = 26; x < 1200; x += 52) dots.push(`<circle cx="${x}" cy="${y}" r="2.4"/>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 400" preserveAspectRatio="xMidYMid slice" role="presentation">
<rect width="1200" height="400" fill="${bg}"/>
<g fill="${fg}" opacity=".14">${dots.join('')}</g>
${scene}</svg>`;
}

const photoFor = (slug) => {
  for (const ext of ['jpg', 'jpeg', 'png', 'webp']) {
    if (fs.existsSync(path.join(ROOT, 'content', 'photos', `${slug}.${ext}`))) return `${slug}.${ext}`;
  }
  return null;
};

/* ---------- variants ---------- */
const VARIANTS = {};

/* ========== A · editorial ========== */
VARIANTS.a = {
  name: 'Editorial',
  nameMl: 'എഡിറ്റോറിയൽ',
  note: 'വലിയ ചിത്രങ്ങൾ, സീരിഫ് തലക്കെട്ടുകൾ, വിശാലമായ ഇടം. ഒരു നല്ല മാസികയുടെ ദീർഘ ലേഖനം പോലെ.',
  font: 'https://fonts.googleapis.com/css2?family=Noto+Serif+Malayalam:wght@500;600;700&family=Manjari:wght@400;700&family=Fraunces:opsz,wght@9..144,600;9..144,700&family=IBM+Plex+Sans:wght@400;500;600&display=swap',
  css: `
:root{
  --paper:#faf7f2;--surface:#fffdfa;--surface-2:#f0ebe2;--ink:#191714;--ink-soft:#56504a;
  --ink-faint:#8a8178;--rule:#e0d8cb;--euc:#1f5c45;--euc-soft:#e7efe9;--lat:#a0452f;--lat-soft:#f6e8e3;
  --f-display:'Noto Serif Malayalam','Fraunces',Georgia,serif;
  --f-body:'Manjari','Noto Sans Malayalam',system-ui,sans-serif;
  --f-ui:'IBM Plex Sans',system-ui,sans-serif;
}
@media(prefers-color-scheme:dark){:root:not([data-theme="light"]){
  --paper:#14120f;--surface:#1c1915;--surface-2:#262219;--ink:#f0ebe3;--ink-soft:#aba296;
  --ink-faint:#857c71;--rule:#332e26;--euc:#7cc0a2;--euc-soft:#1a2a22;--lat:#dd9279;--lat-soft:#2b1d18;color-scheme:dark}}
:root[data-theme="dark"]{
  --paper:#14120f;--surface:#1c1915;--surface-2:#262219;--ink:#f0ebe3;--ink-soft:#aba296;
  --ink-faint:#857c71;--rule:#332e26;--euc:#7cc0a2;--euc-soft:#1a2a22;--lat:#dd9279;--lat-soft:#2b1d18;color-scheme:dark}
body{font-size:19px;line-height:1.85}
h1,h2,h3,h4{font-family:var(--f-display);letter-spacing:-.005em}
.shell{grid-template-columns:minmax(0,1fr);max-width:none}
@media(min-width:1040px){.shell{grid-template-columns:minmax(0,1fr)}}
.side{display:none}
.topbar{background:color-mix(in srgb,var(--paper) 92%,transparent);border-bottom:1px solid var(--rule)}
.topbar,.ed-wrap{display:flex}
main{padding:0!important;max-width:none}
.ed{max-width:1180px;margin:0 auto;padding-left:max(20px,env(safe-area-inset-left,0px));padding-right:max(20px,env(safe-area-inset-right,0px))}
.ed-col{max-width:40rem;margin:0 auto}
.wrap{max-width:40rem;margin:0 auto}
/* section cover */
.cover{position:relative;margin:0 0 44px;border-radius:0 0 22px 22px;overflow:hidden;min-height:300px;display:flex;align-items:flex-end}
.cover img,.cover svg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.cover .scrim{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.08) 0%,rgba(0,0,0,.62) 100%)}
.cover .ct{position:relative;padding:34px 30px 32px;color:#fff;max-width:44rem}
.cover .kick{font-family:var(--f-ui);font-size:11.5px;font-weight:600;letter-spacing:.17em;text-transform:uppercase;opacity:.9}
.cover h1{font-size:clamp(30px,5.6vw,52px);line-height:1.14;margin-top:12px;color:#fff;text-wrap:balance}
.cover .en{display:block;font-family:var(--f-ui);font-size:13.5px;font-weight:500;letter-spacing:.03em;opacity:.85;margin-top:12px;color:#fff}
.cover .lede{color:rgba(255,255,255,.93);font-size:18px;margin-top:16px;line-height:1.6}
.sechead{display:none}
.wrap>p.lede:first-of-type{display:none}
/* editorial rhythm */
h3{font-size:clamp(23px,3.4vw,30px);margin-top:62px;margin-bottom:14px;padding-top:26px;border-top:1px solid var(--rule)}
h4{font-family:var(--f-ui);font-size:13px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--lat);margin-top:38px}
ul.plain>li::before{background:var(--lat);opacity:.65}
figure{margin-left:0;margin-right:0;border-radius:14px}
@media(min-width:1180px){figure,.tscroll{margin-left:-80px;margin-right:-80px}}
.call{border-left:4px solid var(--euc);border-radius:0 12px 12px 0}
.call.stop{border-left-color:var(--danger)}.call.warn{border-left-color:var(--signal)}
.call.money{border-left-color:var(--lat)}.call.good{border-left-color:var(--ok)}
/* home */
.hm-hero{padding:72px 0 56px;text-align:center}
.hm-hero .kick{font-family:var(--f-ui);font-size:11.5px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:var(--lat)}
.hm-hero h1{font-size:clamp(38px,8vw,78px);line-height:1.08;margin-top:18px;text-wrap:balance}
.hm-hero p{max-width:34rem;margin:22px auto 0;font-size:20px;color:var(--ink-soft);line-height:1.68}
.hm-hero .rule{width:64px;height:3px;background:var(--lat);margin:30px auto 0;border-radius:2px}
.feat{display:grid;gap:26px;margin-top:20px}
@media(min-width:860px){.feat{grid-template-columns:1fr 1fr}.feat>a:first-child{grid-column:1/-1}}
.feat a{display:block;text-decoration:none;color:inherit;border-radius:16px;overflow:hidden;background:var(--surface);border:1px solid var(--rule);transition:transform .18s ease,box-shadow .18s ease}
.feat a:hover{transform:translateY(-3px);box-shadow:0 18px 40px -22px rgba(0,0,0,.35)}
.feat .ph{position:relative;aspect-ratio:16/7;background:var(--surface-2)}
.feat>a:first-child .ph{aspect-ratio:24/7}
.feat .ph img,.feat .ph svg{width:100%;height:100%;object-fit:cover;display:block}
.feat .ph b{position:absolute;left:16px;top:14px;font-family:var(--f-ui);font-size:11px;font-weight:700;letter-spacing:.14em;color:#fff;background:rgba(0,0,0,.42);padding:5px 10px;border-radius:99px;backdrop-filter:blur(6px)}
.feat .tx{padding:20px 22px 24px}
.feat h3{font-size:23px;margin:0;padding:0;border:none}
.feat .en{display:block;font-family:var(--f-ui);font-size:11.5px;color:var(--ink-faint);margin-top:5px;letter-spacing:.03em}
.feat p{margin-top:11px;color:var(--ink-soft);font-size:16.5px;line-height:1.62}
.hm-sec{margin-top:62px}
.hm-sec>h2{font-family:var(--f-display);font-size:26px;padding-bottom:12px;border-bottom:2px solid var(--ink);display:inline-block}
.pager a{border-radius:12px}
`,
  cover(s, n) {
    const ph = photoFor(s.slug);
    const media = ph
      ? `<img src="${BP}/preview/assets/photos/${ph}" alt="">`
      : artwork(s.slug);
    return `<div class="cover">${media}<div class="scrim"></div><div class="ct">
      <div class="kick">${String(n).padStart(2, '0')} · ${esc(CFG.siteName)}</div>
      <h1>${s.title}<span class="en">${esc(s.titleEn)}</span></h1>
      <p class="lede">${s.blurb}</p></div></div>`;
  },
  home() {
    const card = (s, i) => {
      const ph = photoFor(s.slug);
      const media = ph ? `<img src="${BP}/preview/assets/photos/${ph}" alt="">` : artwork(s.slug);
      return `<a href="${BP}/preview/a/${s.slug}/">
        <div class="ph">${media}<b>${String(i + 1).padStart(2, '0')}</b></div>
        <div class="tx"><h3>${s.title}<span class="en">${esc(s.titleEn)}</span></h3><p>${s.blurb}</p></div></a>`;
    };
    return `<div class="ed"><div class="hm-hero">
      <div class="kick">കേരളം · ഓസ്‌ട്രേലിയ</div>
      <h1>${CFG.tagline}</h1>
      <p>${CFG.description}</p>
      <div class="rule"></div>
    </div>
    <div class="hm-sec"><h2>വിഭാഗങ്ങൾ</h2>
    <div class="feat">${sections.map(card).join('')}</div></div></div>`;
  },
  wrapBody(inner) { return `<div class="ed"><div class="ed-col">${inner}</div></div>`; },
};

/* ========== B · field manual ========== */
VARIANTS.b = {
  name: 'Field manual',
  nameMl: 'ഫീൽഡ് മാനുവൽ',
  note: 'സാന്ദ്രവും പ്രായോഗികവും. നമ്പറിട്ട നിയമങ്ങൾ, ഉറച്ച പട്ടികകൾ, ഇടതുവശത്ത് എപ്പോഴും കാണുന്ന സൂചിക. അലങ്കാരമില്ല, വേഗത്തിൽ കണ്ടെത്താം.',
  font: 'https://fonts.googleapis.com/css2?family=Anek+Malayalam:wght@500;600;700&family=Manjari:wght@400;700&family=IBM+Plex+Mono:wght@500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap',
  css: `
:root{
  --paper:#f7f7f5;--surface:#fff;--surface-2:#ecedea;--ink:#111312;--ink-soft:#4a4f4c;--ink-faint:#7d837f;
  --rule:#d4d7d3;--euc:#145c3f;--euc-soft:#e6efea;--lat:#9c3b22;--lat-soft:#f8e9e4;
  --f-display:'Anek Malayalam',system-ui,sans-serif;
  --f-body:'Manjari','Noto Sans Malayalam',system-ui,sans-serif;
  --f-ui:'IBM Plex Sans',system-ui,sans-serif;--f-mono:'IBM Plex Mono',ui-monospace,monospace;
}
@media(prefers-color-scheme:dark){:root:not([data-theme="light"]){
  --paper:#0e100f;--surface:#161918;--surface-2:#1f2321;--ink:#e9ece9;--ink-soft:#a3aaa6;--ink-faint:#787f7b;
  --rule:#2a2f2c;--euc:#5fbf92;--euc-soft:#132520;--lat:#e0836a;--lat-soft:#2a1813;color-scheme:dark}}
:root[data-theme="dark"]{
  --paper:#0e100f;--surface:#161918;--surface-2:#1f2321;--ink:#e9ece9;--ink-soft:#a3aaa6;--ink-faint:#787f7b;
  --rule:#2a2f2c;--euc:#5fbf92;--euc-soft:#132520;--lat:#e0836a;--lat-soft:#2a1813;color-scheme:dark}
body{font-size:17.5px;line-height:1.7}
.topbar{border-bottom:2px solid var(--ink);background:var(--paper)}
.topbar .mark{font-family:var(--f-ui);font-weight:700;letter-spacing:-.01em}
.shell{display:grid;grid-template-columns:minmax(0,1fr);max-width:1320px;margin:0 auto;gap:0}
@media(min-width:1000px){.shell{grid-template-columns:272px minmax(0,1fr)}}
.rail{display:none;font-family:var(--f-ui)}
@media(min-width:1000px){.rail{display:block;position:sticky;top:46px;align-self:start;max-height:calc(100vh - 60px);
  overflow-y:auto;border-right:1px solid var(--rule);padding:26px 22px 40px}}
.rail .lbl{font-family:var(--f-mono);font-size:10.5px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-faint);margin-bottom:12px}
.rail ol{list-style:none;margin:0 0 22px;padding:0;counter-reset:r}
.rail li{counter-increment:r;border-bottom:1px solid var(--rule)}
.rail li:first-child{border-top:1px solid var(--rule)}
.rail a{display:grid;grid-template-columns:30px 1fr;gap:8px;padding:9px 4px;text-decoration:none;color:var(--ink-soft);font-size:13.5px;line-height:1.35}
.rail a::before{content:counter(r,decimal-leading-zero);font-family:var(--f-mono);font-size:11px;color:var(--ink-faint);padding-top:2px}
.rail a:hover{color:var(--ink);background:var(--surface-2)}
.rail a.on{color:var(--euc);font-weight:600}
.rail a.on::before{color:var(--euc)}
.rail a em{grid-column:2;display:block;font-style:normal;font-size:10.5px;color:var(--ink-faint);letter-spacing:.02em;line-height:1.3;margin-top:2px}
main{padding-left:max(18px,env(safe-area-inset-left,0px));padding-right:max(18px,env(safe-area-inset-right,0px));padding-block:0 60px}
@media(min-width:1000px){main{padding-left:38px;padding-right:38px}}
.wrap{max-width:72ch}
.bhead{border-bottom:2px solid var(--ink);padding:30px 0 18px;margin-bottom:8px}
.bhead .no{font-family:var(--f-mono);font-size:12px;font-weight:600;letter-spacing:.16em;color:var(--lat)}
.bhead h1{font-family:var(--f-display);font-size:clamp(26px,4.6vw,40px);line-height:1.18;margin-top:9px}
.bhead .en{display:block;font-family:var(--f-ui);font-size:13px;font-weight:500;color:var(--ink-faint);margin-top:7px;letter-spacing:.03em}
.bhead p{margin-top:13px;color:var(--ink-soft);font-size:17px;max-width:70ch}
.sechead{display:none}.wrap>p.lede:first-of-type{display:none}
h3{font-family:var(--f-display);font-size:21px;margin-top:40px;margin-bottom:10px;padding-left:0;counter-increment:h3c}
h3::before{content:counter(h3c) ". ";font-family:var(--f-mono);font-size:15px;color:var(--lat);font-weight:600}
main{counter-reset:h3c}
h4{font-family:var(--f-mono);font-size:11.5px;letter-spacing:.11em;text-transform:uppercase;color:var(--ink-faint);margin-top:26px}
.call{border-radius:4px;border-left-width:4px;border-left-style:solid}
.call.stop{border-left-color:var(--danger)}.call.warn{border-left-color:var(--signal)}
.call.law{border-left-color:var(--euc)}.call.money{border-left-color:var(--lat)}.call.good{border-left-color:var(--ok)}
.tscroll{border-radius:4px}
thead th{font-family:var(--f-mono);font-size:10.5px}
figure{border-radius:4px;box-shadow:none}
.onpage{border-radius:4px;font-family:var(--f-ui)}
.onpage a{border-radius:3px;background:var(--surface-2);color:var(--ink)}
.pager a{border-radius:4px}
/* home */
.bhome{padding:34px 0 10px}
.bhome h1{font-family:var(--f-display);font-size:clamp(30px,6vw,50px);line-height:1.12}
.bhome p{margin-top:16px;color:var(--ink-soft);max-width:62ch;font-size:18px}
.btab{width:100%;border-collapse:collapse;margin-top:32px;font-size:16.5px}
.btab th{font-family:var(--f-mono);font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-faint);
  text-align:left;padding:10px 12px;border-bottom:2px solid var(--ink)}
.btab td{padding:14px 12px;border-bottom:1px solid var(--rule);vertical-align:top}
.btab tr:hover td{background:var(--surface-2)}
.btab .n{font-family:var(--f-mono);font-size:12.5px;color:var(--ink-faint);width:1%;white-space:nowrap}
.btab a{font-family:var(--f-display);font-weight:600;font-size:18px;color:var(--ink);text-decoration:none}
.btab a:hover{color:var(--euc);text-decoration:underline}
.btab em{display:block;font-family:var(--f-ui);font-style:normal;font-size:11.5px;color:var(--ink-faint);margin-top:2px}
.btab .d{color:var(--ink-soft);font-size:15.5px;line-height:1.55}
@media(max-width:700px){.btab .d{display:none}}
`,
  rail(active) {
    return `<nav class="rail"><div class="lbl">Contents</div><ol>${sections.map((s) =>
      `<li><a href="${BP}/preview/b/${s.slug}/"${s.slug === active ? ' class="on"' : ''}>${s.title}<em>${esc(s.titleEn)}</em></a></li>`
    ).join('')}</ol></nav>`;
  },
  cover(s, n) {
    return `<div class="bhead"><div class="no">SECTION ${String(n).padStart(2, '0')}</div>
      <h1>${s.title}<span class="en">${esc(s.titleEn)}</span></h1><p>${s.blurb}</p></div>`;
  },
  home() {
    const rows = sections.map((s, i) => `<tr>
      <td class="n">${String(i + 1).padStart(2, '0')}</td>
      <td><a href="${BP}/preview/b/${s.slug}/">${s.title}<em>${esc(s.titleEn)}</em></a></td>
      <td class="d">${s.blurb}</td></tr>`).join('');
    return `<div class="bhome"><h1>${CFG.tagline}</h1><p>${CFG.description}</p>
      <table class="btab"><thead><tr><th></th><th>വിഭാഗം</th><th>എന്താണ് ഉള്ളത്</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  },
  wrapBody(inner) { return `<div class="wrap">${inner}</div>`; },
};

/* ========== C · task first ========== */
VARIANTS.c = {
  name: 'Task first',
  nameMl: 'ആവശ്യം ആദ്യം',
  note: 'ഒരു ആപ്പ് പോലെ. വലിയ തിരയൽ പെട്ടി, ടാപ്പ് ചെയ്യാവുന്ന ടൈലുകൾ, ഫോണിൽ താഴെ സ്ഥിരം മെനു, വായിച്ച വിഭാഗങ്ങൾ അടയാളപ്പെടുത്തും.',
  font: 'https://fonts.googleapis.com/css2?family=Anek+Malayalam:wght@500;600;700&family=Manjari:wght@400;700&family=IBM+Plex+Sans:wght@400;500;600&display=swap',
  css: `
:root{
  --paper:#eef1f4;--surface:#fff;--surface-2:#e3e8ed;--ink:#0f1720;--ink-soft:#4a5765;--ink-faint:#7d8a98;
  --rule:#d6dde4;--euc:#0e6b4f;--euc-soft:#dff0e8;--lat:#b0452c;--lat-soft:#fae6e0;
  --radius:18px;
  --f-display:'Anek Malayalam',system-ui,sans-serif;
  --f-body:'Manjari','Noto Sans Malayalam',system-ui,sans-serif;
  --f-ui:'IBM Plex Sans',system-ui,sans-serif;
}
@media(prefers-color-scheme:dark){:root:not([data-theme="light"]){
  --paper:#0c1116;--surface:#151c23;--surface-2:#1d262f;--ink:#e8eef4;--ink-soft:#9fb0c0;--ink-faint:#748595;
  --rule:#26323c;--euc:#4fc496;--euc-soft:#102a21;--lat:#e8927a;--lat-soft:#2a1711;color-scheme:dark}}
:root[data-theme="dark"]{
  --paper:#0c1116;--surface:#151c23;--surface-2:#1d262f;--ink:#e8eef4;--ink-soft:#9fb0c0;--ink-faint:#748595;
  --rule:#26323c;--euc:#4fc496;--euc-soft:#102a21;--lat:#e8927a;--lat-soft:#2a1711;color-scheme:dark}
body{font-size:18px;line-height:1.78;padding-bottom:72px}
@media(min-width:900px){body{padding-bottom:0}}
.topbar{background:color-mix(in srgb,var(--paper) 86%,transparent);border-bottom:1px solid var(--rule)}
.shell{max-width:980px;margin:0 auto;display:block}
main{padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:0 40px}
.wrap{max-width:66ch}
/* search hero */
.chero{padding:36px 0 10px}
.chero h1{font-family:var(--f-display);font-size:clamp(27px,5.6vw,42px);line-height:1.16}
.chero p{margin-top:12px;color:var(--ink-soft);font-size:17.5px;max-width:52ch}
.cfind{margin-top:24px;position:relative}
.cfind input{width:100%;font-family:var(--f-body);font-size:18px;padding:17px 20px 17px 52px;border-radius:99px;
  border:1px solid var(--rule);background:var(--surface);color:var(--ink);box-shadow:0 2px 14px -8px rgba(0,0,0,.3)}
.cfind input:focus{outline:2px solid var(--euc);outline-offset:2px}
.cfind svg{position:absolute;left:19px;top:50%;transform:translateY(-50%);width:20px;height:20px;fill:none;stroke:var(--ink-faint);stroke-width:2}
.cres{margin-top:10px;background:var(--surface);border:1px solid var(--rule);border-radius:16px;overflow:hidden}
.cres a{display:block;padding:13px 18px;border-bottom:1px solid var(--rule);text-decoration:none;color:var(--ink);font-size:16px;line-height:1.5}
.cres a:last-child{border-bottom:none}.cres a:hover{background:var(--euc-soft)}
.cres b{display:block;font-family:var(--f-ui);font-size:10.5px;font-weight:600;letter-spacing:.07em;text-transform:uppercase;color:var(--euc);margin-bottom:3px}
.cres .none{padding:16px 18px;color:var(--ink-faint);font-size:16px}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}
.chips span{font-family:var(--f-ui);font-size:11px;font-weight:600;letter-spacing:.09em;text-transform:uppercase;color:var(--ink-faint);align-self:center;margin-right:2px}
.chips a{font-size:15px;padding:7px 15px;border-radius:99px;background:var(--surface);border:1px solid var(--rule);text-decoration:none;color:var(--ink)}
.chips a:hover{border-color:var(--euc);color:var(--euc)}
/* tiles */
.tiles{display:grid;gap:13px;margin-top:34px;grid-template-columns:1fr}
@media(min-width:600px){.tiles{grid-template-columns:1fr 1fr}}
@media(min-width:900px){.tiles{grid-template-columns:1fr 1fr 1fr}}
.tile{display:flex;flex-direction:column;gap:9px;padding:19px 20px 21px;border-radius:var(--radius);background:var(--surface);
  border:1px solid var(--rule);text-decoration:none;color:var(--ink);position:relative;transition:transform .15s,border-color .15s}
.tile:hover{transform:translateY(-2px);border-color:var(--euc)}
.tile .ic{width:42px;height:42px;border-radius:12px;display:grid;place-items:center;background:var(--euc-soft)}
.tile .ic svg{width:22px;height:22px;fill:none;stroke:var(--euc);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.tile strong{font-family:var(--f-display);font-size:18.5px;font-weight:600;line-height:1.3}
.tile em{font-family:var(--f-ui);font-style:normal;font-size:11.5px;color:var(--ink-faint);letter-spacing:.02em}
.tile p{font-size:15.5px;color:var(--ink-soft);line-height:1.55}
.tile .done{position:absolute;top:16px;right:16px;width:19px;height:19px;border-radius:50%;background:var(--euc);display:none}
.tile.read .done{display:block}
.tile.read{background:var(--euc-soft)}
.tile .done::after{content:"";position:absolute;left:6px;top:4px;width:5px;height:9px;border-right:2px solid var(--surface);border-bottom:2px solid var(--surface);transform:rotate(42deg)}
/* section page */
.chead{padding:28px 0 6px}
.chead .bk{font-family:var(--f-ui);font-size:13px;color:var(--euc);text-decoration:none}
.chead h1{font-family:var(--f-display);font-size:clamp(25px,5vw,37px);line-height:1.18;margin-top:14px}
.chead .en{display:block;font-family:var(--f-ui);font-size:12.5px;color:var(--ink-faint);margin-top:6px}
.chead p{margin-top:12px;color:var(--ink-soft);font-size:17px}
.sechead{display:none}.wrap>p.lede:first-of-type{display:none}
h3{font-size:20.5px;margin-top:40px}
.call,figure,.tscroll{border-radius:var(--radius)}
.onpage{border-radius:var(--radius)}
.onpage a{border-radius:99px}
.pager a{border-radius:var(--radius)}
/* bottom bar */
.tabbar{position:fixed;left:0;right:0;bottom:0;z-index:50;display:flex;background:color-mix(in srgb,var(--surface) 94%,transparent);
  backdrop-filter:blur(14px);border-top:1px solid var(--rule);
  padding-bottom:env(safe-area-inset-bottom,0px);padding-left:env(safe-area-inset-left,0px);padding-right:env(safe-area-inset-right,0px)}
@media(min-width:900px){.tabbar{display:none}}
.tabbar a{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;padding:9px 4px 8px;text-decoration:none;
  color:var(--ink-faint);font-family:var(--f-ui);font-size:10.5px;font-weight:500}
.tabbar a svg{width:21px;height:21px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.tabbar a.on{color:var(--euc)}
`,
  cover(s, n) {
    return `<div class="chead"><a class="bk" href="${BP}/preview/c/">← എല്ലാ വിഭാഗങ്ങളും</a>
      <h1>${s.title}<span class="en">${String(n).padStart(2, '0')} · ${esc(s.titleEn)}</span></h1><p>${s.blurb}</p></div>`;
  },
  home() {
    const ic = (n) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS_C[n] || ICONS_C.table}"/></svg>`;
    const tiles = sections.map((s, i) => `<a class="tile" data-slug="${s.slug}" href="${BP}/preview/c/${s.slug}/">
      <span class="done"></span><span class="ic">${ic(s.icon)}</span>
      <strong>${s.title}</strong><em>${esc(s.titleEn)}</em><p>${s.blurb}</p></a>`).join('');
    const chips = [
      ['roads-parking-safety', 'പാർക്കിംഗ്'], ['home-bathroom-bins', 'ബിൻ'],
      ['health-services', 'Medicare'], ['children-school', 'സ്കൂൾ'], ['first-30-days', 'ചെക്ക്‌ലിസ്റ്റ്'],
    ].map(([sl, l]) => `<a href="${BP}/preview/c/${sl}/">${l}</a>`).join('');
    return `<div class="chero">
      <h1>എന്താണ് അറിയേണ്ടത്?</h1>
      <p>${CFG.description}</p>
      <div class="cfind"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/></svg>
        <input type="search" id="q" placeholder="ബിൻ, പാർക്കിംഗ്, Medicare…" autocomplete="off" aria-label="Search"></div>
      <div class="cres" id="results" hidden></div>
      <div class="chips"><span>പെട്ടെന്ന്</span>${chips}</div>
    </div><div class="tiles">${tiles}</div>`;
  },

  js: `
(function(){
  var BASE=${JSON.stringify(BP)};
  /* remember which sections have been opened */
  try{
    var read=JSON.parse(localStorage.getItem('kag-read')||'[]');
    document.querySelectorAll('.tile[data-slug]').forEach(function(t){
      if(read.indexOf(t.dataset.slug)>-1) t.classList.add('read');
    });
    var here=location.pathname.replace(/\\/$/,'').split('/').pop();
    if(here && here!=='c' && read.indexOf(here)<0){ read.push(here);
      localStorage.setItem('kag-read',JSON.stringify(read)); }
  }catch(e){}
  /* search */
  var q=document.getElementById('q'), box=document.getElementById('results');
  if(!q||!box) return;
  var idx=null,t=null;
  function load(){ if(idx) return Promise.resolve(idx);
    return fetch(BASE+'/search-index.json').then(function(r){return r.json()})
      .then(function(j){ idx=j.map(function(r){ return {s:r.s,h:r.h,t:r.t,u:r.u.replace(BASE+'/',BASE+'/preview/c/')}; }); return idx; }); }
  function run(){
    var v=q.value.trim().toLowerCase();
    if(v.length<2){box.hidden=true;box.innerHTML='';return}
    load().then(function(rows){
      var hits=[];
      for(var i=0;i<rows.length&&hits.length<12;i++){
        var r=rows[i];
        if(r.h.toLowerCase().indexOf(v)>-1||r.t.toLowerCase().indexOf(v)>-1) hits.push(r);
      }
      box.innerHTML = hits.length
        ? hits.map(function(r){return '<a href="'+r.u+'"><b>'+r.s+'</b>'+r.h+'</a>'}).join('')
        : '<p class="none">ഒന്നും കിട്ടിയില്ല · No matches</p>';
      box.hidden=false;
    }).catch(function(){box.hidden=true});
  }
  q.addEventListener('input',function(){clearTimeout(t);t=setTimeout(run,110)});
  q.addEventListener('focus',load);
})();
`,
  wrapBody(inner) { return `<div class="wrap">${inner}</div>`; },
  tabbar(active) {
    const i = {
      home: 'M4 10.5 12 4l8 6.5M6 9.8V20h12V9.8',
      search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM16.5 16.5l4 4',
      check: 'M20.5 11.2V18a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9M8.5 12.2l3 3 8-8.5',
    };
    const t = (href, k, label, on) => `<a href="${href}"${on ? ' class="on"' : ''}><svg viewBox="0 0 24 24"><path d="${i[k]}"/></svg>${label}</a>`;
    return `<nav class="tabbar">${t(`${BP}/preview/c/`, 'home', 'വിഭാഗങ്ങൾ', active === 'home')}
      ${t(`${BP}/preview/c/#q`, 'search', 'തിരയുക', false)}
      ${t(`${BP}/preview/c/first-30-days/`, 'check', 'ചെക്ക്‌ലിസ്റ്റ്', active === 'first-30-days')}</nav>`;
  },
};

const ICONS_C = {
  calendar: 'M7 3v3M17 3v3M3.5 9h17M5 5.5h14a1.5 1.5 0 0 1 1.5 1.5v12A1.5 1.5 0 0 1 19 20.5H5A1.5 1.5 0 0 1 3.5 19V7A1.5 1.5 0 0 1 5 5.5Z',
  speech: 'M20.5 11.5c0 3.9-3.8 7-8.5 7-1 0-2-.15-2.9-.42L4 20l1.3-3.6C4.2 15.1 3.5 13.4 3.5 11.5c0-3.9 3.8-7 8.5-7s8.5 3.1 8.5 7Z',
  home: 'M4 10.5 12 4l8 6.5M6 9.8V20h12V9.8M10 20v-5.5h4V20',
  food: 'M7 3v8a2.5 2.5 0 0 0 5 0V3M9.5 11v10M17 3c1.7 1.3 2.5 3 2.5 5.5S18.7 13 17 14v7',
  health: 'M12 20.5S4 15.6 4 10.2A4.2 4.2 0 0 1 12 8a4.2 4.2 0 0 1 8 2.2c0 5.4-8 10.3-8 10.3Z',
  work: 'M3.5 8.5h17v11h-17zM9 8.5V6a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 6v2.5M3.5 13h17',
  road: 'M8 4 5 20M16 4l3 16M12 4.5v3M12 11v3M12 17.5v3',
  school: 'M12 4 3 8.5l9 4.5 9-4.5L12 4ZM6.5 11v5.5c0 1.4 2.5 2.5 5.5 2.5s5.5-1.1 5.5-2.5V11',
  money: 'M3.5 7.5h17v9h-17zM12 9.8a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4',
  table: 'M3.5 6h17v12h-17zM3.5 10.5h17M3.5 14.5h17M9.5 6v12',
  check: 'M20.5 11.2V18a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9M8.5 12.2l3 3 8-8.5',
};

/* ---------- shell ---------- */
function shell(v, id, { slug, title, titleEn, desc, body }) {
  return `<!doctype html>
<html lang="${CFG.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)} · ${esc(CFG.siteName)} · preview ${id.toUpperCase()}</title>
<meta name="robots" content="noindex, nofollow">
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#faf7f2" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#14120f" media="(prefers-color-scheme: dark)">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${v.font || fontBase}">
<link rel="stylesheet" href="${BP}/preview/${id}/theme.css">
</head>
<body>
<div class="pvbar">വകഭേദം ${id.toUpperCase()} · ${esc(v.nameMl)} <a href="${BP}/preview/">മൂന്നും താരതമ്യം ചെയ്യുക</a></div>
<div class="topbar">
  <a class="mark" href="${BP}/preview/${id}/">${CFG.siteName}</a>
  <span class="spacer"></span>
  <button class="iconbtn themebtn" id="themebtn" aria-label="Light or dark theme"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 0 0 16Z" class="half"/></svg></button>
</div>
<div class="shell">${v.rail ? v.rail(slug) : ''}<main id="main">${body}</main></div>
${v.tabbar ? v.tabbar(slug || 'home') : ''}
<script src="${BP}/preview/${id}/app.js" defer></script>
</body></html>`;
}

const pvCss = `
.pvbar{position:sticky;top:0;z-index:60;background:#191714;color:#f5f1ea;font-family:'IBM Plex Sans',system-ui,sans-serif;
  font-size:12.5px;font-weight:500;letter-spacing:.03em;padding:8px max(16px,env(safe-area-inset-left,0px));display:flex;gap:14px;align-items:center}
.pvbar a{color:#9fd7bd;margin-left:auto}
.foot{margin-top:60px;padding:26px 0 70px;border-top:1px solid var(--rule);font-family:var(--f-ui);font-size:13px;color:var(--ink-faint)}
`;

/* ---------- write ---------- */
function buildVariant(id) {
  const v = VARIANTS[id];
  if (!v) { console.warn(`! no variant "${id}"`); return 0; }
  const dir = path.join(DIST, 'preview', id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'theme.css'), baseCss.trim() + '\n' + SHARED_CSS + '\n' + pvCss + '\n' + v.css);
  fs.writeFileSync(path.join(dir, 'app.js'), baseJs.trim() + '\n' + (v.js || ''));

  sections.forEach((s, i) => {
    const p = prepare(sectionHtml[s.id], i + 1, s);
    const prev = sections[i - 1], next = sections[i + 1];
    const pager = `<div class="pager">
      ${prev ? `<a class="prev" href="${BP}/preview/${id}/${prev.slug}/"><span>← മുൻപത്തേത്</span>${prev.title}</a>`
        : `<a class="prev" href="${BP}/preview/${id}/"><span>← ആദ്യ പേജ്</span>${CFG.siteName}</a>`}
      ${next ? `<a class="next" href="${BP}/preview/${id}/${next.slug}/"><span>അടുത്തത് →</span>${next.title}</a>` : ''}</div>`;
    const body = (v.cover ? v.cover(s, i + 1) : '') + v.wrapBody(p.html + pager + `<div class="foot">${CFG.disclaimer}</div>`);
    fs.mkdirSync(path.join(dir, s.slug), { recursive: true });
    fs.writeFileSync(path.join(dir, s.slug, 'index.html'),
      shell(v, id, { slug: s.slug, title: s.title, titleEn: s.titleEn, desc: s.blurb, body }));
  });

  fs.writeFileSync(path.join(dir, 'index.html'),
    shell(v, id, { slug: '', title: CFG.tagline, titleEn: CFG.taglineEn, desc: CFG.description, body: v.home() }));
  return sections.length + 1;
}

const SHARED_CSS = `
*,*::before,*::after{box-sizing:border-box}
:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
img{max-width:100%;height:auto}[hidden]{display:none!important}
.topbar{position:sticky;top:0;z-index:40;backdrop-filter:blur(12px);display:flex;align-items:center;gap:12px;
  padding-block:11px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
.topbar .mark{font-family:var(--f-display);font-weight:700;font-size:16px;color:var(--ink);text-decoration:none}
.topbar .spacer{flex:1}
.iconbtn{font-family:var(--f-ui);font-size:12.5px;font-weight:500;background:var(--surface);color:var(--ink);
  border:1px solid var(--rule);border-radius:8px;padding:7px 11px;cursor:pointer;line-height:1}
.themebtn{padding:6px 9px;display:inline-flex;align-items:center}
.themebtn svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.6}
.themebtn .half{fill:currentColor;stroke:none}
.pager{display:grid;gap:12px;margin-top:54px}
@media(min-width:620px){.pager{grid-template-columns:1fr 1fr}}
.pager a{display:flex;flex-direction:column;gap:3px;padding:16px 18px;border:1px solid var(--rule);
  border-radius:10px;background:var(--surface);text-decoration:none;color:var(--ink);font-family:var(--f-display);font-weight:600}
.pager a:hover{border-color:var(--euc)}
.pager a span{font-family:var(--f-ui);font-size:10.5px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-faint)}
.pager a.next{text-align:right;align-items:flex-end}
`;

/* index of variants */
function buildIndex(ids) {
  const rows = ids.map((id) => {
    const v = VARIANTS[id];
    return `<a class="vcard" href="${BP}/preview/${id}/">
      <span class="vid">${id.toUpperCase()}</span>
      <strong>${esc(v.nameMl)}<em>${esc(v.name)}</em></strong>
      <p>${v.note}</p></a>`;
  }).join('');
  const html = `<!doctype html><html lang="ml"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>ഡിസൈൻ വകഭേദങ്ങൾ</title><meta name="robots" content="noindex, nofollow">
<link rel="stylesheet" href="${fontBase}">
<style>
*,*::before,*::after{box-sizing:border-box}
body{margin:0;background:#14120f;color:#f0ebe3;font-family:'Manjari',system-ui,sans-serif;font-size:18px;line-height:1.75;
  padding:max(28px,env(safe-area-inset-top,0px)) max(20px,env(safe-area-inset-left,0px)) 70px}
.in{max-width:760px;margin:0 auto}
h1{font-family:'Anek Malayalam',system-ui,sans-serif;font-size:clamp(28px,6vw,42px);margin:0;line-height:1.2}
.sub{color:#aba296;margin-top:12px;font-size:17px}
.vcard{display:block;margin-top:18px;padding:22px 24px;border:1px solid #332e26;border-radius:14px;
  background:#1c1915;text-decoration:none;color:inherit}
.vcard:hover{border-color:#7cc0a2}
.vid{font-family:'IBM Plex Sans',system-ui,sans-serif;font-size:11px;font-weight:700;letter-spacing:.16em;color:#7cc0a2}
.vcard strong{display:block;font-family:'Anek Malayalam',system-ui,sans-serif;font-size:23px;margin-top:7px}
.vcard em{display:block;font-family:'IBM Plex Sans',system-ui,sans-serif;font-style:normal;font-size:12px;
  font-weight:500;letter-spacing:.05em;color:#857c71;margin-top:3px}
.vcard p{margin:10px 0 0;color:#aba296;font-size:16px;line-height:1.6}
.note{margin-top:34px;padding:18px 20px;border-left:3px solid #dd9279;background:#2b1d18;border-radius:0 10px 10px 0;font-size:16px;color:#f0ebe3}
.back{display:inline-block;margin-top:28px;color:#7cc0a2;font-family:'IBM Plex Sans',system-ui,sans-serif;font-size:14px}
</style></head><body><div class="in">
<h1>ഡിസൈൻ വകഭേദങ്ങൾ</h1>
<p class="sub">ഒരേ ഉള്ളടക്കം, മൂന്ന് വ്യത്യസ്ത സമീപനം. ഫോണിലും ലാപ്ടോപ്പിലും നോക്കുക, എന്നിട്ട് ഒന്ന് തിരഞ്ഞെടുക്കുക.</p>
${rows}
<div class="note"><strong>ചിത്രങ്ങൾ ഇപ്പോൾ ഇല്ല.</strong> ലൈസൻസ് പരിശോധിക്കാൻ കഴിയാത്തതിനാൽ ഓരോ വിഭാഗത്തിനും വരച്ച ഗ്രാഫിക് ആണ് ഇപ്പോൾ. <code>content/photos/&lt;slug&gt;.jpg</code> എന്ന ഫയൽ ഇട്ടാൽ അത് സ്വയമേവ ഉപയോഗിക്കും.</div>
<a class="back" href="${BP}/">← ലൈവ് സൈറ്റിലേക്ക്</a>
</div></body></html>`;
  fs.writeFileSync(path.join(DIST, 'preview', 'index.html'), html);
}

const want = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const ids = (want.length ? want : Object.keys(VARIANTS)).filter((id) => VARIANTS[id]);
fs.mkdirSync(path.join(DIST, 'preview'), { recursive: true });

/* copy any real photos that exist */
const PH = path.join(ROOT, 'content', 'photos');
if (fs.existsSync(PH)) {
  const out = path.join(DIST, 'preview', 'assets', 'photos');
  fs.mkdirSync(out, { recursive: true });
  for (const f of fs.readdirSync(PH)) fs.copyFileSync(path.join(PH, f), path.join(out, f));
}

let total = 0;
for (const id of ids) total += buildVariant(id);
buildIndex(Object.keys(VARIANTS).filter((id) => fs.existsSync(path.join(DIST, 'preview', id))));
console.log(`preview: ${ids.join(', ')} — ${total} pages`);
console.log(`  compare at ${CFG.siteUrl}${BP}/preview/`);
