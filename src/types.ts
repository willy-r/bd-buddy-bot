export interface BirthdayData {
  user_id: string;
  guild_id: string;
  username: string;
  guild_name: string;
  birthdate: Date;
  show_age: boolean;
  age?: number | null;
}

export enum InteractionType {
  PING = 1,
  APPLICATION_COMMAND = 2,
  MESSAGE_COMPONENT = 3,
  APPLICATION_COMMAND_AUTOCOMPLETE = 4,
  MODAL_SUBMIT = 5,
}

export enum InteractionResponseType {
  PONG = 1,
  CHANNEL_MESSAGE_WITH_SOURCE = 4,
  DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE = 5,
  DEFERRED_UPDATE_MESSAGE = 6,
  UPDATE_MESSAGE = 7,
}

export interface DiscordInteractionOption {
  name: string;
  type: number;
  value?: string | number | boolean;
}

export interface DiscordMember {
  user: {
    id: string;
    username: string;
    global_name?: string;
  };
  roles: string[];
}

export interface DiscordInteractionBody {
  type: InteractionType;
  id: string;
  token: string;
  guild_id?: string;
  channel_id?: string;
  member?: DiscordMember;
  data?: {
    id: string;
    name: string;
    type: number;
    options?: DiscordInteractionOption[];
  };
}

export interface DiscordEmbed {
  description?: string;
  title?: string;
  image?: { url: string };
  color?: number;
  footer?: { text: string };
}

export interface DiscordInteractionResponseData {
  content?: string;
  embeds?: DiscordEmbed[];
  flags?: number;
}

export interface DiscordInteractionResponse {
  type: InteractionResponseType;
  data?: DiscordInteractionResponseData;
}
