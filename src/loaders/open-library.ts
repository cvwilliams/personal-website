import type { Loader } from 'astro/loaders';
import { fetchOpenLibraryBooks } from '../lib/open-library.mjs';

/** Covers and links for a fixed list of books, keyed by their index in the list. */
export function openLibraryBooks({ books }: { books: { title: string; author: string }[] }): Loader {
  return {
    name: 'open-library-books',
    load: async ({ store, logger, parseData }) => {
      store.clear();
      let results;
      try {
        results = await fetchOpenLibraryBooks(books);
      } catch (error) {
        logger.warn(`Open Library unavailable, book covers will use placeholders (${error})`);
        return;
      }
      let found = 0;
      for (const [index, result] of results.entries()) {
        if (!result) {
          logger.warn(`No Open Library match for "${books[index].title}" by ${books[index].author}`);
          continue;
        }
        const id = String(index);
        store.set({ id, data: await parseData({ id, data: result }) });
        found++;
      }
      logger.info(`Matched ${found} of ${books.length} book(s) on Open Library`);
    },
  };
}
