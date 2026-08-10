import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sendCode, verifyCode, SendCodeResult } from '../lib/authApi';
import CodeInput from '../components/CodeInput';
import { LogoMark } from '../components/Logo';
import Icon from '../components/Icon';

type Step = 'creds' | 'verify';

const FEATURES = [
  'Login em duas etapas com código por e-mail',
  'Senhas protegidas com hash (PBKDF2)',
  'Catálogo com milhares de títulos',
  'Acesso de qualquer dispositivo',
];

export default function LoginPage() {
  const { checkCredentials, finishLogin } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('creds');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [otp, setOtp] = useState<SendCodeResult | null>(null);
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [codeError, setCodeError] = useState('');
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (timer <= 0) return;
    const id = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer]);

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Preencha todos os campos.'); return; }

    setLoading(true);
    const check = await checkCredentials(email, password);
    if (!check.ok) {
      setLoading(false);
      setError(check.error ?? 'Não foi possível entrar.');
      return;
    }
    const result = await sendCode(email, 'login');
    setLoading(false);
    setOtp(result);
    setDigits(['', '', '', '', '', '']);
    setStep('verify');
    setTimer(45);
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    const code = digits.join('');
    if (code.length < 6 || !otp) { setCodeError('Digite os 6 dígitos.'); return; }

    setLoading(true);
    const res = await verifyCode(email, code, otp.token);
    if (!res.ok) {
      setLoading(false);
      setCodeError(res.error ?? 'Código incorreto.');
      setDigits(['', '', '', '', '', '']);
      return;
    }
    const done = finishLogin(email);
    setLoading(false);
    if (!done.ok) { setStep('creds'); setError(done.error ?? 'Erro ao entrar.'); return; }
    navigate('/');
  }

  async function handleResend() {
    const result = await sendCode(email, 'login');
    setOtp(result);
    setDigits(['', '', '', '', '', '']);
    setCodeError('');
    setTimer(45);
  }

  return (
    <div className="auth-page">
      <div className="auth-panel">
        <div className="auth-panel__brand brand-logo">
          <LogoMark size={40} />
          <span className="brand-logo__word">BiblioJala</span>
        </div>
        <div className="auth-panel__content">
          <h2 className="auth-panel__title">
            Sua biblioteca,<br /><em>onde você estiver.</em>
          </h2>
          <p className="auth-panel__desc">
            Acesse o acervo completo da Universidade Jala, gerencie seus empréstimos
            e organize suas leituras em um só lugar.
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
          {step === 'creds' && (
            <>
              <p className="auth-form-box__eyebrow"><Icon name="lock" size={14} /> Bem-vindo de volta</p>
              <h1 className="auth-form-box__title">Entrar na conta</h1>
              <p className="auth-form-box__sub">
                Não tem uma conta?{' '}
                <Link to="/register" style={{ color: 'var(--amber-dark)', fontWeight: 600 }}>
                  Criar conta grátis
                </Link>
              </p>

              {error && <div className="auth-error"><Icon name="alert" /> {error}</div>}

              <form onSubmit={handleCredentials} noValidate>
                <div className="auth-field">
                  <label className="auth-label" htmlFor="login-email">E-mail</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon"><Icon name="mail" /></span>
                    <input
                      id="login-email"
                      className={`auth-input${error ? ' auth-input--error' : ''}`}
                      type="email" placeholder="seu@email.com" value={email}
                      onChange={(e) => setEmail(e.target.value)} autoComplete="email" required
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <label className="auth-label" htmlFor="login-pw">Senha</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon"><Icon name="lock" /></span>
                    <input
                      id="login-pw"
                      className={`auth-input${error ? ' auth-input--error' : ''}`}
                      type={showPw ? 'text' : 'password'} placeholder="Sua senha" value={password}
                      onChange={(e) => setPassword(e.target.value)} autoComplete="current-password"
                      required style={{ paddingRight: '3rem' }}
                    />
                    <button type="button" onClick={() => setShowPw((v) => !v)}
                      aria-label={showPw ? 'Ocultar senha' : 'Mostrar senha'} className="auth-pw-toggle">
                      <Icon name={showPw ? 'eye-off' : 'eye'} />
                    </button>
                  </div>
                </div>

                <button type="submit" className="auth-submit" disabled={loading}>
                  {loading ? 'Verificando…' : 'Continuar'} <Icon name="arrow-right" size={17} />
                </button>
              </form>

              <div className="auth-divider">login seguro em 2 etapas</div>
              <p className="auth-2fa-note">
                <Icon name="shield" /> Após a senha, enviaremos um código de uso único para o seu e-mail.
              </p>
            </>
          )}

          {step === 'verify' && otp && (
            <>
              <p className="auth-form-box__eyebrow"><Icon name="mail" size={14} /> Etapa 2 de 2</p>
              <h1 className="auth-form-box__title">Confirme que é você</h1>
              <p className="auth-form-box__sub">
                Enviamos um código de 6 dígitos para <strong>{email}</strong>
              </p>

              <div className={`verify-info${otp.delivered ? ' verify-info--sent' : ''}`}>
                {otp.delivered ? (
                  <>
                    <div className="verify-info__head"><Icon name="mail" /> E-mail enviado!</div>
                    Confira a sua caixa de entrada (e o spam). O código expira em 10 minutos.
                  </>
                ) : (
                  <>
                    <div className="verify-info__head"><Icon name="shield" /> Modo demonstração</div>
                    O envio real de e-mail ainda não está configurado, então o código aparece aqui:
                    <div className="verify-code-reveal">{otp.devCode}</div>
                  </>
                )}
              </div>

              <form onSubmit={handleVerify} noValidate>
                <CodeInput value={digits} onChange={(d) => { setDigits(d); setCodeError(''); }}
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
                  {loading ? 'Entrando…' : 'Entrar'} <Icon name="arrow-right" size={17} />
                </button>

                <div className="auth-switch" style={{ marginTop: '.85rem' }}>
                  <button type="button" onClick={() => { setStep('creds'); setError(''); }}>
                    Usar outra conta
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
