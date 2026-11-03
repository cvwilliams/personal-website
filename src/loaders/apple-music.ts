import type { Loader } from 'astro/loaders';
import { appleMusicConfig, fetchHeavyRotation, isAppleMusicConfigured } from '../lib/apple-music.mjs';

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
