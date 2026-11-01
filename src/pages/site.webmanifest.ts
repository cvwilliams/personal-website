import type { APIRoute } from 'astro';
import icon192 from '../assets/icons/icon-192.png?url';
import icon512 from '../assets/icons/icon-512.png?url';
import { site } from '../data/site';

export const GET: APIRoute = () =>
  new Response(
    JSON.stringify({
      name: site.name,
      short_name: site.name.split(' ')[0],
      icons: [
        { src: icon192, sizes: '192x192', type: 'image/png' },
        { src: icon512, sizes: '512x512', type: 'image/png' },
      ],
      theme_color: '#f2ede4',
      background_color: '#f2ede4',
      display: 'browser',
    }),
    { headers: { 'Content-Type': 'application/manifest+json' } },
  );
