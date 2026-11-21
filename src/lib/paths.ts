/**
 * A page's clean path, as visitors see it. With `build.format: 'file'`, `Astro.url.pathname` is the
 * built file (`/about.html`, `/index.html`) at build time but `/about` in dev.
 */
export function pagePath(url: URL): string {
  const path = url.pathname.replace(/\.html$/, '').replace(/\/index$/, '/').replace(/(.)\/$/, '$1');
  return path || '/';
}
