import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { site } from '../data/site';
import { getThoughts } from '../lib/content';

export async function GET(context: APIContext) {
  const thoughts = await getThoughts();
  return rss({
    title: `${site.name} — Thoughts`,
    description: 'Things I keep thinking about.',
    site: context.site ?? site.url,
    items: thoughts.map((thought) => ({
      title: thought.data.title,
      description: thought.data.description,
      pubDate: thought.data.pubDate,
      link: `/thoughts/${thought.id}`,
      categories: thought.data.tags,
    })),
  });
}
