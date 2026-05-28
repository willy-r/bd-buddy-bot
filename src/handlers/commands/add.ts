import { SlashCommandBuilder } from 'discord.js';
import type { DiscordInteractionBody, DiscordInteractionResponse } from '../../types';
import { InteractionResponseType } from '../../types';
import { createBirthday } from '../../repositories/birthdayRepository';
import { birthdaySchema } from '../../validators/addBirthday';
import { hasRequiredRole, getStringOption, getBooleanOption, textResponse } from './helpers';

export const data = new SlashCommandBuilder()
  .setName('add')
  .setDescription('Adiciona seu aniversário à memória do Buddy!')
  .addStringOption((option) =>
    option.setName('birthdate')
      .setDescription('Data no formato "DD/MM" ou "DD/MM/AAAA"')
      .setRequired(true))
  .addBooleanOption((option) =>
    option.setName('show-age')
      .setDescription('O Buddy deve mostrar sua idade? Padrão é falso'));

export async function handleAdd(body: DiscordInteractionBody): Promise<DiscordInteractionResponse> {
  if (!hasRequiredRole(body)) {
    return textResponse(
      InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      'Desculpe, você não tem permissão para usar esse comando 😿',
    );
  }

  const birthdateInput = getStringOption(body, 'birthdate');
  const parseResult = birthdaySchema.safeParse(birthdateInput);
  if (!parseResult.success) {
    const errorMsg = parseResult.error.errors[0]?.message || 'Data inválida';
    return textResponse(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE, `${errorMsg} 😿`);
  }

  const showAgeInput = getBooleanOption(body, 'show-age') ?? false;
  const { parsedDate, isFullDate } = parseResult.data;
  if (showAgeInput && !isFullDate) {
    return textResponse(
      InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      'Ops! Para mostrar sua idade, precisamos que você informe o ano de nascimento 🐱',
    );
  }

  const userId = body.member!.user.id;
  const username = body.member!.user.username;
  const guildId = body.guild_id!;

  const birthdayData = {
    user_id: userId,
    guild_id: guildId,
    guild_name: '',
    show_age: showAgeInput,
    birthdate: parsedDate,
    username,
  };

  try {
    await createBirthday(birthdayData);
    return textResponse(
      InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      'Seu aniversário foi adicionado com sucesso! 🎉😻',
    );
  }
  catch (err) {
    let message = 'Falha ao adicionar seu aniversário 😿';
    if ((err as Error).message.includes('already exists')) {
      message = 'Parece que seu aniversário já está registrado aqui! 😺';
    }
    return textResponse(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE, message);
  }
}
