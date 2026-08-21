import { z } from 'zod';

export const PostDtoSchema = z.object({
  id: z.number(),
  userId: z.number(),
  title: z.string().default(''),
  body: z.string().default(''),
});

export type PostDto = z.infer<typeof PostDtoSchema>;

export const PostDtoArraySchema = z.array(PostDtoSchema);
