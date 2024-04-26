const { SlashCommandBuilder } = require('discord.js');

const { findByUserAndGuild } = require('../../repositories/birthdayRepository');
const { timeUntilBirthday } = require('../../utils/date');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('show')
    .setDescription('Show your birthday information'),

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
      const birthdayData = await findByUserAndGuild(userId, guildId);
      const options = {
        month: 'numeric',
        day: 'numeric',
      };
      const formattedDate = birthdayData.birthdate.toLocaleDateString('pt-BR', options);
      const formattedTimeUntilBirthday = timeUntilBirthday(birthdayData.birthdate);

      let message = `According to my records, your birthday is ${formattedTimeUntilBirthday} away as it falls on ${formattedDate}`;

      if (birthdayData.show_age) {
        message = `According to my records, your birthday is ${formattedTimeUntilBirthday} away as it falls on ${formattedDate} and you are ${birthdayData.age} years old`;
      }

      await interaction.reply(`${message}! 🎉`);
    }
    catch (err) {
      await interaction.reply('Failed to show your birthday information 😥');
    }
  },
};
