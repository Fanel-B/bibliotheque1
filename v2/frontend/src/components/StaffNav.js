'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ADMIN_LINKS = [
  { href: '/admin', label: '📊 Dashboard' },
  { href: '/iot', label: '🌐 Smart Library' },
  { href: '/automatisations', label: '⚙️ Automatisations' },
  { href: '/employe/pret', label: '🗂️ Poste de prêt' },
];

const EMPLOYEE_LINKS = [
  { href: '/employe', label: '🏠 Espace employé' },
  { href: '/employe/pret', label: '🗂️ Poste de prêt' },
  { href: '/iot', label: '🌐 Smart Library' },
];

// Barre de navigation présente sur toutes les pages "pro" (employé/admin) —
// sans ça, chaque page n'était accessible que depuis un seul lien précis,
// et le reste devenait invisible dès qu'on naviguait ailleurs.
export function StaffNav({ role }) {
  const pathname = usePathname();
  const links = role === 'admin' ? ADMIN_LINKS : EMPLOYEE_LINKS;

  return (
    <nav className="flex flex-wrap items-center gap-1 border-b border-black/10 bg-surface px-4 py-2.5">
      {links.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              active ? 'bg-accent text-white' : 'text-text-secondary hover:bg-bg'
            }`}
          >
            {link.label}
          </Link>
        );
      })}
      <Link
        href="/"
        className="ml-auto rounded-md px-3 py-1.5 text-sm text-text-secondary hover:bg-bg"
      >
        Accueil public →
      </Link>
    </nav>
  );
}
