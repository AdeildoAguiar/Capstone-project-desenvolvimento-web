import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Address } from '../lib/users';
import { useToast, ToastContainer } from '../components/Toast';
import Icon from '../components/Icon';

function fmtPhoneView(digits: string) {
  const d = (digits || '').replace(/\D/g, '');
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return digits || '';
}
function fmtPhoneInput(raw: string) {
  const d = raw.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}
function fmtCep(raw: string) {
  const d = raw.replace(/\D/g, '').slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

function hasAddress(a?: Address) {
  return Boolean(a && (a.street || a.city || a.cep));
}

export default function ProfilePage() {
  const { state, updateProfile } = useAuth();
  const { toasts, show } = useToast();
  const user = state.user!;
  const [editing, setEditing] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);

  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(fmtPhoneInput(user.phone || ''));
  const [addr, setAddr] = useState<Address>({ country: 'Brasil', ...user.address });

  function reset() {
    setName(user.name);
    setPhone(fmtPhoneInput(user.phone || ''));
    setAddr({ country: 'Brasil', ...user.address });
    setEditing(false);
  }

  async function lookupCep(cepRaw: string) {
    const cep = cepRaw.replace(/\D/g, '');
    if (cep.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setAddr((a) => ({
          ...a,
          street: data.logradouro || a.street,
          district: data.bairro || a.district,
          city: data.localidade || a.city,
          state: data.uf || a.state,
        }));
      }
    } catch {
      /* silencioso — preenchimento manual continua funcionando */
    } finally {
      setCepLoading(false);
    }
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    updateProfile({ name, phone: phone.replace(/\D/g, ''), address: addr });
    setEditing(false);
    show('check-circle', 'Perfil atualizado com sucesso!');
  }

  const memberSince = new Date(user.createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  const addressLine = hasAddress(user.address)
    ? [
        [user.address?.street, user.address?.number].filter(Boolean).join(', '),
        user.address?.complement,
        user.address?.district,
        [user.address?.city, user.address?.state].filter(Boolean).join('/'),
        user.address?.cep,
      ].filter(Boolean).join(' · ')
    : null;

  return (
    <main>
      <div className="container">
        {/* Cover header */}
        <section className="profile-hero">
          <div className="profile-hero__cover" />
          <div className="profile-hero__body">
            <div className="profile-avatar">{user.name[0]?.toUpperCase()}</div>
            <div className="profile-hero__id">
              <h1 className="profile-hero__name">
                {user.name}
                {user.role === 'admin' && <span className="profile-role">ADMIN</span>}
              </h1>
              <p className="profile-hero__email"><Icon name="mail" size={15} /> {user.email}</p>
              <p className="profile-hero__since"><Icon name="clock" size={14} /> Membro desde {memberSince}</p>
            </div>
            {!editing && (
              <button className="btn btn--primary profile-hero__edit" onClick={() => setEditing(true)}>
                <Icon name="edit" /> Editar perfil
              </button>
            )}
          </div>
        </section>

        {editing ? (
          /* ── Edit form ─────────────────────────────────────────── */
          <form onSubmit={handleSave} className="profile-grid">
            <div className="profile-card">
              <h2 className="profile-card__title"><Icon name="user" size={18} /> Dados pessoais</h2>

              <div className="auth-field">
                <label className="auth-label" htmlFor="p-name">Nome completo</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon"><Icon name="user" /></span>
                  <input id="p-name" className="auth-input" value={name}
                    onChange={(e) => setName(e.target.value)} required />
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-label">E-mail (não editável)</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon"><Icon name="mail" /></span>
                  <input className="auth-input" value={user.email} disabled
                    style={{ opacity: .7, cursor: 'not-allowed' }} />
                </div>
              </div>

              <div className="auth-field" style={{ marginBottom: 0 }}>
                <label className="auth-label" htmlFor="p-phone">Celular</label>
                <div className="auth-phone-row">
                  <div className="auth-phone-prefix"><span className="auth-phone-cc">BR</span> +55</div>
                  <input id="p-phone" className="auth-phone-input" type="tel" placeholder="(99) 99999-9999"
                    value={phone} onChange={(e) => setPhone(fmtPhoneInput(e.target.value))} inputMode="numeric" />
                </div>
              </div>
            </div>

            <div className="profile-card">
              <h2 className="profile-card__title"><Icon name="map-pin" size={18} /> Onde você mora</h2>

              <div className="auth-field">
                <label className="auth-label" htmlFor="p-cep">CEP</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon"><Icon name="map-pin" /></span>
                  <input id="p-cep" className="auth-input" placeholder="00000-000" inputMode="numeric"
                    value={addr.cep ?? ''}
                    onChange={(e) => setAddr({ ...addr, cep: fmtCep(e.target.value) })}
                    onBlur={(e) => lookupCep(e.target.value)} />
                </div>
                <p className="auth-input-hint">
                  {cepLoading ? 'Buscando endereço…' : 'Digite o CEP para preencher o endereço automaticamente.'}
                </p>
              </div>

              <div className="profile-row-2">
                <div className="auth-field" style={{ flex: 3 }}>
                  <label className="auth-label" htmlFor="p-street">Logradouro</label>
                  <input id="p-street" className="auth-input" style={{ paddingLeft: '1rem' }} placeholder="Rua, avenida…"
                    value={addr.street ?? ''} onChange={(e) => setAddr({ ...addr, street: e.target.value })} />
                </div>
                <div className="auth-field" style={{ flex: 1 }}>
                  <label className="auth-label" htmlFor="p-num">Número</label>
                  <input id="p-num" className="auth-input" style={{ paddingLeft: '1rem' }} placeholder="123"
                    value={addr.number ?? ''} onChange={(e) => setAddr({ ...addr, number: e.target.value })} />
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-label" htmlFor="p-comp">Complemento</label>
                <input id="p-comp" className="auth-input" style={{ paddingLeft: '1rem' }} placeholder="Apto, bloco… (opcional)"
                  value={addr.complement ?? ''} onChange={(e) => setAddr({ ...addr, complement: e.target.value })} />
              </div>

              <div className="profile-row-2">
                <div className="auth-field" style={{ flex: 2 }}>
                  <label className="auth-label" htmlFor="p-district">Bairro</label>
                  <input id="p-district" className="auth-input" style={{ paddingLeft: '1rem' }}
                    value={addr.district ?? ''} onChange={(e) => setAddr({ ...addr, district: e.target.value })} />
                </div>
                <div className="auth-field" style={{ flex: 2 }}>
                  <label className="auth-label" htmlFor="p-city">Cidade</label>
                  <input id="p-city" className="auth-input" style={{ paddingLeft: '1rem' }}
                    value={addr.city ?? ''} onChange={(e) => setAddr({ ...addr, city: e.target.value })} />
                </div>
                <div className="auth-field" style={{ flex: 1 }}>
                  <label className="auth-label" htmlFor="p-state">UF</label>
                  <input id="p-state" className="auth-input" style={{ paddingLeft: '1rem' }} maxLength={2} placeholder="SP"
                    value={addr.state ?? ''} onChange={(e) => setAddr({ ...addr, state: e.target.value.toUpperCase() })} />
                </div>
              </div>
            </div>

            <div className="profile-actions">
              <button type="button" className="btn btn--ghost" onClick={reset}>Cancelar</button>
              <button type="submit" className="btn btn--primary"><Icon name="save" /> Salvar alterações</button>
            </div>
          </form>
        ) : (
          /* ── View mode ─────────────────────────────────────────── */
          <div className="profile-grid">
            <div className="profile-card">
              <h2 className="profile-card__title"><Icon name="user" size={18} /> Dados pessoais</h2>
              <InfoRow icon="user" label="Nome completo" value={user.name} />
              <InfoRow icon="mail" label="E-mail" value={user.email} />
              <InfoRow icon="phone" label="Celular"
                value={user.phone ? `+55 ${fmtPhoneView(user.phone)}` : null} />
              <InfoRow icon="badge" label="Tipo de conta"
                value={user.role === 'admin' ? 'Administrador' : 'Membro'} />
            </div>

            <div className="profile-card">
              <h2 className="profile-card__title"><Icon name="map-pin" size={18} /> Onde você mora</h2>
              {addressLine ? (
                <>
                  <div className="profile-address">
                    <Icon name="home" size={20} />
                    <div>
                      <strong>{[user.address?.city, user.address?.state].filter(Boolean).join('/') || 'Endereço'}</strong>
                      <p>{addressLine}</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="profile-empty-inline">
                  <Icon name="map-pin" size={22} />
                  <p>Você ainda não informou onde mora. Clique em <strong>Editar perfil</strong> para adicionar seu endereço.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <ToastContainer toasts={toasts} />
    </main>
  );
}

function InfoRow({ icon, label, value }: { icon: Parameters<typeof Icon>[0]['name']; label: string; value: string | null }) {
  return (
    <div className="info-row">
      <span className="info-row__icon"><Icon name={icon} size={17} /></span>
      <span className="info-row__label">{label}</span>
      <span className={`info-row__value${value ? '' : ' info-row__value--empty'}`}>
        {value ?? 'Não informado'}
      </span>
    </div>
  );
}
