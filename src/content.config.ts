import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    tags: z.array(z.string()).default([]),
    repo: z.string().optional(),
    url: z.string().optional(),
    order: z.number().default(0),
  }),
});

const freelance = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/freelance' }),
  schema: z.object({
    title: z.string(),
    client: z.string().optional(),
    description: z.string(),
    tags: z.array(z.string()).default([]),
    repo: z.string().optional(),
    url: z.string().optional(),
    date: z.string().optional(),
    order: z.number().default(0),
  }),
});

export const collections = { blog, projects, freelance };
