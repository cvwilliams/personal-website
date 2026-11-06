// Page-weight budget for the built site (dist/): gzipped HTML, JavaScript and CSS per page, plus preloaded fonts.
// Images are left out: they're lazy-loaded and mostly come from other hosts.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { gzipSync } from 'node:zlib';

// About twice what the site ships today (HTML includes its inline scripts and styles).
const BUDGET_KB = { html: 30, js: 10, css: 12, fonts: 40 };

const root = new URL('../dist/', import.meta.url).pathname;
if (!existsSync(root)) {
  console.error('dist/ not found: run the build first.');
  process.exit(1);
}

const pages = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (name.endsWith('.html')) pages.push(path);
  }
};
walk(root);

const gz = (text) => gzipSync(text).length;
const fileCache = new Map();
const asset = (href) => {
  const path = join(root, href.split(/[?#]/)[0]);
  if (!fileCache.has(path)) fileCache.set(path, existsSync(path) ? readFileSync(path) : null);
  return fileCache.get(path);
};
const attr = (tag, name) => tag.match(new RegExp(`\\s${name}=["']([^"']+)["']`))?.[1];

const rows = [];
const failures = [];
for (const page of pages.sort()) {
  const html = readFileSync(page, 'utf8');
  const sizes = { html: gz(html), js: 0, css: 0, fonts: 0 };
  for (const [tag, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g).map((m) => [m[1], m[2]])) {
    const type = attr(tag, 'type');
    if (type && type !== 'module' && type !== 'text/javascript') continue;
    const src = attr(tag, 'src');
    if (src?.startsWith('/')) sizes.js += asset(src) ? gz(asset(src)) : 0;
    else if (!src) sizes.js += gz(body);
  }
  for (const [, body] of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)) sizes.css += gz(body);
  for (const [tag] of html.matchAll(/<link\b[^>]*>/g)) {
    const rel = attr(tag, 'rel');
    const href = attr(tag, 'href');
    if (!href?.startsWith('/')) continue;
    if (rel === 'stylesheet' && asset(href)) sizes.css += gz(asset(href));
    if (rel === 'preload' && attr(tag, 'as') === 'font' && asset(href)) sizes.fonts += asset(href).length;
  }
  const name = `/${relative(root, page)}`;
  rows.push([name, sizes]);
  for (const [kind, limit] of Object.entries(BUDGET_KB)) {
    if (sizes[kind] > limit * 1024) failures.push(`${name}: ${kind} ${(sizes[kind] / 1024).toFixed(1)} KB > ${limit} KB`);
  }
}

const kb = (n) => `${(n / 1024).toFixed(1)}`.padStart(6);
console.log(`${'page'.padEnd(36)}  html KB   js KB  css KB  font KB   (budget ${BUDGET_KB.html}/${BUDGET_KB.js}/${BUDGET_KB.css}/${BUDGET_KB.fonts})`);
for (const [name, s] of rows) console.log(`${name.padEnd(36)}  ${kb(s.html)}  ${kb(s.js)}  ${kb(s.css)}  ${kb(s.fonts)}`);

if (failures.length > 0) {
  console.error(`\nOver budget:\n${failures.map((f) => `  ${f}`).join('\n')}`);
  process.exit(1);
}
console.log(`\nAll ${pages.length} pages within budget.`);
