const { findAllTodayBirthDays, updateAgeById } = require('../repositories/birthdayRepository');

module.exports = async (client) => {
  const today = new Date();
  const todayStr = today.toLocaleDateString('pt-BR');

  console.log(`Checking for users birthday today: ${todayStr}`);

  try {
    const [day, month] = todayStr.split('/').slice(0, 2);
    const users = await findAllTodayBirthDays(day, month);

    if (!users.length) {
      console.log('There are no users to send birthdays reminders 😥');
      return;
    }

    for (const user of users) {
      const guild = client.guilds.cache.get(user.guild_id);
      // Should not be able to send message for not found guild.
      if (!guild) {
        console.log(`Guild ${user.guild_id} not found for user ${user.user_id}, skipping...`);
        continue;
      }

      // Get specific availables channels (from the user's guild) to send messages.
      const channel = guild.channels.cache.find((chann) => {
        return process.env.BIRTHDAY_GUILDS_CHANNELS.split(',').includes(chann.id);
      });
      // Should not be able to send message for not found channel.
      if (!channel) {
        console.log(`Channel not found for user ${user.user_id} from guild ${user.guild_id}, skipping...`);
        continue;
      }

      console.log(`Sending reminder for user ${user.user_id} in channel ${channel.id} from guild ${user.guild_id}`);

      let birthdayMessage = `🎉 Happy Birthday, <@${user.user_id}>! 🎂`;
      if (user.show_age) {
        birthdayMessage = `🎉 Happy Birthday for your ${user.age + 1} years old, <@${user.user_id}>! 🎂`;
      }

      // Updates user age by 1.
      await updateAgeById(user.id, 1);

      channel.send(birthdayMessage);
    }
  }
  catch (err) {
    console.error(err);
  }
};
