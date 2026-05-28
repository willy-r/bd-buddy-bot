# Birthday Buddy Discord Bot

<p align="center">
  <img height="200" src="./assets/images/buddy.jpeg">
</p>

Hey there! I'm Birthday Buddy – your ultimate party pal here on Discord! 🎉

**Birthday Buddy Bot** is a Discord bot built with [Discord.js](https://github.com/discordjs/guide) to remind users of birthdays. Never miss a friend's special day again with Birthday Buddy Bot!


## Features

- 🎈 **Personalized Reminders**: Daily birthday messages sent automatically to the configured channel.
- 🎂 **Interactive Commands**: Add, show, remove and list birthdays using slash commands.


## Commands

- **`/add`**: Add your birthday to Buddy's memory.
- **`/show`**: Show how long until your next birthday.
- **`/remove`**: Remove your birthday from Buddy's memory.
- **`/next`**: List the next upcoming birthdays in the server.


## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/willy-r/bd-buddy-bot.git
cd bd-buddy-bot
pnpm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable | Where to find |
|---|---|
| `DISCORD_TOKEN` | Developer Portal → Bot → Token |
| `DISCORD_CLIENT_ID` | Developer Portal → General Information → Application ID |
| `DISCORD_PUBLIC_KEY` | Developer Portal → General Information → Public Key |
| `DISCORD_GUILD_ID` | Right-click your server → Copy Server ID |
| `BIRTHDAY_GUILDS_ROLES` | Server Settings → Roles → Copy Role ID |
| `BIRTHDAY_GUILD_CHANNELS_MAP` | `{"SERVER_ID":"CHANNEL_ID"}` |
| `INTERNAL_JOB_TOKEN` | Any random string (e.g. `node -e "console.log(require('crypto').randomUUID())"`) |

### 3. Register slash commands

```bash
pnpm commands:deploy
```

### 4. Run locally

```bash
pnpm start
```

The bot runs as an HTTP server on port 3000. To receive interactions from Discord locally, expose it with a tunnel:

```bash
ngrok http 3000
```

Then set the **Interactions Endpoint URL** in the Discord Developer Portal to `https://<your-ngrok-url>/interactions`.

### Running tests

```bash
pnpm test        # run once
pnpm test:watch  # watch mode
```


## How to Contribute

1. Open an issue describing the bug or feature request.
2. Fork the repository and create a branch:
   ```bash
   git checkout -b {type}/issue-{number}-{description}
   ```
3. Make your changes and open a pull request referencing the issue.


## Created By

**Birthday Buddy Bot** was created by [William Rodrigues](https://www.linkedin.com/in/william-rodrigues-dev/).
