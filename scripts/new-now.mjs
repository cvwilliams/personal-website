import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const dir = 'src/content/now';
const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
const target = join(dir, `${today}.md`);

if (existsSync(target)) {
  console.log(`${target} already exists. Edit it directly.`);
  process.exit(0);
}

const latest = readdirSync(dir)
  .filter((f) => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
  .sort()
  .at(-1);

const body = latest
  ? readFileSync(join(dir, latest), 'utf8').replace(/^updated: .*$/m, `updated: ${today}`)
  : `---\nupdated: ${today}\nfocus: ''\n---\n`;

writeFileSync(target, body);
console.log(`Created ${target}${latest ? ` from ${latest}` : ''}. Edit it, then commit.`);
