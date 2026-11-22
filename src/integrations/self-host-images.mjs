import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

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

// Anchor on whitespace: `\b` would also match the `src` in `data-src`.
const attrPattern = (name) => new RegExp(`(^|\\s)${name}="([^"]*)"`);
const attr = (attrs, name) => attrs.match(attrPattern(name))?.[2];
// Built HTML escapes attribute values (`&` is `&amp;`); fetch needs the real URL.
const decodeEntities = (value) =>
  value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

/**
 * After the build, download every remote `<img>` (album art, book covers), shrink it to twice its
 * displayed size as WebP and serve it from /_astro/ (content-hashed, cached forever). Pages then
 * make no connections to other hosts for images. An image that fails to download keeps its remote
 * URL, so a flaky CDN never breaks the build.
 * @param {{ dir?: string; quality?: number }} [options]
 */
export default function selfHostImages({ dir: subdir = '_astro/img', quality = 78 } = {}) {
  return {
    name: 'self-host-images',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        const files = await htmlFiles(root);
        const pages = await Promise.all(files.map(async (file) => ({ file, html: await readFile(file, 'utf8') })));

        // Collect each remote image with the largest size any page displays it at.
        const wanted = new Map();
        const imgTag = /<img\b([^>]*)>/g;
        for (const { html } of pages) {
          for (const [, attrs] of html.matchAll(imgTag)) {
            const src = attr(attrs, 'src');
            // srcset candidates aren't rewritten, so leave those images alone entirely.
            if (!src?.startsWith('https://') || attr(attrs, 'srcset') !== undefined) continue;
            const width = Number(attr(attrs, 'width')) || 0;
            const height = Number(attr(attrs, 'height')) || 0;
            const prev = wanted.get(src);
            wanted.set(src, { width: Math.max(width, prev?.width ?? 0), height: Math.max(height, prev?.height ?? 0) });
          }
        }
        if (wanted.size === 0) return;

        await mkdir(join(root, subdir), { recursive: true });
        const local = new Map();
        await Promise.all(
          [...wanted].map(async ([src, { width, height }]) => {
            try {
              const res = await fetch(decodeEntities(src), { signal: AbortSignal.timeout(15_000) });
              if (!res.ok) throw new Error(`HTTP ${res.status}`);
              const input = Buffer.from(await res.arrayBuffer());
              const output = await sharp(input)
                .resize({
                  width: width ? width * 2 : undefined,
                  height: height ? height * 2 : undefined,
                  fit: 'cover',
                  withoutEnlargement: true,
                })
                .webp({ quality })
                .toBuffer();
              const name = `${createHash('sha256').update(output).digest('hex').slice(0, 16)}.webp`;
              await writeFile(join(root, subdir, name), output);
              local.set(src, `/${subdir}/${name}`);
            } catch (error) {
              logger.warn(`Keeping remote image ${src} (${error})`);
            }
          }),
        );

        let changed = 0;
        for (const { file, html } of pages) {
          const next = html.replace(imgTag, (tag, attrs) => {
            const path = local.get(attr(attrs, 'src') ?? '');
            return path ? `<img${attrs.replace(attrPattern('src'), `$1src="${path}"`)}>` : tag;
          });
          if (next !== html) {
            await writeFile(file, next);
            changed++;
          }
        }
        logger.info(`Self-hosted ${local.size} of ${wanted.size} remote image(s) across ${changed} page(s)`);
      },
    },
  };
}
