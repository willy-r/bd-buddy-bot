import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import type { Command } from '../../types';

import { findByUserAndGuild } from '../../repositories/birthdayRepository';
import { formatBirthdayMessage } from '../../utils/date';
import { getRandomBirthdayGif } from '../../utils/birthdayMessages';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('show')
    .setDescription('Mostra quanto tempo falta para o seu aniversário!'),

  async execute(interaction: ChatInputCommandInteraction) {
    const hasBirthdayRole = interaction.member?.roles && 'cache' in interaction.member.roles
      ? interaction.member.roles.cache.some((role) => {
        return (process.env.BIRTHDAY_GUILDS_ROLES ?? '').split(',').includes(role.id);
      })
      : false;

    if (!hasBirthdayRole) {
      await interaction.reply('Desculpe, você não tem permissão para usar esse comando 😿');
      return;
    }

    const { id: userId } = interaction.user;
    const { id: guildId } = interaction.guild!;

    try {
      const birthdayData = await findByUserAndGuild(userId, guildId);

      if (birthdayData === null) {
        await interaction.reply('Ops! Parece que você não tem um aniversário registrado aqui 😿');
        return;
      }

      const { message, isToday } = formatBirthdayMessage(birthdayData);
      if (isToday) {
        const embed = new EmbedBuilder()
          .setDescription(message)
          .setImage(getRandomBirthdayGif())
          .setColor('#FFD700')
          .setFooter({ text: 'Feliz aniversário! 🎈' });

        await interaction.reply({ embeds: [embed] });
        return;
      }

      await interaction.reply(message);
    }
    catch (_err) {
      await interaction.reply('Não foi possível mostrar as informações do seu aniversário 😿');
    }
  },
};

export default command;
