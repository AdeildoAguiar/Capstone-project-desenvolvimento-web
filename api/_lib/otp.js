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
 * Envia o código por e-mail. O provedor é escolhido pela variável de
 * ambiente presente (nesta ordem):
 *   - BREVO_API_KEY  → Brevo (NÃO precisa de domínio; só remetente verificado)
 *   - RESEND_API_KEY → Resend (precisa de domínio verificado p/ enviar a terceiros)
 *   - nenhuma        → modo demonstração (código aparece na tela)
 * Retorna { sent: true } ou { sent: false, reason }.
 */
export async function sendCodeEmail(email, code, purpose) {
  const from = process.env.EMAIL_FROM || 'BiblioJala <onboarding@resend.dev>';
  const { name: fromName, email: fromEmail } = parseFrom(from);

  const title =
    purpose === 'register' ? 'Confirme seu e-mail' : 'Verificação de acesso';
  const intro =
    purpose === 'register'
      ? 'Bem-vindo(a) à BiblioJala! Falta só um passo para ativar a sua conta. Use o código abaixo para confirmar o seu e-mail:'
      : 'Recebemos um pedido de acesso à sua conta BiblioJala. Use o código abaixo para concluir o seu login em duas etapas:';
  const subject = `${code} é o seu código de verificação — BiblioJala`;
  const html = emailTemplate(code, title, intro);

  if (process.env.BREVO_API_KEY) {
    return sendViaBrevo({ apiKey: process.env.BREVO_API_KEY, fromName, fromEmail, to: email, subject, html });
  }
  if (process.env.RESEND_API_KEY) {
    return sendViaResend({ apiKey: process.env.RESEND_API_KEY, from, to: email, subject, html });
  }
  return { sent: false, reason: 'no-api-key' };
}

/** Divide "Nome <email@dominio>" em { name, email }. */
function parseFrom(from) {
  const m = /^\s*(.*?)\s*<([^>]+)>\s*$/.exec(from);
  if (m) return { name: m[1] || 'BiblioJala', email: m[2].trim() };
  return { name: 'BiblioJala', email: from.trim() };
}

async function sendViaBrevo({ apiKey, fromName, fromEmail, to, subject, html }) {
  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { name: fromName, email: fromEmail },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      return { sent: false, reason: `brevo-${res.status}`, detail };
    }
    return { sent: true };
  } catch (err) {
    return { sent: false, reason: 'network', detail: String(err) };
  }
}

async function sendViaResend({ apiKey, from, to, subject, html }) {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to: [to], subject, html }),
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

function emailTemplate(code, title, intro) {
  const year = new Date().getFullYear();
  return `<!doctype html>
<html lang="pt-BR"><body style="margin:0;background:#f4f0e8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;padding:32px 16px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;background:#fffdf8;border:1px solid #ddd5c6;border-radius:22px;overflow:hidden;box-shadow:0 6px 18px rgba(60,42,20,.08);">
    <!-- Cabeçalho com marca (sem emoji) -->
    <tr><td style="background:linear-gradient(135deg,#e6a94f 0%,#c8893a 52%,#9c5f1c 100%);padding:26px 32px;">
      <table role="presentation" cellpadding="0" cellspacing="0"><tr>
        <td style="width:38px;height:38px;background:rgba(255,255,255,.92);border-radius:11px;text-align:center;vertical-align:middle;">
          <span style="font-size:19px;font-weight:800;color:#9c5f1c;line-height:38px;">B</span>
        </td>
        <td style="padding-left:12px;color:#fff8ee;font-size:20px;font-weight:700;letter-spacing:-.01em;">BiblioJala</td>
      </tr></table>
    </td></tr>

    <!-- Corpo -->
    <tr><td style="padding:36px 32px 8px;">
      <h1 style="margin:0 0 10px;font-size:22px;color:#201b15;">${title}</h1>
      <p style="margin:0 0 26px;font-size:14px;line-height:1.7;color:#5a5147;">${intro}</p>

      <div style="text-align:center;margin:0 0 14px;">
        <span style="display:inline-block;font-size:36px;font-weight:800;letter-spacing:.35em;color:#97591b;background:#f6e7cc;border:1px solid rgba(200,137,58,.35);border-radius:16px;padding:18px 26px 18px 36px;">${code}</span>
      </div>
      <p style="margin:0 0 26px;text-align:center;font-size:12px;color:#938a7d;">
        Este código expira em <strong style="color:#5a5147;">10 minutos</strong> e só pode ser usado uma vez.
      </p>

      <!-- Aviso de segurança -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f0e8;border-radius:12px;">
        <tr><td style="padding:14px 16px;font-size:12px;line-height:1.6;color:#5a5147;">
          <strong style="color:#201b15;">Dica de segurança:</strong> a BiblioJala nunca vai pedir esse código
          por telefone, WhatsApp ou e-mail. Se não foi você que solicitou, apenas ignore esta mensagem —
          a sua conta continua protegida.
        </td></tr>
      </table>
    </td></tr>

    <!-- Rodapé -->
    <tr><td style="padding:20px 32px;border-top:1px solid #ddd5c6;">
      <p style="margin:0;font-size:11px;color:#938a7d;line-height:1.6;">
        Universidade Jala · Biblioteca Digital<br>
        Este é um e-mail automático — por favor, não responda.<br>
        © ${year} BiblioJala. Todos os direitos reservados.
      </p>
    </td></tr>
  </table>
</body></html>`;
}
