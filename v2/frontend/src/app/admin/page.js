'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { useAuth } from '../../context/AuthContext';
import * as adminService from '../../services/adminService';
import { StaffNav } from '../../components/StaffNav';
import { downloadCsv } from '../../lib/downloadCsv';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip);

const ACCENT = '#1B5E20';
const BLUE = '#1565C0';
const BORDEAUX = '#7B1D1D';
const TEXT_SECONDARY = '#5D4037';
const GRID_COLOR = 'rgba(44, 24, 16, 0.08)';

function KpiTile({ label, value, tone = 'default' }) {
  const toneClasses = {
    default: 'bg-surface text-text',
    warning: 'bg-error text-bordeaux',
  };
  return (
    <div className={`flex flex-col gap-1 rounded-xl border border-black/10 p-4 ${toneClasses[tone]}`}>
      <span className="text-xs uppercase tracking-wide text-text-secondary">{label}</span>
      <span className="text-2xl font-semibold">{value ?? '—'}</span>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { user, accessToken, loading } = useAuth();
  const [overview, setOverview] = useState(null);
  const [popularBooks, setPopularBooks] = useState([]);
  const [popularGenres, setPopularGenres] = useState([]);
  const [trends, setTrends] = useState([]);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);
  const [savingUserId, setSavingUserId] = useState(null);

  function refreshUsersAndLogs() {
    Promise.all([adminService.getUsers(accessToken), adminService.getLogs(accessToken)])
      .then(([us, lg]) => {
        setUsers(us.users);
        setLogs(lg.logs);
      })
      .catch((err) => setError(err.message));
  }

  useEffect(() => {
    if (!accessToken) return;
    Promise.all([
      adminService.getOverview(accessToken),
      adminService.getPopularBooks(accessToken),
      adminService.getPopularGenres(accessToken),
      adminService.getTrends(accessToken),
      adminService.getUsers(accessToken),
      adminService.getLogs(accessToken),
    ])
      .then(([ov, books, genres, tr, us, lg]) => {
        setOverview(ov);
        setPopularBooks(books.books);
        setPopularGenres(genres.genres);
        setTrends(tr.trends);
        setUsers(us.users);
        setLogs(lg.logs);
      })
      .catch((err) => setError(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  async function handleRoleChange(targetUser, role) {
    setSavingUserId(targetUser.id);
    setError(null);
    try {
      await adminService.changeUserRole(accessToken, targetUser.id, role);
      refreshUsersAndLogs();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingUserId(null);
    }
  }

  async function handleExport(path, filename) {
    try {
      await downloadCsv(path, accessToken, filename);
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <p className="p-10 text-text-secondary">Chargement...</p>;

  if (!user || user.role !== 'admin') {
    return (
      <main className="flex min-h-full flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-text">Cette page est réservée aux administrateurs.</p>
        <Link href="/login" className="rounded-md bg-accent px-4 py-2 text-white">
          Se connecter
        </Link>
      </main>
    );
  }

  return (
    <>
      <StaffNav role="admin" />
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text">Dashboard admin</h1>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('/api/admin/export/users.csv', 'utilisateurs.csv')}
            className="rounded-md border border-black/15 px-3 py-1.5 text-sm text-text"
          >
            ⬇️ Utilisateurs
          </button>
          <button
            onClick={() => handleExport('/api/admin/export/loans.csv', 'prets.csv')}
            className="rounded-md border border-black/15 px-3 py-1.5 text-sm text-text"
          >
            ⬇️ Prêts
          </button>
        </div>
      </div>

      {error && <p className="text-bordeaux">{error}</p>}

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiTile label="Utilisateurs" value={overview?.total_users} />
        <KpiTile label="Prêts en cours" value={overview?.active_loans} />
        <KpiTile
          label="Retards"
          value={overview?.overdue_loans}
          tone={overview?.overdue_loans > 0 ? 'warning' : 'default'}
        />
        <KpiTile label="Réservations aujourd'hui" value={overview?.reservations_today} />
      </section>

      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-black/10 bg-surface p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-secondary">
            Livres les plus empruntés
          </h2>
          <Bar
            data={{
              labels: popularBooks.map((b) => b.title),
              datasets: [{ data: popularBooks.map((b) => b.loan_count), backgroundColor: ACCENT }],
            }}
            options={{
              indexAxis: 'y',
              plugins: { legend: { display: false } },
              scales: {
                x: { ticks: { color: TEXT_SECONDARY, stepSize: 1 }, grid: { color: GRID_COLOR } },
                y: { ticks: { color: TEXT_SECONDARY }, grid: { display: false } },
              },
            }}
          />
        </div>

        <div className="rounded-xl border border-black/10 bg-surface p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-secondary">
            Genres les plus empruntés
          </h2>
          <Bar
            data={{
              labels: popularGenres.map((g) => g.label),
              datasets: [{ data: popularGenres.map((g) => g.loan_count), backgroundColor: BLUE }],
            }}
            options={{
              indexAxis: 'y',
              plugins: { legend: { display: false } },
              scales: {
                x: { ticks: { color: TEXT_SECONDARY, stepSize: 1 }, grid: { color: GRID_COLOR } },
                y: { ticks: { color: TEXT_SECONDARY }, grid: { display: false } },
              },
            }}
          />
        </div>
      </section>

      <section className="rounded-xl border border-black/10 bg-surface p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-secondary">
          Prêts — 14 derniers jours
        </h2>
        <Line
          data={{
            labels: trends.map((t) => t.date.slice(5)),
            datasets: [
              {
                data: trends.map((t) => t.count),
                borderColor: ACCENT,
                backgroundColor: 'rgba(27, 94, 32, 0.12)',
                fill: true,
                tension: 0.3,
                pointRadius: 3,
              },
            ],
          }}
          options={{
            plugins: { legend: { display: false } },
            scales: {
              x: { ticks: { color: TEXT_SECONDARY }, grid: { display: false } },
              y: { ticks: { color: TEXT_SECONDARY, stepSize: 1, precision: 0 }, grid: { color: GRID_COLOR } },
            },
          }}
        />
      </section>

      <section className="rounded-xl border border-black/10 bg-surface p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-secondary">
          Utilisateurs
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-text-secondary">
                <th className="pb-2">Nom</th>
                <th className="pb-2">Email</th>
                <th className="pb-2">Rôle</th>
                <th className="pb-2">Inscrit le</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf = u.id === user.id;
                return (
                  <tr key={u.id} className="border-t border-black/10 text-text">
                    <td className="py-2">{u.name}</td>
                    <td className="py-2">{u.email}</td>
                    <td className="py-2">
                      <select
                        value={u.role}
                        disabled={isSelf || savingUserId === u.id}
                        onChange={(e) => handleRoleChange(u, e.target.value)}
                        title={isSelf ? 'Tu ne peux pas changer ton propre rôle' : undefined}
                        className={`rounded-md border px-2 py-1 text-xs ${
                          u.role === 'admin'
                            ? 'border-bordeaux/30 bg-error text-bordeaux'
                            : u.role === 'employee'
                              ? 'border-blue/30 bg-blue/10 text-blue'
                              : 'border-black/15 bg-bg text-text'
                        } disabled:opacity-60`}
                      >
                        <option value="user">user</option>
                        <option value="employee">employee</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td className="py-2">{new Date(u.created_at).toLocaleDateString('fr-FR')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-black/10 bg-surface p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-secondary">
          Journal des actions récentes
        </h2>
        {logs.length === 0 ? (
          <p className="text-sm text-text-secondary">Aucune action enregistrée pour le moment.</p>
        ) : (
          <ul className="flex flex-col gap-2 text-sm">
            {logs.map((log) => (
              <li key={log.id} className="flex justify-between border-t border-black/10 py-2 text-text">
                <span>
                  <strong>{log.user_name}</strong> — {log.action} — {log.target}
                </span>
                <span className="text-text-secondary">
                  {new Date(log.created_at).toLocaleString('fr-FR')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
      </main>
    </>
  );
}
