# കേരളം → ഓസ്‌ട്രേലിയ · Kerala to Australia Guide

A practical settlement guide for Malayali migrants in Australia, published as a
static multi-page site. Each of the 11 sections is its own page with its own URL,
so a reader can be sent straight to the one thing they need — which is how this
actually gets shared, in WhatsApp family groups, one link at a time.

---

## How it is put together

**`content/guide.html` is the single source of truth.** It is the complete guide
as one document. The build splits it into pages. You never edit the generated
pages — edit the source, run the build.

```
content/guide.html      ← all the writing lives here (edit this)
content/og/*.png        ← link-preview cards (regenerate only if titles change)
site.config.json        ← domain, slugs, English titles, dates (edit this)
build.mjs               ← splits the source into dist/
og.mjs                  ← renders the link-preview PNGs
serve.mjs               ← local preview
dist/                   ← generated. Never edit, never commit.
```

## First run

```bash
node build.mjs      # builds dist/
npm run dev         # builds, then serves at http://localhost:4321
```

No dependencies are needed for the build. Node 18+ is enough.

## Before going live — do this first

Open `site.config.json` and set **`siteUrl`** to your real address:

```json
"siteUrl": "https://guide.yourdomain.com",
"basePath": ""
```

Every canonical URL, Open Graph tag, sitemap entry and the service worker is
generated from that one value. The CI workflow refuses to deploy while it still
says `example.com`.

If you are serving from a sub-path instead of a subdomain — say
`yourdomain.com/australia-guide/` — set both:

```json
"siteUrl": "https://yourdomain.com",
"basePath": "/australia-guide"
```

While you are in there, also set `feedbackEmail` (or `feedbackUrl`) so readers
can report an error, and bump `lastVerified` whenever you re-check the content.

---

## Deploying

### Cloudflare Pages (recommended)

Nothing to configure, no build step needed on their side.

1. Run `node build.mjs` locally.
2. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** →
   **Upload assets**, and drop the `dist` folder in.
3. **Custom domains** → add `guide.yourdomain.com`. If your DNS is already on
   Cloudflare this is one click; otherwise add the CNAME they show you.

To deploy from Git instead: connect the repo, set build command `node build.mjs`
and output directory `dist`.

### GitHub Pages

`.github/workflows/deploy.yml` is ready. Push to `main`, then
**Settings → Pages → Source: GitHub Actions**. For a custom domain, set it under
**Settings → Pages → Custom domain** and add the DNS record GitHub shows.

### Netlify

Build command `node build.mjs`, publish directory `dist`.

---

## Regenerating the link-preview cards

The 1200×630 cards that WhatsApp, Facebook and LinkedIn show are **committed
PNGs**, because those platforms reject SVG and because Malayalam needs a real
font and a browser to shape correctly.

You only need to re-run this if you change a title in `site.config.json`:

```bash
npm install          # pulls Playwright, only needed for this
npx playwright install chromium
npm run og           # rewrites content/og/*.png
```

Then commit the PNGs. CI never runs this, so it stays fast and browser-free.

---

## Adding or renaming a section

1. Add a `<section id="sN">…</section>` to `content/guide.html`.
2. Add a matching entry to `sections` in `site.config.json` — `id` must match,
   `slug` becomes the URL, `titleEn` and `descriptionEn` are what Google and the
   link previews read.
3. `node build.mjs`, then `npm run og` if you want its preview card.

The build warns if the config lists a section the source does not have.

**Changing a `slug` changes a public URL.** If the old one has been shared, add a
redirect — on Cloudflare Pages a `_redirects` file in `dist`, on Netlify the
same, on GitHub Pages a small stub page with a `<meta http-equiv="refresh">`.

---

## Keeping it honest

This guide states wage rates, thresholds, fines and visa rules. **Most of those
change on 1 July each year, and stale figures on a public page are worse than no
page** — people act on them.

- Sections with volatile facts declare them in `site.config.json` under
  `volatile`. The build renders a `⟳` box at the end of the page listing what
  goes stale and linking the official source. Keep that list current.
- `lastVerified` is shown in the footer of every page. Update it when you
  re-check, not when you tweak CSS.
- Put a recurring reminder in your calendar for early July.

The disclaimer in `site.config.json` appears on every page. Keep it.

---

## What the build produces

| | |
|---|---|
| Pages | `index.html` + one directory per section + `404.html` |
| Per page | canonical URL, Open Graph + Twitter card, JSON-LD `Article`, bilingual title |
| Search | `search-index.json`, 84 entries, filtered client-side in the sidebar |
| Offline | `sw.js` pre-caches every page — useful for a new arrival with no SIM yet |
| Also | `sitemap.xml`, `robots.txt`, `manifest.webmanifest`, print stylesheet |

The print stylesheet drops the navigation and expands tables, so the 30-day
checklist prints cleanly on one or two pages.

---

## Licence and credit

Written by Abhilash Emmanuel. Decide on a licence before you publish — if you
want it reused and translated, CC BY 4.0 is the usual choice for this kind of
community resource; if you would rather it not be copied wholesale, say
"all rights reserved" in the footer. Either way, state it.
