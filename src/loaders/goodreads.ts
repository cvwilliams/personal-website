import type { Loader } from 'astro/loaders';
import { fetchGoodreadsShelf } from '../lib/goodreads.mjs';

export function goodreadsShelf({
  userId,
  shelf,
  limit = 10,
  coverHeight,
}: {
  userId: string;
  shelf: string;
  limit?: number;
  /** Cover height in px (default 180, for small thumbnails). */
  coverHeight?: number;
}): Loader {
  return {
    name: 'goodreads-shelf',
    load: async ({ store, logger, parseData }) => {
      store.clear();
      let books;
      try {
        books = await fetchGoodreadsShelf({ userId, shelf, limit, coverHeight });
      } catch (error) {
        logger.warn(`Goodreads "${shelf}" shelf unavailable, using the fallback list (${error})`);
        return;
      }
      for (const { id, ...book } of books) {
        store.set({ id, data: await parseData({ id, data: book }) });
      }
      logger.info(`Loaded ${books.length} book(s) from Goodreads "${shelf}"`);
    },
  };
}
