import { describe, it, expect, beforeEach } from 'vitest';
import Birthday from '../../src/models/birthday';
import {
  createBirthday,
  findAllTodayBirthDays,
  findByUserAndGuild,
  findNextBirthdaysByGuild,
  updateAgeById,
  deleteByUserAndGuild,
} from '../../src/repositories/birthdayRepository';

function makeBirthday(overrides: Partial<{
  user_id: string;
  guild_id: string;
  username: string;
  guild_name: string;
  birthdate: Date;
  show_age: boolean;
}> = {}) {
  return {
    user_id: 'user1',
    guild_id: 'guild1',
    username: 'testuser',
    guild_name: 'Test Guild',
    birthdate: new Date(1990, 5, 15), // June 15
    show_age: true,
    ...overrides,
  };
}

beforeEach(async () => {
  await Birthday.sync({ force: true });
});

describe('createBirthday', () => {
  it('creates and returns a birthday record', async () => {
    const record = await createBirthday(makeBirthday());
    expect(record.user_id).toBe('user1');
    expect(record.guild_id).toBe('guild1');
  });

  it('throws when duplicate (user_id + guild_id)', async () => {
    await createBirthday(makeBirthday());
    await expect(createBirthday(makeBirthday())).rejects.toThrow('already exists');
  });

  it('allows same user in different guilds', async () => {
    await createBirthday(makeBirthday({ guild_id: 'guild1' }));
    const second = await createBirthday(makeBirthday({ guild_id: 'guild2' }));
    expect(second.guild_id).toBe('guild2');
  });
});

describe('findAllTodayBirthDays', () => {
  it('returns birthdays matching day and month', async () => {
    await createBirthday(makeBirthday({ birthdate: new Date(1990, 5, 15) })); // June 15
    const results = await findAllTodayBirthDays('15', '06');
    expect(results.length).toBe(1);
  });

  it('returns empty array when no birthdays match', async () => {
    await createBirthday(makeBirthday({ birthdate: new Date(1990, 5, 15) })); // June 15
    const results = await findAllTodayBirthDays('16', '06');
    expect(results.length).toBe(0);
  });

  it('does not return birthdays from different month', async () => {
    await createBirthday(makeBirthday({ birthdate: new Date(1990, 5, 15) })); // June 15
    const results = await findAllTodayBirthDays('15', '07');
    expect(results.length).toBe(0);
  });
});

describe('findByUserAndGuild', () => {
  it('returns the record when found', async () => {
    await createBirthday(makeBirthday());
    const result = await findByUserAndGuild('user1', 'guild1');
    expect(result).not.toBeNull();
    expect(result!.user_id).toBe('user1');
  });

  it('returns null when not found', async () => {
    const result = await findByUserAndGuild('nonexistent', 'guild1');
    expect(result).toBeNull();
  });
});

describe('findNextBirthdaysByGuild', () => {
  it('returns birthdays for the given guild', async () => {
    await createBirthday(makeBirthday({ user_id: 'u1', guild_id: 'g1', birthdate: new Date(1990, 5, 15) }));
    await createBirthday(makeBirthday({ user_id: 'u2', guild_id: 'g1', birthdate: new Date(1990, 7, 20) }));
    const results = await findNextBirthdaysByGuild('g1', 5);
    expect(results.length).toBe(2);
  });

  it('does not return birthdays from other guilds', async () => {
    await createBirthday(makeBirthday({ user_id: 'u1', guild_id: 'g1' }));
    await createBirthday(makeBirthday({ user_id: 'u2', guild_id: 'g2' }));
    const results = await findNextBirthdaysByGuild('g1', 5);
    expect(results.length).toBe(1);
  });

  it('respects the limit parameter', async () => {
    await createBirthday(makeBirthday({ user_id: 'u1', guild_id: 'g1', birthdate: new Date(1990, 5, 15) }));
    await createBirthday(makeBirthday({ user_id: 'u2', guild_id: 'g1', birthdate: new Date(1990, 7, 20) }));
    const results = await findNextBirthdaysByGuild('g1', 1);
    expect(results.length).toBe(1);
  });
});

describe('updateAgeById', () => {
  it('increments age by the given amount', async () => {
    const created = await createBirthday(makeBirthday({ show_age: true }));
    const ageBefore = created.age;
    await updateAgeById(created.id, 1);
    const updated = await findByUserAndGuild('user1', 'guild1');
    expect(updated!.age).toBe((ageBefore ?? 0) + 1);
  });
});

describe('deleteByUserAndGuild', () => {
  it('removes the record', async () => {
    await createBirthday(makeBirthday());
    await deleteByUserAndGuild('user1', 'guild1');
    const result = await findByUserAndGuild('user1', 'guild1');
    expect(result).toBeNull();
  });

  it('is a no-op when record does not exist', async () => {
    await expect(deleteByUserAndGuild('ghost', 'guild1')).resolves.not.toThrow();
  });
});
