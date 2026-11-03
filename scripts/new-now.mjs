import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fetchGoodreadsShelf } from '../src/lib/goodreads.mjs';

const dir = 'src/content/now';
const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
const target = join(dir, `${today}.md`);

if (existsSync(target)) {
  console.log(`${target} already exists. Edit it directly.`);
  process.exit(0);
}

const quote = (value) => `'${String(value).replace(/'/g, "''")}'`;

function readingYaml(books) {
  if (books.length === 0) return 'reading: []\n';
  return (
    'reading:\n' +
    books
      .map((book) =>
        [
          `  - title: ${quote(book.title)}`,
          book.author && `    author: ${quote(book.author)}`,
          book.url && `    url: ${quote(book.url)}`,
        ]
          .filter(Boolean)
          .join('\n'),
      )
      .join('\n') +
    '\n'
  );
}

function withReading(markdown, books) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return markdown;
  const frontmatter = match[1].replace(/^reading:.*\n?(?:^[ \t-].*\n?)*/m, '').replace(/\n*$/, '\n');
  return markdown.replace(match[0], `---\n${frontmatter}${readingYaml(books).trimEnd()}\n---`);
}

const latest = readdirSync(dir)
  .filter((f) => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
  .sort()
  .at(-1);

const userId = readFileSync('src/data/site.ts', 'utf8').match(/goodreadsUserId:\s*'(\d+)'/)?.[1];
let books;
if (userId) {
  try {
    books = (await fetchGoodreadsShelf({ userId, shelf: 'currently-reading' })).map(({ title, author, url }) => ({
      title,
      author,
      url,
    }));
  } catch (error) {
    console.warn(`Couldn't reach Goodreads (${error.message}); keeping the existing reading lists.`);
  }
}

if (latest && books) {
  const previous = join(dir, latest);
  writeFileSync(previous, withReading(readFileSync(previous, 'utf8'), books));
  console.log(`Saved ${books.length} book(s) from Goodreads into ${previous} for the archive.`);
}

let body = latest
  ? readFileSync(join(dir, latest), 'utf8').replace(/^updated: .*$/m, `updated: ${today}`)
  : `---\nupdated: ${today}\nfocus: ''\n---\n`;
if (books) body = withReading(body, books);

writeFileSync(target, body);
console.log(`Created ${target}${latest ? ` from ${latest}` : ''}. Edit it, then commit.`);
