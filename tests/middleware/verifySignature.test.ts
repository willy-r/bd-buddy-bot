import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateKeyPairSync, sign, type KeyObject } from 'node:crypto';
import { verifyDiscordSignature } from '../../src/middleware/verifySignature';

const { privateKey, publicKey } = generateKeyPairSync('ed25519', {}) as {
  privateKey: KeyObject;
  publicKey: KeyObject;
};

/* Extract raw 32-byte public key from SPKI DER encoding (last 32 bytes). */
const spkiDer = publicKey.export({ type: 'spki', format: 'der' }) as Buffer;
const PUBLIC_KEY_HEX = spkiDer.subarray(spkiDer.length - 32).toString('hex');

/* Signs timestamp + body with the test private key. */
function signMessage(body: string, timestamp: string): string {
  return sign(null, Buffer.from(timestamp + body), privateKey).toString('hex');
}

function makeRequest(headers: Record<string, string>, body: string) {
  return { headers, body } as Parameters<typeof verifyDiscordSignature>[0];
}

function makeReply() {
  const reply = {
    statusCode: 200,
    _body: undefined as unknown,
    status(code: number) { this.statusCode = code; return this; },
    send(body: unknown) { this._body = body; return this; },
  };
  return reply as unknown as Parameters<typeof verifyDiscordSignature>[1];
}

beforeEach(() => {
  process.env.DISCORD_PUBLIC_KEY = PUBLIC_KEY_HEX;
});

describe('verifyDiscordSignature', () => {
  it('passes through when signature is valid', async () => {
    const timestamp = String(Math.floor(Date.now() / 1000));
    const body = '{"type":1}';
    const signature = signMessage(body, timestamp);

    const request = makeRequest({
      'x-signature-ed25519': signature,
      'x-signature-timestamp': timestamp,
    }, body);
    const reply = makeReply();

    await verifyDiscordSignature(request, reply);

    expect((reply as unknown as { statusCode: number }).statusCode).toBe(200);
  });

  it('returns 401 when signature is invalid', async () => {
    const timestamp = String(Math.floor(Date.now() / 1000));
    const body = '{"type":1}';
    const badSignature = 'a'.repeat(128);

    const request = makeRequest({
      'x-signature-ed25519': badSignature,
      'x-signature-timestamp': timestamp,
    }, body);
    const reply = makeReply();

    await verifyDiscordSignature(request, reply);

    expect((reply as unknown as { statusCode: number }).statusCode).toBe(401);
  });

  it('returns 401 when signature header is missing', async () => {
    const request = makeRequest({ 'x-signature-timestamp': '1234567890' }, '{}');
    const reply = makeReply();

    await verifyDiscordSignature(request, reply);

    expect((reply as unknown as { statusCode: number }).statusCode).toBe(401);
  });

  it('returns 401 when timestamp header is missing', async () => {
    const request = makeRequest({ 'x-signature-ed25519': 'abc123' }, '{}');
    const reply = makeReply();

    await verifyDiscordSignature(request, reply);

    expect((reply as unknown as { statusCode: number }).statusCode).toBe(401);
  });

  it('returns 401 when body is tampered after signing', async () => {
    const timestamp = String(Math.floor(Date.now() / 1000));
    const originalBody = '{"type":1}';
    const signature = signMessage(originalBody, timestamp);

    const request = makeRequest({
      'x-signature-ed25519': signature,
      'x-signature-timestamp': timestamp,
    }, '{"type":2}'); // tampered
    const reply = makeReply();

    await verifyDiscordSignature(request, reply);

    expect((reply as unknown as { statusCode: number }).statusCode).toBe(401);
  });
});
