import 'dotenv/config';
import { REST, Routes } from 'discord.js';

const rest = new REST().setToken(process.env.DISCORD_TOKEN ?? '');

(async () => {
  try {
    console.log('Started deleting all application (/) commands.');

    const clientId = process.env.DISCORD_CLIENT_ID ?? '';
    const guildId = process.env.DISCORD_GUILD_ID;
    let commandsRoute = Routes.applicationCommands(clientId);

    if (guildId) {
      commandsRoute = Routes.applicationGuildCommands(clientId, guildId);
    }

    await rest.put(commandsRoute, { body: [] });

    console.log('Successfully deleted all application (/) commands.');
  }
  catch (err) {
    console.error(err);
  }
})();
