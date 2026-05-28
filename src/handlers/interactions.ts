import type { FastifyReply } from 'fastify';
import type { DiscordInteractionBody } from '../types';
import { InteractionType, InteractionResponseType } from '../types';
import { handleAdd } from './commands/add';
import { handleRemove } from './commands/remove';
import { handleShow } from './commands/show';
import { handleNext } from './commands/next';

export async function handleInteraction(
  body: DiscordInteractionBody,
  reply: FastifyReply,
): Promise<void> {
  if (body.type === InteractionType.PING) {
    reply.send({ type: InteractionResponseType.PONG });
    return;
  }

  if (body.type === InteractionType.APPLICATION_COMMAND) {
    const commandName = body.data?.name;

    let response;
    switch (commandName) {
      case 'add':    response = await handleAdd(body); break;
      case 'remove': response = await handleRemove(body); break;
      case 'show':   response = await handleShow(body); break;
      case 'next':   response = await handleNext(body); break;
      default:
        reply.status(400).send({ error: `Unknown command: ${commandName}` });
        return;
    }

    reply.send(response);
    return;
  }

  reply.status(400).send({ error: 'Unsupported interaction type' });
}
