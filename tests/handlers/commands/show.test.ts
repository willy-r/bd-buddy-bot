import { describe, it, expect, beforeEach, vi } from 'vitest';
import Birthday from '../../../src/models/birthday';
import { handleShow } from '../../../src/handlers/commands/show';
import { InteractionResponseType } from '../../../src/types';
import type { DiscordInteractionBody } from '../../../src/types';

const ALLOWED_ROLE = 'role-allowed';

function makeBody(userId = 'user1', guildId = 'guild1'): DiscordInteractionBody {
  return {
    type: 2,
    id: '1',
    token: 'tok',
    guild_id: guildId,
    member: { user: { id: userId, username: 'testuser' }, roles: [ALLOWED_ROLE] },
    data: { id: 'd1', name: 'show', type: 1 },
  };
}

async function createBirthday(birthdate: Date, userId = 'user1') {
  return Birthday.create({
    user_id: userId,
    guild_id: 'guild1',
    username: 'testuser',
    guild_name: 'Test Guild',
    birthdate,
    show_age: false,
  });
}

beforeEach(async () => {
  await Birthday.sync({ force: true });
  process.env.BIRTHDAY_GUILDS_ROLES = ALLOWED_ROLE;
});

describe('handleShow', () => {
  it('returns error when birthday is not registered', async () => {
    const response = await handleShow(makeBody());
    expect(response.data?.content).toContain('não tem um aniversário registrado');
  });

  it('returns error when user lacks the required role', async () => {
    const body = makeBody();
    body.member!.roles = [];
    const response = await handleShow(body);
    expect(response.data?.content).toContain('não tem permissão');
  });

  it('returns a text message when birthday is not today', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 5, 15)); // June 15
    await createBirthday(new Date(1990, 0, 1)); // Jan 1 — not today

    const response = await handleShow(makeBody());
    expect(response.type).toBe(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE);
    expect(response.data?.content).toBeDefined();
    expect(response.data?.embeds).toBeUndefined();

    vi.useRealTimers();
  });

  it('returns an embed when birthday is today', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 5, 15)); // June 15
    await createBirthday(new Date(1990, 5, 15)); // June 15 — today

    const response = await handleShow(makeBody());
    expect(response.type).toBe(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE);
    expect(response.data?.embeds).toHaveLength(1);

    vi.useRealTimers();
  });
});
