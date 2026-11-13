'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { myRecommendations } from '../services/recommendationsService';
import { searchBooks } from '../services/booksService';
import { ColorTile, SectionTitle, Wave, ArrowBadge } from '../components/ui';

// Accès rapides : chaque rubrique a sa couleur.
const TILES = [
  { href: '/catalogue', color: 'bg-sky', title: 'Catalogue', text: 'Rechercher un titre, un auteur, un genre' },
  { href: '/mes-emprunts', color: 'bg-lime', title: 'Mes emprunts', text: 'Suivre mes prêts et leurs dates de retour' },
  { href: '/reservation', color: 'bg-periwinkle', title: 'Salles de travail', text: 'Réserver un créneau pour travailler à plusieurs' },
];

const ROLE_ENTRIES = [
  { href: '/login?role=user', color: 'bg-rose', title: 'Usager', text: 'Emprunter, réserver, découvrir' },
  { href: '/login?role=employee', color: 'bg-tangerine', title: 'Employé', text: 'Poste de prêt et suivi des salles' },
  { href: '/login?role=admin', color: 'bg-lilac', title: 'Admin', text: 'Statistiques, rôles, domotique' },
];

function CoverRow({ books }) {
  return (
    <div className="grid grid-cols-3 gap-5 sm:grid-cols-6">
      {books.map((book) => (
        <Link key={book.id} href={`/catalogue/${book.id}`} className="group flex flex-col gap-2">
          <div className="relative aspect-[2/3] w-full overflow-hidden rounded-sm bg-sand shadow-sm transition group-hover:-translate-y-1 group-hover:shadow-md">
            {book.cover_url && (
              <Image src={book.cover_url} alt="" fill sizes="(max-width: 640px) 33vw, 180px" className="object-cover" />
            )}
          </div>
          <span className="text-sm font-medium leading-snug text-blue group-hover:underline">
            {book.title}
          </span>
        </Link>
      ))}
    </div>
  );
}

export default function Home() {
  const { user, accessToken } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [featured, setFeatured] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  // Une sélection du catalogue, visible même sans être connecté.
  useEffect(() => {
    searchBooks('')
      .then((data) => setFeatured(data.books.slice(0, 6)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!accessToken) return;
    myRecommendations(accessToken)
      .then((data) => setRecommendations(data.books))
      .catch(() => {});
  }, [accessToken]);

  function handleSearch(event) {
    event.preventDefault();
    router.push(`/catalogue?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <main className="flex flex-1 flex-col">
      {/* En-tête de page : titre, recherche, entrées par rôle */}
      <section className="relative bg-bg">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5 pb-16 pt-14 sm:pt-20">
          <div className="flex max-w-3xl flex-col gap-4">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-text-secondary">
              Bienvenue à la bibliothèque
            </span>
            <h1 className="text-5xl leading-[1.05] text-ink sm:text-7xl">
              Lire, emprunter,
              <br />
              <span className="italic">se retrouver.</span>
            </h1>
            <p className="max-w-xl text-lg text-text-secondary">
              Le catalogue, vos emprunts, les salles de travail et une bibliothèque connectée
              dont on voit vivre les capteurs en temps réel.
            </p>
          </div>

          <form
            onSubmit={handleSearch}
            className="flex max-w-3xl flex-col gap-4 rounded-sm bg-surface p-6 shadow-[0_1px_0_rgba(0,0,0,0.04),0_12px_32px_-16px_rgba(0,0,0,0.25)] sm:p-8"
          >
            <label htmlFor="home-search" className="text-xl text-ink">
              Que cherchez-vous ?
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="home-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Un titre, un auteur, un genre..."
                className="w-full rounded-sm border border-line bg-bg px-4 py-3 text-ink placeholder:text-text-secondary/70 focus:border-ink focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-sm bg-ink px-6 py-3 font-semibold text-white hover:bg-ink/85"
              >
                Rechercher
              </button>
            </div>
          </form>
        </div>

        {/* Bande dégradée sous l'en-tête */}
        <div aria-hidden="true" className="h-3 bg-gradient-to-r from-periwinkle via-sky to-lime" />
      </section>

      <section className="bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col gap-12 px-5 py-16">
          {user ? (
            <SectionTitle kicker={`Bonjour ${user.name.split(' ')[0]}`}>Votre bibliothèque</SectionTitle>
          ) : (
            <SectionTitle kicker="À découvrir">Lire, réserver, explorer</SectionTitle>
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            {TILES.map((tile) => (
              <ColorTile key={tile.href} {...tile} href={user || tile.href === '/catalogue' ? tile.href : '/login'} />
            ))}
          </div>

          {user && recommendations.length > 0 && (
            <div className="flex flex-col gap-5">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">
                Recommandé pour vous
              </span>
              <CoverRow books={recommendations.slice(0, 6)} />
            </div>
          )}

          {featured.length > 0 && (
            <div className="flex flex-col gap-5">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">
                Dans nos rayons
              </span>
              <CoverRow books={featured} />
              <Link
                href="/catalogue"
                className="w-fit rounded-sm bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-ink/85"
              >
                Voir tout le catalogue →
              </Link>
            </div>
          )}
        </div>
        <Wave className="text-bg" />
      </section>

      {/* Mise en avant de la couche domotique */}
      <section className="bg-bg">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5 py-16">
          <SectionTitle kicker="À la une">Une bibliothèque connectée</SectionTitle>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col justify-between gap-6 bg-gradient-to-br from-tangerine to-rose p-8 text-ink">
              <div className="flex flex-col gap-3">
                <h3 className="font-serif text-2xl">Capteurs en temps réel</h3>
                <p className="text-ink/80">
                  Température, lumière, affluence : chaque zone a ses capteurs simulés, et des
                  règles d&apos;automatisation déclenchent ventilation ou éclairage.
                </p>
              </div>
            </div>
            <div className="flex flex-col justify-between gap-6 bg-gradient-to-br from-sky to-lime p-8 text-ink">
              <div className="flex flex-col gap-3">
                <h3 className="font-serif text-2xl">Sécurité des archives</h3>
                <p className="text-ink/80">
                  Une ouverture hors horaires déclenche un événement puis une alerte, avec
                  l&apos;historique conservé pour le personnel.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Entrées par rôle, seulement pour les visiteurs non connectés */}
      {!user && (
        <section className="bg-surface">
          <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5 py-16">
            <SectionTitle kicker="Comptes de démonstration">Je suis...</SectionTitle>
            <div className="grid gap-4 sm:grid-cols-3">
              {ROLE_ENTRIES.map((entry) => (
                <ColorTile key={entry.href} {...entry} />
              ))}
            </div>
            <p className="text-sm text-text-secondary">
              Mot de passe pour tous les comptes : <code className="rounded bg-bg px-1.5 py-0.5">demo1234</code>.{' '}
              <Link href="/register" className="group inline-flex items-center gap-2 font-medium text-ink underline">
                Ou créer un compte usager
              </Link>
            </p>
          </div>
        </section>
      )}

      {user && user.role !== 'user' && (
        <section className="bg-surface">
          <div className="mx-auto max-w-6xl px-5 py-12">
            <Link
              href={user.role === 'admin' ? '/admin' : '/employe'}
              className="group flex items-center justify-between gap-6 bg-sun p-8 text-ink"
            >
              <span className="font-serif text-2xl">
                {user.role === 'admin' ? 'Aller au dashboard admin' : 'Aller à mon espace employé'}
              </span>
              <ArrowBadge />
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
