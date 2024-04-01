const { SlashCommandBuilder } = require('discord.js');

const { createBirthday } = require('../../repositories/birthdayRepository');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('add')
    .setDescription('Add your birthday to the buddy\'s memory!')
    .addStringOption((option) =>
      option.setName('birthdate')
        .setDescription('Your birthdate in the format "YYYY-MM-DD"')
        .setRequired(true))
    .addBooleanOption(option =>
      option.setName('show-age')
        .setDescription('Whether or not the buddy should show age on message\'s birthday, defaults to false')),

  async execute(interaction) {
    const hasBirthdayRole = interaction.member.roles.cache.some((role) => {
      return process.env.BIRTHDAY_GUILDS_ROLES.split(',').includes(role.id);
    });

    if (!hasBirthdayRole) {
      await interaction.reply('Sorry, but you do not have the right permissions to do that 😥');
      return;
    }

    const birthdate = interaction.options.getString('birthdate');
    const showAge = interaction.options.getBoolean('show-age') ?? false;
    const { id: userId, username } = interaction.user;
    const { id: guildId, name: guildName } = interaction.guild;

    const birthdayData = {
      user_id: userId,
      guild_id: guildId,
      guild_name: guildName,
      show_age: showAge,
      birthdate,
      username,
    };
    try {
      await createBirthday(birthdayData);
      await interaction.reply('Your birthday has been added successfully! 🎉');
    }
    catch (err) {
      await interaction.reply(`Failed to add your birthday: ${err.message} 😥`);
    }
  },
};
