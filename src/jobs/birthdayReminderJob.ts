import { EmbedBuilder } from 'discord.js';
import type { Client } from '../types';

import { findAllTodayBirthDays, updateAgeById } from '../repositories/birthdayRepository';
import { getRandomBirthdayMessage, getRandomBirthdayGif } from '../utils/birthdayMessages';

export default async function birthdayReminderJob(client: Client): Promise<void> {
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
      if (!guild) {
        console.log(`Guild ${userBirthday.guild_id} not found for user ${userBirthday.user_id}, skipping...`);
        continue;
      }

      const channel = guild.channels.cache.find((chann) => {
        return (process.env.BIRTHDAY_GUILDS_CHANNELS ?? '').split(',').includes(chann.id);
      });
      if (!channel) {
        console.log(`Channel not found for user ${userBirthday.user_id} from guild ${userBirthday.guild_id}, skipping...`);
        continue;
      }

      console.log(`Sending reminder for user ${userBirthday.user_id} in channel ${channel.id} from guild ${userBirthday.guild_id}`);

      await updateAgeById(userBirthday.id, 1);

      const birthdayMessage = getRandomBirthdayMessage(userBirthday);
      const birthdayGif = getRandomBirthdayGif();

      const embed = new EmbedBuilder()
        .setDescription(birthdayMessage)
        .setImage(birthdayGif)
        .setColor('#FFD700')
        .setFooter({ text: 'Comemore seu dia! 🎈' });

      await (channel as { send: (opts: unknown) => Promise<unknown> }).send({ embeds: [embed] });
    }
  }
  catch (err) {
    console.error(err);
  }
}
