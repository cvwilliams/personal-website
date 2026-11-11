import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { goodreadsShelf } from './loaders/goodreads';
import { appleMusicAlbums, appleMusicHeavyRotation } from './loaders/apple-music';
import { desertIslandAlbums } from './data/desert-island';
import { site } from './data/site';

const thoughts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/thoughts' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

// A full URL, or a path on this site ("/pregunta-del-dia/").
const link = z.union([z.url(), z.string().regex(/^\/(?!\/)/, 'Use a full URL or a path starting with /')]);

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    year: z.number().int(),
    status: z.enum(['active', 'shipped', 'archived']).default('shipped'),
    tech: z.array(z.string()).default([]),
    links: z
      .object({
        repo: link.optional(),
        live: link.optional(),
      })
      .default({}),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

const book = z.object({
  title: z.string(),
  author: z.string().optional(),
  url: z.url().optional(),
});

const rotationItem = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  kind: z.enum(['album', 'single', 'ep']),
  url: z.url().optional(),
  artwork: z.url().optional(),
});

const now = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/now' }),
  schema: z.object({
    updated: z.coerce.date(),
    focus: z.string(),
    reading: z.array(book).default([]),
    listening: z.array(rotationItem).default([]),
    spanish: z
      .object({
        hours: z.number().nonnegative(),
        note: z.string().optional(),
      })
      .optional(),
  }),
});

const reading = defineCollection({
  loader: goodreadsShelf({ userId: site.goodreadsUserId, shelf: 'currently-reading' }),
  schema: book.extend({
    cover: z.url().optional(),
  }),
});

const listening = defineCollection({
  loader: appleMusicHeavyRotation({ limit: 5 }),
  schema: rotationItem,
});

const desertIsland = defineCollection({
  loader: appleMusicAlbums({ albums: desertIslandAlbums }),
  schema: rotationItem,
});

export const collections = { thoughts, projects, now, reading, listening, desertIsland };
