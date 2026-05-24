import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import type { Command } from '../../types';

import { findNextBirthdaysByGuild } from '../../repositories/birthdayRepository';
import { formatBirthdayLine } from '../../utils/date';
import { DEFAULT_LIMIT, MIN_LIMIT, MAX_LIMIT, getNextBirthdaysSchema } from '../../validators/next';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('next')
    .setDescription('Mostra os próximos aniversários cadastrados no servidor')
    .addIntegerOption((option) =>
      option
        .setName('quantity')
        .setDescription('Número de aniversários para exibir')
        .setMinValue(MIN_LIMIT)
        .setMaxValue(MAX_LIMIT),
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const hasBirthdayRole = interaction.member?.roles && 'cache' in interaction.member.roles
      ? interaction.member.roles.cache.some((role) =>
        (process.env.BIRTHDAY_GUILDS_ROLES ?? '').split(',').includes(role.id),
      )
      : false;

    if (!hasBirthdayRole) {
      await interaction.reply('Desculpe, você não tem permissão para usar esse comando 😿');
      return;
    }

    const { id: guildId } = interaction.guild!;
    const quantityInput = interaction.options.getInteger('quantity') ?? DEFAULT_LIMIT;

    const parseResult = getNextBirthdaysSchema.safeParse({ quantity: quantityInput });
    if (!parseResult.success) {
      const errorMsg = parseResult.error.errors[0].message;
      await interaction.reply(`${errorMsg} 😿`);
      return;
    }

    try {
      const quantity = parseResult.data.quantity;
      const birthdays = await findNextBirthdaysByGuild(guildId, quantity);

      if (!birthdays.length) {
        await interaction.reply('Ainda não há aniversários cadastrados neste servidor 😿');
        return;
      }

      const lines = birthdays.map(formatBirthdayLine).join('\n');
      const embed = new EmbedBuilder()
        .setTitle('🎈 Próximos aniversariantes')
        .setDescription(lines)
        .setColor('#FF69B4')
        .setFooter({ text: `Exibindo os próximos ${quantity} aniversários` });

      await interaction.reply({ embeds: [embed] });
    }
    catch (_err) {
      await interaction.reply('Erro ao buscar os próximos aniversários 😿');
    }
  },
};

export default command;
