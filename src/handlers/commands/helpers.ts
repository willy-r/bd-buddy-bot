import type { DiscordInteractionBody, DiscordInteractionResponse, InteractionResponseType } from '../../types';

export function hasRequiredRole(body: DiscordInteractionBody): boolean {
  const memberRoles: string[] = body.member?.roles ?? [];
  const allowedRoles = (process.env.BIRTHDAY_GUILDS_ROLES ?? '').split(',').filter(Boolean);
  return memberRoles.some((roleId) => allowedRoles.includes(roleId));
}

export function getStringOption(body: DiscordInteractionBody, name: string): string | undefined {
  return body.data?.options?.find((o) => o.name === name)?.value as string | undefined;
}

export function getBooleanOption(body: DiscordInteractionBody, name: string): boolean | undefined {
  return body.data?.options?.find((o) => o.name === name)?.value as boolean | undefined;
}

export function getIntegerOption(body: DiscordInteractionBody, name: string): number | undefined {
  return body.data?.options?.find((o) => o.name === name)?.value as number | undefined;
}

export function textResponse(
  type: InteractionResponseType,
  content: string,
): DiscordInteractionResponse {
  return { type, data: { content } };
}
