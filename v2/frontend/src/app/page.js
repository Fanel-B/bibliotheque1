'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';
import { myRecommendations } from '../services/recommendationsService';

const STAFF_LINKS = {
  employee: { href: '/employe', label: '🗂️ Aller à mon espace employé', bg: 'bg-blue' },
  admin: { href: '/admin', label: '📊 Aller au dashboard admin', bg: 'bg-bordeaux' },
};

export default function Home() {
  const { user, accessToken, loading, logout } = useAuth();
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    if (!accessToken) return;
    myRecommendations(accessToken)
      .then((data) => setRecommendations(data.books))
      .catch(() => {});
  }, [accessToken]);

  const staffLink = user ? STAFF_LINKS[user.role] : null;

  return (
    <main className="flex min-h-full flex-1 flex-col">
      <section className="bg-gradient-to-br from-accent to-[#123f16] px-4 py-14 text-center text-white">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4">
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium uppercase tracking-wide">
            Smart Library
          </span>
          <h1 className="text-4xl font-semibold">Biblio-Tech</h1>
          <p className="max-w-md text-white/85">
            Votre bibliothèque intelligente : catalogue, emprunts, réservations de
            salles, et une couche domotique simulée en temps réel.
          </p>

          {loading ? null : user ? (
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-sm text-white/85">
                Connecté en tant que <strong>{user.name}</strong>
              </span>
              <button
                onClick={logout}
                className="rounded-md bg-white/15 px-3 py-1.5 text-sm hover:bg-white/25"
              >
                Se déconnecter
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/login" className="rounded-md bg-white px-5 py-2.5 font-medium text-accent">
                Se connecter
              </Link>
              <Link
                href="/register"
                className="rounded-md border border-white/40 px-5 py-2.5 font-medium text-white"
              >
                S'inscrire
              </Link>
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8">
        {staffLink && (
          <Link
            href={staffLink.href}
            className={`flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium text-white ${staffLink.bg}`}
          >
            <span>{staffLink.label}</span>
            <span>→</span>
          </Link>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Link
            href="/catalogue"
            className="flex flex-col gap-1 rounded-xl bg-accent-soft p-5 text-accent shadow-sm transition hover:shadow-md"
          >
            <span className="text-2xl">📖</span>
            <span className="font-semibold">Catalogue</span>
            <span className="text-sm opacity-80">Rechercher un livre</span>
          </Link>
          <Link
            href={user ? '/mes-emprunts' : '/login'}
            className="flex flex-col gap-1 rounded-xl bg-blue-soft p-5 text-blue shadow-sm transition hover:shadow-md"
          >
            <span className="text-2xl">📚</span>
            <span className="font-semibold">Mes emprunts</span>
            <span className="text-sm opacity-80">Suivre mes prêts en cours</span>
          </Link>
          <Link
            href={user ? '/mes-reservations' : '/login'}
            className="flex flex-col gap-1 rounded-xl bg-bordeaux-soft p-5 text-bordeaux shadow-sm transition hover:shadow-md"
          >
            <span className="text-2xl">🗓️</span>
            <span className="font-semibold">Mes réservations</span>
            <span className="text-sm opacity-80">Réserver une salle</span>
          </Link>
        </div>

        {user && recommendations.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
              Recommandé pour vous
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {recommendations.map((book) => (
                <Link
                  key={book.id}
                  href={`/catalogue/${book.id}`}
                  className="flex flex-col overflow-hidden rounded-lg border border-black/10 bg-surface text-left shadow-sm transition hover:shadow-md"
                >
                  <div className="relative aspect-[2/3] w-full bg-black/5">
                    {book.cover_url && (
                      <Image src={book.cover_url} alt={book.title} fill className="object-cover" />
                    )}
                  </div>
                  <p className="p-2 text-xs font-medium text-text">{book.title}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
