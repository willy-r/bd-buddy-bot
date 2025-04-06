const { SlashCommandBuilder } = require('discord.js');

const { findByUserAndGuild } = require('../../repositories/birthdayRepository');
const { formatBirthdayMessage } = require('../../utils/date');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('show')
    .setDescription('Mostra quanto tempo falta para o seu aniversário!'),

  async execute(interaction) {
    const hasBirthdayRole = interaction.member.roles.cache.some((role) => {
      return process.env.BIRTHDAY_GUILDS_ROLES.split(',').includes(role.id);
    });
    if (!hasBirthdayRole) {
      await interaction.reply('Desculpe, você não tem permissão para usar esse comando 😿');
      return;
    }

    const { id: userId } = interaction.user;
    const { id: guildId } = interaction.guild;

    try {
      const birthdayData = await findByUserAndGuild(userId, guildId);

      if (birthdayData === null) {
        await interaction.reply('Ops! Parece que você não tem um aniversário registrado aqui 😿');
        return;
      }

      const message = formatBirthdayMessage(birthdayData);
      await interaction.reply(message);
    }
    catch (err) {
      await interaction.reply('Failed to show your birthday information 😥');
    }
  },
};
