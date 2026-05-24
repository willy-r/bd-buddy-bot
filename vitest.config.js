import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    env: {
      BOT_ENV: 'test',
      DATABASE_PATH: ':memory:',
      BIRTHDAY_GUILDS_ROLES: '111,222',
      BIRTHDAY_GUILDS_CHANNELS: '333',
      BIRTHDAY_REMINDER_CRON: '* * * * *',
      DEFAULT_LIMIT: '5',
      MAX_LIMIT: '25',
      MIN_LIMIT: '1',
    },
  },
});
