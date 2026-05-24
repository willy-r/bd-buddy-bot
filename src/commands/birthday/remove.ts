import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import type { Command } from '../../types';

import { deleteByUserAndGuild, findByUserAndGuild } from '../../repositories/birthdayRepository';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('remove')
    .setDescription('Remove seu aniversário da memória do Buddy!'),

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
      const birthday = await findByUserAndGuild(userId, guildId);

      if (birthday === null) {
        await interaction.reply('Ops! Parece que você não tem um aniversário registrado aqui 😿');
        return;
      }

      await deleteByUserAndGuild(userId, guildId);
      await interaction.reply('Seu aniversário foi removido da memória do Buddy! 😿');
    }
    catch (_err) {
      await interaction.reply('Falha ao remover seu aniversário 😿');
    }
  },
};

export default command;
