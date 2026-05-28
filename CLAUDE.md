# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Node is managed via **nvm**. Prefix all commands with the nvm bin path:

```bash
export PATH="$HOME/.nvm/versions/node/v22.15.0/bin:$PATH"
```

```bash
pnpm start                # Run the HTTP server (via tsx)
pnpm typecheck            # TypeScript type check (tsc --noEmit)
pnpm lint                 # ESLint check
pnpm test                 # Run all tests once
pnpm test:watch           # Run tests in watch mode
pnpm run commands:deploy  # Register/update slash commands with Discord API
pnpm run commands:delete  # Remove all slash commands from Discord API
```

`commands:deploy` must be run whenever a command's `data` definition changes (name, description, options). It is a no-op for logic-only changes. With `DISCORD_GUILD_ID` set, deploys to that guild only (instant); without it, deploys globally (up to 1 hour to propagate).

## Environment Variables

Copy `.env.example` to `.env`. Key variables:

| Variable                                    | Purpose                                                                    |
| ------------------------------------------- | -------------------------------------------------------------------------- |
| `BOT_ENV`                                   | `dev` enables Sequelize SQL logging                                        |
| `DATABASE_PATH`                             | SQLite file path (e.g. `db.dev.sqlite3`)                                   |
| `DISCORD_TOKEN`                             | Bot token from Discord Developer Portal                                    |
| `DISCORD_CLIENT_ID`                         | Application ID (only needed for `commands:deploy`)                         |
| `DISCORD_PUBLIC_KEY`                        | Ed25519 public key — used to verify every incoming interaction request     |
| `DISCORD_GUILD_ID`                          | Server ID — scopes command deployment to one guild; omit for global        |
| `BIRTHDAY_GUILDS_ROLES`                     | Comma-separated role IDs; users need one to run any birthday command       |
| `BIRTHDAY_GUILD_CHANNELS_MAP`               | JSON map `{"guild_id":"channel_id"}` for birthday announcement channels    |
| `INTERNAL_JOB_TOKEN`                        | Secret token that authenticates the `/jobs/birthday-reminder` HTTP route   |
| `DEFAULT_LIMIT` / `MAX_LIMIT` / `MIN_LIMIT` | Pagination bounds for `/next` (defaults: 5 / 25 / 1)                      |

## Architecture

The bot is written in **TypeScript** and runs as an **HTTP server** (Fastify) on port 3000. It uses Discord's HTTP Interactions endpoint instead of a persistent WebSocket gateway — the machine can sleep when idle (Fly.io `auto_stop_machines`).

### Request flow

1. Discord sends a POST to `/interactions` → `src/server.ts` validates the Ed25519 signature via `src/middleware/verifySignature.ts`.
2. `src/handlers/interactions.ts` routes the interaction to the matching handler in `src/handlers/commands/`.
3. Each handler validates input via **Zod** (`src/validators/`), calls the repository layer, and returns a `DiscordInteractionResponse` object.
4. The repository (`src/repositories/birthdayRepository.ts`) is the only layer that touches Sequelize/SQLite.

### Background job

`src/jobs/birthdayReminderJob.ts` runs when GitHub Actions calls `POST /jobs/birthday-reminder` (authenticated via `INTERNAL_JOB_TOKEN`). It queries for today's birthdays, sends an embed to the matching guild channel via **discord.js REST** (no gateway), and increments the stored `age` field by 1.

The cron schedule is defined in `.github/workflows/birthday-reminder.yml` (`0 11 * * *` UTC = 8h Brasília).

### Local development with tunnel

Discord requires a public HTTPS URL to deliver interactions. For local dev:

```bash
ngrok http 3000
# Then set Interactions Endpoint URL in the Developer Portal to https://<ngrok-url>/interactions
```

### Shared types

`src/types.ts` contains `BirthdayData`, the Discord HTTP interaction types (`DiscordInteractionBody`, `DiscordInteractionResponse`, etc.), and the `InteractionType` / `InteractionResponseType` enums.

### Adding a new command

1. Create `src/handlers/commands/<name>.ts` exporting:
   - `export const data` — a `SlashCommandBuilder` instance (used by `commands:deploy`)
   - `export async function handle<Name>(body: DiscordInteractionBody): Promise<DiscordInteractionResponse>`
2. Register the handler in `src/handlers/interactions.ts` (add a `case` to the switch).
3. Run `pnpm run commands:deploy` to register the new command with Discord.

## Code Conventions

- 2-space indentation, single quotes, trailing commas (enforced by ESLint).
- No inline comments (`no-inline-comments` rule is on) — use block comments when needed.
- User-facing strings are in **Brazilian Portuguese**; internal logs are in English.
- The unique constraint on `(user_id, guild_id)` is the guard against duplicate birthday registrations — do not add application-level duplication checks.

## Deployment

Deployed to **Fly.io** (`fly.toml`, region `gru`). The SQLite database is persisted on a mounted volume at `/usr/data`. `DATABASE_PATH` in production should point inside that mount. The machine uses `auto_stop_machines = "stop"` — it sleeps when idle and wakes on incoming requests.

CI/CD is defined in `.github/workflows/fly.yml` (deploy on push to main) and `.github/workflows/birthday-reminder.yml` (daily cron).
