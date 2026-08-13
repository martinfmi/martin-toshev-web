import fs from 'node:fs';

const p =
  process.argv[2] ||
  'content/blog/architecture/Brief architectural overview of several RDBMS.html';
const html = fs.readFileSync(p, 'utf8');

console.log('FILE', p);
console.log('TITLE TAG', (html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1]);
console.log(
  'H1s',
  [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) =>
    m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(),
  ),
);
console.log(
  'itemprop name',
  [...html.matchAll(/itemprop="name"[^>]*>([\s\S]*?)<\//gi)].slice(0, 5).map((m) =>
    m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(),
  ),
);
console.log(
  'page-header',
  [...html.matchAll(/page-header[\s\S]{0,200}/gi)].slice(0, 3).map((m) => m[0].slice(0, 180)),
);
console.log('PUB', (html.match(/Published on[\s\S]{0,80}/i) || [])[0]);
const idx = html.search(/item-page/);
console.log('item-page idx', idx);
if (idx >= 0) console.log(html.slice(idx, idx + 1200));
