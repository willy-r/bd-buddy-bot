# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Node is managed via **nvm**. Prefix all commands with the nvm bin path:

```bash
export PATH="$HOME/.nvm/versions/node/v22.15.0/bin:$PATH"
```

```bash
pnpm start                # Run the bot
pnpm lint                 # ESLint check
pnpm run commands:deploy  # Register/update slash commands with Discord API
pnpm run commands:delete  # Remove all slash commands from Discord API
```

`commands:deploy` must be run whenever a command's `data` definition changes (name, description, options). It is a no-op for logic-only changes. With `DISCORD_GUILD_ID` set, deploys to that guild only (instant); without it, deploys globally (up to 1 hour to propagate).

No test suite exists — `pnpm test` exits 1.

## Environment Variables

Copy `.env.example` to `.env`. Key variables:

| Variable                                    | Purpose                                                              |
| ------------------------------------------- | -------------------------------------------------------------------- |
| `BOT_ENV`                                   | `dev` enables Sequelize SQL logging                                  |
| `DATABASE_PATH`                             | SQLite file path (e.g. `db.dev.sqlite3`)                             |
| `DISCORD_TOKEN`                             | Bot token from Discord Developer Portal                              |
| `DISCORD_CLIENT_ID`                         | Application ID                                                       |
| `DISCORD_GUILD_ID`                          | Server ID — scopes command deployment to one guild; omit for global  |
| `BIRTHDAY_GUILDS_ROLES`                     | Comma-separated role IDs; users need one to run `/add`               |
| `BIRTHDAY_GUILDS_CHANNELS`                  | Comma-separated channel IDs where birthday messages are sent         |
| `BIRTHDAY_REMINDER_CRON`                    | Cron expression for the reminder job (timezone: `America/Sao_Paulo`) |
| `DEFAULT_LIMIT` / `MAX_LIMIT` / `MIN_LIMIT` | Pagination bounds for `/next`                                        |

## Architecture

The bot uses **Discord.js v14** with a file-system-driven loader pattern. `bot.js` auto-discovers commands and events at startup — no central registry to update when adding files.

### Request flow

1. Discord sends an interaction → `events/interactionCreate.js` routes it to the matching command in `client.commands` (a `Collection` keyed by command name).
2. Each command in `src/commands/birthday/` validates input via **Zod** (`src/validators/`), then calls the repository layer.
3. The repository (`src/repositories/birthdayRepository.js`) is the only layer that touches Sequelize/SQLite. Raw SQL is used only for `findNextBirthdaysByGuild` (SQLite `STRFTIME` ordering).

### Background job

`events/ready.js` starts a `CronJob` on login. `src/jobs/birthdayReminderJob.js` queries for today's birthdays, sends an embed to the matching guild channel (resolved from `BIRTHDAY_GUILDS_CHANNELS`), and increments the stored `age` field by 1.

### Adding a new command

1. Create `src/commands/<folder>/<name>.js` exporting `{ data: SlashCommandBuilder, execute(interaction) }`.
2. Run `pnpm run commands:deploy` — the loader picks it up automatically.

### Deployment

Deployed to **Fly.io** (`fly.toml`, region `gru`). The SQLite database is persisted on a mounted volume at `/usr/data`. `DATABASE_PATH` in production should point inside that mount. CI/CD is defined in `.github/workflows/fly.yml`.

## Code Conventions

- 2-space indentation, single quotes, trailing commas (enforced by ESLint).
- No inline comments (`no-inline-comments` rule is on) — use block comments when needed.
- User-facing strings are in **Brazilian Portuguese**; internal logs are in English.
- The unique constraint on `(user_id, guild_id)` is the guard against duplicate birthday registrations — do not add application-level duplication checks.
