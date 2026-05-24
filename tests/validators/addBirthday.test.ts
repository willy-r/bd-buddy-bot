import { describe, it, expect } from 'vitest';
import { birthdaySchema } from '../../src/validators/addBirthday';

describe('birthdaySchema', () => {
  it('accepts DD/MM format and sets isFullDate=false', () => {
    const result = birthdaySchema.safeParse('15/06');
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.isFullDate).toBe(false);
  });

  it('accepts DD/MM/AAAA format and sets isFullDate=true', () => {
    const result = birthdaySchema.safeParse('15/06/1990');
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.isFullDate).toBe(true);
  });

  it('rejects invalid format (dashes)', () => {
    const result = birthdaySchema.safeParse('15-06-1990');
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.errors[0].message).toContain('DD/MM');
  });

  it('rejects future year', () => {
    const result = birthdaySchema.safeParse('15/06/2099');
    expect(result.success).toBe(false);
  });

  it('rejects year before 1900', () => {
    const result = birthdaySchema.safeParse('15/06/1899');
    expect(result.success).toBe(false);
  });

  it('returns a parsedDate as a Date object', () => {
    const result = birthdaySchema.safeParse('15/06/1990');
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.parsedDate).toBeInstanceOf(Date);
  });

  it('rejects empty string', () => {
    const result = birthdaySchema.safeParse('');
    expect(result.success).toBe(false);
  });
});
