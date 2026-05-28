import { describe, it, expect, beforeEach, vi } from 'vitest';
import Birthday from '../../../src/models/birthday';
import { handleNext } from '../../../src/handlers/commands/next';
import { InteractionResponseType } from '../../../src/types';
import type { DiscordInteractionBody } from '../../../src/types';

const ALLOWED_ROLE = 'role-allowed';

const getMock = vi.fn().mockResolvedValue({});

vi.mock('discord.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('discord.js')>();
  return {
    ...actual,
    /* eslint-disable-next-line no-empty-function */
    REST: vi.fn().mockImplementation(function () {
      return {
        setToken: vi.fn().mockReturnThis(),
        get: getMock,
      };
    }),
  };
});

function makeBody(quantity?: number, guildId = 'guild1'): DiscordInteractionBody {
  return {
    type: 2,
    id: '1',
    token: 'tok',
    guild_id: guildId,
    member: { user: { id: 'u1', username: 'testuser' }, roles: [ALLOWED_ROLE] },
    data: {
      id: 'd1',
      name: 'next',
      type: 1,
      options: quantity !== undefined
        ? [{ name: 'quantity', type: 4, value: quantity }]
        : [],
    },
  };
}

async function createBirthday(userId: string, birthdate: Date) {
  return Birthday.create({
    user_id: userId,
    guild_id: 'guild1',
    username: userId,
    guild_name: 'Test Guild',
    birthdate,
    show_age: false,
  });
}

beforeEach(async () => {
  await Birthday.sync({ force: true });
  getMock.mockResolvedValue({});
  process.env.BIRTHDAY_GUILDS_ROLES = ALLOWED_ROLE;
  process.env.DISCORD_TOKEN = 'test-token';
  process.env.DEFAULT_LIMIT = '5';
  process.env.MAX_LIMIT = '25';
  process.env.MIN_LIMIT = '1';
});

describe('handleNext', () => {
  it('returns message when no birthdays exist', async () => {
    const response = await handleNext(makeBody());
    expect(response.data?.content).toContain('não há aniversários cadastrados');
  });

  it('returns embed with birthday list', async () => {
    await createBirthday('u1', new Date(1990, 5, 15));
    await createBirthday('u2', new Date(1990, 7, 20));

    const response = await handleNext(makeBody());
    expect(response.type).toBe(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE);
    expect(response.data?.embeds).toHaveLength(1);
  });

  it('returns error when user lacks the required role', async () => {
    const body = makeBody();
    body.member!.roles = [];
    const response = await handleNext(body);
    expect(response.data?.content).toContain('não tem permissão');
  });

  it('respects quantity option', async () => {
    await createBirthday('u1', new Date(1990, 5, 15));
    await createBirthday('u2', new Date(1990, 7, 20));
    await createBirthday('u3', new Date(1990, 9, 10));

    const response = await handleNext(makeBody(2));
    expect(response.data?.embeds?.[0]?.footer?.text).toContain('2');
  });

  it('filters out users no longer in the guild', async () => {
    await createBirthday('u1', new Date(1990, 5, 15));
    getMock.mockRejectedValue(new Error('Unknown Member'));

    const response = await handleNext(makeBody());
    expect(response.data?.content).toContain('não há aniversários cadastrados');
  });
});
