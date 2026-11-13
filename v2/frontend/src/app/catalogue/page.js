import { searchBooks } from '../../services/booksService';
import { BookCard } from '../../components/BookCard';

export const metadata = { title: 'Catalogue · Biblio-Tech' };

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
    <main className="flex flex-1 flex-col">
      <section className="bg-sky">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-12">
          <h1 className="text-4xl text-ink sm:text-5xl">Catalogue</h1>
          <form className="flex max-w-3xl flex-col gap-3 sm:flex-row">
            <input
              type="search"
              name="q"
              defaultValue={q}
              aria-label="Rechercher dans le catalogue"
              placeholder="Rechercher un titre, un auteur ou un genre..."
              className="w-full rounded-sm border border-ink/10 bg-surface px-4 py-3 text-ink placeholder:text-text-secondary/70 focus:border-ink focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-sm bg-ink px-6 py-3 font-semibold text-white hover:bg-ink/85"
            >
              Rechercher
            </button>
          </form>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-12">
        {q && !error && (
          <p className="text-sm text-text-secondary">
            {books.length} résultat{books.length > 1 ? 's' : ''} pour « {q} »
          </p>
        )}

        {error && <p className="text-bordeaux">{error}</p>}

        {!error && books.length === 0 && (
          <p className="text-text-secondary">Aucun livre trouvé.</p>
        )}

        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>
    </main>
  );
}
