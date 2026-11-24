// Open Library lookups (no key needed): find a book by title and author for its cover and page.

const normalize = (value) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/**
 * @param {{ title: string; author: string }[]} books
 * @returns {Promise<({ url: string; cover?: string } | null)[]>} one result per book, in order
 */
export async function fetchOpenLibraryBooks(books) {
  return Promise.all(
    books.map(async ({ title, author }) => {
      const url = new URL('https://openlibrary.org/search.json');
      url.search = new URLSearchParams({ title, author, fields: 'key,title,author_name,cover_i', limit: '10' }).toString();
      const response = await fetch(url, {
        headers: { 'User-Agent': 'cameronwillia.ms (https://cameronwillia.ms)' },
        signal: AbortSignal.timeout(15_000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status} for "${title}"`);
      const body = await response.json();
      const matches = (body.docs ?? []).filter(
        (doc) =>
          doc.key &&
          doc.title &&
          normalize(doc.title).startsWith(normalize(title)) &&
          (doc.author_name ?? []).some((name) => normalize(name).includes(normalize(author).split(' ').at(-1))),
      );
      const match = matches.find((doc) => doc.cover_i) ?? matches[0];
      if (!match) return null;
      return {
        url: `https://openlibrary.org${match.key}`,
        cover: match.cover_i ? `https://covers.openlibrary.org/b/id/${match.cover_i}-L.jpg` : undefined,
      };
    }),
  );
}
