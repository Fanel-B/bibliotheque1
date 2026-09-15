'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user, loading, logout } = useAuth();

  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
      <span className="rounded-full bg-success px-3 py-1 text-xs font-medium tracking-wide text-accent uppercase">
        En construction
      </span>
      <h1 className="text-3xl font-semibold text-text">Biblio-Tech 2.0</h1>
      <p className="max-w-md text-text-secondary">
        Frontend et backend sont branchés et fonctionnels. Les vraies pages
        (prêts, réservations, IoT) arrivent phase par phase.
      </p>

      <div className="flex flex-wrap justify-center gap-2">
        <Link
          href="/catalogue"
          className="rounded-md border border-black/15 px-4 py-2 text-sm font-medium text-text"
        >
          📖 Voir le catalogue
        </Link>
        {user && (
          <Link
            href="/mes-emprunts"
            className="rounded-md border border-black/15 px-4 py-2 text-sm font-medium text-text"
          >
            📚 Mes emprunts
          </Link>
        )}
        {user && (
          <Link
            href="/mes-reservations"
            className="rounded-md border border-black/15 px-4 py-2 text-sm font-medium text-text"
          >
            🗓️ Mes réservations
          </Link>
        )}
        {user && ['employee', 'admin'].includes(user.role) && (
          <Link
            href="/employe/pret"
            className="rounded-md border border-black/15 px-4 py-2 text-sm font-medium text-text"
          >
            🗂️ Poste de prêt
          </Link>
        )}
        {user && ['employee', 'admin'].includes(user.role) && (
          <Link
            href="/iot"
            className="rounded-md border border-black/15 px-4 py-2 text-sm font-medium text-text"
          >
            🌐 Smart Library
          </Link>
        )}
        {user && user.role === 'admin' && (
          <Link
            href="/admin"
            className="rounded-md border border-black/15 px-4 py-2 text-sm font-medium text-text"
          >
            📊 Dashboard admin
          </Link>
        )}
        {user && user.role === 'admin' && (
          <Link
            href="/automatisations"
            className="rounded-md border border-black/15 px-4 py-2 text-sm font-medium text-text"
          >
            ⚙️ Automatisations
          </Link>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-text-secondary">Vérification de la session...</p>
      ) : user ? (
        <div className="flex flex-col items-center gap-2">
          <p className="text-text">
            Connecté en tant que <strong>{user.name}</strong> ({user.role})
          </p>
          <button
            onClick={logout}
            className="rounded-md border border-black/15 px-4 py-2 text-sm text-text"
          >
            Se déconnecter
          </button>
        </div>
      ) : (
        <Link
          href="/login"
          className="rounded-md bg-accent px-4 py-2 font-medium text-white"
        >
          Se connecter
        </Link>
      )}
    </main>
  );
}
