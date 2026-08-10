import { generateCode, signToken, sendCodeEmail } from './_lib/otp.js';

/**
 * POST /api/send-code
 * body: { email: string, purpose?: 'login' | 'register' }
 *
 * Generates a one-time code, e-mails it via Resend, and returns a signed
 * token the client sends back to /api/verify-code. In demo mode (no
 * RESEND_API_KEY) the code is returned as `devCode` so the flow still works.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Método não permitido.' });
  }

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body || {};
  const email = String(body.email || '').trim();
  const purpose = body.purpose === 'register' ? 'register' : 'login';

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ ok: false, error: 'E-mail inválido.' });
  }

  const code = generateCode();
  const token = signToken(email, code, purpose);
  const mail = await sendCodeEmail(email, code, purpose);

  return res.status(200).json({
    ok: true,
    token,
    delivered: mail.sent,
    // Only exposed when real delivery is not configured (demo/dev mode).
    devCode: mail.sent ? undefined : code,
  });
}

function safeParse(s) {
  try {
    return JSON.parse(s);
  } catch {
    return {};
  }
}
