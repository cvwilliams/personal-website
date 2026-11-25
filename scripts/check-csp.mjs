// Checks the built site (dist/) for markup its own Content Security Policy would block: style="…"
// attributes, inline event handlers, javascript: URLs, inline scripts and styles whose hash isn't in the
// page's policy, and scripts or stylesheets from other hosts.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.argv[2] ?? new URL('../dist/', import.meta.url).pathname;
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

// Data blocks the browser doesn't run; speculation rules are allowed by 'inline-speculation-rules'.
const DATA_TYPES = new Set(['application/ld+json', 'application/json', 'speculationrules']);
const URL_ATTRIBUTES = ['href', 'src', 'action', 'formaction', 'xlink:href'];

// Comments, then raw-text elements with their contents (which aren't markup), then any other start tag.
// Quoted attribute values may contain ">".
const ATTRS = `(?:"[^"]*"|'[^']*'|[^'">])*`;
const TOKEN = new RegExp(`<!--[\\s\\S]*?-->|<(script|style)\\b(${ATTRS})>([\\s\\S]*?)</\\1\\s*>|<([a-z][^\\s/>]*)(${ATTRS})>`, 'gi');

const parseAttributes = (source) => {
  const attributes = new Map();
  for (const [, name, double, single, bare] of source.matchAll(/([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g)) {
    attributes.set(name.toLowerCase(), double ?? single ?? bare ?? '');
  }
  return attributes;
};

const isOwn = (url) => !/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(url.trim());
const directive = (policy, name) => policy.match(new RegExp(`(?:^|;)\\s*${name}\\s([^;]*)`))?.[1] ?? '';
const isHashed = (sources, body) => sources.includes(`'sha256-${createHash('sha256').update(body).digest('base64')}'`);
const snippet = (text) => `${text.trim().replace(/\s+/g, ' ').slice(0, 60)}`;

const failures = [];
for (const page of pages) {
  const html = readFileSync(page, 'utf8');
  const elements = [...html.matchAll(TOKEN)]
    .filter((match) => match[1] || match[4])
    .map((match) => ({ tag: (match[1] ?? match[4]).toLowerCase(), attributes: parseAttributes(match[2] ?? match[5]), body: match[3] ?? '' }));
  const fail = (message) => failures.push(`/${relative(root, page)}: ${message}`);

  const meta = elements.find((el) => el.tag === 'meta' && el.attributes.get('http-equiv')?.toLowerCase() === 'content-security-policy');
  if (!meta) {
    fail('no Content-Security-Policy meta tag');
    continue;
  }
  const policy = meta.attributes.get('content') ?? '';
  const scriptSources = directive(policy, 'script-src');
  const styleSources = directive(policy, 'style-src');

  for (const { tag, attributes, body } of elements) {
    for (const [name, value] of attributes) {
      if (name === 'style') fail(`<${tag}> has style="${snippet(value)}"`);
      else if (/^on[a-z]/.test(name)) fail(`<${tag}> has an inline ${name} handler`);
      else if (URL_ATTRIBUTES.includes(name) && /^\s*javascript:/i.test(value)) fail(`<${tag}> has a javascript: URL in ${name}`);
    }

    if (tag === 'script' && !DATA_TYPES.has(attributes.get('type')?.toLowerCase())) {
      if (attributes.has('src')) {
        if (!isOwn(attributes.get('src'))) fail(`<script> from another host: ${attributes.get('src')}`);
      } else if (!isHashed(scriptSources, body)) fail(`inline <script> not in script-src: ${snippet(body)}`);
    }
    if (tag === 'style' && !isHashed(styleSources, body)) fail(`inline <style> not in style-src: ${snippet(body)}`);
    if (tag === 'link' && attributes.get('rel')?.toLowerCase().split(/\s+/).includes('stylesheet') && !isOwn(attributes.get('href') ?? '')) {
      fail(`stylesheet from another host: ${attributes.get('href')}`);
    }
  }
}

if (failures.length > 0) {
  console.error(`${failures.length} thing(s) the Content Security Policy would block:\n${failures.map((f) => `  ${f}`).join('\n')}`);
  process.exit(1);
}
console.log(`Checked ${pages.length} pages: nothing the Content Security Policy would block.`);
