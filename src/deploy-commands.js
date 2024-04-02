/**
 * This file will be used to register and update the slash commands for the bot application.
 * Slash commands only need to be registered once, and updated when the definition (description, options etc) is changed.
 * This script is intended to be run separately, only when needed to make changes to slash command definitions.
 *
 * This scrip uses env variables:
 *   - DISCORD_TOKEN: Application's token
 *   - DISCORD_CLIENT_ID: Application's client id
 *   - DISCORD_GUILD_ID: Server's id (optional)
 */

const fs = require('node:fs');
const path = require('node:path');

require('dotenv').config();
const { REST, Routes } = require('discord.js');

const commands = [];

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if ('data' in command && 'execute' in command) {
      commands.push(command.data.toJSON());
    }
    else {
      console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
  }
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    const clientId = process.env.DISCORD_CLIENT_ID;
    const guildId = process.env.DISCORD_GUILD_ID;
    let commandsRoute = Routes.applicationCommands(clientId);

    if (guildId) {
      commandsRoute = Routes.applicationGuildCommands(clientId, guildId);
    }

    const data = await rest.put(
      commandsRoute,
      { body: commands },
    );

    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
  }
  catch (err) {
    console.error(err);
  }
})();
