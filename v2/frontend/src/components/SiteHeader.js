'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { roleHomePath } from '../lib/roleHome';

// Les pages employé/admin ont déjà leur propre barre (StaffNav).
const STAFF_PREFIXES = ['/admin', '/iot', '/automatisations', '/employe'];

export function isStaffPath(pathname) {
  return STAFF_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

const NAV_LINKS = [
  { href: '/catalogue', label: 'Catalogue' },
  { href: '/reservation', label: 'Réserver une salle' },
  { href: '/mes-emprunts', label: 'Mes emprunts' },
];

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3" aria-label="Biblio-Tech, accueil">
      {/* Trois livres stylisés aux couleurs du site */}
      <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true">
        <rect x="4" y="8" width="7" height="22" rx="1" className="fill-periwinkle" />
        <rect x="13" y="4" width="7" height="26" rx="1" className="fill-tangerine" />
        <rect x="22" y="10" width="7" height="20" rx="1" transform="rotate(-8 25 20)" className="fill-ink" />
      </svg>
      <span className="font-serif text-xl tracking-wide text-ink">Biblio-Tech</span>
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  if (isStaffPath(pathname)) return null;

  return (
    <header className="border-b border-line bg-bg">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-3 px-5 py-5">
        <Logo />

        <nav className="order-3 flex w-full gap-6 overflow-x-auto text-[15px] font-medium sm:order-none sm:w-auto">
          {NAV_LINKS.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap border-b-2 py-1 transition ${
                  active ? 'border-ink text-ink' : 'border-transparent text-text-secondary hover:text-ink'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {loading ? null : user ? (
            <>
              {user.role !== 'user' && (
                <Link
                  href={roleHomePath(user.role)}
                  className="rounded-full bg-sun px-4 py-2 text-sm font-semibold text-ink hover:brightness-95"
                >
                  Mon espace
                </Link>
              )}
              <span className="hidden text-sm text-text-secondary md:inline">{user.name}</span>
              <button
                onClick={logout}
                className="rounded-full border border-ink/20 px-4 py-2 text-sm font-medium text-ink hover:bg-ink hover:text-white"
              >
                Se déconnecter
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white hover:bg-ink/85"
            >
              Se connecter
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const pathname = usePathname();
  if (isStaffPath(pathname)) return null;

  return (
    <footer className="mt-auto border-t border-line bg-surface">
      {/* Bande de couleurs, rappel des rubriques */}
      <div aria-hidden="true" className="flex h-1.5">
        <span className="flex-1 bg-sky" />
        <span className="flex-1 bg-lime" />
        <span className="flex-1 bg-periwinkle" />
        <span className="flex-1 bg-tangerine" />
        <span className="flex-1 bg-rose" />
        <span className="flex-1 bg-lilac" />
      </div>
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-3">
          <Logo />
          <p className="max-w-xs text-sm text-text-secondary">
            Projet de démonstration : bibliothèque intelligente avec une couche domotique simulée.
          </p>
        </div>
        <ul className="flex flex-col gap-2 text-sm">
          <li><Link href="/catalogue" className="hover:underline">Catalogue</Link></li>
          <li><Link href="/reservation" className="hover:underline">Réserver une salle</Link></li>
          <li><Link href="/register" className="hover:underline">Créer un compte</Link></li>
        </ul>
        <ul className="flex flex-col gap-2 text-sm">
          <li>
            <a href="https://github.com/Fanel-B/bibliotheque1" className="hover:underline">
              Code source sur GitHub
            </a>
          </li>
          <li><Link href="/login?role=employee" className="hover:underline">Accès employé</Link></li>
          <li><Link href="/login?role=admin" className="hover:underline">Accès admin</Link></li>
        </ul>
      </div>
    </footer>
  );
}
