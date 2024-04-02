const { Events } = require('discord.js');
const { CronJob } = require('cron');

const Birthday = require('../models/birthday');
const birthdayReminderJob = require('../jobs/birthdayReminderJob');

module.exports = {
  name: Events.ClientReady,
  once: true,

  async execute(client) {
    // Sync database.
    await Birthday.sync();

    // Config and start crons.
    const birthdayReminderCron = CronJob.from({
      cronTime: process.env.BIRTHDAY_REMINDER_CRON,
      onTick: async function () {
        await birthdayReminderJob(client);
      },
      timeZone: 'America/Sao_Paulo',
    });

    birthdayReminderCron.start();

    console.log(`Ready! Logged in as ${client.user.tag}`);
  },
};
