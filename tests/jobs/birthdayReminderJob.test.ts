import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Birthday from '../../src/models/birthday';
import birthdayReminderJob from '../../src/jobs/birthdayReminderJob';

// Integration tests: real in-memory SQLite DB, mocked discord.js REST only.
// Today is pinned to June 15 2024 so query date is deterministic.

const postMock = vi.fn().mockResolvedValue(undefined);
const getMock = vi.fn().mockResolvedValue({});

vi.mock('discord.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('discord.js')>();
  return {
    ...actual,
    /* eslint-disable-next-line no-empty-function */
    REST: vi.fn().mockImplementation(function () {
      return {
        setToken: vi.fn().mockReturnThis(),
        post: postMock,
        get: getMock,
      };
    }),
  };
});

async function createBirthdayToday(overrides: Record<string, unknown> = {}) {
  return Birthday.create({
    user_id: 'u1',
    guild_id: 'g1',
    username: 'testuser',
    guild_name: 'Test Guild',
    birthdate: new Date(1990, 5, 15), // June 15 — matches pinned "today"
    show_age: false,
    ...overrides,
  });
}

beforeEach(async () => {
  await Birthday.sync({ force: true });
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2024, 5, 15)); // June 15 2024
  getMock.mockResolvedValue({});
  process.env.DISCORD_TOKEN = 'test-token';
  process.env.BIRTHDAY_GUILD_CHANNELS_MAP = '{"g1":"channel-1"}';
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe('birthdayReminderJob', () => {
  it('does nothing when there are no birthdays today', async () => {
    await birthdayReminderJob();
    expect(postMock).not.toHaveBeenCalled();
  });

  it('skips when guild has no channel mapping', async () => {
    await createBirthdayToday({ guild_id: 'unmapped-guild' });
    await birthdayReminderJob();
    expect(postMock).not.toHaveBeenCalled();
  });

  it('skips when user is no longer in the guild', async () => {
    await createBirthdayToday({ show_age: false });
    getMock.mockRejectedValue(new Error('Unknown Member'));

    await birthdayReminderJob();

    expect(postMock).not.toHaveBeenCalled();
  });

  it('sends an embed and increments age on happy path', async () => {
    const record = await createBirthdayToday({ show_age: true });
    const ageBefore = record.age;

    await birthdayReminderJob();

    expect(postMock).toHaveBeenCalledOnce();
    const [_route, options] = postMock.mock.calls[0] as [string, { body: { embeds: unknown[] } }];
    expect(options.body.embeds).toHaveLength(1);

    const updated = await Birthday.findByPk(record.id);
    expect(updated!.age).toBe((ageBefore ?? 0) + 1);
  });

  it('processes multiple birthday records independently', async () => {
    await createBirthdayToday({ user_id: 'u1' });
    await createBirthdayToday({ user_id: 'u2' });

    await birthdayReminderJob();

    expect(postMock).toHaveBeenCalledTimes(2);
  });
});
