import { SlashCommandBuilder } from 'discord.js';
import type { DiscordInteractionBody, DiscordInteractionResponse } from '../../types';
import { InteractionResponseType } from '../../types';
import { findByUserAndGuild } from '../../repositories/birthdayRepository';
import { formatBirthdayMessage } from '../../utils/date';
import { getRandomBirthdayGif } from '../../utils/birthdayMessages';
import { hasRequiredRole, textResponse } from './helpers';

export const data = new SlashCommandBuilder()
  .setName('show')
  .setDescription('Mostra quanto tempo falta para o seu aniversário!');

export async function handleShow(body: DiscordInteractionBody): Promise<DiscordInteractionResponse> {
  if (!hasRequiredRole(body)) {
    return textResponse(
      InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      'Desculpe, você não tem permissão para usar esse comando 😿',
    );
  }

  const userId = body.member!.user.id;
  const guildId = body.guild_id!;

  try {
    const birthdayData = await findByUserAndGuild(userId, guildId);

    if (birthdayData === null) {
      return textResponse(
        InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        'Ops! Parece que você não tem um aniversário registrado aqui 😿',
      );
    }

    const { message, isToday } = formatBirthdayMessage(birthdayData);
    if (isToday) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          embeds: [{
            description: message,
            image: { url: getRandomBirthdayGif() },
            color: 0xFFD700,
            footer: { text: 'Feliz aniversário! 🎈' },
          }],
        },
      };
    }

    return textResponse(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE, message);
  }
  catch {
    return textResponse(
      InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      'Não foi possível mostrar as informações do seu aniversário 😿',
    );
  }
}
