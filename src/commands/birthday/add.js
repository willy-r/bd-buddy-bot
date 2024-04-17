const { SlashCommandBuilder } = require('discord.js');

const { createBirthday } = require('../../repositories/birthdayRepository');
const { parseDateStringToDate, isDateInFuture } = require('../../utils/date');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('add')
    .setDescription('Add your birthday to the Buddy\'s memory!')
    .addStringOption((option) =>
      option.setName('birthdate')
        .setDescription('Your birthdate in the format "DD/MM/YYYY" (our little secret)')
        .setRequired(true))
    .addBooleanOption((option) =>
      option.setName('show-age')
        .setDescription('Should Buddy show your age? Defaults to False')),

  async execute(interaction) {
    const hasBirthdayRole = interaction.member.roles.cache.some((role) => {
      return process.env.BIRTHDAY_GUILDS_ROLES.split(',').includes(role.id);
    });
    if (!hasBirthdayRole) {
      await interaction.reply('Sorry, but you do not have the right permissions to do that 😥');
      return;
    }

    const birthdate = interaction.options.getString('birthdate');

    const dateRegex = /^(0[1-9]|[1-2][0-9]|3[0-1])\/(0[1-9]|1[0-2])\/(\d{4})$/;
    if (!dateRegex.test(birthdate)) {
      await interaction.reply('Sorry, but birthday should follow the format "DD/MM/YYYY" 😥');
      return;
    }

    const birthdateToDate = parseDateStringToDate(birthdate);
    if (isDateInFuture(birthdateToDate)) {
      await interaction.reply('Sorry, but birthday should not be in the future 😥');
      return;
    }

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
      await interaction.reply('Failed to add your birthday 😥');
    }
  },
};
