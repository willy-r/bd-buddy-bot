import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
const Birthday = require('../../src/models/birthday');
const birthdayReminderJob = require('../../src/jobs/birthdayReminderJob');

// Integration tests: real in-memory SQLite DB, mocked Discord client only.
// Today is pinned to June 15 2024 so query date is deterministic.

function makeClient({ guildExists = true, channelExists = true } = {}) {
  const sendMock = vi.fn().mockResolvedValue(undefined);
  const channel = channelExists ? { id: '333', send: sendMock } : undefined;
  const guildMock = guildExists
    ? { channels: { cache: { find: vi.fn().mockReturnValue(channel) } } }
    : undefined;
  return {
    guilds: { cache: { get: vi.fn().mockReturnValue(guildMock) } },
    _sendMock: sendMock,
  };
}

async function createBirthdayToday(overrides = {}) {
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
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe('birthdayReminderJob', () => {
  it('does nothing when there are no birthdays today', async () => {
    const client = makeClient();
    await birthdayReminderJob(client);
    expect(client._sendMock).not.toHaveBeenCalled();
  });

  it('skips when guild is not found in cache', async () => {
    await createBirthdayToday();
    const client = makeClient({ guildExists: false });
    await birthdayReminderJob(client);
    expect(client._sendMock).not.toHaveBeenCalled();
  });

  it('skips when channel is not found in cache', async () => {
    await createBirthdayToday();
    const client = makeClient({ guildExists: true, channelExists: false });
    await birthdayReminderJob(client);
    expect(client._sendMock).not.toHaveBeenCalled();
  });

  it('sends an embed and increments age on happy path', async () => {
    const record = await createBirthdayToday({ show_age: true });
    const ageBefore = record.age;
    const client = makeClient();

    await birthdayReminderJob(client);

    expect(client._sendMock).toHaveBeenCalledOnce();
    const [payload] = client._sendMock.mock.calls[0];
    expect(payload).toHaveProperty('embeds');
    expect(payload.embeds.length).toBe(1);

    const updated = await Birthday.findByPk(record.id);
    expect(updated.age).toBe(ageBefore + 1);
  });

  it('processes multiple birthday records independently', async () => {
    await createBirthdayToday({ user_id: 'u1' });
    await createBirthdayToday({ user_id: 'u2' });
    const client = makeClient();

    await birthdayReminderJob(client);

    expect(client._sendMock).toHaveBeenCalledTimes(2);
  });
});
