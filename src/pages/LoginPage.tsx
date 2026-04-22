import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Preencha todos os campos.'); return; }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const result = login(email, password);
    setLoading(false);

    if (!result.ok) { setError(result.error ?? 'Erro ao entrar.'); return; }
    navigate('/');
  }

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
            Sua biblioteca,<br /><em>onde você estiver.</em>
          </h2>
          <p className="auth-panel__desc">
            Acesse o acervo completo da Universidade Jala, gerencie seus empréstimos
            e organize suas leituras em um só lugar.
          </p>
        </div>

        <ul className="auth-panel__features">
          {[
            'Catálogo com milhares de títulos',
            'Empréstimos com prazo automático',
            'Lista de desejos e status de leitura',
            'Acesso de qualquer dispositivo',
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
          <p className="auth-form-box__eyebrow">Bem-vindo de volta</p>
          <h1 className="auth-form-box__title">Entrar na conta</h1>
          <p className="auth-form-box__sub">
            Não tem uma conta?{' '}
            <Link to="/register" style={{ color: 'var(--amber-dark)', fontWeight: 600 }}>
              Criar conta grátis
            </Link>
          </p>

          {error && (
            <div className="auth-error">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label className="auth-label" htmlFor="login-email">E-mail</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">✉️</span>
                <input
                  id="login-email"
                  className={`auth-input${error ? ' auth-input--error' : ''}`}
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="login-pw">Senha</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">🔑</span>
                <input
                  id="login-pw"
                  className={`auth-input${error ? ' auth-input--error' : ''}`}
                  type={showPw ? 'text' : 'password'}
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
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

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? 'Entrando…' : 'Entrar →'}
            </button>
          </form>

          {}
          <div className="auth-divider">ou</div>
          <div style={{
            background: 'var(--amber-light)',
            border: '1px solid rgba(200,137,58,.25)',
            borderRadius: 'var(--radius)',
            padding: '.85rem 1rem',
            fontSize: '.8rem',
            color: 'var(--amber-dark)',
            lineHeight: 1.6,
          }}>
            <strong>💡 Demo rápida:</strong> Crie uma conta nova para testar.
            Qualquer e-mail e telefone (pode ser fictício) funcionam!
          </div>
        </div>
      </div>
    </div>
  );
}
