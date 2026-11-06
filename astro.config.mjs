// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import externalLinks from './src/integrations/external-links.mjs';

export default defineConfig({
  site: 'https://cameronwillia.ms',
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [mdx(), sitemap(), externalLinks({ site: 'https://cameronwillia.ms' })],
  vite: {
    build: {
      assetsInlineLimit: 0,
    },
    server: {
      allowedHosts: ['.orb.local'],
    },
  },
});
