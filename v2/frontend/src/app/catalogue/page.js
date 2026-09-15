import Link from 'next/link';
import { searchBooks } from '../../services/booksService';
import { BookCard } from '../../components/BookCard';

export const metadata = { title: 'Catalogue — Biblio-Tech' };

export default async function CataloguePage({ searchParams }) {
  const { q = '' } = await searchParams;

  let books = [];
  let error = null;
  try {
    ({ books } = await searchBooks(q));
  } catch (err) {
    error = err.message;
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text">Catalogue</h1>
        <Link href="/" className="text-sm text-text-secondary underline">
          ← Accueil
        </Link>
      </div>

      <form className="flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Rechercher un titre, un auteur ou un genre..."
          className="w-full rounded-md border border-black/15 bg-surface px-3 py-2 text-text"
        />
        <button
          type="submit"
          className="rounded-md bg-accent px-4 py-2 font-medium text-white"
        >
          Rechercher
        </button>
      </form>

      {error && <p className="text-bordeaux">{error}</p>}

      {!error && books.length === 0 && (
        <p className="text-text-secondary">Aucun livre trouvé.</p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </main>
  );
}
