import { webcrypto } from 'node:crypto';
import type { FastifyReply, FastifyRequest } from 'fastify';

export async function verifyDiscordSignature(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const signature = request.headers['x-signature-ed25519'];
  const timestamp = request.headers['x-signature-timestamp'];
  const body = request.body as string;

  if (typeof signature !== 'string' || typeof timestamp !== 'string') {
    reply.status(401).send({ error: 'Missing signature headers' });
    return;
  }

  const isValid = await verifyEd25519(
    process.env.DISCORD_PUBLIC_KEY!,
    signature,
    timestamp,
    body,
  );

  if (!isValid) {
    reply.status(401).send({ error: 'Invalid request signature' });
  }
}

async function verifyEd25519(
  publicKey: string,
  signature: string,
  timestamp: string,
  body: string,
): Promise<boolean> {
  try {
    const key = await webcrypto.subtle.importKey(
      'raw',
      Buffer.from(publicKey, 'hex'),
      { name: 'Ed25519', namedCurve: 'Ed25519' },
      false,
      ['verify'],
    );

    return await webcrypto.subtle.verify(
      'Ed25519',
      key,
      Buffer.from(signature, 'hex'),
      Buffer.from(timestamp + body),
    );
  }
  catch {
    return false;
  }
}
