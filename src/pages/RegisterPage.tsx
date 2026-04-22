import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type Step = 'info' | 'verify' | 'done';
function fmtPhone(raw: string) {
  const d = raw.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2)  return d;
  if (d.length <= 7)  return `(${d.slice(0,2)}) ${d.slice(2)}`;
  if (d.length <= 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
  return d;
}

export default function RegisterPage() {
  const { register, sendVerificationCode } = useAuth();
  const navigate = useNavigate();
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [phone, setPhone]       = useState('');
  const [password, setPw]       = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [step1Error, setS1Err]  = useState('');
  const [step, setStep]         = useState<Step>('info');
  const [sentCode, setSentCode] = useState('');
  const [codeDigits, setDigits] = useState(['', '', '', '', '', '']);
  const [codeError, setCodeErr] = useState(false);
  const [timer, setTimer]       = useState(0);
  const [loading, setLoading]   = useState(false);
  const inputRefs               = useRef<(HTMLInputElement | null)[]>([]);
  useEffect(() => {
    if (timer <= 0) return;
    const id = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer]);
  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setS1Err('');

    if (!name.trim())     { setS1Err('Informe seu nome completo.'); return; }
    if (!email.includes('@')) { setS1Err('Informe um e-mail válido.'); return; }
    if (phone.replace(/\D/g,'').length < 10) {
      setS1Err('Informe um número de telefone válido (mínimo 10 dígitos).'); return;
    }
    if (password.length < 6) { setS1Err('A senha deve ter pelo menos 6 caracteres.'); return; }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    const code = sendVerificationCode(email);
    setSentCode(code);
    setStep('verify');
    setTimer(60);
    setLoading(false);
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  }
  function handleDigit(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...codeDigits];
    next[index] = digit;
    setDigits(next);
    setCodeErr(false);
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !codeDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = [...codeDigits];
    for (let i = 0; i < 6; i++) next[i] = pasted[i] ?? '';
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  }
  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    const entered = codeDigits.join('');
    if (entered.length < 6) { setCodeErr(true); return; }

    if (entered !== sentCode) {
      setCodeErr(true);
      setDigits(['', '', '', '', '', '']);
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const result = register({
      name,
      email,
      phone: phone.replace(/\D/g, ''),
      password,
    });
    setLoading(false);

    if (!result.ok) {
      setS1Err(result.error ?? 'Erro ao criar conta.');
      setStep('info');
      return;
    }
    setStep('done');
    setTimeout(() => navigate('/'), 2200);
  }

  function handleResend() {
    const code = sendVerificationCode(email);
    setSentCode(code);
    setTimer(60);
    setDigits(['', '', '', '', '', '']);
    setCodeErr(false);
    setTimeout(() => inputRefs.current[0]?.focus(), 50);
  }
  const steps = [
    { key: 'info',   label: 'Dados' },
    { key: 'verify', label: 'Verificar' },
    { key: 'done',   label: 'Pronto' },
  ];
  const stepIdx = step === 'info' ? 0 : step === 'verify' ? 1 : 2;

  return (
    <div className="auth-page">
      {}
      <div className="auth-panel">
        <div className="auth-panel__brand">
          <div className="auth-panel__brand-icon">📚</div>
          BiblioJala
        </div>

        <div className="auth-panel__content">
          <h2 className="auth-panel__title">
            Comece sua<br /><em>jornada literária.</em>
          </h2>
          <p className="auth-panel__desc">
            Crie sua conta gratuitamente e tenha acesso imediato ao acervo
            completo da Universidade Jala.
          </p>
        </div>

        <ul className="auth-panel__features">
          {[
            'Cadastro simples e rápido',
            'Verificação por e-mail segura',
            'Telefone para recuperar sua conta',
            'Acesso imediato após cadastro',
          ].map((f) => (
            <li key={f} className="auth-panel__feature">
              <span className="auth-panel__feature-dot" />
              {f}
            </li>
          ))}
        </ul>
      </div>

      {}
      <div className="auth-form-area">
        <div className="auth-form-box">

          {}
          <div className="auth-steps">
            {steps.map((s, i) => (
              <>
                <div
                  key={s.key}
                  className={`auth-step ${i < stepIdx ? 'auth-step--done' : i === stepIdx ? 'auth-step--active' : ''}`}
                >
                  <div className="auth-step__dot">
                    {i < stepIdx ? '✓' : i + 1}
                  </div>
                  <span>{s.label}</span>
                </div>
                {i < steps.length - 1 && <div key={`line-${i}`} className="auth-step-line" />}
              </>
            ))}
          </div>

          {}
          {step === 'info' && (
            <>
              <p className="auth-form-box__eyebrow">Passo 1 de 2</p>
              <h1 className="auth-form-box__title">Criar conta</h1>
              <p className="auth-form-box__sub">
                Já tem conta?{' '}
                <Link to="/login" style={{ color: 'var(--amber-dark)', fontWeight: 600 }}>
                  Entrar
                </Link>
              </p>

              {step1Error && (
                <div className="auth-error"><span>⚠️</span> {step1Error}</div>
              )}

              <form onSubmit={handleSendCode} noValidate>
                {}
                <div className="auth-field">
                  <label className="auth-label" htmlFor="reg-name">Nome completo</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon">👤</span>
                    <input
                      id="reg-name"
                      className="auth-input"
                      type="text"
                      placeholder="Seu nome"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                      required
                    />
                  </div>
                </div>

                {}
                <div className="auth-field">
                  <label className="auth-label" htmlFor="reg-email">E-mail</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon">✉️</span>
                    <input
                      id="reg-email"
                      className="auth-input"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </div>
                  <p className="auth-input-hint">
                    Enviaremos um código de verificação para este e-mail.
                  </p>
                </div>

                {}
                <div className="auth-field">
                  <label className="auth-label" htmlFor="reg-phone">
                    Celular
                  </label>
                  <div className="auth-phone-row">
                    <div className="auth-phone-prefix">🇧🇷 +55</div>
                    <input
                      id="reg-phone"
                      className="auth-phone-input"
                      type="tel"
                      placeholder="(99) 99999-9999"
                      value={phone}
                      onChange={(e) => setPhone(fmtPhone(e.target.value))}
                      autoComplete="tel"
                      inputMode="numeric"
                      required
                    />
                  </div>
                  <p className="auth-input-hint auth-input-hint--fake">
                    💡 Pode usar um número fictício — ex: (11) 99999-0000
                  </p>
                </div>

                {}
                <div className="auth-field">
                  <label className="auth-label" htmlFor="reg-pw">Senha</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon">🔑</span>
                    <input
                      id="reg-pw"
                      className="auth-input"
                      type={showPw ? 'text' : 'password'}
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPw(e.target.value)}
                      autoComplete="new-password"
                      required
                      style={{ paddingRight: '3rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      aria-label={showPw ? 'Ocultar senha' : 'Mostrar senha'}
                      style={{
                        position: 'absolute', right: '.85rem', top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: '.9rem', color: 'var(--ink-3)',
                      }}
                    >
                      {showPw ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <button type="submit" className="auth-submit" disabled={loading}>
                  {loading ? 'Enviando código…' : 'Continuar → Verificar e-mail'}
                </button>
              </form>
            </>
          )}

          {}
          {step === 'verify' && (
            <>
              <p className="auth-form-box__eyebrow">Passo 2 de 2</p>
              <h1 className="auth-form-box__title">Verifique seu e-mail</h1>
              <p className="auth-form-box__sub">
                Insira o código de 6 dígitos enviado para <strong>{email}</strong>
              </p>

              {}
              <div className="verify-info">
                <strong>📨 E-mail enviado!</strong> Em um sistema real, o código
                chegaria na sua caixa de entrada. Para este demo, o código é:
                <div className="verify-code-reveal">{sentCode}</div>
              </div>

              <form onSubmit={handleVerify} noValidate>
                <div className="code-inputs" onPaste={handlePaste}>
                  {codeDigits.map((d, i) => (
                    <input
                      key={i}
                      ref={(el) => { inputRefs.current[i] = el; }}
                      className={`code-input${d ? ' code-input--filled' : ''}${codeError ? ' code-input--error' : ''}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={d}
                      onChange={(e) => handleDigit(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      aria-label={`Dígito ${i + 1} do código`}
                    />
                  ))}
                </div>

                {codeError && (
                  <div className="auth-error" style={{ justifyContent: 'center' }}>
                    <span>❌</span> Código incorreto. Tente novamente.
                  </div>
                )}

                <div style={{ textAlign: 'center', margin: '.5rem 0 1rem', fontSize: '.82rem', color: 'var(--ink-3)' }}>
                  {timer > 0 ? (
                    <span className="resend-timer">Reenviar em {timer}s</span>
                  ) : (
                    <button type="button" className="resend-btn" onClick={handleResend}>
                      Reenviar código
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  className="auth-submit"
                  disabled={loading || codeDigits.join('').length < 6}
                >
                  {loading ? 'Verificando…' : 'Criar minha conta →'}
                </button>

                <div className="auth-switch" style={{ marginTop: '.85rem' }}>
                  <button type="button" onClick={() => setStep('info')}>
                    ← Voltar e editar dados
                  </button>
                </div>
              </form>
            </>
          )}

          {}
          {step === 'done' && (
            <div className="auth-success">
              <span className="auth-success__icon">🎉</span>
              <h2 className="auth-success__title">Conta criada!</h2>
              <p className="auth-success__text">
                Bem-vindo(a) ao BiblioJala, <strong>{name.split(' ')[0]}</strong>!<br />
                Redirecionando para o catálogo…
              </p>
              <div style={{ marginTop: '1.5rem' }}>
                <div className="spinner" style={{ margin: '0 auto' }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
