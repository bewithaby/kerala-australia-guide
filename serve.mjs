#!/usr/bin/env node
/** Tiny local preview server for dist/ — no dependencies.  npm run dev  */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const DIST = path.join(ROOT, 'dist');
const PORT = Number(process.env.PORT || 4321);
/* The build writes absolute URLs under basePath, so the preview has to answer on
   that prefix too. Serving dist/ at / instead leaves every page loading with no
   stylesheet, no app.js and no search index, which looks like a broken site. */
const BP = (JSON.parse(fs.readFileSync(path.join(ROOT, 'site.config.json'), 'utf8')).basePath || '')
  .replace(/\/+$/, '');
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8', '.webmanifest': 'application/manifest+json',
};

if (!fs.existsSync(DIST)) { console.error('dist/ not found — run `npm run build` first.'); process.exit(1); }

http.createServer((req, res) => {
  let clean = decodeURIComponent(req.url.split('?')[0]).replace(/\.\./g, '');
  if (BP && (clean === BP || clean.startsWith(BP + '/'))) clean = clean.slice(BP.length) || '/';
  else if (BP && clean === '/') {
    res.writeHead(302, { location: BP + '/' });
    return res.end();
  }
  let file = path.join(DIST, clean);
  if (!path.extname(file)) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) {
    res.writeHead(404, { 'content-type': TYPES['.html'] });
    return res.end(fs.existsSync(path.join(DIST, '404.html')) ? fs.readFileSync(path.join(DIST, '404.html')) : 'Not found');
  }
  res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`preview  →  http://localhost:${PORT}${BP}/`));
