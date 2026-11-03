import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

async function htmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) return htmlFiles(path);
      return entry.name.endsWith('.html') ? [path] : [];
    }),
  );
  return files.flat();
}

/**
 * After the build, make every link to another site open in a new tab
 * (target="_blank" rel="noopener noreferrer") and describe that to screen readers.
 * @param {{ site: string; noteId?: string }} options
 */
export default function externalLinks({ site, noteId = 'new-tab-note' }) {
  const ownHost = new URL(site).host;
  const isExternal = (href) => {
    try {
      const url = new URL(href);
      return (url.protocol === 'http:' || url.protocol === 'https:') && url.host !== ownHost;
    } catch {
      return false;
    }
  };

  const rewrite = (html) =>
    html.replace(/<a\b([^>]*)>/g, (tag, attrs) => {
      const href = attrs.match(/\bhref="([^"]*)"/)?.[1];
      if (!href || !isExternal(href) || /\btarget=/.test(attrs)) return tag;
      let next = attrs;
      next = /\brel="/.test(next)
        ? next.replace(/\brel="([^"]*)"/, (_, rel) => `rel="${[...new Set([...rel.split(/\s+/), 'noopener', 'noreferrer'])].filter(Boolean).join(' ')}"`)
        : `${next} rel="noopener noreferrer"`;
      next += ' target="_blank"';
      if (!/\baria-describedby=/.test(next)) next += ` aria-describedby="${noteId}"`;
      return `<a${next}>`;
    });

  return {
    name: 'external-links',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        const files = await htmlFiles(root);
        let changed = 0;
        for (const file of files) {
          const html = await readFile(file, 'utf8');
          const next = rewrite(html);
          if (next !== html) {
            await writeFile(file, next);
            changed++;
          }
        }
        logger.info(`Made external links open in a new tab in ${changed} page(s)`);
      },
    },
  };
}
