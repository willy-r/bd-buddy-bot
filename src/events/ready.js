const { Events } = require('discord.js');

const Birthday = require('../models/birthday');

module.exports = {
  name: Events.ClientReady,
  once: true,

  async execute(client) {
    // Sync database.
    await Birthday.sync();
    console.log(`Ready! Logged in as ${client.user.tag}`);
  },
};
