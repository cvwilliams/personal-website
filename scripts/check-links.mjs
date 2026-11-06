// Checks every internal link, asset and #fragment in the built site (dist/). External links are not fetched.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';

const root = new URL('../dist/', import.meta.url).pathname;
const site = 'https://cameronwillia.ms';

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

const html = new Map(pages.map((page) => [page, readFileSync(page, 'utf8')]));
const idsCache = new Map();
const idsOf = (page) => {
  if (!idsCache.has(page)) {
    idsCache.set(page, new Set([...html.get(page).matchAll(/\s(?:id|name)=["']([^"']+)["']/g)].map((m) => m[1])));
  }
  return idsCache.get(page);
};

const resolveFile = (path) => {
  const clean = decodeURIComponent(path).replace(/\/$/, '');
  const candidates = clean === '' ? ['index.html'] : [clean, `${clean}.html`, join(clean, 'index.html')];
  for (const candidate of candidates) {
    const file = join(root, candidate);
    if (existsSync(file) && statSync(file).isFile()) return file;
  }
  return null;
};

const urlsIn = (source) => {
  const urls = [];
  for (const [, attr, value] of source.matchAll(/\s(href|src|srcset|content)=(?:"([^"]*)"|'([^']*)')/g)) {
    if (value === undefined) continue;
    if (attr === 'srcset') urls.push(...value.split(',').map((part) => part.trim().split(/\s+/)[0]));
    else if (attr === 'content') {
      if (value.startsWith(`${site}/`)) urls.push(value);
    } else urls.push(value);
  }
  return urls.filter(Boolean);
};

const failures = [];
for (const page of pages) {
  const pagePath = `/${relative(root, page)}`;
  for (const raw of new Set(urlsIn(html.get(page)))) {
    let url = raw.replace(/&amp;/g, '&');
    if (url.startsWith(site)) url = url.slice(site.length) || '/';
    if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(url)) continue;
    const [pathPart, fragment] = url.split('#');
    const path = pathPart.split('?')[0];
    let target = page;
    if (path) {
      const absolute = path.startsWith('/') ? path : join(dirname(pagePath), path);
      target = resolveFile(absolute.slice(1));
      if (!target) {
        failures.push(`${pagePath}: ${raw} (not found)`);
        continue;
      }
    }
    if (fragment && target.endsWith('.html') && !idsOf(target).has(decodeURIComponent(fragment))) {
      failures.push(`${pagePath}: ${raw} (no element with id "${fragment}")`);
    }
  }
}

if (failures.length > 0) {
  console.error(`${failures.length} broken link(s):\n${failures.map((f) => `  ${f}`).join('\n')}`);
  process.exit(1);
}
console.log(`Checked ${pages.length} pages: no broken internal links.`);
