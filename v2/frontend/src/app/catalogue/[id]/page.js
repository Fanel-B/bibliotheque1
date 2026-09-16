import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBook } from '../../../services/booksService';

export default async function BookDetailPage({ params }) {
  const { id } = await params;

  let book;
  try {
    ({ book } = await getBook(id));
  } catch {
    notFound();
  }

  const availableCount = book.copies.filter((c) => c.available).length;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-10">
      <Link href="/catalogue" className="text-sm text-text-secondary underline">
        ← Retour au catalogue
      </Link>

      <div className="flex flex-col gap-6 sm:flex-row">
        <div className="relative aspect-[2/3] w-40 shrink-0 overflow-hidden rounded-xl bg-black/5">
          {book.cover_url && (
            <Image src={book.cover_url} alt={book.title} fill className="object-cover" />
          )}
        </div>

        <div className="flex flex-1 flex-col gap-3">
          <h1 className="text-2xl font-semibold text-text">{book.title}</h1>
          <div className="flex flex-wrap items-center gap-3">
            {book.authors.map((author) => (
              <span key={author.name} className="flex items-center gap-2 text-text-secondary">
                {author.photo_url && (
                  <span className="relative block h-8 w-8 overflow-hidden rounded-full bg-black/5">
                    <Image src={author.photo_url} alt={author.name} fill className="object-cover" />
                  </span>
                )}
                {author.name}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {book.genres.map((genre) => (
              <span
                key={genre}
                className="rounded-full bg-blue/10 px-3 py-1 text-xs font-medium text-blue"
              >
                {genre}
              </span>
            ))}
          </div>

          <p className="text-sm text-text-secondary">
            {book.format} · {book.published_year}
          </p>

          <p className="text-text">{book.description}</p>

          <span
            className={`w-fit rounded-full px-3 py-1 text-sm font-medium ${
              availableCount > 0 ? 'bg-success text-accent' : 'bg-error text-bordeaux'
            }`}
          >
            {availableCount > 0
              ? `${availableCount} exemplaire${availableCount > 1 ? 's' : ''} disponible${availableCount > 1 ? 's' : ''}`
              : 'Aucun exemplaire disponible actuellement'}
          </span>
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-text-secondary">
          Exemplaires
        </h2>
        <ul className="flex flex-col gap-2">
          {book.copies.map((copy) => (
            <li
              key={copy.id}
              className="flex items-center justify-between rounded-md border border-black/10 bg-surface px-3 py-2 text-sm"
            >
              <span className="text-text">Exemplaire #{copy.id} — état : {copy.state}</span>
              <span className={copy.available ? 'text-accent' : 'text-bordeaux'}>
                {copy.available ? 'Disponible' : 'Emprunté'}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
