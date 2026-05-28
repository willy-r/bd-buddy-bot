import { REST, Routes } from 'discord.js';

import { findAllTodayBirthDays, updateAgeById } from '../repositories/birthdayRepository';
import { getRandomBirthdayMessage, getRandomBirthdayGif } from '../utils/birthdayMessages';

function getChannelForGuild(guildId: string): string | undefined {
  const raw = process.env.BIRTHDAY_GUILD_CHANNELS_MAP ?? '{}';
  try {
    const map = JSON.parse(raw) as Record<string, string>;
    return map[guildId];
  }
  catch {
    console.error('Invalid BIRTHDAY_GUILD_CHANNELS_MAP — expected JSON object');
    return undefined;
  }
}

export default async function birthdayReminderJob(): Promise<void> {
  const today = new Date();
  const todayStr = today.toLocaleDateString('pt-BR');

  console.log(`Checking for users birthday today: ${todayStr}`);

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);

  try {
    const [day, month] = todayStr.split('/').slice(0, 2);
    const usersBirthdays = await findAllTodayBirthDays(day, month);

    if (!usersBirthdays.length) {
      console.log('There are no users to send birthdays reminders');
      return;
    }

    for (const userBirthday of usersBirthdays) {
      const channelId = getChannelForGuild(userBirthday.guild_id);
      if (!channelId) {
        console.log(`Channel not found for guild ${userBirthday.guild_id}, skipping user ${userBirthday.user_id}`);
        continue;
      }

      try {
        await rest.get(Routes.guildMember(userBirthday.guild_id, userBirthday.user_id));
      }
      catch {
        console.log(`User ${userBirthday.user_id} is no longer in guild ${userBirthday.guild_id}, skipping`);
        continue;
      }

      console.log(`Sending reminder for user ${userBirthday.user_id} in channel ${channelId}`);

      await updateAgeById(userBirthday.id, 1);

      const birthdayMessage = getRandomBirthdayMessage(userBirthday);
      const birthdayGif = getRandomBirthdayGif();

      await rest.post(Routes.channelMessages(channelId), {
        body: {
          embeds: [{
            description: birthdayMessage,
            image: { url: birthdayGif },
            color: 0xFFD700,
            footer: { text: 'Comemore seu dia! 🎈' },
          }],
        },
      });
    }
  }
  catch (err) {
    console.error(err);
  }
}
