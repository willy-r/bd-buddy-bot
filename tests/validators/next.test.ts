import { describe, it, expect } from 'vitest';
import { getNextBirthdaysSchema, DEFAULT_LIMIT, MAX_LIMIT, MIN_LIMIT } from '../../src/validators/next';

describe('getNextBirthdaysSchema', () => {
  it('accepts a quantity within bounds', () => {
    const result = getNextBirthdaysSchema.safeParse({ quantity: 10 });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.quantity).toBe(10);
  });

  it('uses DEFAULT_LIMIT when quantity is omitted', () => {
    const result = getNextBirthdaysSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.quantity).toBe(DEFAULT_LIMIT);
  });

  it('rejects quantity below MIN_LIMIT', () => {
    const result = getNextBirthdaysSchema.safeParse({ quantity: MIN_LIMIT - 1 });
    expect(result.success).toBe(false);
  });

  it('rejects quantity above MAX_LIMIT', () => {
    const result = getNextBirthdaysSchema.safeParse({ quantity: MAX_LIMIT + 1 });
    expect(result.success).toBe(false);
  });

  it('accepts exactly MIN_LIMIT', () => {
    const result = getNextBirthdaysSchema.safeParse({ quantity: MIN_LIMIT });
    expect(result.success).toBe(true);
  });

  it('accepts exactly MAX_LIMIT', () => {
    const result = getNextBirthdaysSchema.safeParse({ quantity: MAX_LIMIT });
    expect(result.success).toBe(true);
  });

  it('rejects non-integer quantity', () => {
    const result = getNextBirthdaysSchema.safeParse({ quantity: 3.5 });
    expect(result.success).toBe(false);
  });
});
