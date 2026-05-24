import { z } from 'zod';

export const DEFAULT_LIMIT = parseInt(process.env.DEFAULT_LIMIT ?? '5');
export const MAX_LIMIT = parseInt(process.env.MAX_LIMIT ?? '25');
export const MIN_LIMIT = parseInt(process.env.MIN_LIMIT ?? '1');

export const getNextBirthdaysSchema = z.object({
  quantity: z
    .number()
    .int()
    .min(MIN_LIMIT, { message: 'A quantidade deve ser no mínimo 1' })
    .max(MAX_LIMIT, { message: 'A quantidade máxima permitida é 25' })
    .default(DEFAULT_LIMIT),
});

export type GetNextBirthdaysInput = z.infer<typeof getNextBirthdaysSchema>;
