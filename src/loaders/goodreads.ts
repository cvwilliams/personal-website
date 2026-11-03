import type { Loader } from 'astro/loaders';
import { fetchGoodreadsShelf } from '../lib/goodreads.mjs';

export function goodreadsShelf({ userId, shelf, limit = 10 }: { userId: string; shelf: string; limit?: number }): Loader {
  return {
    name: 'goodreads-shelf',
    load: async ({ store, logger, parseData }) => {
      store.clear();
      let books;
      try {
        books = await fetchGoodreadsShelf({ userId, shelf, limit });
      } catch (error) {
        logger.warn(`Goodreads "${shelf}" shelf unavailable, using the Now page fallback (${error})`);
        return;
      }
      for (const { id, ...book } of books) {
        store.set({ id, data: await parseData({ id, data: book }) });
      }
      logger.info(`Loaded ${books.length} book(s) from Goodreads "${shelf}"`);
    },
  };
}
