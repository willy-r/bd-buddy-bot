import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
const { formatBirthdayMessage, formatBirthdayLine } = require('../../src/utils/date');

// formatTimeUntilBirthday is a private helper — its behavior is exercised through
// the exported formatBirthdayMessage and formatBirthdayLine functions.

describe('formatBirthdayMessage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns isToday=true when birthday is today', () => {
    vi.setSystemTime(new Date(2024, 5, 15)); // June 15
    const result = formatBirthdayMessage({ birthdate: new Date(2000, 5, 15), show_age: false, age: 23 });
    expect(result.isToday).toBe(true);
  });

  it('includes age in today message when show_age is true', () => {
    vi.setSystemTime(new Date(2024, 5, 15));
    const result = formatBirthdayMessage({ birthdate: new Date(2000, 5, 15), show_age: true, age: 23 });
    expect(result.isToday).toBe(true);
    expect(result.message).toContain('23');
  });

  it('omits age in today message when show_age is false', () => {
    vi.setSystemTime(new Date(2024, 5, 15));
    const result = formatBirthdayMessage({ birthdate: new Date(2000, 5, 15), show_age: false, age: 23 });
    expect(result.message).not.toContain('23');
  });

  it('returns isToday=false for a future birthday', () => {
    vi.setSystemTime(new Date(2024, 0, 1));
    const result = formatBirthdayMessage({ birthdate: new Date(2000, 5, 15), show_age: false, age: 23 });
    expect(result.isToday).toBe(false);
  });

  it('includes age+1 in future message when show_age is true', () => {
    vi.setSystemTime(new Date(2024, 0, 1));
    const result = formatBirthdayMessage({ birthdate: new Date(2000, 5, 15), show_age: true, age: 23 });
    expect(result.message).toContain('24');
  });

  it('embeds months and days in future message', () => {
    vi.setSystemTime(new Date(2024, 0, 1)); // Jan 1
    const result = formatBirthdayMessage({ birthdate: new Date(2000, 2, 15), show_age: false, age: 23 }); // Mar 15
    expect(result.message).toContain('meses');
    expect(result.message).toContain('dias');
  });

  it('wraps to next year when birthday already passed this year', () => {
    vi.setSystemTime(new Date(2024, 6, 1)); // Jul 1
    const result = formatBirthdayMessage({ birthdate: new Date(2000, 2, 15), show_age: false, age: 23 }); // Mar 15
    expect(result.isToday).toBe(false);
    expect(result.message).toMatch(/mes/); // 'mês' or 'meses'
  });
});

describe('formatBirthdayLine', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 0, 1)); // Jan 1
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('includes age+1 and user mention when show_age is true', () => {
    const result = formatBirthdayLine({ birthdate: new Date(2000, 5, 15), show_age: true, age: 23, user_id: 'u1' });
    expect(result).toContain('<@u1>');
    expect(result).toContain('24');
  });

  it('omits age and uses 🎉 emoji when show_age is false', () => {
    const result = formatBirthdayLine({ birthdate: new Date(2000, 5, 15), show_age: false, age: 23, user_id: 'u1' });
    expect(result).toContain('🎉');
    expect(result).not.toContain('24');
  });

  it('contains a time-until string in parentheses', () => {
    const result = formatBirthdayLine({ birthdate: new Date(2000, 5, 15), show_age: false, age: 23, user_id: 'u1' });
    expect(result).toMatch(/\(.+\)/);
  });

  it('returns "hoje" in the time field when birthday is today', () => {
    vi.setSystemTime(new Date(2024, 5, 15)); // June 15
    const result = formatBirthdayLine({ birthdate: new Date(2000, 5, 15), show_age: false, age: 23, user_id: 'u1' });
    expect(result).toContain('(hoje)');
  });
});
