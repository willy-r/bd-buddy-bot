const { SlashCommandBuilder } = require('discord.js');

const { updateByUserAndGuild, findByUserAndGuild } = require('../../repositories/birthdayRepository');
const { parseDateStringToDate, isDateInFuture } = require('../../utils/date');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('update')
    .setDescription('Update your birthday on the Buddy\'s memory!')
    .addStringOption((option) =>
      option.setName('birthdate')
        .setDescription('Your birthdate in the format "DD/MM/YYYY" (our little secret)')
        .setRequired(true))
    .addBooleanOption((option) =>
      option.setName('show-age')
        .setDescription('Should Buddy show your age by now? Defaults to False')),

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
    const { id: userId } = interaction.user;
    const { id: guildId } = interaction.guild;

    const birthdayData = {
      show_age: showAge,
      birthdate: birthdateToDate,
    };
    try {
      const birthday = await findByUserAndGuild(userId, guildId);

      if (birthday === null) {
        await interaction.reply('I didn\'t find birthday information for this user on this server to update 😥');
        return;
      }

      await updateByUserAndGuild(userId, guildId, birthdayData);
      await interaction.reply('Your birthday has been updated successfully! 🎉');
    }
    catch (err) {
      await interaction.reply('Failed to update your birthday 😥');
    }
  },
};
