import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { goodreadsShelf } from './loaders/goodreads';
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
        repo: z.url().optional(),
        live: z.url().optional(),
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

const now = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/now' }),
  schema: z.object({
    updated: z.coerce.date(),
    focus: z.string(),
    reading: z.array(book).default([]),
  }),
});

const reading = defineCollection({
  loader: goodreadsShelf({ userId: site.goodreadsUserId, shelf: 'currently-reading' }),
  schema: book.extend({
    cover: z.url().optional(),
  }),
});

export const collections = { thoughts, projects, now, reading };
