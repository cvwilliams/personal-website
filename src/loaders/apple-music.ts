import type { Loader } from 'astro/loaders';
import {
  appleMusicConfig,
  fetchCatalogAlbums,
  fetchHeavyRotation,
  isAppleMusicConfigured,
  isCatalogConfigured,
} from '../lib/apple-music.mjs';

export function appleMusicHeavyRotation({ limit = 5 }: { limit?: number } = {}): Loader {
  return {
    name: 'apple-music-heavy-rotation',
    load: async ({ store, logger, parseData }) => {
      store.clear();
      const config = appleMusicConfig();
      if (!isAppleMusicConfigured(config)) {
        logger.info('Apple Music not configured; using the Now page fallback for heavy rotation');
        return;
      }
      let items;
      try {
        items = await fetchHeavyRotation(config, limit);
      } catch (error) {
        logger.warn(`Apple Music heavy rotation unavailable, using the Now page fallback (${error})`);
        return;
      }
      for (const { id, ...item } of items) {
        store.set({ id, data: await parseData({ id, data: item }) });
      }
      logger.info(`Loaded ${items.length} item(s) from Apple Music heavy rotation`);
    },
  };
}

export function appleMusicAlbums({ albums }: { albums: { title: string; artist: string }[] }): Loader {
  return {
    name: 'apple-music-albums',
    load: async ({ store, logger, parseData }) => {
      store.clear();
      const config = appleMusicConfig();
      if (!isCatalogConfigured(config)) {
        logger.info('Apple Music not configured; album artwork will use placeholders');
        return;
      }
      let items;
      try {
        items = await fetchCatalogAlbums(config, albums);
      } catch (error) {
        logger.warn(`Apple Music catalog unavailable, album artwork will use placeholders (${error})`);
        return;
      }
      let found = 0;
      for (const [index, item] of items.entries()) {
        if (!item) {
          logger.warn(`No Apple Music match for "${albums[index].title}" by ${albums[index].artist}`);
          continue;
        }
        const { id: _id, ...data } = item;
        const id = String(index);
        store.set({ id, data: await parseData({ id, data }) });
        found++;
      }
      logger.info(`Matched ${found} of ${albums.length} album(s) in the Apple Music catalog`);
    },
  };
}
