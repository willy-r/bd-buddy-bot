const { SlashCommandBuilder } = require('discord.js');

const { deleteByUserAndGuild } = require('../../repositories/birthdayRepository');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remove')
    .setDescription('Remove your birthday from Buddy\'s memory'),

  async execute(interaction) {
    const hasBirthdayRole = interaction.member.roles.cache.some((role) => {
      return process.env.BIRTHDAY_GUILDS_ROLES.split(',').includes(role.id);
    });
    if (!hasBirthdayRole) {
      await interaction.reply('Sorry, but you do not have the right permissions to do that 😥');
      return;
    }

    const { id: userId } = interaction.user;
    const { id: guildId } = interaction.guild;

    try {
      await deleteByUserAndGuild(userId, guildId);
      await interaction.reply('From now, I can\'t remember your birthday 😥');
    }
    catch (err) {
      await interaction.reply('Failed to remove your birthday from my memory 😥');
    }
  },
};
