const { SlashCommandBuilder } = require('discord.js');
const { findNextBirthdaysByGuild } = require('../../repositories/birthdayRepository');
const { formatBirthdayLine } = require('../../utils/date');

const DEFAULT_LIMIT = process.env.DEFAULT_LIMIT;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('next')
    .setDescription('Mostra os próximos aniversários cadastrados no servidor'),

  async execute(interaction) {
    const hasBirthdayRole = interaction.member.roles.cache.some((role) =>
      process.env.BIRTHDAY_GUILDS_ROLES.split(',').includes(role.id),
    );
    if (!hasBirthdayRole) {
      await interaction.reply('Desculpe, você não tem permissão para usar esse comando 😿');
      return;
    }

    const { id: guildId } = interaction.guild;

    try {
      const birthdays = await findNextBirthdaysByGuild(guildId, DEFAULT_LIMIT);

      if (!birthdays.length) {
        await interaction.reply('Ainda não há aniversários cadastrados neste servidor 😿');
        return;
      }

      const lines = birthdays.map(formatBirthdayLine).join('\n');

      await interaction.reply(`🎈 **Próximos aniversários**:\n\n${lines}`);
    }
    catch (err) {
      await interaction.reply('Erro ao buscar os próximos aniversários 😿');
    }
  },
};
