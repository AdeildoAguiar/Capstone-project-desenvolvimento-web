import crypto from 'node:crypto';

/**
 * Stateless one-time-code (OTP) helpers for a serverless environment.
 *
 * There is no database, so the code itself is never stored server-side.
 * Instead `send-code` signs a tamper-proof token that binds the e-mail,
 * an expiry and a *hash* of the code. `verify-code` re-derives the hash
 * from what the user typed and checks the signature. The plaintext code
 * only ever exists inside the e-mail we send.
 */

const AUTH_SECRET =
  process.env.AUTH_SECRET || 'dev-insecure-secret-change-me-in-production';
const CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes

/** Cryptographically-random 6-digit code, always zero-padded. */
export function generateCode() {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
}

function hashCode(email, code) {
  return crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(`${email.toLowerCase()}:${code}`)
    .digest('hex');
}

function sign(payloadB64) {
  return crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(payloadB64)
    .digest('base64url');
}

/** Build an opaque, signed token the client stores between the two steps. */
export function signToken(email, code, purpose) {
  const payload = {
    e: email.toLowerCase(),
    p: purpose || 'login',
    x: Date.now() + CODE_TTL_MS,
    h: hashCode(email, code),
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${payloadB64}.${sign(payloadB64)}`;
}

/** Returns { ok: true } or { ok: false, error } — constant-ish work either way. */
export function verifyToken(token, email, code) {
  if (typeof token !== 'string' || !token.includes('.')) {
    return { ok: false, error: 'Token inválido.' };
  }
  const [payloadB64, providedSig] = token.split('.');
  const expectedSig = sign(payloadB64);

  // Timing-safe signature check.
  const a = Buffer.from(providedSig || '', 'utf8');
  const b = Buffer.from(expectedSig, 'utf8');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return { ok: false, error: 'Token adulterado.' };
  }

  let payload;
  try {
    payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
  } catch {
    return { ok: false, error: 'Token corrompido.' };
  }

  if (Date.now() > payload.x) {
    return { ok: false, error: 'O código expirou. Solicite um novo.' };
  }
  if (payload.e !== email.toLowerCase()) {
    return { ok: false, error: 'E-mail não confere com o código.' };
  }

  const expectedHash = hashCode(email, String(code));
  const ha = Buffer.from(payload.h, 'utf8');
  const hb = Buffer.from(expectedHash, 'utf8');
  if (ha.length !== hb.length || !crypto.timingSafeEqual(ha, hb)) {
    return { ok: false, error: 'Código incorreto.' };
  }

  return { ok: true };
}

/**
 * Sends the code by e-mail through the Resend REST API.
 * Returns { sent: true } on success, or { sent: false, reason } when no
 * API key is configured (demo mode) or the provider fails.
 */
export async function sendCodeEmail(email, code, purpose) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || 'BiblioJala <onboarding@resend.dev>';

  if (!apiKey) return { sent: false, reason: 'no-api-key' };

  const title =
    purpose === 'register' ? 'Confirme seu e-mail' : 'Seu código de acesso';

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject: `${code} é o seu código BiblioJala`,
        html: emailTemplate(code, title),
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      return { sent: false, reason: `resend-${res.status}`, detail };
    }
    return { sent: true };
  } catch (err) {
    return { sent: false, reason: 'network', detail: String(err) };
  }
}

function emailTemplate(code, title) {
  return `<!doctype html>
<html lang="pt-BR"><body style="margin:0;background:#f5f2ee;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;padding:32px 16px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:460px;margin:0 auto;background:#fdfaf6;border:1px solid #e0dbd3;border-radius:20px;overflow:hidden;">
    <tr><td style="background:#1a1714;padding:28px 32px;">
      <span style="color:#f5f2ee;font-size:20px;font-weight:700;letter-spacing:-.01em;">📚 BiblioJala</span>
    </td></tr>
    <tr><td style="padding:36px 32px 32px;">
      <h1 style="margin:0 0 8px;font-size:22px;color:#1a1714;">${title}</h1>
      <p style="margin:0 0 24px;font-size:14px;line-height:1.7;color:#4a4540;">
        Use o código abaixo para continuar. Ele expira em <strong>10 minutos</strong> e só funciona uma vez.
      </p>
      <div style="text-align:center;margin:0 0 24px;">
        <span style="display:inline-block;font-size:34px;font-weight:800;letter-spacing:.35em;color:#a06c28;background:#f5e6cc;border:1px solid rgba(200,137,58,.35);border-radius:14px;padding:16px 24px 16px 34px;">${code}</span>
      </div>
      <p style="margin:0;font-size:12px;line-height:1.6;color:#8a857e;">
        Se você não solicitou este código, ignore este e-mail — sua conta continua segura.
      </p>
    </td></tr>
    <tr><td style="padding:18px 32px;border-top:1px solid #e0dbd3;">
      <p style="margin:0;font-size:11px;color:#8a857e;">Universidade Jala · Biblioteca Digital</p>
    </td></tr>
  </table>
</body></html>`;
}
