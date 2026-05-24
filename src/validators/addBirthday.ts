import { z } from 'zod';

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = 1900;

function createDateWithGuessedYear(day: number, month: number, year?: number): Date {
  if (year) {
    return new Date(year, month - 1, day);
  }
  return new Date(CURRENT_YEAR - 1, month - 1, day);
}

function isValidDate(date: Date): boolean {
  const now = new Date();
  return date.getFullYear() >= MIN_YEAR && date <= now;
}

export const birthdaySchema = z.string().transform((val, ctx) => {
  const fullDateMatch = val.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  const shortDateMatch = val.match(/^(\d{2})\/(\d{2})$/);

  if (fullDateMatch) {
    const [, day, month, year] = fullDateMatch;
    const dayNum = parseInt(day, 10);
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);

    const parsedDate = createDateWithGuessedYear(dayNum, monthNum, yearNum);
    if (!isValidDate(parsedDate)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'A data de nascimento não é válida',
      });
      return z.NEVER;
    }

    return {
      parsedDate: createDateWithGuessedYear(dayNum, monthNum, yearNum),
      isFullDate: true,
    };
  }

  if (shortDateMatch) {
    const [, day, month] = shortDateMatch;
    return {
      parsedDate: createDateWithGuessedYear(parseInt(day, 10), parseInt(month, 10)),
      isFullDate: false,
    };
  }

  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    message: 'A data deve estar no formato "DD/MM" ou "DD/MM/AAAA"',
  });
  return z.NEVER;
});

export type BirthdayParsed = z.infer<typeof birthdaySchema>;
