import { useEffect, useMemo, useState } from 'react';
import { getEvents } from '../lib/events';
import { getUsers } from '../lib/users';
import { computeAnalytics } from '../lib/analytics';
import { seedDemoData, clearDemoData, hasDemoData } from '../lib/demoData';
import { MonthlyBars, Donut, RankBars } from '../components/Charts';
import { AppEvent } from '../types';
import { useToast, ToastContainer } from '../components/Toast';
import Icon, { IconName } from '../components/Icon';

function useLiveEvents(): AppEvent[] {
  const [events, setEvents] = useState<AppEvent[]>(() => getEvents());
  useEffect(() => {
    const refresh = () => setEvents(getEvents());
    window.addEventListener('biblio:events', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('biblio:events', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);
  return events;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `${mins}min atrás`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h atrás`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d atrás`;
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export default function AdminPage() {
  const events = useLiveEvents();
  const { toasts, show } = useToast();
  const [authorRange, setAuthorRange] = useState<'month' | 'year'>('month');
  const [demoPresent, setDemoPresent] = useState(() => hasDemoData());

  const a = useMemo(() => computeAnalytics(events), [events]);
  const totalUsers = useMemo(() => getUsers().length, [events]);
  const recent = useMemo(
    () => [...events].sort((x, y) => y.at.localeCompare(x.at)).slice(0, 12),
    [events]
  );

  function handleSeed() {
    const n = seedDemoData();
    setDemoPresent(true);
    show('chart', `${n} eventos de demonstração adicionados.`);
  }
  function handleClear() {
    clearDemoData();
    setDemoPresent(false);
    show('trash', 'Dados de demonstração removidos.');
  }

  const kpis: { label: string; value: string | number; icon: IconName; tone: string }[] = [
    { label: 'Empréstimos totais', value: a.totalBorrows, icon: 'upload', tone: '' },
    { label: 'Ativos agora', value: a.activeLoans, icon: 'book-open', tone: 'amber' },
    { label: 'Devoluções', value: a.totalReturns, icon: 'return', tone: 'green' },
    { label: 'Leitores', value: a.uniqueReaders, icon: 'users', tone: '' },
    { label: 'Usuários cadastrados', value: totalUsers, icon: 'badge', tone: '' },
    { label: 'Taxa de devolução', value: `${Math.round(a.returnRate * 100)}%`, icon: 'return', tone: 'green' },
  ];

  const authors = authorRange === 'month' ? a.topAuthorsMonth : a.topAuthorsYear;

  return (
    <main>
      <div className="container">
        <header className="page-header admin-header">
          <div>
            <p className="page-header__eyebrow"><Icon name="chart" size={15} /> Painel administrativo</p>
            <h1 className="page-header__title">Visão geral do acervo</h1>
            <p className="page-header__subtitle">
              Métricas de uso, autores mais lidos e situação dos livros em tempo real.
            </p>
          </div>
          <div className="admin-tools">
            {demoPresent ? (
              <button className="btn btn--outline btn--sm" onClick={handleClear}>
                <Icon name="trash" size={16} /> Limpar dados de exemplo
              </button>
            ) : (
              <button className="btn btn--amber btn--sm" onClick={handleSeed}>
                <Icon name="database" size={16} /> Popular com dados de exemplo
              </button>
            )}
          </div>
        </header>

        {/* KPI row */}
        <section className="kpi-grid" aria-label="Indicadores">
          {kpis.map((k) => (
            <div key={k.label} className={`kpi-card${k.tone ? ` kpi-card--${k.tone}` : ''}`}>
              <span className="kpi-card__icon"><Icon name={k.icon} size={20} /></span>
              <span className="kpi-card__value">{k.value}</span>
              <span className="kpi-card__label">{k.label}</span>
            </div>
          ))}
        </section>

        {/* Charts */}
        <section className="admin-grid">
          <div className="panel panel--wide">
            <div className="panel__head">
              <h2 className="panel__title">Empréstimos por mês</h2>
              <div className="panel__legend">
                <span><i className="dot" style={{ background: 'var(--amber)' }} /> Empréstimos</span>
                <span><i className="dot" style={{ background: 'var(--green)' }} /> Devoluções</span>
              </div>
            </div>
            <MonthlyBars data={a.borrowsByMonth} />
          </div>

          <div className="panel">
            <div className="panel__head">
              <h2 className="panel__title">Situação dos livros</h2>
            </div>
            <Donut
              segments={a.bookStatus}
              centerLabel="empréstimos"
              centerValue={a.totalBorrows}
            />
          </div>

          <div className="panel">
            <div className="panel__head">
              <h2 className="panel__title">Autores mais lidos</h2>
              <div className="seg-toggle" role="tablist" aria-label="Período">
                <button
                  role="tab"
                  aria-selected={authorRange === 'month'}
                  className={authorRange === 'month' ? 'active' : ''}
                  onClick={() => setAuthorRange('month')}
                >
                  Mês
                </button>
                <button
                  role="tab"
                  aria-selected={authorRange === 'year'}
                  className={authorRange === 'year' ? 'active' : ''}
                  onClick={() => setAuthorRange('year')}
                >
                  Ano
                </button>
              </div>
            </div>
            <RankBars items={authors} emptyLabel="Nenhum empréstimo neste período." />
          </div>

          <div className="panel">
            <div className="panel__head"><h2 className="panel__title">Gêneros populares</h2></div>
            <RankBars items={a.topGenres} accent="var(--blue)" />
          </div>

          <div className="panel">
            <div className="panel__head"><h2 className="panel__title">Livros mais emprestados</h2></div>
            <RankBars items={a.topBooks} accent="var(--green)" />
          </div>

          <div className="panel">
            <div className="panel__head"><h2 className="panel__title">Leitores mais ativos</h2></div>
            <RankBars items={a.topReaders} accent="var(--amber-dark)" />
          </div>
        </section>

        {/* Recent user activity */}
        <section className="panel panel--table">
          <div className="panel__head">
            <h2 className="panel__title">Atividade recente dos usuários</h2>
          </div>
          {recent.length === 0 ? (
            <p className="rank-empty" style={{ padding: '1rem' }}>
              Sem atividade ainda. Empreste um livro ou popule com dados de exemplo.
            </p>
          ) : (
            <div className="table-scroll">
              <table className="activity-table">
                <thead>
                  <tr>
                    <th>Usuário</th>
                    <th>Ação</th>
                    <th>Livro</th>
                    <th>Autor</th>
                    <th>Quando</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((e) => (
                    <tr key={e.id}>
                      <td>
                        <span className="avatar-mini">{e.userName[0]?.toUpperCase()}</span>
                        {e.userName}
                      </td>
                      <td>
                        <span className={`badge ${e.type === 'borrow' ? 'badge--loaned' : 'badge--available'}`}>
                          <Icon name={e.type === 'borrow' ? 'upload' : 'return'} />
                          {e.type === 'borrow' ? 'Empréstimo' : 'Devolução'}
                        </span>
                      </td>
                      <td className="cell-strong">{e.bookTitle}</td>
                      <td className="cell-muted">{e.bookAuthor}</td>
                      <td className="cell-muted">{timeAgo(e.at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="admin-footnote">
          As métricas são calculadas a partir da atividade registrada neste dispositivo.
          Em produção, viriam de um banco de dados compartilhado.
        </p>
      </div>
      <ToastContainer toasts={toasts} />
    </main>
  );
}
