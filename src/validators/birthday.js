const { z } = require('zod');

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = 1900;

function createDateWithGuessedYear(day, month, year) {
  if (year) {
    return new Date(year, month - 1, day);
  }
  return new Date(CURRENT_YEAR - 1, month - 1, day);
}

function isValidDate(date) {
  const now = new Date();
  return date.getFullYear() >= MIN_YEAR && date <= now;
}

const birthdaySchema = z.string().transform((val, ctx) => {
  const fullDateMatch = val.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  const shortDateMatch = val.match(/^(\d{2})\/(\d{2})$/);

  let data;

  if (fullDateMatch) {
    const [, day, month, year] = fullDateMatch;
    const dayNum = parseInt(day, 10);
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);

    // if (!isValidYear(yearNum)) {
    //   ctx.addIssue({
    //     code: z.ZodIssueCode.custom,
    //     message: 'O ano deve estar entre 1900 e o ano atual',
    //   });
    //   return z.NEVER;
    // }
    const parsedDate = createDateWithGuessedYear(dayNum, monthNum, yearNum);
    if (!isValidDate(parsedDate)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'A data de nascimento não é válida',
      });
      return z.NEVER;
    }

    data = {
      parsedDate: createDateWithGuessedYear(dayNum, monthNum, yearNum),
      isFullDate: true,
    };
  }
  else if (shortDateMatch) {
    const [, day, month] = shortDateMatch;
    data = {
      parsedDate: createDateWithGuessedYear(parseInt(day, 10), parseInt(month, 10)),
      isFullDate: false,
    };
  }
  else {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'A data deve estar no formato "DD/MM" ou "DD/MM/AAAA"',
    });
    return z.NEVER;
  }

  // if (isDateInFuture(data.parsedDate)) {
  //   ctx.addIssue({
  //     code: z.ZodIssueCode.custom,
  //     message: 'A data de nascimento não pode estar no futuro',
  //   });
  //   return z.NEVER;
  // }

  return data;
});

module.exports = {
  birthdaySchema,
};
