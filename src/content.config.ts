import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string().optional().default(''),
    category: z.string().default('General'),
    tags: z.array(z.string()).default([]),
    toc: z.boolean().optional().default(true),
    series: z.string().optional(),
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = { posts };
