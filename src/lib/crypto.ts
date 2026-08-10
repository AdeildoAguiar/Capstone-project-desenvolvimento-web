/**
 * Password hashing with the Web Crypto API (PBKDF2 / SHA-256).
 *
 * We never store plaintext passwords. Each password gets a random salt and
 * 150k PBKDF2 iterations; the stored string is `pbkdf2$<iters>$<salt>$<hash>`
 * (salt and hash base64). Verification is timing-safe via constant-length
 * comparison of the derived bytes.
 *
 * Note: client-side hashing protects data at rest in localStorage for this
 * demo. A production system would hash server-side too.
 */

const ITERATIONS = 150_000;
const KEY_LEN = 32; // bytes

function toB64(bytes: Uint8Array): string {
  let s = '';
  bytes.forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s);
}

function fromB64(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function derive(
  password: string,
  salt: Uint8Array,
  iterations: number
): Promise<Uint8Array> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations, hash: 'SHA-256' },
    keyMaterial,
    KEY_LEN * 8
  );
  return new Uint8Array(bits);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derive(password, salt, ITERATIONS);
  return `pbkdf2$${ITERATIONS}$${toB64(salt)}$${toB64(hash)}`;
}

export async function verifyPassword(
  password: string,
  stored: string
): Promise<boolean> {
  try {
    const [scheme, iterStr, saltB64, hashB64] = stored.split('$');
    if (scheme !== 'pbkdf2') return false;
    const iterations = parseInt(iterStr, 10);
    const salt = fromB64(saltB64);
    const expected = fromB64(hashB64);
    const actual = await derive(password, salt, iterations);
    if (actual.length !== expected.length) return false;
    let diff = 0;
    for (let i = 0; i < actual.length; i++) diff |= actual[i] ^ expected[i];
    return diff === 0;
  } catch {
    return false;
  }
}

/** True for legacy plaintext records so we can transparently upgrade them. */
export function isLegacyPlaintext(stored: string): boolean {
  return !stored.startsWith('pbkdf2$');
}
