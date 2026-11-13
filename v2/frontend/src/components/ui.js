import Link from 'next/link';

// Petits éléments visuels réutilisés sur les pages publiques.

// Flèche dans un rond noir, en bas des cartes de couleur.
export function ArrowBadge({ className = '' }) {
  return (
    <span
      aria-hidden="true"
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-white transition group-hover:translate-x-1 ${className}`}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3 8h9M8.5 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

// Carte de couleur cliquable : titre, texte court, flèche.
export function ColorTile({ href, color, title, text }) {
  return (
    <Link
      href={href}
      className={`group flex min-h-36 flex-col justify-between gap-6 rounded-sm p-6 text-ink transition hover:-translate-y-0.5 ${color}`}
    >
      <span>
        <span className="block text-lg font-semibold">{title}</span>
        {text && <span className="mt-1 block text-sm text-ink/75">{text}</span>}
      </span>
      <ArrowBadge />
    </Link>
  );
}

// Séparateur en vague entre deux sections.
export function Wave({ className = 'text-bg' }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 24"
      preserveAspectRatio="none"
      className={`block h-4 w-full ${className}`}
    >
      <path
        fill="currentColor"
        d="M0 12 Q 30 0 60 12 T 120 12 T 180 12 T 240 12 T 300 12 T 360 12 T 420 12 T 480 12 T 540 12 T 600 12 T 660 12 T 720 12 T 780 12 T 840 12 T 900 12 T 960 12 T 1020 12 T 1080 12 T 1140 12 T 1200 12 T 1260 12 T 1320 12 T 1380 12 T 1440 12 V 24 H 0 Z"
      />
    </svg>
  );
}

// Titre de section, avec un sur-titre optionnel en petites capitales.
export function SectionTitle({ kicker, children }) {
  return (
    <div className="flex flex-col gap-2">
      {kicker && (
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">
          {kicker}
        </span>
      )}
      <h2 className="text-3xl text-ink sm:text-4xl">{children}</h2>
    </div>
  );
}
