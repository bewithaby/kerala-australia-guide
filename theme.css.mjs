/**
 * The design system, as one exported string.
 *
 * Two layers, and the second one is load-bearing:
 *
 *   1. The "Vazhi" tokens — indigo/teal, Plus Jakarta Sans + Anek Malayalam,
 *      soft cards, generous radii.
 *   2. LEGACY ALIASES. Every inline SVG diagram in content/guide.html paints
 *      itself with var(--euc), var(--bin-red), var(--danger) and friends. If
 *      those names stop resolving, all eight diagrams render blank — not
 *      broken-looking, just invisible, which is worse. So the old names stay
 *      defined forever, remapped onto the new palette. Never delete them
 *      without grepping content/guide.html first.
 */
export const THEME_CSS = `
/* ============================================================ tokens */
:root{
  /* brand */
  --bg:#F5F7FB; --card:#FFFFFF; --card-2:#F7F9FD;
  --ink:#0F172A; --soft:#5B6B84; --faint:#8A99B0;
  --indigo:#4F46E5; --indigo-deep:#3730C8; --indigo-soft:#E8E7FD;
  --teal:#0D9488; --teal-deep:#0B7A70; --teal-soft:#D9F3EE;
  --amber:#B45309; --amber-soft:#FDEED3;
  --rose:#E11D48; --rose-soft:#FCE4E9;
  --line:#E4E9F2;
  --grad:linear-gradient(120deg,#4F46E5,#0D9488);
  --shadow:0 20px 50px -18px rgba(15,23,42,.18);
  --shadow-sm:0 6px 20px -14px rgba(15,23,42,.3);
  --r:22px; --r-sm:14px;

  /* type */
  --f-ui:"Plus Jakarta Sans",system-ui,-apple-system,sans-serif;
  --f-display:"Anek Malayalam","Plus Jakarta Sans",system-ui,sans-serif;
  --f-body:"Manjari","Noto Sans Malayalam",system-ui,sans-serif;

  /* bins keep their real-world colours in both themes */
  --bin-red:#C0392B; --bin-yellow:#D8A400; --bin-green:#5A9E3F; --bin-purple:#7B4EA8;

  /* ---- legacy aliases: the SVG diagrams paint with these ---- */
  --paper:var(--bg); --surface:var(--card); --surface-2:var(--card-2);
  --ink-soft:var(--soft); --ink-faint:var(--faint); --rule:var(--line);
  --euc:var(--teal-deep); --euc-soft:var(--teal-soft);
  --lat:var(--rose); --lat-soft:var(--rose-soft);
  --signal:var(--amber); --signal-soft:var(--amber-soft);
  --danger:var(--rose); --danger-soft:var(--rose-soft);
  --ok:var(--teal-deep); --ok-soft:var(--teal-soft);
}
@media(prefers-color-scheme:dark){:root:not([data-theme="light"]){
  --bg:#0B1120; --card:#131C2E; --card-2:#1A2439;
  --ink:#E9EEF8; --soft:#9DACC4; --faint:#75849C;
  --indigo:#8B86F5; --indigo-deep:#A9A5F8; --indigo-soft:#1E2142;
  --teal:#2DD4BF; --teal-deep:#5EE0D0; --teal-soft:#10302D;
  --amber:#E0A94A; --amber-soft:#2E2514;
  --rose:#FB7185; --rose-soft:#2F171E;
  --line:#253149;
  --grad:linear-gradient(120deg,#6366F1,#14B8A6);
  --shadow:0 20px 50px -18px rgba(0,0,0,.6);
  --shadow-sm:0 6px 20px -14px rgba(0,0,0,.7);
  --bin-red:#E06A5C; --bin-yellow:#E0BB3E; --bin-green:#84C468; --bin-purple:#A983D6;
  color-scheme:dark;
}}
:root[data-theme="dark"]{
  --bg:#0B1120; --card:#131C2E; --card-2:#1A2439;
  --ink:#E9EEF8; --soft:#9DACC4; --faint:#75849C;
  --indigo:#8B86F5; --indigo-deep:#A9A5F8; --indigo-soft:#1E2142;
  --teal:#2DD4BF; --teal-deep:#5EE0D0; --teal-soft:#10302D;
  --amber:#E0A94A; --amber-soft:#2E2514;
  --rose:#FB7185; --rose-soft:#2F171E;
  --line:#253149;
  --grad:linear-gradient(120deg,#6366F1,#14B8A6);
  --shadow:0 20px 50px -18px rgba(0,0,0,.6);
  --shadow-sm:0 6px 20px -14px rgba(0,0,0,.7);
  --bin-red:#E06A5C; --bin-yellow:#E0BB3E; --bin-green:#84C468; --bin-purple:#A983D6;
  color-scheme:dark;
}

/* ============================================================ base */
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
body{background:var(--bg);color:var(--ink);font-family:var(--f-body);
  font-size:17.5px;line-height:1.75;overflow-x:hidden;
  padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
img{display:block;max-width:100%;height:auto}
a{color:inherit;text-decoration:none}
[hidden]{display:none!important}
.ml{font-family:var(--f-body)}
.en{font-family:var(--f-ui);font-size:.9em;color:var(--soft)}
code{font-family:ui-monospace,monospace;font-size:.88em;background:var(--card-2);padding:.1em .4em;border-radius:5px}
h1,h2,h3,h4{font-family:var(--f-display);font-weight:700;line-height:1.3;text-wrap:balance}
:focus-visible{outline:3px solid var(--indigo);outline-offset:2px;border-radius:6px}
.wrap{max-width:1160px;margin:0 auto;
  padding-left:max(22px,env(safe-area-inset-left,0px));
  padding-right:max(22px,env(safe-area-inset-right,0px))}
.skip{position:absolute;left:-9999px;top:0;background:var(--indigo);color:#fff;
  padding:12px 20px;z-index:200;border-radius:0 0 10px 0;font-family:var(--f-ui);font-weight:600}
.skip:focus{left:0}

/* ============================================================ nav */
.topbar{position:sticky;top:env(safe-area-inset-top,0px);z-index:90;padding:14px 0}
.nav{display:flex;align-items:center;gap:6px;max-width:1160px;margin:0 auto;
  background:color-mix(in srgb,var(--card) 82%,transparent);backdrop-filter:blur(16px);
  border:1px solid color-mix(in srgb,var(--line) 90%,transparent);border-radius:999px;
  padding:8px 10px 8px 16px;box-shadow:0 8px 30px -14px rgba(15,23,42,.22)}
/* The logo is the one item that may shrink: the buttons beside it are fixed
   actions, so if anything has to give it is the wordmark, which truncates. With
   nowrap on the whole row and no min-width:0 the row simply overflowed instead. */
.logo{display:flex;align-items:center;gap:10px;font-family:var(--f-ui);font-weight:800;
  font-size:1rem;margin-right:auto;min-width:0;flex:1 1 auto}
.logo .mark{width:34px;height:34px;border-radius:11px;background:var(--grad);
  display:grid;place-items:center;flex:none;box-shadow:0 4px 12px -4px rgba(79,70,229,.6)}
.logo .mark svg{width:19px;height:19px;fill:none;stroke:#fff;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
/* The wordmark is Malayalam, so it needs the Malayalam display face — the UI
   face on .logo has no Malayalam glyphs and would silently fall back. */
.logo .nm{font-family:var(--f-display);font-weight:700;font-size:1rem;line-height:1.16;
  min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.logo small{display:block;font-family:var(--f-ui);font-weight:700;font-size:.58rem;
  letter-spacing:.055em;text-transform:uppercase;color:var(--soft);line-height:1.2;margin-top:2px}
.nav .item{padding:9px 14px;border-radius:999px;font-family:var(--f-display);font-weight:600;
  font-size:.88rem;color:var(--soft);transition:.2s;white-space:nowrap}
.nav .item:hover{background:var(--card-2);color:var(--ink)}
.nav .item.on{background:var(--indigo-soft);color:var(--indigo-deep)}
.nav .cta{display:inline-flex;align-items:center;gap:4px;flex:none;background:var(--grad);color:#fff;
  font-family:var(--f-display);font-weight:700;font-size:.88rem;padding:10px 17px;
  border-radius:999px;transition:.2s;white-space:nowrap}
.nav .cta:hover{transform:translateY(-1px);box-shadow:0 10px 24px -10px rgba(79,70,229,.6)}
.nav .cta svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex:none}
.navbtn{display:none;align-items:center;gap:7px;background:var(--card);
  border:1px solid var(--line);border-radius:999px;
  padding:9px 15px;font-family:var(--f-display);font-weight:600;font-size:.85rem;
  color:var(--ink);cursor:pointer;flex:none}
.navbtn svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.9;
  stroke-linecap:round;stroke-linejoin:round}
.iconbtn{background:var(--card);border:1px solid var(--line);border-radius:999px;
  width:38px;height:38px;display:grid;place-items:center;cursor:pointer;color:var(--soft);flex:none}
.iconbtn:hover{color:var(--ink);border-color:var(--indigo)}
.iconbtn svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:1.8}
.iconbtn .half{fill:currentColor;stroke:none}
@media(max-width:1060px){
  .nav .item{display:none}
  .navbtn{display:inline-flex}
}
/* Below this the labels go and the buttons are icon-only, which is what keeps
   the row inside a 390px phone. */
@media(max-width:620px){.navbtn span{display:none}.navbtn{padding:9px 11px}}
@media(max-width:520px){.nav .cta span{display:none}.logo small{display:none}
  .logo .nm{font-size:.92rem}.logo{gap:8px}.logo .mark{width:30px;height:30px;border-radius:9px}
  .logo .mark svg{width:16px;height:16px}.nav .cta{padding:10px 12px}.nav{gap:7px}}
/* mobile sheet */
.sheet{position:fixed;inset:0;z-index:120;background:color-mix(in srgb,var(--ink) 45%,transparent);
  backdrop-filter:blur(3px);opacity:0;pointer-events:none;transition:.22s;overflow:hidden}
.sheet.open{opacity:1;pointer-events:auto}
.sheet .panel{position:absolute;top:0;right:0;bottom:0;width:min(330px,88vw);background:var(--card);
  border-left:1px solid var(--line);padding:22px 20px calc(30px + env(safe-area-inset-bottom,0px));
  overflow-y:auto;transform:translateX(100%);transition:.26s cubic-bezier(.4,0,.2,1);
  display:flex;flex-direction:column;gap:3px}
.sheet.open .panel{transform:none}
.sheet .ttl{font-family:var(--f-ui);font-size:.68rem;font-weight:700;letter-spacing:.14em;
  text-transform:uppercase;color:var(--faint);margin:6px 0 10px}
.sheet a{display:flex;gap:11px;align-items:baseline;padding:11px 12px;border-radius:12px;
  font-family:var(--f-display);font-weight:600;font-size:.95rem;color:var(--ink)}
.sheet a:hover{background:var(--card-2)}
.sheet a.on{background:var(--indigo-soft);color:var(--indigo-deep)}
.sheet a i{font-family:var(--f-ui);font-style:normal;font-size:.72rem;font-weight:700;
  color:var(--faint);min-width:17px}
.sheet a em{display:block;font-family:var(--f-ui);font-style:normal;font-size:.7rem;
  font-weight:500;color:var(--faint);margin-top:2px}

/* ============================================================ hero */
.hero{padding:46px 0 26px;position:relative}
.hero .blob{position:absolute;inset:0;pointer-events:none;background:
  radial-gradient(600px 300px at 12% 0%,color-mix(in srgb,var(--indigo) 12%,transparent),transparent 60%),
  radial-gradient(700px 340px at 88% 10%,color-mix(in srgb,var(--teal) 14%,transparent),transparent 60%)}
.hero .grid{display:grid;grid-template-columns:1.02fr .98fr;gap:46px;align-items:center;position:relative}
/* a grid track's default min-width is auto, so one wide inline-flex child
   (the pill) would otherwise push the whole column past the phone's width */
.hero .grid>*{min-width:0}
@media(max-width:940px){.hero .grid{grid-template-columns:1fr;gap:34px}}
.pill{display:inline-flex;align-items:center;gap:8px;max-width:100%;background:var(--card);
  border:1px solid var(--line);border-radius:999px;padding:7px 15px;font-family:var(--f-display);
  font-size:.82rem;font-weight:600;color:var(--teal-deep);box-shadow:0 4px 14px -8px rgba(15,23,42,.25)}
/* Malayalam leads — this is a Malayalam-first audience. The English line
   sits under it, smaller, for anyone scanning or sharing in English. */
.hero h1{font-family:var(--f-display);font-size:clamp(2rem,4.2vw,3.2rem);line-height:1.18;
  font-weight:700;letter-spacing:-.01em;margin:20px 0 0}
.hero h1 .en{display:block;font-family:var(--f-ui);font-size:.42em;color:var(--indigo);
  font-weight:700;margin-top:12px;letter-spacing:-.01em;line-height:1.3}
/* Who this is for, Malayalam over English on two lines. Not a pill: a pill is
   one line by nature, and forcing two into it looks like a mistake. */
.eyebrow{display:block;max-width:100%}
.eyebrow span{display:block;font-family:var(--f-display);font-weight:600;font-size:1rem;
  line-height:1.4;color:var(--indigo-deep)}
.eyebrow em{display:block;font-family:var(--f-ui);font-style:normal;font-weight:700;
  font-size:.74rem;letter-spacing:.07em;text-transform:uppercase;color:var(--soft);margin-top:4px}
@media(max-width:560px){.eyebrow span{font-size:.94rem}.eyebrow em{font-size:.68rem;letter-spacing:.05em}}
.hero .lede{color:var(--soft);font-size:1.04rem;max-width:36em;margin-top:16px}
.hero .meta{display:flex;gap:16px;flex-wrap:wrap;margin-top:20px;font-family:var(--f-ui);
  font-size:.78rem;color:var(--faint)}
.heroimg{position:relative}
.heroimg .frame{border-radius:28px;overflow:hidden;border:1px solid var(--line);box-shadow:var(--shadow);background:var(--card-2)}
.heroimg .frame img,.heroimg .frame svg{height:420px;width:100%;object-fit:cover;display:block}
@media(max-width:940px){.heroimg .frame img,.heroimg .frame svg{height:300px}}
.float{position:absolute;background:var(--card);border:1px solid var(--line);border-radius:18px;
  padding:12px 16px;box-shadow:var(--shadow);display:flex;gap:11px;align-items:center}
.float .ic{width:36px;height:36px;border-radius:11px;display:grid;place-items:center;flex:none;color:#fff}
.float .ic svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:2.1;stroke-linecap:round;stroke-linejoin:round}
.float b{font-family:var(--f-ui);font-size:1.05rem;display:block;line-height:1.15}
.float span{font-size:.72rem;color:var(--soft);display:block;line-height:1.3}
.f1{top:22px;left:-26px}
.f2{bottom:-22px;right:12px}
@media(max-width:940px){.f1{left:6px;top:12px}.f2{right:6px;bottom:-16px}}
@media(max-width:420px){.float{padding:9px 12px}.float b{font-size:.92rem}.float span{font-size:.66rem}}

/* search */
.find{margin-top:26px;position:relative;max-width:530px}
.find .box{background:var(--card);border:1px solid var(--line);border-radius:18px;
  padding:7px 7px 7px 16px;display:flex;align-items:center;gap:11px;box-shadow:var(--shadow)}
.find .box:focus-within{border-color:var(--indigo);box-shadow:0 0 0 3px var(--indigo-soft),var(--shadow)}
.find svg.mag{width:19px;height:19px;flex:none;fill:none;stroke:var(--faint);stroke-width:2;stroke-linecap:round}
.find input{flex:1;min-width:0;border:0;background:none;font-family:var(--f-body);font-size:1rem;
  color:var(--ink);padding:9px 0}
.find input:focus{outline:none}
.find input::placeholder{color:var(--faint)}
.find .go{background:var(--grad);color:#fff;border:0;border-radius:12px;padding:11px 19px;
  font-family:var(--f-ui);font-weight:700;font-size:.9rem;cursor:pointer;flex:none}
.res{position:absolute;left:0;right:0;top:calc(100% + 8px);z-index:70;background:var(--card);
  border:1px solid var(--line);border-radius:16px;box-shadow:var(--shadow);overflow:hidden;max-height:360px;overflow-y:auto}
.res a{display:block;padding:12px 17px;border-bottom:1px solid var(--line);font-size:.92rem;line-height:1.5}
.res a:last-child{border-bottom:none}
.res a:hover,.res a:focus{background:var(--indigo-soft)}
.res b{display:block;font-family:var(--f-ui);font-size:.66rem;font-weight:700;letter-spacing:.07em;
  text-transform:uppercase;color:var(--teal-deep);margin-bottom:3px}
.res .none{padding:15px 17px;color:var(--faint);font-size:.92rem}
.chips{display:flex;gap:8px;margin-top:13px;flex-wrap:wrap}
.chips .chip{background:var(--card);border:1px solid var(--line);border-radius:999px;padding:7px 14px;
  font-family:var(--f-display);font-size:.82rem;font-weight:600;color:var(--soft);transition:.18s}
.chips .chip:hover{border-color:var(--indigo);color:var(--indigo)}

/* ============================================================ sections */
.sec{padding:60px 0}
.sec.tight{padding-top:12px}
.sechead{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;
  margin-bottom:30px;flex-wrap:wrap}
.sechead h2{font-family:var(--f-ui);font-size:clamp(1.6rem,3vw,2.2rem);font-weight:800;letter-spacing:-.02em}
.sechead .sub{color:var(--soft);margin-top:5px;font-size:.98rem;max-width:60ch}

/* journey stepper */
.stepper{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
@media(max-width:900px){.stepper{grid-template-columns:repeat(2,1fr)}}
@media(max-width:520px){.stepper{grid-template-columns:1fr}}
.step{background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:20px;
  position:relative;overflow:hidden;display:block;transition:.22s}
.step::before{content:"";position:absolute;top:0;left:0;right:0;height:4px;background:var(--grad)}
.step:hover{transform:translateY(-4px);box-shadow:var(--shadow);border-color:transparent}
.step .n{font-family:var(--f-ui);font-size:.68rem;font-weight:800;letter-spacing:.14em;color:var(--teal-deep)}
.step h3{margin:9px 0 5px;font-size:1rem}
.step p{font-size:.86rem;color:var(--soft);line-height:1.6}

/* guide grid */
.ggrid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
@media(max-width:1000px){.ggrid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:560px){.ggrid{grid-template-columns:1fr}}
.g{background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:20px;
  display:flex;flex-direction:column;gap:7px;transition:.25s;position:relative;overflow:hidden}
.g:hover{transform:translateY(-5px);box-shadow:var(--shadow);border-color:transparent}
.g .ico{width:44px;height:44px;border-radius:14px;display:grid;place-items:center;color:#fff;flex:none}
.g .ico svg{width:21px;height:21px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
.g h3{font-size:1.02rem;line-height:1.35;margin-top:2px}
.g small.lbl{font-family:var(--f-ui);font-size:.64rem;font-weight:700;letter-spacing:.07em;
  text-transform:uppercase;color:var(--faint)}
.g p{font-size:.86rem;color:var(--soft);line-height:1.6}
.g .thumb{border-radius:16px;overflow:hidden;height:130px;margin-bottom:3px;background:var(--card-2)}
.g .thumb img,.g .thumb svg{width:100%;height:100%;object-fit:cover;transition:.4s;display:block}
.g:hover .thumb img,.g:hover .thumb svg{transform:scale(1.06)}

/* 2026 notification cards */
.notifwrap{display:grid;grid-template-columns:1fr 1fr;gap:15px}
@media(max-width:860px){.notifwrap{grid-template-columns:1fr}}
.notif{background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:19px 21px;
  display:flex;gap:15px;align-items:flex-start;box-shadow:var(--shadow-sm)}
.notif .dot{width:40px;height:40px;border-radius:12px;flex:none;display:grid;place-items:center}
.notif .dot svg{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
.notif .when{font-family:var(--f-ui);font-size:.66rem;font-weight:800;letter-spacing:.08em}
.notif h3{font-size:1rem;margin:4px 0 3px}
.notif p{font-size:.86rem;color:var(--soft);line-height:1.6}

/* coffee widget */
.coffee{display:grid;grid-template-columns:1.05fr .95fr;gap:38px;align-items:center;
  background:linear-gradient(120deg,#0B7A70,#0F172A);border-radius:30px;padding:42px;color:#EAF5F3;
  overflow:hidden;position:relative}
@media(max-width:900px){.coffee{grid-template-columns:1fr;padding:30px 24px}}
.coffee h2{font-family:var(--f-ui);font-size:clamp(1.5rem,2.8vw,2rem);font-weight:800;color:#fff}
.coffee .sub{opacity:.86;margin-top:7px;font-size:.95rem}
.tabs{display:flex;flex-wrap:wrap;gap:8px;margin-top:20px}
.tab{border:1px solid rgba(255,255,255,.22);background:rgba(255,255,255,.08);color:#fff;
  border-radius:999px;padding:9px 16px;font-family:var(--f-ui);font-size:.85rem;font-weight:600;cursor:pointer;transition:.2s}
.tab:hover{background:rgba(255,255,255,.16)}
.tab.on{background:#fff;color:#0B7A70;border-color:#fff}
.coffee .desc{margin-top:17px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.16);
  border-radius:16px;padding:16px 20px;font-size:.95rem;min-height:92px}
.coffee .desc b{color:#7EE0D2;font-family:var(--f-ui)}
.coffee .pic{border-radius:24px;overflow:hidden;border:1px solid rgba(255,255,255,.18);
  box-shadow:0 30px 60px -20px rgba(0,0,0,.5)}
.coffee .pic img,.coffee .pic svg{height:320px;width:100%;object-fit:cover;display:block}
.coffee .note{margin-top:13px;font-size:.78rem;opacity:.78;line-height:1.6}

/* ============================================================ content pages */
.page{display:grid;grid-template-columns:minmax(0,1fr);gap:0;max-width:1160px;margin:0 auto;
  padding-left:max(22px,env(safe-area-inset-left,0px));
  padding-right:max(22px,env(safe-area-inset-right,0px))}
@media(min-width:1040px){.page{grid-template-columns:238px minmax(0,1fr);gap:46px;align-items:start}}
.rail{display:none}
@media(min-width:1040px){.rail{display:block;position:sticky;top:96px;padding:30px 0 40px;
  max-height:calc(100vh - 110px);overflow-y:auto}}
.rail .ttl{font-family:var(--f-ui);font-size:.66rem;font-weight:700;letter-spacing:.14em;
  text-transform:uppercase;color:var(--faint);margin-bottom:11px}
.rail ol{list-style:none;display:flex;flex-direction:column;gap:1px}
.rail a{display:grid;grid-template-columns:22px 1fr;gap:9px;padding:8px 11px;border-radius:10px;
  font-family:var(--f-display);font-size:.86rem;font-weight:600;color:var(--soft);line-height:1.35}
.rail a:hover{background:var(--card-2);color:var(--ink)}
.rail a.on{background:var(--indigo-soft);color:var(--indigo-deep)}
.rail a i{font-family:var(--f-ui);font-style:normal;font-size:.68rem;font-weight:700;color:var(--faint);padding-top:2px}
.rail a.on i{color:var(--indigo-deep)}
.rail a em{grid-column:2;display:block;font-family:var(--f-ui);font-style:normal;font-size:.66rem;
  font-weight:500;color:var(--faint);margin-top:2px;line-height:1.3}
.doc{min-width:0;padding-bottom:50px}
.doc .inner{max-width:68ch}

/* article header */
.ahead{padding:26px 0 4px}
.ahead .crumb{display:inline-flex;align-items:center;gap:7px;font-family:var(--f-ui);font-size:.8rem;
  font-weight:600;color:var(--teal-deep)}
.ahead .crumb svg{width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
.ahead h1{font-size:clamp(1.75rem,4.2vw,2.7rem);line-height:1.18;margin-top:15px;letter-spacing:-.01em}
.ahead .en-sub{display:block;font-family:var(--f-ui);font-size:.86rem;font-weight:600;
  color:var(--faint);margin-top:9px;letter-spacing:.02em}
.ahead .lede{color:var(--soft);font-size:1.04rem;margin-top:14px;max-width:62ch;line-height:1.7}
.ahead .banner{margin-top:22px;border-radius:var(--r);overflow:hidden;border:1px solid var(--line);
  height:200px;background:var(--card-2)}
.ahead .banner img,.ahead .banner svg{width:100%;height:100%;object-fit:cover;display:block}
/* A drawn banner carries its wash on the container, so the scene can be fitted
   whole instead of cropped to a strip. The dots are the same texture the card
   thumbs get, redrawn in CSS because the SVG no longer paints its background. */
.ahead .banner.art{background-size:cover;position:relative}
.ahead .banner.art::before{content:"";position:absolute;inset:0;
  background-image:radial-gradient(rgba(255,255,255,.14) 1.6px,transparent 1.6px);
  background-size:38px 38px}
.ahead .banner.art svg{object-fit:contain;position:relative}
/* the single-page build's own heading block is replaced by .ahead */
.sechead-legacy{display:none}

/* on this page */
.onpage{display:flex;flex-wrap:wrap;gap:7px;align-items:center;margin-top:26px;padding:15px 17px;
  background:var(--card);border:1px solid var(--line);border-radius:var(--r-sm)}
.onpage span{font-family:var(--f-ui);font-size:.65rem;font-weight:700;letter-spacing:.11em;
  text-transform:uppercase;color:var(--faint)}
.onpage a{font-family:var(--f-display);font-size:.85rem;font-weight:600;color:var(--indigo-deep);
  padding:5px 12px;border-radius:999px;background:var(--indigo-soft)}
.onpage a:hover{background:var(--indigo);color:#fff}

/* prose */
.doc h3{font-size:clamp(1.22rem,2.4vw,1.5rem);margin-top:48px;margin-bottom:12px;
  padding-top:22px;border-top:1px solid var(--line);scroll-margin-top:100px}
.doc h3:first-of-type{border-top:none;padding-top:0;margin-top:34px}
.doc h4{font-family:var(--f-ui);font-size:.76rem;font-weight:700;letter-spacing:.12em;
  text-transform:uppercase;color:var(--teal-deep);margin-top:32px;margin-bottom:8px}
.doc p{margin-top:15px}
.doc .lede{color:var(--soft)}
ul.plain,ol.steps{list-style:none;margin-top:17px;display:flex;flex-direction:column;gap:14px}
ul.plain>li{position:relative;padding-left:21px}
ul.plain>li::before{content:"";position:absolute;left:3px;top:.72em;width:7px;height:7px;
  border-radius:50%;background:var(--teal);opacity:.75}
ul.plain ul{list-style:none;margin-top:10px;padding-left:15px;display:flex;flex-direction:column;gap:9px}
ul.plain ul>li{position:relative;padding-left:15px;font-size:.96em;color:var(--soft)}
ul.plain ul>li::before{content:"";position:absolute;left:0;top:.78em;width:8px;height:1.5px;background:var(--line)}
ul.plain ul>li strong{color:var(--ink)}
ol.steps{counter-reset:s}
ol.steps>li{position:relative;padding-left:38px;counter-increment:s}
ol.steps>li::before{content:counter(s);position:absolute;left:0;top:.05em;width:26px;height:26px;
  border-radius:9px;background:var(--indigo-soft);color:var(--indigo-deep);
  font-family:var(--f-ui);font-size:.76rem;font-weight:800;display:grid;place-items:center}

/* callouts */
.call{margin-top:24px;border-radius:var(--r-sm);padding:18px 21px;background:var(--card);
  border:1px solid var(--line);border-left:4px solid var(--teal);
  display:flex;flex-direction:column;gap:9px;box-shadow:var(--shadow-sm)}
.call .tag{font-family:var(--f-ui);font-size:.66rem;font-weight:800;letter-spacing:.1em;
  text-transform:uppercase;color:var(--teal-deep)}
.call p{margin:0;font-size:1rem;line-height:1.72}
.call.stop{border-left-color:var(--rose);background:var(--rose-soft)}
.call.stop .tag{color:var(--rose)}
.call.warn{border-left-color:var(--amber);background:var(--amber-soft)}
.call.warn .tag{color:var(--amber)}
.call.good{border-left-color:var(--teal);background:var(--teal-soft)}
.call.good .tag{color:var(--teal-deep)}
.call.law{border-left-color:var(--indigo);background:var(--indigo-soft)}
.call.law .tag{color:var(--indigo-deep)}
.call.money{border-left-color:var(--indigo);background:var(--card)}
.call.money .tag{color:var(--indigo-deep)}

/* kerala vs australia pair */
.pair{display:grid;gap:13px;margin-top:22px}
@media(min-width:620px){.pair{grid-template-columns:1fr 1fr}}
.pair>div{border-radius:var(--r-sm);padding:17px 19px;border:1px solid var(--line);
  background:var(--card);display:flex;flex-direction:column;gap:7px;min-width:0}
.pair .k{border-top:3px solid var(--rose)}
.pair .a{border-top:3px solid var(--teal)}
.pair .lbl{font-family:var(--f-ui);font-size:.66rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase}
.pair .k .lbl{color:var(--rose)}
.pair .a .lbl{color:var(--teal-deep)}
.pair p{margin:0;font-size:.97rem;line-height:1.68}

/* tables */
.tscroll{margin-top:24px;overflow-x:auto;border:1px solid var(--line);border-radius:var(--r-sm);
  background:var(--card);box-shadow:var(--shadow-sm);-webkit-overflow-scrolling:touch}
table{border-collapse:collapse;width:100%;font-size:.95rem;min-width:520px}
.tscroll.wide table{min-width:760px}
th,td{text-align:left;padding:13px 16px;border-bottom:1px solid var(--line);vertical-align:top}
thead th{font-family:var(--f-ui);font-size:.66rem;font-weight:700;letter-spacing:.08em;
  text-transform:uppercase;color:var(--faint);background:var(--card-2);white-space:nowrap;
  position:sticky;top:0;z-index:1}
tbody tr:last-child td{border-bottom:none}
tbody tr:hover td{background:var(--card-2)}
td.num{font-family:var(--f-ui);font-variant-numeric:tabular-nums;color:var(--faint);font-size:.8rem;width:1%}
.cmp td:nth-child(3){background:color-mix(in srgb,var(--rose) 5%,transparent)}
.cmp td:nth-child(4){background:color-mix(in srgb,var(--teal) 6%,transparent)}
.say td:first-child{font-family:var(--f-ui);font-weight:700;font-size:.9rem;color:var(--ink);white-space:nowrap}
.say td:last-child{font-family:var(--f-ui);font-weight:700;font-size:.9rem;color:var(--teal-deep)}
.say thead th:last-child{color:var(--teal-deep)}
.bank{display:flex;flex-wrap:wrap;gap:8px;margin-top:17px;list-style:none}
.bank li{font-family:var(--f-ui);font-size:.85rem;font-weight:600;background:var(--teal-soft);
  color:var(--teal-deep);border:1px solid color-mix(in srgb,var(--teal) 25%,transparent);
  border-radius:999px;padding:6px 14px}
.bank li small{font-family:var(--f-body);font-weight:400;color:var(--soft);font-size:.78rem}

/* figures */
figure{margin-top:30px;padding:22px;background:var(--card);border:1px solid var(--line);
  border-radius:var(--r);box-shadow:var(--shadow-sm)}
@media(min-width:1180px){figure{margin-left:-46px;margin-right:-46px}}
figure svg{display:block;width:100%;height:auto;max-width:100%}
svg text{font-family:"Plus Jakarta Sans",system-ui,sans-serif}
svg .ml{font-family:"Manjari","Noto Sans Malayalam",system-ui,sans-serif}
.figtitle{font-family:var(--f-ui);font-size:.66rem;font-weight:800;letter-spacing:.11em;
  text-transform:uppercase;color:var(--indigo);margin-bottom:15px}
figcaption{font-size:.88rem;line-height:1.65;color:var(--soft);margin-top:15px;
  padding-top:13px;border-top:1px solid var(--line)}
figcaption b{color:var(--ink);font-weight:600}

/* verify box */
.verify{margin-top:32px;padding:18px 21px;border-radius:var(--r-sm);
  border:1px dashed color-mix(in srgb,var(--amber) 50%,transparent);background:var(--amber-soft)}
.verify .tag{font-family:var(--f-ui);font-size:.66rem;font-weight:800;letter-spacing:.1em;
  text-transform:uppercase;color:var(--amber)}
.verify ul{margin-top:10px;padding-left:19px;display:flex;flex-direction:column;gap:7px;font-size:.96rem}
.verify a{color:var(--indigo-deep);text-decoration:underline;text-underline-offset:2px}
.verify p{margin-top:10px;font-size:.9rem;color:var(--soft)}

/* official links.
   Readers act on these, so they have to look different from ordinary bold text
   and be obviously government sources. The arrow is generated, not typed, so it
   never ends up in the search index or in a copied quote. */
.ol{color:var(--indigo-deep);text-decoration:underline;text-decoration-thickness:1px;
  text-underline-offset:3px;font-weight:600}
.ol::after{content:" \\2197";text-decoration:none;display:inline-block;font-weight:700}
.ol:hover{color:var(--teal-deep)}
.olinks{margin-top:22px;padding:17px 20px;border-radius:var(--r-sm);background:var(--card);
  border:1px solid var(--line);border-left:3px solid var(--indigo);
  display:flex;flex-direction:column;gap:9px;box-shadow:var(--shadow)}
.olinks .ttl{font-family:var(--f-ui);font-size:.66rem;font-weight:800;letter-spacing:.1em;
  text-transform:uppercase;color:var(--indigo-deep)}
.olinks .ol{font-size:.97rem;line-height:1.5}

/* checklist */
/* The card sits inside a 68ch reading column, so its own width is what should
   drive the split — a viewport breakpoint would give it two columns in 430px
   of space and shred the lines. Hence container queries. */
.checkcard{container-type:inline-size;background:var(--card);border:1px solid var(--line);
  border-radius:26px;box-shadow:var(--shadow);overflow:hidden;display:grid;
  grid-template-columns:1fr;margin-top:26px}
@container (min-width:720px){.checkcard{grid-template-columns:260px 1fr}}
/* stacked: a compact horizontal band; beside the list: a tall centred panel */
.checkcard .side{background:var(--grad);color:#fff;padding:24px;display:flex;flex-direction:row;
  align-items:center;justify-content:center;gap:22px;text-align:left;flex-wrap:wrap}
@container (min-width:720px){.checkcard .side{flex-direction:column;text-align:center;padding:30px;gap:14px}}
.ring{position:relative;width:148px;height:148px}
.ring svg{transform:rotate(-90deg)}
.ring .val{position:absolute;inset:0;display:grid;place-items:center;font-family:var(--f-ui);
  font-weight:800;font-size:1.45rem;font-variant-numeric:tabular-nums}
.checkcard .side .lbl{font-size:.84rem;opacity:.92}
.checkcard .side button{background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.32);
  color:#fff;border-radius:999px;padding:8px 17px;font-family:var(--f-display);font-weight:600;
  font-size:.82rem;cursor:pointer}
.checkcard .side button:hover{background:rgba(255,255,255,.26)}
.cklist{padding:20px 22px;display:grid;grid-template-columns:1fr;gap:3px 20px;list-style:none}
@container (min-width:1020px){.cklist{grid-template-columns:1fr 1fr}}
.cklist li{border:none}
/* An official link sits outside the <label> on purpose: inside it, clicking the
   link would also toggle the checkbox, because a label activates its control
   from anywhere in its subtree. The indent lines it up with the item's text
   (20px box + 11px gap + 8px label padding). */
.cklist li .ol{display:inline-block;margin:-2px 0 8px 39px;font-size:.84rem;line-height:1.45}
.cklist label{display:flex;gap:11px;align-items:flex-start;padding:10px 8px;border-radius:11px;
  cursor:pointer;font-size:.95rem;line-height:1.6;transition:.15s}
.cklist label:hover{background:var(--card-2)}
.cklist input{appearance:none;width:20px;height:20px;border:2px solid var(--teal);border-radius:6px;
  flex:none;margin-top:3px;position:relative;cursor:pointer;background:var(--card)}
.cklist input:checked{background:var(--teal);border-color:var(--teal)}
.cklist input:checked::after{content:"";position:absolute;left:6px;top:2px;width:5px;height:10px;
  border-right:2.5px solid #fff;border-bottom:2.5px solid #fff;transform:rotate(42deg)}
.cklist input:checked~span{text-decoration:line-through;opacity:.5}
.ckhead{display:none}

/* closing note */
.close{margin-top:40px;padding:26px 28px;border-radius:var(--r);background:var(--teal-soft);
  border:1px solid color-mix(in srgb,var(--teal) 25%,transparent)}
.close h3{margin:0 0 6px;padding:0;border:none;color:var(--teal-deep);font-size:1.2rem}

/* pager */
.pager{display:grid;gap:13px;margin-top:48px}
@media(min-width:620px){.pager{grid-template-columns:1fr 1fr}}
.pager a{display:flex;flex-direction:column;gap:4px;padding:18px 20px;border:1px solid var(--line);
  border-radius:var(--r-sm);background:var(--card);font-family:var(--f-display);font-weight:600;transition:.2s}
.pager a:hover{border-color:var(--indigo);transform:translateY(-2px);box-shadow:var(--shadow-sm)}
.pager a span{font-family:var(--f-ui);font-size:.65rem;font-weight:700;letter-spacing:.1em;
  text-transform:uppercase;color:var(--faint)}
.pager a.next{text-align:right;align-items:flex-end}

/* reading progress */
.prog{position:fixed;top:0;left:0;height:3px;background:var(--grad);z-index:150;width:0;
  transition:width .1s linear;border-radius:0 3px 3px 0}

/* ============================================================ emergency */
.fab{position:fixed;right:20px;bottom:calc(20px + env(safe-area-inset-bottom,0px));z-index:110;
  background:var(--rose);color:#fff;border:0;border-radius:999px;padding:13px 20px;
  font-family:var(--f-display);font-weight:700;font-size:.9rem;cursor:pointer;
  box-shadow:0 16px 40px -12px rgba(225,29,72,.55);display:flex;gap:9px;align-items:center;transition:.2s}
.fab:hover{transform:translateY(-2px)}
.fab svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
@media(max-width:520px){.fab{padding:13px 15px}.fab .t{display:none}}
.drawer{position:fixed;right:20px;bottom:calc(78px + env(safe-area-inset-bottom,0px));z-index:110;
  width:min(390px,calc(100vw - 40px));background:var(--card);border:1px solid var(--line);
  border-radius:24px;box-shadow:0 30px 70px -20px rgba(15,23,42,.45);overflow:hidden;
  transform:translateY(16px) scale(.98);opacity:0;pointer-events:none;transition:.24s}
.drawer.open{transform:none;opacity:1;pointer-events:auto}
.drawer .head{background:var(--rose);color:#fff;padding:15px 21px;font-family:var(--f-display);font-weight:700}
.drawer .body{padding:9px}
.drawer .row{display:flex;justify-content:space-between;gap:12px;padding:11px 13px;
  border-radius:13px;align-items:center}
.drawer .row:hover{background:var(--card-2)}
.drawer .row .l{font-size:.85rem;color:var(--soft);line-height:1.45}
.drawer .row .n{font-family:var(--f-ui);font-weight:800;font-size:1rem;color:var(--rose);white-space:nowrap}

/* ============================================================ footer */
footer{margin-top:70px;background:#0F172A;color:#B9C4D6;
  padding:52px 0 calc(32px + env(safe-area-inset-bottom,0px))}
.foot{display:grid;grid-template-columns:1.3fr 1fr 1fr;gap:38px}
@media(max-width:820px){.foot{grid-template-columns:1fr;gap:28px}}
footer h4{color:#fff;margin-bottom:11px;font-size:1rem}
footer p{font-size:.86rem;opacity:.8;line-height:1.7}
footer .list a{display:block;font-family:var(--f-ui);font-size:.86rem;padding:4px 0;opacity:.85}
footer .list a:hover{color:#7EE0D2;opacity:1}
.legal{margin-top:34px;padding-top:19px;border-top:1px solid rgba(255,255,255,.12);
  display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;font-size:.78rem;opacity:.72}
.legal a{color:#7EE0D2}

/* ============================================================ motion */
.reveal{opacity:0;transform:translateY(22px);transition:.6s ease}
.reveal.in{opacity:1;transform:none}
@media(prefers-reduced-motion:reduce){
  .reveal{opacity:1;transform:none;transition:none}
  *{animation-duration:.01ms!important;transition-duration:.01ms!important}
}

/* ============================================================ print */
@media print{
  .topbar,.rail,.onpage,.pager,.fab,.drawer,.sheet,.prog,.skip,.find,.chips,.heroimg,.checkcard .side{display:none!important}
  body{background:#fff;color:#000;font-size:11pt}
  .page{display:block;max-width:none;padding:0}
  .doc .inner{max-width:none}
  figure,.call,.tscroll,.checkcard,.g,.notif{break-inside:avoid;box-shadow:none;border:1px solid #ccc}
  .tscroll{overflow:visible}
  table{min-width:0!important}
  .cklist{grid-template-columns:1fr 1fr}
  .cklist input{-webkit-appearance:none;appearance:none;border:1.5px solid #000}
  footer{background:#fff;color:#000;margin-top:30px}
  a[href^="http"]::after{content:" (" attr(href) ")";font-size:8pt;color:#555}
}
`;
