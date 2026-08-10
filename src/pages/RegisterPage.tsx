import { useState, useEffect, Fragment } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sendCode, verifyCode, SendCodeResult } from '../lib/authApi';
import CodeInput from '../components/CodeInput';
import { LogoMark } from '../components/Logo';
import Icon from '../components/Icon';

type Step = 'info' | 'verify' | 'done';

function fmtPhone(raw: string) {
  const d = raw.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

const FEATURES = [
  'Verificação real por e-mail',
  'Senha protegida com hash seguro',
  'Cadastro simples e rápido',
  'Acesso imediato após confirmar',
];

export default function RegisterPage() {
  const { register, emailExists } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [step1Error, setS1Err] = useState('');
  const [step, setStep] = useState<Step>('info');
  const [loading, setLoading] = useState(false);

  const [otp, setOtp] = useState<SendCodeResult | null>(null);
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [codeError, setCodeErr] = useState('');
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (timer <= 0) return;
    const id = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer]);

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setS1Err('');
    if (!name.trim()) { setS1Err('Informe seu nome completo.'); return; }
    if (!email.includes('@')) { setS1Err('Informe um e-mail válido.'); return; }
    if (phone.replace(/\D/g, '').length < 10) {
      setS1Err('Informe um número de telefone válido (mínimo 10 dígitos).'); return;
    }
    if (password.length < 6) { setS1Err('A senha deve ter pelo menos 6 caracteres.'); return; }
    if (emailExists(email)) { setS1Err('Este e-mail já está cadastrado.'); return; }

    setLoading(true);
    const result = await sendCode(email, 'register');
    setLoading(false);
    setOtp(result);
    setDigits(['', '', '', '', '', '']);
    setStep('verify');
    setTimer(45);
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    const code = digits.join('');
    if (code.length < 6 || !otp) { setCodeErr('Digite os 6 dígitos.'); return; }

    setLoading(true);
    const check = await verifyCode(email, code, otp.token);
    if (!check.ok) {
      setLoading(false);
      setCodeErr(check.error ?? 'Código incorreto.');
      setDigits(['', '', '', '', '', '']);
      return;
    }
    const result = await register({ name, email, phone: phone.replace(/\D/g, ''), password });
    setLoading(false);
    if (!result.ok) { setS1Err(result.error ?? 'Erro ao criar conta.'); setStep('info'); return; }
    setStep('done');
    setTimeout(() => navigate('/'), 2200);
  }

  async function handleResend() {
    const result = await sendCode(email, 'register');
    setOtp(result);
    setDigits(['', '', '', '', '', '']);
    setCodeErr('');
    setTimer(45);
  }

  const steps = [
    { key: 'info', label: 'Dados' },
    { key: 'verify', label: 'Verificar' },
    { key: 'done', label: 'Pronto' },
  ];
  const stepIdx = step === 'info' ? 0 : step === 'verify' ? 1 : 2;

  return (
    <div className="auth-page">
      <div className="auth-panel">
        <div className="auth-panel__brand brand-logo">
          <LogoMark size={40} />
          <span className="brand-logo__word">BiblioJala</span>
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
          {FEATURES.map((f) => (
            <li key={f} className="auth-panel__feature">
              <span className="auth-panel__feature-dot" />
              {f}
            </li>
          ))}
        </ul>
      </div>

      <div className="auth-form-area">
        <div className="auth-form-box">
          <div className="auth-steps">
            {steps.map((s, i) => (
              <Fragment key={s.key}>
                <div className={`auth-step ${i < stepIdx ? 'auth-step--done' : i === stepIdx ? 'auth-step--active' : ''}`}>
                  <div className="auth-step__dot">
                    {i < stepIdx ? <Icon name="check" size={13} /> : i + 1}
                  </div>
                  <span>{s.label}</span>
                </div>
                {i < steps.length - 1 && <div className="auth-step-line" />}
              </Fragment>
            ))}
          </div>

          {step === 'info' && (
            <>
              <p className="auth-form-box__eyebrow"><Icon name="user" size={14} /> Passo 1 de 2</p>
              <h1 className="auth-form-box__title">Criar conta</h1>
              <p className="auth-form-box__sub">
                Já tem conta?{' '}
                <Link to="/login" style={{ color: 'var(--amber-dark)', fontWeight: 600 }}>Entrar</Link>
              </p>

              {step1Error && <div className="auth-error"><Icon name="alert" /> {step1Error}</div>}

              <form onSubmit={handleSendCode} noValidate>
                <div className="auth-field">
                  <label className="auth-label" htmlFor="reg-name">Nome completo</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon"><Icon name="user" /></span>
                    <input id="reg-name" className="auth-input" type="text" placeholder="Seu nome"
                      value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
                  </div>
                </div>

                <div className="auth-field">
                  <label className="auth-label" htmlFor="reg-email">E-mail</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon"><Icon name="mail" /></span>
                    <input id="reg-email" className="auth-input" type="email" placeholder="seu@email.com"
                      value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
                  </div>
                  <p className="auth-input-hint">Enviaremos um código de verificação para este e-mail.</p>
                </div>

                <div className="auth-field">
                  <label className="auth-label" htmlFor="reg-phone">Celular</label>
                  <div className="auth-phone-row">
                    <div className="auth-phone-prefix"><span className="auth-phone-cc">BR</span> +55</div>
                    <input id="reg-phone" className="auth-phone-input" type="tel" placeholder="(99) 99999-9999"
                      value={phone} onChange={(e) => setPhone(fmtPhone(e.target.value))}
                      autoComplete="tel" inputMode="numeric" required />
                  </div>
                </div>

                <div className="auth-field">
                  <label className="auth-label" htmlFor="reg-pw">Senha</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon"><Icon name="lock" /></span>
                    <input id="reg-pw" className="auth-input" type={showPw ? 'text' : 'password'}
                      placeholder="Mínimo 6 caracteres" value={password} onChange={(e) => setPw(e.target.value)}
                      autoComplete="new-password" required style={{ paddingRight: '3rem' }} />
                    <button type="button" onClick={() => setShowPw((v) => !v)}
                      aria-label={showPw ? 'Ocultar senha' : 'Mostrar senha'} className="auth-pw-toggle">
                      <Icon name={showPw ? 'eye-off' : 'eye'} />
                    </button>
                  </div>
                </div>

                <button type="submit" className="auth-submit" disabled={loading}>
                  {loading ? 'Enviando código…' : 'Continuar'} <Icon name="arrow-right" size={17} />
                </button>
              </form>
            </>
          )}

          {step === 'verify' && otp && (
            <>
              <p className="auth-form-box__eyebrow"><Icon name="mail" size={14} /> Passo 2 de 2</p>
              <h1 className="auth-form-box__title">Verifique seu e-mail</h1>
              <p className="auth-form-box__sub">
                Insira o código de 6 dígitos enviado para <strong>{email}</strong>
              </p>

              <div className={`verify-info${otp.delivered ? ' verify-info--sent' : ''}`}>
                {otp.delivered ? (
                  <>
                    <div className="verify-info__head"><Icon name="mail" /> E-mail enviado!</div>
                    Confira sua caixa de entrada e o spam. O código expira em 10 minutos.
                  </>
                ) : (
                  <>
                    <div className="verify-info__head"><Icon name="shield" /> Modo demonstração</div>
                    O envio real de e-mail ainda não está configurado — use o código abaixo:
                    <div className="verify-code-reveal">{otp.devCode}</div>
                  </>
                )}
              </div>

              <form onSubmit={handleVerify} noValidate>
                <CodeInput value={digits} onChange={(d) => { setDigits(d); setCodeErr(''); }}
                  error={Boolean(codeError)} autoFocus />

                {codeError && (
                  <div className="auth-error" style={{ justifyContent: 'center' }}>
                    <Icon name="alert" /> {codeError}
                  </div>
                )}

                <div className="auth-resend-row">
                  {timer > 0 ? (
                    <span className="resend-timer">Reenviar em {timer}s</span>
                  ) : (
                    <button type="button" className="resend-btn" onClick={handleResend}>Reenviar código</button>
                  )}
                </div>

                <button type="submit" className="auth-submit" disabled={loading || digits.join('').length < 6}>
                  {loading ? 'Criando conta…' : 'Criar minha conta'} <Icon name="arrow-right" size={17} />
                </button>

                <div className="auth-switch" style={{ marginTop: '.85rem' }}>
                  <button type="button" onClick={() => setStep('info')}>Voltar e editar dados</button>
                </div>
              </form>
            </>
          )}

          {step === 'done' && (
            <div className="auth-success">
              <span className="auth-success__icon-wrap"><Icon name="check-circle" size={34} /></span>
              <h2 className="auth-success__title">Conta criada!</h2>
              <p className="auth-success__text">
                Bem-vindo(a) ao BiblioJala, <strong>{name.split(' ')[0]}</strong>!<br />
                Redirecionando para o catálogo…
              </p>
              <div style={{ marginTop: '1.5rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
