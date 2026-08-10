import { verifyToken } from './_lib/otp.js';

/**
 * POST /api/verify-code
 * body: { email: string, code: string, token: string }
 * Verifies the code against the signed token issued by /api/send-code.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Método não permitido.' });
  }

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body || {};
  const email = String(body.email || '').trim();
  const code = String(body.code || '').trim();
  const token = String(body.token || '');

  if (!email || !code || !token) {
    return res.status(400).json({ ok: false, error: 'Dados incompletos.' });
  }

  const result = verifyToken(token, email, code);
  return res.status(result.ok ? 200 : 400).json(result);
}

function safeParse(s) {
  try {
    return JSON.parse(s);
  } catch {
    return {};
  }
}
