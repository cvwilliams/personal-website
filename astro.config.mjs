// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import externalLinks from './src/integrations/external-links.mjs';
import selfHostImages from './src/integrations/self-host-images.mjs';
import { inlineScriptHashes } from './src/lib/csp.mjs';
import { withLastmod } from './src/lib/lastmod.mjs';

export default defineConfig({
  site: 'https://cameronwillia.ms',
  trailingSlash: 'never',
  // Inline every page's CSS (about 5 KB gzipped) so first paint doesn't wait on several tiny
  // stylesheet requests; vite's assetsInlineLimit: 0 below would otherwise keep them all external.
  build: { format: 'file', inlineStylesheets: 'always' },
  integrations: [mdx(), sitemap({ serialize: withLastmod() }), externalLinks({ site: 'https://cameronwillia.ms' }), selfHostImages()],
  fonts: [
    {
      name: 'Libre Franklin',
      cssVariable: '--font-libre-franklin',
      provider: fontProviders.fontsource(),
      weights: ['100 900'],
      styles: ['normal'],
      subsets: ['latin', 'latin-ext'],
      fallbacks: ['Franklin Gothic Medium', 'Helvetica Neue', 'Arial', 'sans-serif'],
    },
  ],
  security: {
    csp: {
      scriptDirective: {
        resources: ["'self'", "'inline-speculation-rules'"],
        hashes: inlineScriptHashes(),
      },
    },
  },
  vite: {
    build: {
      assetsInlineLimit: 0,
    },
    server: {
      allowedHosts: ['.orb.local'],
    },
  },
});
