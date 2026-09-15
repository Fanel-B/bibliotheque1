'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { myLoans } from '../../services/loansService';

const STATUS_LABELS = {
  en_cours: { label: 'En cours', className: 'bg-blue/10 text-blue' },
  retard: { label: 'En retard', className: 'bg-error text-bordeaux' },
  retourne: { label: 'Rendu', className: 'bg-success text-accent' },
};

export default function MesEmpruntsPage() {
  const { user, accessToken, loading } = useAuth();
  const [loans, setLoans] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!accessToken) return;
    myLoans(accessToken)
      .then((data) => setLoans(data.loans))
      .catch((err) => setError(err.message));
  }, [accessToken]);

  if (loading) {
    return <p className="p-10 text-text-secondary">Chargement...</p>;
  }

  if (!user) {
    return (
      <main className="flex min-h-full flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-text">Connecte-toi pour voir tes emprunts.</p>
        <Link href="/login" className="rounded-md bg-accent px-4 py-2 text-white">
          Se connecter
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text">Mes emprunts</h1>
        <Link href="/" className="text-sm text-text-secondary underline">
          ← Accueil
        </Link>
      </div>

      {error && <p className="text-bordeaux">{error}</p>}

      {loans && loans.length === 0 && (
        <p className="text-text-secondary">Tu n'as encore emprunté aucun livre.</p>
      )}

      <ul className="flex flex-col gap-3">
        {loans?.map((loan) => {
          const status = STATUS_LABELS[loan.status];
          return (
            <li
              key={loan.id}
              className="flex items-center justify-between rounded-lg border border-black/10 bg-surface p-4"
            >
              <div>
                <p className="font-medium text-text">{loan.title}</p>
                <p className="text-sm text-text-secondary">
                  Emprunté le {loan.loan_date} · à rendre le {loan.due_date}
                  {loan.return_date && ` · rendu le ${loan.return_date}`}
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${status.className}`}>
                {status.label}
              </span>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
