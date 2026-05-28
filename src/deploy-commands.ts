import fs from 'node:fs';
import path from 'node:path';

import 'dotenv/config';
import { REST, Routes, type SharedSlashCommand } from 'discord.js';

const commands: ReturnType<SharedSlashCommand['toJSON']>[] = [];

const commandsPath = path.join(__dirname, 'handlers', 'commands');
const commandFiles = fs.readdirSync(commandsPath)
  .filter((file) => file.endsWith('.ts') && file !== 'helpers.ts');

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require(filePath);
  if (mod.data) {
    commands.push((mod.data as SharedSlashCommand).toJSON());
  }
  else {
    console.log(`[WARNING] ${filePath} is missing a "data" export.`);
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
