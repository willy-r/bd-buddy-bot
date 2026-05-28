import { describe, it, expect } from 'vitest';
import { InteractionType, InteractionResponseType } from '../../src/types';
import { handleInteraction } from '../../src/handlers/interactions';
import type { DiscordInteractionBody } from '../../src/types';

function makeReply() {
  const reply = {
    statusCode: 200,
    _body: undefined as unknown,
    status(code: number) { this.statusCode = code; return this; },
    send(body: unknown) { this._body = body; return this; },
  };
  return reply as unknown as Parameters<typeof handleInteraction>[1];
}

function pingBody(): DiscordInteractionBody {
  return { type: InteractionType.PING, id: '1', token: 'tok' };
}

describe('handleInteraction', () => {
  it('responds with PONG for PING interactions', async () => {
    const reply = makeReply();
    await handleInteraction(pingBody(), reply);
    expect((reply as unknown as { _body: unknown })._body).toEqual({ type: InteractionResponseType.PONG });
  });

  it('returns 400 for unknown interaction types', async () => {
    const reply = makeReply();
    const body = { type: 99, id: '1', token: 'tok' } as unknown as DiscordInteractionBody;
    await handleInteraction(body, reply);
    expect((reply as unknown as { statusCode: number }).statusCode).toBe(400);
  });

  it('returns 400 for unknown command names', async () => {
    const reply = makeReply();
    const body: DiscordInteractionBody = {
      type: InteractionType.APPLICATION_COMMAND,
      id: '1',
      token: 'tok',
      guild_id: 'g1',
      member: { user: { id: 'u1', username: 'user' }, roles: [] },
      data: { id: 'd1', name: 'unknown-command', type: 1 },
    };
    await handleInteraction(body, reply);
    expect((reply as unknown as { statusCode: number }).statusCode).toBe(400);
  });
});
