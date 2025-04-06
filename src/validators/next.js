const { z } = require('zod');

const DEFAULT_LIMIT = parseInt(process.env.DEFAULT_LIMIT);
const MAX_LIMIT = parseInt(process.env.MAX_LIMIT);
const MIN_LIMIT = parseInt(process.env.MIN_LIMIT);

const getNextBirthdaysSchema = z.object({
  quantity: z
    .number()
    .int()
    .min(MIN_LIMIT, { message: 'A quantidade deve ser no mínimo 1' })
    .max(MAX_LIMIT, { message: 'A quantidade máxima permitida é 25' })
    .default(DEFAULT_LIMIT),
});

module.exports = {
  getNextBirthdaysSchema,
  DEFAULT_LIMIT,
  MAX_LIMIT,
  MIN_LIMIT,
};
