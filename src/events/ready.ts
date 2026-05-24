import { Events, Client } from 'discord.js';
import { CronJob } from 'cron';
import type { DiscordEvent } from '../types';

import Birthday from '../models/birthday';
import birthdayReminderJob from '../jobs/birthdayReminderJob';

const event: DiscordEvent = {
  name: Events.ClientReady,
  once: true,

  async execute(client: Client) {
    await Birthday.sync();

    const birthdayReminderCron = CronJob.from({
      cronTime: process.env.BIRTHDAY_REMINDER_CRON ?? '0 8 * * *',
      onTick: async function () {
        await birthdayReminderJob(client);
      },
      timeZone: 'America/Sao_Paulo',
    });

    birthdayReminderCron.start();

    console.log(`Ready! Logged in as ${client.user?.tag}`);
  },
};

export default event;
