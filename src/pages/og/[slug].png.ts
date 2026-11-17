import type { APIRoute, GetStaticPaths } from 'astro';
import { getThoughts, formatDate } from '../../lib/content';
import { renderOgImage } from '../../lib/og.mjs';

export const getStaticPaths = (async () => {
  const thoughts = await getThoughts();
  return thoughts.map((thought) => ({
    params: { slug: thought.id },
    props: { title: thought.data.title, date: formatDate(thought.data.pubDate) },
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const png = await renderOgImage({ section: 'thoughts', title: props.title, date: props.date });
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
