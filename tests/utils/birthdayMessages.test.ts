import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getRandomBirthdayMessage, getRandomBirthdayGif } from '../../src/utils/birthdayMessages';

describe('getRandomBirthdayMessage', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns a message containing the user mention', () => {
    const result = getRandomBirthdayMessage({ user_id: 'abc123', show_age: false, age: 20, guild_id: 'g1', username: 'u', guild_name: 'g', birthdate: new Date() });
    expect(result).toContain('<@abc123>');
  });

  it('picks from age messages when show_age is true', () => {
    const result = getRandomBirthdayMessage({ user_id: 'abc123', show_age: true, age: 20, guild_id: 'g1', username: 'u', guild_name: 'g', birthdate: new Date() });
    expect(result).toContain('21');
  });

  it('does not include age when show_age is false', () => {
    const result = getRandomBirthdayMessage({ user_id: 'abc123', show_age: false, age: 20, guild_id: 'g1', username: 'u', guild_name: 'g', birthdate: new Date() });
    expect(result).not.toContain('21');
  });
});

describe('getRandomBirthdayGif', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns a non-empty string', () => {
    const result = getRandomBirthdayGif();
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('returns the first gif when Math.random returns 0', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const first = getRandomBirthdayGif();
    vi.spyOn(Math, 'random').mockReturnValue(0.999);
    const last = getRandomBirthdayGif();
    expect(first).not.toBe(last);
  });
});
