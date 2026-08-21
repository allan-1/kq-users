import { z } from 'zod';

export const TodoDtoSchema = z.object({
  id: z.number(),
  userId: z.number(),
  title: z.string().default(''),
  completed: z.boolean().default(false),
});

export type TodoDto = z.infer<typeof TodoDtoSchema>;

export const TodoDtoArraySchema = z.array(TodoDtoSchema);
