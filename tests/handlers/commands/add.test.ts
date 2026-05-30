import { describe, it, expect, beforeEach, vi } from 'vitest';
import Birthday from '../../../src/models/birthday';
import { handleAdd } from '../../../src/handlers/commands/add';
import { InteractionResponseType } from '../../../src/types';
import type { DiscordInteractionBody } from '../../../src/types';

const ALLOWED_ROLE = 'role-allowed';

function makeBody(overrides: Partial<DiscordInteractionBody> = {}): DiscordInteractionBody {
  return {
    type: 2,
    id: '1',
    token: 'tok',
    guild_id: 'guild1',
    member: { user: { id: 'user1', username: 'testuser' }, roles: [ALLOWED_ROLE] },
    data: {
      id: 'd1',
      name: 'add',
      type: 1,
      options: [{ name: 'birthdate', type: 3, value: '15/06/1990' }],
    },
    ...overrides,
  };
}

beforeEach(async () => {
  await Birthday.sync({ force: true });
  process.env.BIRTHDAY_GUILD_ROLES_MAP = JSON.stringify({ guild1: ALLOWED_ROLE });
});

describe('handleAdd', () => {
  it('creates a birthday and returns success message', async () => {
    const response = await handleAdd(makeBody());
    expect(response.type).toBe(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE);
    expect(response.data?.content).toContain('adicionado com sucesso');
  });

  it('returns error when user lacks the required role', async () => {
    const body = makeBody({ member: { user: { id: 'u1', username: 'u' }, roles: [] } });
    const response = await handleAdd(body);
    expect(response.data?.content).toContain('não tem permissão');
  });

  it('returns error for invalid birthdate format', async () => {
    const body = makeBody();
    body.data!.options = [{ name: 'birthdate', type: 3, value: '1990-06-15' }];
    const response = await handleAdd(body);
    expect(response.data?.content).toContain('DD/MM');
  });

  it('returns error when show-age=true but date has no year', async () => {
    const body = makeBody();
    body.data!.options = [
      { name: 'birthdate', type: 3, value: '15/06' },
      { name: 'show-age', type: 5, value: true },
    ];
    const response = await handleAdd(body);
    expect(response.data?.content).toContain('ano de nascimento');
  });

  it('returns error on duplicate registration', async () => {
    await handleAdd(makeBody());
    const response = await handleAdd(makeBody());
    expect(response.data?.content).toContain('já está registrado');
  });
});
