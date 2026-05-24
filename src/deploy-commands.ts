import fs from 'node:fs';
import path from 'node:path';

import 'dotenv/config';
import { REST, Routes } from 'discord.js';

import type { Command } from './types';

const commands: ReturnType<Command['data']['toJSON']>[] = [];

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require(filePath);
    const command: Partial<Command> = mod.default ?? mod;

    if (command.data && command.execute) {
      commands.push(command.data.toJSON());
    }
    else {
      console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
  }
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN ?? '');

(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    const clientId = process.env.DISCORD_CLIENT_ID ?? '';
    const guildId = process.env.DISCORD_GUILD_ID;
    let commandsRoute = Routes.applicationCommands(clientId);

    if (guildId) {
      commandsRoute = Routes.applicationGuildCommands(clientId, guildId);
    }

    const data = await rest.put(commandsRoute, { body: commands }) as unknown[];

    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
  }
  catch (err) {
    console.error(err);
  }
})();
