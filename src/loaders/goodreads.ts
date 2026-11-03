import type { Loader } from 'astro/loaders';

const entities: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&nbsp;': ' ',
};

function decode(value: string): string {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&(amp|lt|gt|quot|apos|nbsp|#39);/g, (match) => entities[match] ?? match)
    .replace(/\s+/g, ' ')
    .trim();
}

function widgetHtml(script: string): string | undefined {
  const literal = script.match(/var widget_code = '([\s\S]*?)'\s*\n/)?.[1];
  return literal?.replace(/\\n/g, '\n').replace(/\\(.)/g, '$1');
}

function parseBooks(html: string) {
  const chunks = html.split(/<div[^>]+class="gr_custom_each_container[^"]*"[^>]*>/).slice(1);
  return chunks.flatMap((chunk) => {
    const coverLink = chunk.match(/class="gr_custom_book_container[^"]*"[^>]*>\s*<a\b([^>]*)>([\s\S]*?)<\/a>/);
    const title = coverLink?.[1].match(/\btitle="([^"]*)"/)?.[1];
    const rawCover = coverLink?.[2].match(/<img\b[^>]*\bsrc="([^"]+)"/)?.[1];
    const author = chunk.match(/class="gr_custom_author[^"]*"[^>]*>[\s\S]*?<a\b[^>]*>([\s\S]*?)<\/a>/)?.[1];
    const bookId = rawCover?.match(/\/(\d+)(?:\._[^/]*)?\.\w+$/)?.[1];
    if (!title || !bookId) return [];
    const cover = rawCover && !rawCover.includes('nophoto') ? rawCover.replace(/\._S[XY]\d+_/i, '') : undefined;
    return [
      {
        id: bookId,
        title: decode(title),
        author: author ? decode(author.replace(/<[^>]+>/g, '')) : undefined,
        url: `https://www.goodreads.com/book/show/${bookId}`,
        cover,
      },
    ];
  });
}

export function goodreadsShelf({ userId, shelf, limit = 10 }: { userId: string; shelf: string; limit?: number }): Loader {
  return {
    name: 'goodreads-shelf',
    load: async ({ store, logger, parseData }) => {
      store.clear();
      const url = new URL(`https://www.goodreads.com/review/custom_widget/${userId}`);
      url.searchParams.set('shelf', shelf);
      url.searchParams.set('num_books', String(limit));
      url.searchParams.set('sort', 'date_added');
      url.searchParams.set('order', 'd');
      url.searchParams.set('widget_id', `${shelf}-${Date.now()}`);

      let books: ReturnType<typeof parseBooks>;
      try {
        const response = await fetch(url, {
          headers: { 'User-Agent': 'cameronwillia.ms site build' },
          signal: AbortSignal.timeout(15_000),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const html = widgetHtml(await response.text());
        if (!html) throw new Error('widget response had no widget_code');
        books = parseBooks(html);
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
