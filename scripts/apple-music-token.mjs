import { createServer } from 'node:http';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { appleMusicConfig, developerToken } from '../src/lib/apple-music.mjs';

const PORT = 4323;
const config = appleMusicConfig();
let token;
try {
  token = developerToken(config, 60 * 60);
} catch (error) {
  console.error(`Can't create a developer token: ${error.message}. Fill in .env first (see .env.example).`);
  process.exit(1);
}

const page = `<!doctype html>
<html lang="en">
<meta charset="utf-8" />
<title>Apple Music sign-in</title>
<style>
  body { font: 17px/1.5 system-ui, sans-serif; max-width: 34rem; margin: 15vh auto; padding: 0 1rem; }
  button { font: inherit; font-weight: 700; padding: .7rem 1.2rem; border-radius: 999px; border: 0; background: #ea4b35; color: #141414; cursor: pointer; }
</style>
<h1>Connect Apple Music</h1>
<p>Sign in so the site can read your heavy rotation. The token is saved to your local <code>.env</code>.</p>
<button id="go" disabled>Loading MusicKit…</button>
<p id="status" role="status"></p>
<script src="https://js-cdn.music.apple.com/musickit/v3/musickit.js" data-web-components async></script>
<script>
  const button = document.getElementById('go');
  const status = document.getElementById('status');
  document.addEventListener('musickitloaded', async () => {
    await MusicKit.configure({ developerToken: ${JSON.stringify(token)}, app: { name: 'cameronwillia.ms', build: '1.0' } });
    button.disabled = false;
    button.textContent = 'Sign in to Apple Music';
  });
  button.addEventListener('click', async () => {
    try {
      const userToken = await MusicKit.getInstance().authorize();
      await fetch('/token', { method: 'POST', body: userToken });
      status.textContent = 'Done. The token was saved to .env; you can close this tab.';
    } catch (error) {
      status.textContent = 'Sign-in failed: ' + error;
    }
  });
</script>
</html>`;

function saveToEnv(userToken) {
  const file = '.env';
  const line = `APPLE_MUSIC_USER_TOKEN=${userToken}`;
  const current = existsSync(file) ? readFileSync(file, 'utf8') : '';
  const next = /^APPLE_MUSIC_USER_TOKEN=.*$/m.test(current)
    ? current.replace(/^APPLE_MUSIC_USER_TOKEN=.*$/m, line)
    : `${current.replace(/\n?$/, '\n')}${line}\n`;
  writeFileSync(file, next);
}

const server = createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/token') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      saveToEnv(body.trim());
      res.end('ok');
      console.log('\nSaved APPLE_MUSIC_USER_TOKEN to .env.');
      console.log('Update GitHub too:  gh secret set APPLE_MUSIC_USER_TOKEN  (then paste the value from .env)');
      server.close();
    });
    return;
  }
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(page);
});

server.listen(PORT, '0.0.0.0', () => console.log(`Open http://localhost:${PORT} and sign in to Apple Music.`));
