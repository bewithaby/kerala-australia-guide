/**
 * Per-section banner artwork, drawn as inline SVG.
 *
 * Why drawn and not photographed: every image on this site sits on a public
 * page under a named author, so each one needs a licence that can be produced
 * on request. Stock photography cannot clear that bar without a paper trail,
 * and generated photographs carry no usable provenance at all. These are
 * original drawings, so there is nothing to clear.
 *
 * They also cost nothing to ship (a few KB of markup, no requests), they
 * recolour with the theme, and every section gets one — which a photo set
 * never manages, leaving most cards blank.
 *
 * Each scene draws into a 640x300 box. No text except where a sign is the
 * subject, so there is no font dependency and nothing to translate.
 */

/* A scene returns markup only. tile() in build.mjs supplies the gradient wash,
   the dot screen and the frame, so the look stays consistent across all of them. */
const SCENES = {
  /* Australia, with the journey from Kerala drawn across it. The outline is a
     simplified coast, not a blob: Cape York and the Gulf of Carpentaria at the
     top, the Bight scooped out of the south coast, and Tasmania separate. */
  'about-australia': `
    <g transform="translate(348 150)">
      <path d="M-104 -40
        C-98 -56 -84 -66 -70 -62 -58 -58 -52 -70 -42 -72
        -34 -74 -30 -62 -24 -56 -18 -50 -14 -58 -12 -68
        -10 -80 -4 -88 2 -86 8 -84 8 -72 10 -62
        12 -50 20 -40 30 -28 40 -16 50 -2 56 14
        62 30 60 44 52 54 44 64 30 68 16 68
        2 68 -10 62 -24 62 -38 62 -50 68 -64 66
        -78 64 -90 56 -98 44 -106 32 -110 16 -110 0
        -110 -16 -108 -28 -104 -40Z"
        fill="#fff" opacity=".94"/>
      <path d="M20 80c6-6 16-8 22-2 5 5 2 14-4 18-7 5-16 3-20-4-3-5-1-9 2-12Z"
        fill="#fff" opacity=".88"/>
      <circle cx="-44" cy="6" r="7" fill="currentColor"/>
      <circle cx="-44" cy="6" r="16" fill="none" stroke="currentColor" stroke-width="3" opacity=".4"/>
    </g>
    <g opacity=".95">
      <circle cx="74" cy="92" r="9" fill="#fff"/>
      <path d="M83 99q66 30 122 44" stroke="#fff" stroke-width="4" fill="none"
        stroke-dasharray="11 9" stroke-linecap="round" opacity=".75"/>
      <path d="M212 148l-15-5 3 7-1 7Z" fill="#fff"/>
    </g>`,

  /* Suitcase, boarding pass, plane. */
  'before-you-fly': `
    <g transform="translate(250 150)">
      <rect x="-86" y="-54" width="172" height="118" rx="16" fill="#fff" opacity=".95"/>
      <rect x="-86" y="-16" width="172" height="12" fill="currentColor" opacity=".28"/>
      <path d="M-30 -54v-16a14 14 0 0 1 14-14h32a14 14 0 0 1 14 14v16"
        fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round"/>
      <rect x="-54" y="14" width="40" height="8" rx="4" fill="currentColor" opacity=".3"/>
      <rect x="-54" y="32" width="66" height="8" rx="4" fill="currentColor" opacity=".18"/>
    </g>
    <g transform="translate(430 112) rotate(-9)">
      <rect x="-54" y="-34" width="108" height="68" rx="10" fill="#fff" opacity=".88"/>
      <path d="M12 -34v68" stroke="currentColor" stroke-width="2.5" stroke-dasharray="6 5" opacity=".45"/>
      <rect x="-42" y="-20" width="40" height="7" rx="3.5" fill="currentColor" opacity=".35"/>
      <rect x="-42" y="-5" width="30" height="6" rx="3" fill="currentColor" opacity=".2"/>
      <circle cx="31" cy="-2" r="13" fill="none" stroke="currentColor" stroke-width="3" opacity=".4"/>
    </g>
    <path d="M454 212l82-30-22 56-16-24-44-2Z" fill="#fff" opacity=".9"/>`,

  /* Calendar with one date ringed. */
  'whats-changed-2026': `
    <g transform="translate(320 148)">
      <rect x="-104" y="-74" width="208" height="150" rx="18" fill="#fff" opacity=".95"/>
      <rect x="-104" y="-74" width="208" height="40" rx="18" fill="currentColor" opacity=".32"/>
      <rect x="-104" y="-50" width="208" height="16" fill="currentColor" opacity=".32"/>
      <rect x="-66" y="-90" width="13" height="30" rx="6.5" fill="#fff"/>
      <rect x="53" y="-90" width="13" height="30" rx="6.5" fill="#fff"/>
      <g fill="currentColor" opacity=".22">
        <rect x="-82" y="-18" width="26" height="20" rx="5"/><rect x="-46" y="-18" width="26" height="20" rx="5"/>
        <rect x="-10" y="-18" width="26" height="20" rx="5"/><rect x="26" y="-18" width="26" height="20" rx="5"/>
        <rect x="62" y="-18" width="22" height="20" rx="5"/>
        <rect x="-82" y="12" width="26" height="20" rx="5"/><rect x="-46" y="12" width="26" height="20" rx="5"/>
        <rect x="26" y="12" width="26" height="20" rx="5"/><rect x="62" y="12" width="22" height="20" rx="5"/>
        <rect x="-82" y="42" width="26" height="20" rx="5"/><rect x="-46" y="42" width="26" height="20" rx="5"/>
        <rect x="-10" y="42" width="26" height="20" rx="5"/>
      </g>
      <circle cx="3" cy="22" r="20" fill="currentColor"/>
      <path d="M-7 22l7 7 13-14" stroke="#fff" stroke-width="4.5" fill="none"
        stroke-linecap="round" stroke-linejoin="round"/>
    </g>`,

  /* Two speech bubbles, one answering the other. */
  'etiquette': `
    <g transform="translate(246 124)">
      <path d="M-82 -48h164a18 18 0 0 1 18 18v56a18 18 0 0 1-18 18H-26l-34 28v-28h-22a18 18 0 0 1-18-18v-56a18 18 0 0 1 18-18Z"
        fill="#fff" opacity=".95"/>
      <rect x="-58" y="-22" width="104" height="9" rx="4.5" fill="currentColor" opacity=".32"/>
      <rect x="-58" y="0" width="72" height="9" rx="4.5" fill="currentColor" opacity=".2"/>
    </g>
    <g transform="translate(436 196)">
      <path d="M78 -44H-66a16 16 0 0 0-16 16v48a16 16 0 0 0 16 16h116l30 24v-24h-2a16 16 0 0 0 16-16v-48a16 16 0 0 0-16-16Z"
        transform="scale(-1 1)" fill="currentColor" opacity=".55"/>
      <rect x="-58" y="-20" width="88" height="9" rx="4.5" fill="#fff" opacity=".9"/>
      <rect x="-58" y="2" width="56" height="9" rx="4.5" fill="#fff" opacity=".65"/>
    </g>`,

  /* The four bins. This one keeps its real-world lid colours on purpose:
     the whole point of the section is which colour means what. */
  'home-bathroom-bins': `
    <g transform="translate(320 162)">
      ${[['-168', '#D92D20'], ['-56', '#EAB308'], ['56', '#16A34A'], ['168', '#7E3AED']]
    .map(([x, c]) => `<g transform="translate(${x} 0)">
        <path d="M-40 -34h80l-7 92a12 12 0 0 1-12 11h-42a12 12 0 0 1-12-11Z" fill="#fff" opacity=".97"/>
        <rect x="-47" y="-50" width="94" height="20" rx="8" fill="${c}"/>
        <rect x="-13" y="-62" width="26" height="12" rx="5" fill="${c}"/>
        <path d="M-26 -14h52" stroke="${c}" stroke-width="4" opacity=".35" stroke-linecap="round"/>
      </g>`).join('')}
    </g>`,

  /* Flat white in a takeaway cup, next to a grocery bag. */
  'food-groceries': `
    <g transform="translate(248 146)">
      <path d="M-46 -52h92l-10 108a16 16 0 0 1-16 14h-40a16 16 0 0 1-16-14Z" fill="#fff" opacity=".96"/>
      <rect x="-54" y="-64" width="108" height="20" rx="9" fill="#fff"/>
      <rect x="-40" y="-18" width="80" height="30" rx="7" fill="currentColor" opacity=".3"/>
      <path d="M-18 4q18-14 36 0" stroke="currentColor" stroke-width="4" fill="none" opacity=".5" stroke-linecap="round"/>
      <path d="M-58 -78q14-16 32-10M-28 -92q10-12 24-8" stroke="#fff" stroke-width="5"
        fill="none" opacity=".55" stroke-linecap="round"/>
    </g>
    <g transform="translate(438 164)">
      <path d="M-56 -36h112l-10 100a14 14 0 0 1-14 12H-32a14 14 0 0 1-14-12Z" fill="currentColor" opacity=".5"/>
      <path d="M-26 -36v-14a26 26 0 0 1 52 0v14" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round"/>
      <circle cx="-16" cy="12" r="13" fill="#fff" opacity=".8"/>
      <path d="M12 -2h26v30H12Z" fill="#fff" opacity=".7"/>
    </g>`,

  /* SIM card and a rising signal. */
  'sim-internet': `
    <g transform="translate(252 150)">
      <path d="M-62 -72h88l36 36v108a14 14 0 0 1-14 14h-110a14 14 0 0 1-14-14v-130a14 14 0 0 1 14-14Z"
        fill="#fff" opacity=".96"/>
      <path d="M26 -72v36h36Z" fill="currentColor" opacity=".35"/>
      <rect x="-34" y="-2" width="76" height="56" rx="9" fill="currentColor" opacity=".55"/>
      <g stroke="#fff" stroke-width="3.5" opacity=".9">
        <path d="M-34 16h30M-34 36h30M12 -2v56M-10 -2v56"/>
      </g>
    </g>
    <g transform="translate(448 196)" fill="#fff">
      <rect x="-60" y="-16" width="22" height="34" rx="5" opacity=".45"/>
      <rect x="-30" y="-38" width="22" height="56" rx="5" opacity=".62"/>
      <rect x="0" y="-62" width="22" height="80" rx="5" opacity=".8"/>
      <rect x="30" y="-88" width="22" height="106" rx="5" opacity=".96"/>
    </g>`,

  /* Medicare-style card with a heart. */
  'health-services': `
    <g transform="translate(316 150) rotate(-6)">
      <rect x="-124" y="-78" width="248" height="152" rx="20" fill="#fff" opacity=".96"/>
      <rect x="-124" y="-78" width="248" height="34" rx="20" fill="currentColor" opacity=".3"/>
      <rect x="-124" y="-60" width="248" height="16" fill="currentColor" opacity=".3"/>
      <rect x="-100" y="-24" width="104" height="10" rx="5" fill="currentColor" opacity=".26"/>
      <rect x="-100" y="-2" width="76" height="10" rx="5" fill="currentColor" opacity=".16"/>
      <rect x="-100" y="34" width="120" height="14" rx="7" fill="currentColor" opacity=".22"/>
      <path d="M62 36c0 0-34-19-34-40a18 18 0 0 1 34-9 18 18 0 0 1 34 9c0 21-34 40-34 40Z"
        fill="currentColor" opacity=".8"/>
    </g>`,

  /* A desk at 5:30, which is when people actually leave. */
  'workplace': `
    <g transform="translate(320 160)">
      <path d="M-116 52h232l14 26H-130Z" fill="#fff" opacity=".55"/>
      <rect x="-104" y="-62" width="208" height="118" rx="12" fill="#fff" opacity=".96"/>
      <rect x="-90" y="-48" width="180" height="90" rx="7" fill="currentColor" opacity=".45"/>
      <g stroke="#fff" stroke-width="4" opacity=".9" stroke-linecap="round">
        <path d="M-66 -24h74M-66 -4h108M-66 16h52"/>
      </g>
    </g>
    <g transform="translate(470 92)">
      <circle r="40" fill="#fff" opacity=".95"/>
      <circle r="40" fill="none" stroke="currentColor" stroke-width="4" opacity=".3"/>
      <path d="M0 -24v26l17 11" stroke="currentColor" stroke-width="6" fill="none"
        stroke-linecap="round" stroke-linejoin="round"/>
    </g>`,

  /* A 2P parking sign, which is the one sign everyone misreads. */
  'roads-parking-safety': `
    <g transform="translate(320 142)">
      <rect x="-10" y="-20" width="20" height="150" rx="6" fill="#fff" opacity=".5"/>
      <rect x="-74" y="-104" width="148" height="128" rx="12" fill="#fff"/>
      <rect x="-74" y="-104" width="148" height="128" rx="12" fill="none"
        stroke="currentColor" stroke-width="5" opacity=".5"/>
      <text x="0" y="-48" text-anchor="middle" font-family="Helvetica,Arial,sans-serif"
        font-size="56" font-weight="700" fill="#1D4ED8">2P</text>
      <path d="M-50 -24h100" stroke="currentColor" stroke-width="4" opacity=".3"/>
      <text x="0" y="4" text-anchor="middle" font-family="Helvetica,Arial,sans-serif"
        font-size="20" font-weight="700" fill="#334155">TICKET</text>
    </g>`,

  /* School bag and the hat you cannot play without. */
  'children-school': `
    <g transform="translate(262 156)">
      <path d="M-60 -22h120v86a16 16 0 0 1-16 16H-44a16 16 0 0 1-16-16Z" fill="#fff" opacity=".96"/>
      <path d="M-60 -22a60 60 0 0 1 120 0Z" fill="currentColor" opacity=".55"/>
      <rect x="-34" y="26" width="68" height="34" rx="9" fill="currentColor" opacity=".3"/>
      <path d="M-24 -56a24 24 0 0 1 48 0v34" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round"/>
    </g>
    <g transform="translate(446 176)">
      <ellipse cy="14" rx="76" ry="20" fill="#fff" opacity=".9"/>
      <path d="M-42 14a42 42 0 0 1 84 0Z" fill="currentColor" opacity=".6"/>
      <path d="M-42 6h84" stroke="#fff" stroke-width="7" stroke-linecap="round"/>
    </g>`,

  /* A church, a temple and a mosque sharing one skyline. */
  'community-faith': `
    <g transform="translate(320 186)" fill="#fff">
      <g opacity=".95">
        <path d="M-150 10v-62h56v62Z"/>
        <path d="M-122 -96l32 44h-64Z"/>
        <rect x="-126" y="-128" width="8" height="26" rx="4"/>
        <rect x="-136" y="-118" width="28" height="8" rx="4"/>
      </g>
      <g opacity=".88">
        <path d="M-34 10v-54h68v54Z"/>
        <path d="M0 -112l44 68H-44Z"/>
        <circle cy="-124" r="9"/>
      </g>
      <g opacity=".95">
        <path d="M94 10v-58h58v58Z"/>
        <path d="M94 -48a29 29 0 0 1 58 0Z"/>
        <rect x="160" y="-92" width="8" height="102" rx="4" opacity=".8"/>
        <circle cx="164" cy="-104" r="8" opacity=".8"/>
        <path d="M123 -22a11 11 0 0 1 22 0v32h-22Z" fill="currentColor" opacity=".55"/>
      </g>
      <rect x="-166" y="10" width="340" height="12" rx="6" opacity=".45"/>
    </g>`,

  /* Dollar and clock: what everything here costs in both. */
  'money-time-jobs': `
    <g transform="translate(262 150)">
      <circle r="74" fill="#fff" opacity=".96"/>
      <text x="0" y="26" text-anchor="middle" font-family="Helvetica,Arial,sans-serif"
        font-size="80" font-weight="700" fill="currentColor" opacity=".75">$</text>
    </g>
    <g transform="translate(424 160)">
      <circle r="66" fill="currentColor" opacity=".5"/>
      <circle r="66" fill="none" stroke="#fff" stroke-width="6" opacity=".9"/>
      <path d="M0 -38v42l28 18" stroke="#fff" stroke-width="8" fill="none"
        stroke-linecap="round" stroke-linejoin="round"/>
    </g>`,

  /* Two columns, which is what the comparison table is. */
  'comparison': `
    <g transform="translate(320 150)">
      <rect x="-146" y="-80" width="134" height="160" rx="14" fill="#fff" opacity=".9"/>
      <rect x="12" y="-80" width="134" height="160" rx="14" fill="currentColor" opacity=".52"/>
      <g fill="currentColor" opacity=".3">
        <rect x="-126" y="-58" width="94" height="10" rx="5"/>
        <rect x="-126" y="-30" width="72" height="8" rx="4"/>
        <rect x="-126" y="-10" width="88" height="8" rx="4"/>
        <rect x="-126" y="10" width="64" height="8" rx="4"/>
        <rect x="-126" y="30" width="80" height="8" rx="4"/>
      </g>
      <g fill="#fff" opacity=".92">
        <rect x="32" y="-58" width="94" height="10" rx="5"/>
        <rect x="32" y="-30" width="80" height="8" rx="4"/>
        <rect x="32" y="-10" width="60" height="8" rx="4"/>
        <rect x="32" y="10" width="88" height="8" rx="4"/>
        <rect x="32" y="30" width="70" height="8" rx="4"/>
      </g>
      <path d="M-6 -80v160" stroke="#fff" stroke-width="3" opacity=".5" stroke-dasharray="8 7"/>
    </g>`,

  /* The checklist, half done. */
  'first-30-days': `
    <g transform="translate(320 150)">
      <rect x="-114" y="-86" width="228" height="172" rx="18" fill="#fff" opacity=".96"/>
      ${[0, 1, 2, 3].map((i) => {
      const y = -52 + i * 36; const done = i < 2;
      return `<g transform="translate(0 ${y})">
          <rect x="-86" y="-14" width="28" height="28" rx="8" fill="${done ? 'currentColor' : 'none'}"
            opacity="${done ? '.8' : '1'}" stroke="currentColor" stroke-width="3" ${done ? '' : 'stroke-opacity=".35"'}/>
          ${done ? '<path d="M-78 0l6 7 12-14" stroke="#fff" stroke-width="3.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' : ''}
          <rect x="-44" y="-6" width="${done ? 92 : 118}" height="11" rx="5.5"
            fill="currentColor" opacity="${done ? '.2' : '.32'}"/>
        </g>`;
    }).join('')}
    </g>`,
};

export function hasScene(slug) {
  return Object.prototype.hasOwnProperty.call(SCENES, slug);
}

export function scene(slug) {
  return SCENES[slug] || '';
}
