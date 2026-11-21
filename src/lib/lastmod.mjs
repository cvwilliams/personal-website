// Last-modified dates for the sitemap, read straight from content frontmatter (astro.config.mjs runs
// before content collections exist). Only pages whose freshness we actually know get a date:
// each thought, the Thoughts index, each Now update, /now, and the homepage (latest of everything).
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const frontmatter = (file) => {
  const block = readFileSync(file, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
  const field = (key) => block.match(new RegExp(`^${key}:\\s*['"]?([^'"\\n]+?)['"]?\\s*$`, 'm'))?.[1];
  return { field };
};

const entries = (dir) => {
  try {
    return readdirSync(dir).filter((f) => /\.mdx?$/.test(f)).map((f) => ({ slug: f.replace(/\.mdx?$/, ''), ...frontmatter(join(dir, f)) }));
  } catch {
    return [];
  }
};

const toDate = (value) => {
  const date = value ? new Date(value) : undefined;
  return date && !Number.isNaN(date.valueOf()) ? date : undefined;
};
const latest = (dates) => dates.filter(Boolean).sort((a, b) => b - a)[0];

/** Map of site path (`/thoughts/foo`) to its last-modified Date. */
export function lastModified(root = 'src/content') {
  const map = new Map();

  const thoughts = entries(join(root, 'thoughts'))
    .filter((t) => t.field('draft') !== 'true')
    .map((t) => [`/thoughts/${t.slug}`, toDate(t.field('updatedDate')) ?? toDate(t.field('pubDate'))]);
  for (const [path, date] of thoughts) if (date) map.set(path, date);

  const now = entries(join(root, 'now')).map((n) => [n.slug, toDate(n.field('updated')) ?? toDate(n.slug)]);
  for (const [slug, date] of now) if (date) map.set(`/now/${slug}`, date);

  const newestThought = latest(thoughts.map(([, d]) => d));
  const newestNow = latest(now.map(([, d]) => d));
  if (newestThought) map.set('/thoughts', newestThought);
  if (newestNow) {
    map.set('/now', newestNow);
    // The newest update is served at /now, not /now/<date>.
    const current = now.find(([, d]) => d === newestNow)?.[0];
    if (current) map.delete(`/now/${current}`);
  }
  const home = latest([newestThought, newestNow]);
  if (home) map.set('/', home);
  return map;
}

/** `serialize` hook for @astrojs/sitemap: adds lastmod where we know it. */
export function withLastmod(root) {
  const dates = lastModified(root);
  return (item) => {
    const path = new URL(item.url).pathname.replace(/(.)\/$/, '$1');
    const date = dates.get(path);
    return date ? { ...item, lastmod: date.toISOString() } : item;
  };
}
