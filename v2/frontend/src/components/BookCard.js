import Image from 'next/image';
import Link from 'next/link';

export function BookCard({ book }) {
  const isAvailable = book.available_copies > 0;

  return (
    <Link
      href={`/catalogue/${book.id}`}
      className="flex flex-col overflow-hidden rounded-xl border border-black/10 bg-surface shadow-sm transition hover:shadow-md"
    >
      <div className="relative aspect-[2/3] w-full bg-black/5">
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
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="font-medium text-text">{book.title}</h3>
        <p className="text-sm text-text-secondary">{book.authors.join(', ')}</p>
        <span
          className={`mt-2 w-fit rounded-full px-2 py-1 text-xs font-medium ${
            isAvailable ? 'bg-success text-accent' : 'bg-error text-bordeaux'
          }`}
        >
          {isAvailable
            ? `${book.available_copies} disponible${book.available_copies > 1 ? 's' : ''}`
            : 'Indisponible'}
        </span>
      </div>
    </Link>
  );
}
