// Builds the standalone apps into dist/ after `astro build`. Each app lives in its own GitHub repo:
// the latest commit on its branch is downloaded into apps/ (gitignored), built with the base path of
// the subfolder it's served from, and copied into dist/<name>/.
import { execSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { spawn } from 'node:child_process';

const apps = [{ name: 'pregunta-del-dia', repo: 'cvwilliams/pregunta-del-dia', branch: 'main' }];

if (!existsSync('dist')) {
  console.error('dist/ not found: run the build first.');
  process.exit(1);
}

for (const { name, repo, branch } of apps) {
  const dir = `apps/${name}`;
  console.log(`Downloading ${repo}@${branch}`);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const response = await fetch(`https://codeload.github.com/${repo}/tar.gz/refs/heads/${branch}`);
  if (!response.ok || !response.body) throw new Error(`Couldn't download ${repo}: HTTP ${response.status}`);
  const tar = spawn('tar', ['-xz', '--strip-components=1', '-C', dir], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((resolve, reject) => tar.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`tar exited with ${code}`)))));
  await pipeline(Readable.fromWeb(response.body), tar.stdin);
  await done;

  console.log(`Building ${name} into dist/${name}`);
  execSync(`npm ci --no-audit --no-fund && npm run build -- --base=/${name}/`, { cwd: dir, stdio: 'inherit' });
  rmSync(`dist/${name}`, { recursive: true, force: true });
  cpSync(`${dir}/dist`, `dist/${name}`, { recursive: true });
}
