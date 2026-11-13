import Image from 'next/image';
import Link from 'next/link';

export function BookCard({ book }) {
  const isAvailable = book.available_copies > 0;

  return (
    <Link href={`/catalogue/${book.id}`} className="group flex flex-col gap-3">
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-sm bg-sand shadow-sm transition group-hover:-translate-y-1 group-hover:shadow-md">
        {book.cover_url && (
          <Image
            src={book.cover_url}
            alt={book.title}
            fill
            sizes="(max-width: 640px) 50vw, 220px"
            className="object-cover"
          />
        )}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="font-medium leading-snug text-ink group-hover:underline">{book.title}</h3>
        <p className="text-sm text-text-secondary">{book.authors.join(', ')}</p>
        <span className="mt-1 flex items-center gap-2 text-xs font-medium text-text-secondary">
          {/* Pastille de couleur : vert si disponible, rose sinon */}
          <span
            aria-hidden="true"
            className={`h-2.5 w-2.5 rounded-full ${isAvailable ? 'bg-accent' : 'bg-bordeaux'}`}
          />
          {isAvailable
            ? `${book.available_copies} disponible${book.available_copies > 1 ? 's' : ''}`
            : 'Indisponible'}
        </span>
      </div>
    </Link>
  );
}
