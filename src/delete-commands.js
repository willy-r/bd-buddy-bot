/**
 * This file will be used to delete all slash commands for all servers from the bot application.
 * This script is intended to be run separately, only when needed to make some kind of reset in slash commands.
 *
 * This scrip uses env variables:
 *   - DISCORD_TOKEN: Application's token
 *   - DISCORD_CLIENT_ID: Applicatio's client id
 */

require('dotenv').config();
const { REST, Routes } = require('discord.js');

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('Started deleting all application (/) commands.');

    const clientId = process.env.DISCORD_CLIENT_ID;
    const guildId = process.env.DISCORD_GUILD_ID;
    let commandsRoute = Routes.applicationCommands(clientId);

    if (guildId) {
      commandsRoute = Routes.applicationGuildCommands(clientId, guildId);
    }

    await rest.put(
      commandsRoute,
      { body: [] },
    );

    console.log('Successfully deleted all application (/) commands.');
  }
  catch (err) {
    console.error(err);
  }
})();
