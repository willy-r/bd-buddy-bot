import type { DiscordInteractionBody, DiscordInteractionResponse, InteractionResponseType } from '../../types';

export function hasRequiredRole(body: DiscordInteractionBody): boolean {
  const memberRoles: string[] = body.member?.roles ?? [];
  let rolesMap: Record<string, string> = {};
  try {
    rolesMap = JSON.parse(process.env.BIRTHDAY_GUILD_ROLES_MAP ?? '{}') as Record<string, string>;
  }
  catch {
    return false;
  }
  const requiredRole = rolesMap[body.guild_id ?? ''];
  if (!requiredRole) return false;
  return memberRoles.includes(requiredRole);
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
