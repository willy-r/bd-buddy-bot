import { SlashCommandBuilder } from 'discord.js';
import type { DiscordInteractionBody, DiscordInteractionResponse } from '../../types';
import { InteractionResponseType } from '../../types';
import { findByUserAndGuild, deleteByUserAndGuild } from '../../repositories/birthdayRepository';
import { hasRequiredRole, textResponse } from './helpers';

export const data = new SlashCommandBuilder()
  .setName('remove')
  .setDescription('Remove seu aniversário da memória do Buddy!');

export async function handleRemove(body: DiscordInteractionBody): Promise<DiscordInteractionResponse> {
  if (!hasRequiredRole(body)) {
    return textResponse(
      InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      'Desculpe, você não tem permissão para usar esse comando 😿',
    );
  }

  const userId = body.member!.user.id;
  const guildId = body.guild_id!;

  try {
    const birthday = await findByUserAndGuild(userId, guildId);

    if (birthday === null) {
      return textResponse(
        InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        'Ops! Parece que você não tem um aniversário registrado aqui 😿',
      );
    }

    await deleteByUserAndGuild(userId, guildId);
    return textResponse(
      InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      'Seu aniversário foi removido da memória do Buddy! 😿',
    );
  }
  catch {
    return textResponse(
      InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      'Falha ao remover seu aniversário 😿',
    );
  }
}
