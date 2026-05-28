import { describe, it, expect, beforeEach } from 'vitest';
import Birthday from '../../../src/models/birthday';
import { handleRemove } from '../../../src/handlers/commands/remove';
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
    data: { id: 'd1', name: 'remove', type: 1 },
  };
}

async function createBirthday(userId = 'user1', guildId = 'guild1') {
  return Birthday.create({
    user_id: userId,
    guild_id: guildId,
    username: 'testuser',
    guild_name: 'Test Guild',
    birthdate: new Date(1990, 5, 15),
    show_age: false,
  });
}

beforeEach(async () => {
  await Birthday.sync({ force: true });
  process.env.BIRTHDAY_GUILDS_ROLES = ALLOWED_ROLE;
});

describe('handleRemove', () => {
  it('removes birthday and returns success message', async () => {
    await createBirthday();
    const response = await handleRemove(makeBody());
    expect(response.type).toBe(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE);
    expect(response.data?.content).toContain('removido');
  });

  it('returns error when no birthday is registered', async () => {
    const response = await handleRemove(makeBody());
    expect(response.data?.content).toContain('não tem um aniversário registrado');
  });

  it('returns error when user lacks the required role', async () => {
    const body = makeBody();
    body.member!.roles = [];
    const response = await handleRemove(body);
    expect(response.data?.content).toContain('não tem permissão');
  });
});
