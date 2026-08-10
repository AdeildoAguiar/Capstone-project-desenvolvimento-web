/**
 * Client for the e-mail OTP flow.
 *
 * Primary path: the serverless functions in /api (real e-mail via Resend).
 * Fallback path: when the API is unreachable — e.g. `vite dev` with no
 * `vercel dev`, or a static host without functions — we generate and verify
 * the code locally so the UX keeps working. The fallback is clearly flagged
 * as demo mode to the UI.
 */

export type OtpPurpose = 'login' | 'register';

export interface SendCodeResult {
  token: string;
  /** True when a real e-mail was actually delivered by the server. */
  delivered: boolean;
  /** Present only in demo mode — the UI reveals it on screen. */
  devCode?: string;
  /** Which path handled the request. */
  mode: 'server' | 'local';
}

const LOCAL_PREFIX = 'local:'; // token marker for the local fallback

function randomCode(): string {
  return String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0');
}

export async function sendCode(
  email: string,
  purpose: OtpPurpose = 'login'
): Promise<SendCodeResult> {
  try {
    const res = await fetch('/api/send-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, purpose }),
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const data = await res.json();
    if (!data?.token) throw new Error('malformed response');
    return {
      token: data.token,
      delivered: Boolean(data.delivered),
      devCode: data.devCode,
      mode: 'server',
    };
  } catch {
    // ── Local demo fallback ───────────────────────────────────────────
    const code = randomCode();
    const token = `${LOCAL_PREFIX}${btoa(`${email.toLowerCase()}:${code}:${Date.now() + 600000}`)}`;
    return { token, delivered: false, devCode: code, mode: 'local' };
  }
}

export async function verifyCode(
  email: string,
  code: string,
  token: string
): Promise<{ ok: boolean; error?: string }> {
  // Local fallback tokens are verified in the browser.
  if (token.startsWith(LOCAL_PREFIX)) {
    try {
      const [e, c, x] = atob(token.slice(LOCAL_PREFIX.length)).split(':');
      if (Date.now() > Number(x)) return { ok: false, error: 'O código expirou.' };
      if (e !== email.toLowerCase()) return { ok: false, error: 'E-mail não confere.' };
      if (c !== code.trim()) return { ok: false, error: 'Código incorreto.' };
      return { ok: true };
    } catch {
      return { ok: false, error: 'Token inválido.' };
    }
  }

  try {
    const res = await fetch('/api/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, token }),
    });
    const data = await res.json().catch(() => ({}));
    return { ok: Boolean(data.ok), error: data.error };
  } catch {
    return { ok: false, error: 'Falha de conexão ao verificar o código.' };
  }
}
