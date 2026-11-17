// Astro's CSP hashes the scripts it bundles, but not `<script is:inline>` blocks, which the site
// needs so they run before first paint (theme, transition names, art state). This hashes those
// blocks straight from the .astro sources, whose text Astro emits unchanged, for
// security.csp.scriptDirective.hashes. Data blocks (JSON-LD, speculation rules) aren't scripts the
// browser runs, so they're skipped.
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const SKIP_TYPES = /type=["'](?:application\/ld\+json|speculationrules|importmap)["']/;

const astroFiles = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return astroFiles(path);
    return name.endsWith('.astro') ? [path] : [];
  });

export function inlineScriptHashes(root = 'src') {
  const hashes = new Set();
  for (const file of astroFiles(root)) {
    const source = readFileSync(file, 'utf8');
    for (const [, attrs, body] of source.matchAll(/<script\b([^>]*\bis:inline\b[^>]*)>([\s\S]*?)<\/script>/g)) {
      if (SKIP_TYPES.test(attrs) || /\bset:html\b/.test(attrs)) continue;
      hashes.add(`sha256-${createHash('sha256').update(body).digest('base64')}`);
    }
  }
  return [...hashes];
}
