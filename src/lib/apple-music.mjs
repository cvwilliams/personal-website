import { createPrivateKey, sign } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';

/**
 * @typedef {{ teamId?: string; keyId?: string; privateKey?: string; userToken?: string }} AppleMusicConfig
 * @typedef {{ id: string; title: string; subtitle?: string; kind: 'album' | 'single' | 'ep'; url?: string; artwork?: string }} RotationItem
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

const isExpiringArtwork = (url) => !url || /blobstore\.apple\.com|X-Amz-Expires/.test(url);

/** @returns {RotationItem | null} */
function toItem(item, catalog) {
  const attributes = item.attributes ?? {};
  const catalogAttributes = catalog?.attributes ?? {};
  const name = attributes.name ?? catalogAttributes.name;
  if (!name) return null;
  let kind = 'album';
  if (attributes.isSingle || catalogAttributes.isSingle || / - Single$/.test(name)) kind = 'single';
  else if (/ - EP$/.test(name)) kind = 'ep';
  const title = name.replace(/ - (Single|EP)$/, '');
  const artworkTemplate = catalogAttributes.artwork?.url ?? attributes.artwork?.url;
  const artwork = artworkTemplate?.replace('{w}', '300').replace('{h}', '300').replace('{f}', 'jpg');
  return {
    id: item.id,
    title,
    subtitle: attributes.artistName ?? catalogAttributes.artistName,
    kind,
    url: catalogAttributes.url ?? attributes.url,
    artwork: isExpiringArtwork(artwork) ? undefined : artwork,
  };
}

async function catalogVersions(items, headers) {
  const byType = { 'library-albums': [] };
  for (const item of items) byType[item.type]?.push(item.id);
  const catalog = new Map();
  for (const [type, ids] of Object.entries(byType)) {
    if (ids.length === 0) continue;
    const kind = type.replace('library-', '');
    try {
      const response = await fetch(
        `https://api.music.apple.com/v1/me/library/${kind}?ids=${ids.map(encodeURIComponent).join(',')}&include=catalog`,
        { headers, signal: AbortSignal.timeout(15_000) },
      );
      if (!response.ok) continue;
      const { data = [] } = await response.json();
      for (const libraryItem of data) {
        const match = libraryItem.relationships?.catalog?.data?.[0];
        if (match?.attributes) catalog.set(libraryItem.id, match);
      }
    } catch {
      // Keep the library versions if the lookup fails.
    }
  }
  return catalog;
}

/**
 * Albums, singles and EPs in the user's Apple Music heavy rotation (playlists and stations are skipped).
 * @param {AppleMusicConfig} config
 * @returns {Promise<RotationItem[]>}
 */
export async function fetchHeavyRotation(config, limit = 5) {
  if (!config.userToken) throw new Error('missing APPLE_MUSIC_USER_TOKEN');
  const headers = { Authorization: `Bearer ${developerToken(config)}`, 'Music-User-Token': config.userToken };
  const response = await fetch('https://api.music.apple.com/v1/me/history/heavy-rotation?limit=10', {
    headers,
    signal: AbortSignal.timeout(15_000),
  });
  if (response.status === 401 || response.status === 403) {
    throw new Error(
      `HTTP ${response.status}. The Apple Music user token has probably expired: run "make music-token" and update the APPLE_MUSIC_USER_TOKEN secret`,
    );
  }
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const { data = [] } = await response.json();
  const candidates = data.filter((item) => item.type === 'albums' || item.type === 'library-albums');
  const catalog = await catalogVersions(candidates, headers);
  return candidates
    .map((item) => toItem(item, catalog.get(item.id)))
    .filter(Boolean)
    .slice(0, limit);
}

export function isAppleMusicConfigured(config) {
  return Boolean(config.teamId && config.keyId && config.privateKey && config.userToken);
}

export function isCatalogConfigured(config) {
  return Boolean(config.teamId && config.keyId && config.privateKey);
}

const normalize = (value) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/**
 * Looks up albums in the Apple Music catalog by title and artist. Needs only a developer token.
 * Returns one entry per album, in order: the catalog match, or null when nothing matches.
 * @param {AppleMusicConfig} config
 * @param {{ title: string; artist: string }[]} albums
 * @returns {Promise<(RotationItem | null)[]>}
 */
export async function fetchCatalogAlbums(config, albums, storefront = 'us') {
  const headers = { Authorization: `Bearer ${developerToken(config)}` };
  return Promise.all(
    albums.map(async ({ title, artist }) => {
      const url = new URL(`https://api.music.apple.com/v1/catalog/${storefront}/search`);
      url.search = new URLSearchParams({ term: `${artist} ${title}`, types: 'albums', limit: '15' }).toString();
      const response = await fetch(url, { headers, signal: AbortSignal.timeout(15_000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const body = await response.json();
      const match = (body.results?.albums?.data ?? [])
        .filter(({ attributes: a = {} }) => {
          return a.name && a.artistName && normalize(a.artistName).includes(normalize(artist)) && normalize(a.name).startsWith(normalize(title));
        })
        .sort((a, b) => {
          const clean = (item) => (item.attributes.contentRating === 'clean' ? 1 : 0);
          return clean(a) - clean(b) || a.attributes.name.length - b.attributes.name.length;
        })[0];
      return match ? toItem(match) : null;
    }),
  );
}
