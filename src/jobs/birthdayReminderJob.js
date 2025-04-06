const { EmbedBuilder } = require('discord.js');

const { findAllTodayBirthDays, updateAgeById } = require('../repositories/birthdayRepository');
const { getRandomBirthdayMessage, getRandomBirthdayGif } = require('../utils/birthdayMessages');

/**
 * Job to send birthday reminders to users.
 * It checks the database for users with birthdays today and sends a reminder message
 * in the specified channels of their respective guilds.
 * It also updates the user's age by 1.
 * The job should be run daily.
 */
module.exports = async (client) => {
  const today = new Date();
  const todayStr = today.toLocaleDateString('pt-BR');

  console.log(`Checking for users birthday today: ${todayStr}`);

  try {
    const [day, month] = todayStr.split('/').slice(0, 2);
    const usersBirthdays = await findAllTodayBirthDays(day, month);

    if (!usersBirthdays.length) {
      console.log('There are no users to send birthdays reminders');
      return;
    }

    for (const userBirthday of usersBirthdays) {
      const guild = client.guilds.cache.get(userBirthday.guild_id);
      // Should not be able to send message for not found guild.
      if (!guild) {
        console.log(`Guild ${userBirthday.guild_id} not found for user ${userBirthday.user_id}, skipping...`);
        continue;
      }

      // Get specific availables channels (from the user's guild) to send messages.
      const channel = guild.channels.cache.find((chann) => {
        return process.env.BIRTHDAY_GUILDS_CHANNELS.split(',').includes(chann.id);
      });
      // Should not be able to send message for not found channel.
      if (!channel) {
        console.log(`Channel not found for user ${userBirthday.user_id} from guild ${userBirthday.guild_id}, skipping...`);
        continue;
      }

      console.log(`Sending reminder for user ${userBirthday.user_id} in channel ${channel.id} from guild ${userBirthday.guild_id}`);

      // Updates user age by 1.
      await updateAgeById(userBirthday.id, 1);

      const birthdayMessage = getRandomBirthdayMessage(userBirthday);
      const birthdayGif = getRandomBirthdayGif();

      const embed = new EmbedBuilder()
        .setDescription(birthdayMessage)
        .setImage(birthdayGif)
        .setColor('#FFD700')
        .setFooter({ text: 'Comemore seu dia! 🎈' });

      await channel.send({ embeds: [embed] });
    }
  }
  catch (err) {
    console.error(err);
  }
};
