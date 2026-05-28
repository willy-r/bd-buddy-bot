import 'dotenv/config';
import Fastify from 'fastify';

import { verifyDiscordSignature } from './middleware/verifySignature';
import { handleInteraction } from './handlers/interactions';
import birthdayReminderJob from './jobs/birthdayReminderJob';
import Birthday from './models/birthday';
import type { DiscordInteractionBody } from './types';

const app = Fastify({ logger: true });

app.addContentTypeParser(
  'application/json',
  { parseAs: 'string' },
  (_req, body, done) => done(null, body),
);

app.post('/interactions', { preHandler: verifyDiscordSignature }, async (request, reply) => {
  const body = JSON.parse(request.body as string) as DiscordInteractionBody;
  return handleInteraction(body, reply);
});

app.post('/jobs/birthday-reminder', async (request, reply) => {
  const token = request.headers['x-internal-token'];
  if (token !== process.env.INTERNAL_JOB_TOKEN) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }
  await birthdayReminderJob();
  return { ok: true };
});

app.get('/health', async () => ({ status: 'ok' }));

async function start(): Promise<void> {
  await Birthday.sync();
  await app.listen({ port: 3000, host: '0.0.0.0' });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
