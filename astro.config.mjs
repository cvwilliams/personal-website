// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://cameronwillia.ms',
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [mdx(), sitemap()],
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
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
