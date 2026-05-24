import type { Collection, ChatInputCommandInteraction, Client, SharedSlashCommand } from 'discord.js';

export interface Command {
  data: SharedSlashCommand;
  execute(interaction: ChatInputCommandInteraction): Promise<void>;
}

export interface DiscordEvent {
  name: string;
  once?: boolean;
  execute(...args: unknown[]): Promise<void>;
}

export interface BirthdayData {
  user_id: string;
  guild_id: string;
  username: string;
  guild_name: string;
  birthdate: Date;
  show_age: boolean;
  age?: number | null;
}

declare module 'discord.js' {
  interface Client {
    commands: Collection<string, Command>;
  }
}

export type { Client };
