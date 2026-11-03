import { createPrivateKey, sign } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';

/**
 * @typedef {{ teamId?: string; keyId?: string; privateKey?: string; userToken?: string }} AppleMusicConfig
 * @typedef {{ id: string; title: string; subtitle?: string; kind: 'album' | 'single' | 'ep' | 'playlist'; url?: string; artwork?: string }} RotationItem
 */

/** @returns {AppleMusicConfig} */
export function appleMusicConfig(env = process.env) {
  let privateKey = env.APPLE_MUSIC_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const keyFile = env.APPLE_MUSIC_PRIVATE_KEY_FILE;
  if (!privateKey && keyFile && existsSync(keyFile)) privateKey = readFileSync(keyFile, 'utf8');
  return {
    teamId: env.APPLE_MUSIC_TEAM_ID,
    keyId: env.APPLE_MUSIC_KEY_ID,
    privateKey,
    userToken: env.APPLE_MUSIC_USER_TOKEN,
  };
}

/** Short-lived MusicKit developer token (ES256 JWT). */
export function developerToken({ teamId, keyId, privateKey }, ttlSeconds = 3600) {
  if (!teamId || !keyId || !privateKey) throw new Error('missing APPLE_MUSIC_TEAM_ID, APPLE_MUSIC_KEY_ID or private key');
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const issuedAt = Math.floor(Date.now() / 1000);
  const data = `${encode({ alg: 'ES256', kid: keyId })}.${encode({ iss: teamId, iat: issuedAt, exp: issuedAt + ttlSeconds })}`;
  const signature = sign('sha256', Buffer.from(data), { key: createPrivateKey(privateKey), dsaEncoding: 'ieee-p1363' });
  return `${data}.${signature.toString('base64url')}`;
}

/** @returns {RotationItem | null} */
function toItem(item) {
  const attributes = item.attributes ?? {};
  if (!attributes.name) return null;
  const isPlaylist = item.type.includes('playlists');
  let kind = isPlaylist ? 'playlist' : 'album';
  let title = attributes.name;
  if (!isPlaylist) {
    if (attributes.isSingle || / - Single$/.test(title)) kind = 'single';
    else if (/ - EP$/.test(title)) kind = 'ep';
    title = title.replace(/ - (Single|EP)$/, '');
  }
  return {
    id: item.id,
    title,
    subtitle: isPlaylist ? attributes.curatorName : attributes.artistName,
    kind,
    url: attributes.url,
    artwork: attributes.artwork?.url?.replace('{w}', '400').replace('{h}', '400').replace('{f}', 'jpg'),
  };
}

/**
 * Albums, singles and playlists in the user's Apple Music heavy rotation (stations are skipped).
 * @param {AppleMusicConfig} config
 * @returns {Promise<RotationItem[]>}
 */
export async function fetchHeavyRotation(config, limit = 5) {
  if (!config.userToken) throw new Error('missing APPLE_MUSIC_USER_TOKEN');
  const response = await fetch('https://api.music.apple.com/v1/me/history/heavy-rotation?limit=10', {
    headers: { Authorization: `Bearer ${developerToken(config)}`, 'Music-User-Token': config.userToken },
    signal: AbortSignal.timeout(15_000),
  });
  if (response.status === 401 || response.status === 403) {
    throw new Error(
      `HTTP ${response.status}. The Apple Music user token has probably expired: run "make music-token" and update the APPLE_MUSIC_USER_TOKEN secret`,
    );
  }
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const { data = [] } = await response.json();
  return data
    .filter((item) => !item.type.includes('stations'))
    .map(toItem)
    .filter(Boolean)
    .slice(0, limit);
}

export function isAppleMusicConfigured(config) {
  return Boolean(config.teamId && config.keyId && config.privateKey && config.userToken);
}
