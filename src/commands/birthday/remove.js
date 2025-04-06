const { SlashCommandBuilder } = require('discord.js');

const { deleteByUserAndGuild, findByUserAndGuild } = require('../../repositories/birthdayRepository');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remove')
    .setDescription('Remove seu aniversário da memória do Buddy!'),

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
      const birthday = await findByUserAndGuild(userId, guildId);

      if (birthday === null) {
        await interaction.reply('Ops! Parece que você não tem um aniversário registrado aqui 😿');
        return;
      }

      await deleteByUserAndGuild(userId, guildId);
      await interaction.reply('Seu aniversário foi removido da memória do Buddy! 😿');
    }
    catch (err) {
      await interaction.reply('Falha ao remover seu aniversário 😿');
    }
  },
};
