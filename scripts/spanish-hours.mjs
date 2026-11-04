import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const hours = Number(process.argv[2]);
if (!process.argv[2] || !Number.isFinite(hours) || hours < 0) {
  console.error('Usage: make spanish hours=<total Dreaming Spanish hours>');
  process.exit(1);
}

const dir = 'src/content/now';
const latest = readdirSync(dir)
  .filter((f) => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
  .sort()
  .at(-1);
if (!latest) {
  console.error(`No Now updates in ${dir}. Run "make now" first.`);
  process.exit(1);
}

const file = join(dir, latest);
const markdown = readFileSync(file, 'utf8');
const match = markdown.match(/^---\n([\s\S]*?)\n---/);
if (!match) {
  console.error(`${file} has no frontmatter.`);
  process.exit(1);
}

let frontmatter = match[1];
if (/^spanish:\s*\n(?:[ \t]+.*\n?)*/m.test(frontmatter) && /^[ \t]+hours:/m.test(frontmatter)) {
  frontmatter = frontmatter.replace(/^([ \t]+hours:).*$/m, `$1 ${hours}`);
} else if (/^spanish:/m.test(frontmatter)) {
  frontmatter = frontmatter.replace(/^spanish:.*$/m, `spanish:\n  hours: ${hours}`);
} else {
  frontmatter = `${frontmatter}\nspanish:\n  hours: ${hours}`;
}

writeFileSync(file, markdown.replace(match[0], `---\n${frontmatter}\n---`));
console.log(`Set Dreaming Spanish hours to ${hours} in ${file}.`);
