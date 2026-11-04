const entities = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&nbsp;': ' ',
};

/** @param {string} value */
function decode(value) {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&(amp|lt|gt|quot|apos|nbsp|#39);/g, (match) => entities[match] ?? match)
    .replace(/\s+/g, ' ')
    .trim();
}

/** @param {string} script */
function widgetHtml(script) {
  const literal = script.match(/var widget_code = '([\s\S]*?)'\s*\n/)?.[1];
  return literal?.replace(/\\n/g, '\n').replace(/\\(.)/g, '$1');
}

/**
 * @typedef {{ id: string; title: string; author?: string; url: string; cover?: string }} Book
 * @param {string} html
 * @returns {Book[]}
 */
function parseBooks(html) {
  const chunks = html.split(/<div[^>]+class="gr_custom_each_container[^"]*"[^>]*>/).slice(1);
  return chunks.flatMap((chunk) => {
    const coverLink = chunk.match(/class="gr_custom_book_container[^"]*"[^>]*>\s*<a\b([^>]*)>([\s\S]*?)<\/a>/);
    const title = coverLink?.[1].match(/\btitle="([^"]*)"/)?.[1];
    const rawCover = coverLink?.[2].match(/<img\b[^>]*\bsrc="([^"]+)"/)?.[1];
    const author = chunk.match(/class="gr_custom_author[^"]*"[^>]*>[\s\S]*?<a\b[^>]*>([\s\S]*?)<\/a>/)?.[1];
    const bookId = rawCover?.match(/\/(\d+)(?:\._[^/]*)?\.\w+$/)?.[1];
    if (!title || !bookId) return [];
    const cover =
      rawCover && !rawCover.includes('nophoto')
        ? /\._S[XY]\d+_/i.test(rawCover)
          ? rawCover.replace(/\._S[XY]\d+_/i, '._SY180_')
          : rawCover.replace(/(\.\w+)$/, '._SY180_$1')
        : undefined;
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

/**
 * Books on a public Goodreads shelf, read from the shelf widget (shelf RSS feeds were retired in 2026).
 * @param {{ userId: string; shelf: string; limit?: number }} options
 * @returns {Promise<Book[]>}
 */
export async function fetchGoodreadsShelf({ userId, shelf, limit = 10 }) {
  const url = new URL(`https://www.goodreads.com/review/custom_widget/${userId}`);
  url.searchParams.set('shelf', shelf);
  url.searchParams.set('num_books', String(limit));
  url.searchParams.set('sort', 'date_added');
  url.searchParams.set('order', 'd');
  url.searchParams.set('widget_id', `${shelf}-${Date.now()}`);

  const response = await fetch(url, {
    headers: { 'User-Agent': 'cameronwillia.ms site build' },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const html = widgetHtml(await response.text());
  if (!html) throw new Error('widget response had no widget_code');
  return parseBooks(html);
}
