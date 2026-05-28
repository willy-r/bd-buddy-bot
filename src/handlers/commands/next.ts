import { SlashCommandBuilder, REST, Routes } from 'discord.js';
import type { DiscordInteractionBody, DiscordInteractionResponse } from '../../types';
import { InteractionResponseType } from '../../types';
import { findNextBirthdaysByGuild } from '../../repositories/birthdayRepository';
import { formatBirthdayLine } from '../../utils/date';
import { DEFAULT_LIMIT, MIN_LIMIT, MAX_LIMIT, getNextBirthdaysSchema } from '../../validators/next';
import { hasRequiredRole, getIntegerOption, textResponse } from './helpers';

async function isUserInGuild(rest: REST, guildId: string, userId: string): Promise<boolean> {
  try {
    await rest.get(Routes.guildMember(guildId, userId));
    return true;
  } catch {
    return false;
  }
}

export const data = new SlashCommandBuilder()
  .setName('next')
  .setDescription('Mostra os próximos aniversários cadastrados no servidor')
  .addIntegerOption((option) =>
    option
      .setName('quantity')
      .setDescription('Número de aniversários para exibir')
      .setMinValue(MIN_LIMIT)
      .setMaxValue(MAX_LIMIT),
  );

export async function handleNext(body: DiscordInteractionBody): Promise<DiscordInteractionResponse> {
  if (!hasRequiredRole(body)) {
    return textResponse(
      InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      'Desculpe, você não tem permissão para usar esse comando 😿',
    );
  }

  const guildId = body.guild_id!;
  const quantityInput = getIntegerOption(body, 'quantity') ?? DEFAULT_LIMIT;

  const parseResult = getNextBirthdaysSchema.safeParse({ quantity: quantityInput });
  if (!parseResult.success) {
    const errorMsg = parseResult.error.errors[0].message;
    return textResponse(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE, `${errorMsg} 😿`);
  }

  try {
    const quantity = parseResult.data.quantity;
    const birthdays = await findNextBirthdaysByGuild(guildId, quantity);

    if (!birthdays.length) {
      return textResponse(
        InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        'Ainda não há aniversários cadastrados neste servidor 😿',
      );
    }

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);
    const inGuild = await Promise.all(birthdays.map((b) => isUserInGuild(rest, guildId, b.user_id)));
    const activeBirthdays = birthdays.filter((_, i) => inGuild[i]);

    if (!activeBirthdays.length) {
      return textResponse(
        InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        'Ainda não há aniversários cadastrados neste servidor 😿',
      );
    }

    const lines = activeBirthdays.map(formatBirthdayLine).join('\n');
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [{
          title: '🎈 Próximos aniversariantes',
          description: lines,
          color: 0xFF69B4,
          footer: { text: `Exibindo os próximos ${activeBirthdays.length} aniversários` },
        }],
      },
    };
  }
  catch {
    return textResponse(
      InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      'Erro ao buscar os próximos aniversários 😿',
    );
  }
}
