import { defineCollection, z } from 'astro:content';

const projectsCollection = defineCollection({
  type: 'data',
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    cover: z.string(),
    blocks: z.array(
      z.union([
        z.object({
          type: z.literal('image'),
          src: z.string(),
          width: z.union([z.literal(6), z.literal(12)]).optional(),
        }),
        z.object({
          type: z.literal('text'),
          content: z.string(),
        }),
        z.object({
          type: z.literal('p5'),
          url: z.string().optional(),
        }),
      ])
    ),
  }),
});

export const collections = {
  projects: projectsCollection,
};
