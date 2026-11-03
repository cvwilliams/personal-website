import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fetchGoodreadsShelf } from '../src/lib/goodreads.mjs';
import { appleMusicConfig, fetchHeavyRotation, isAppleMusicConfigured } from '../src/lib/apple-music.mjs';

const dir = 'src/content/now';
const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
const target = join(dir, `${today}.md`);

if (existsSync(target)) {
  console.log(`${target} already exists. Edit it directly.`);
  process.exit(0);
}

const quote = (value) => `'${String(value).replace(/'/g, "''")}'`;

function listYaml(key, items, fields) {
  if (items.length === 0) return `${key}: []\n`;
  const entries = items.map((item) =>
    fields
      .filter((field) => item[field])
      .map((field, i) => `${i === 0 ? '  - ' : '    '}${field}: ${quote(item[field])}`)
      .join('\n'),
  );
  return `${key}:\n${entries.join('\n')}\n`;
}

function withList(markdown, key, items, fields) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return markdown;
  const block = new RegExp(`^${key}:.*\\n?(?:^[ \\t-].*\\n?)*`, 'm');
  const frontmatter = match[1].replace(block, '').replace(/\n*$/, '\n');
  return markdown.replace(match[0], `---\n${frontmatter}${listYaml(key, items, fields).trimEnd()}\n---`);
}

const sources = [];

const userId = readFileSync('src/data/site.ts', 'utf8').match(/goodreadsUserId:\s*'(\d+)'/)?.[1];
if (userId) {
  try {
    const books = await fetchGoodreadsShelf({ userId, shelf: 'currently-reading' });
    sources.push({ key: 'reading', label: 'book(s) from Goodreads', items: books, fields: ['title', 'author', 'url'] });
  } catch (error) {
    console.warn(`Couldn't reach Goodreads (${error.message}); keeping the existing reading lists.`);
  }
}

const music = appleMusicConfig();
if (isAppleMusicConfigured(music)) {
  try {
    const rotation = await fetchHeavyRotation(music, 5);
    sources.push({
      key: 'listening',
      label: 'item(s) from Apple Music',
      items: rotation,
      fields: ['title', 'subtitle', 'kind', 'url', 'artwork'],
    });
  } catch (error) {
    console.warn(`Couldn't reach Apple Music (${error.message}); keeping the existing listening lists.`);
  }
}

const apply = (markdown) =>
  sources.reduce((md, { key, items, fields }) => withList(md, key, items, fields), markdown);

const latest = readdirSync(dir)
  .filter((f) => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
  .sort()
  .at(-1);

if (latest && sources.length > 0) {
  const previous = join(dir, latest);
  writeFileSync(previous, apply(readFileSync(previous, 'utf8')));
  for (const { items, label } of sources) console.log(`Saved ${items.length} ${label} into ${previous} for the archive.`);
}

const body = latest
  ? readFileSync(join(dir, latest), 'utf8').replace(/^updated: .*$/m, `updated: ${today}`)
  : `---\nupdated: ${today}\nfocus: ''\n---\n`;

writeFileSync(target, apply(body));
console.log(`Created ${target}${latest ? ` from ${latest}` : ''}. Edit it, then commit.`);
