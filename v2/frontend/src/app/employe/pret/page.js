'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { searchBooks, getBook } from '../../../services/booksService';
import { createLoan, returnLoan } from '../../../services/loansService';

export default function PosteDePretPage() {
  const { user, accessToken, loading } = useAuth();
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [borrowerEmail, setBorrowerEmail] = useState('');
  const [message, setMessage] = useState(null);

  async function handleSearch(event) {
    event.preventDefault();
    setMessage(null);
    try {
      const { books } = await searchBooks(query);
      setBooks(books);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  }

  if (loading) {
    return <p className="p-10 text-text-secondary">Chargement...</p>;
  }

  if (!user || !['employee', 'admin'].includes(user.role)) {
    return (
      <main className="flex min-h-full flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-text">Cette page est réservée au personnel de la bibliothèque.</p>
        <Link href="/login" className="rounded-md bg-accent px-4 py-2 text-white">
          Se connecter
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text">Poste de prêt</h1>
        <Link href="/" className="text-sm text-text-secondary underline">
          ← Accueil
        </Link>
      </div>

      <label className="flex flex-col gap-1 text-sm text-text-secondary">
        Email de l'emprunteur (pour un nouveau prêt)
        <input
          type="email"
          value={borrowerEmail}
          onChange={(e) => setBorrowerEmail(e.target.value)}
          placeholder="claire@bibliotech.demo"
          className="rounded-md border border-black/15 bg-surface px-3 py-2 text-text"
        />
      </label>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Chercher un livre par titre, auteur ou genre..."
          className="w-full rounded-md border border-black/15 bg-surface px-3 py-2 text-text"
        />
        <button type="submit" className="rounded-md bg-accent px-4 py-2 font-medium text-white">
          Chercher
        </button>
      </form>

      {message && (
        <p className={message.type === 'error' ? 'text-bordeaux' : 'text-accent'}>
          {message.text}
        </p>
      )}

      <ul className="flex flex-col gap-4">
        {books.map((book) => (
          <li key={book.id} className="rounded-lg border border-black/10 bg-surface p-4">
            <p className="mb-2 font-medium text-text">
              {book.title} <span className="text-text-secondary">— {book.authors.join(', ')}</span>
            </p>
            <BookCopies
              bookId={book.id}
              accessToken={accessToken}
              borrowerEmail={borrowerEmail}
              onMessage={setMessage}
            />
          </li>
        ))}
      </ul>
    </main>
  );
}

function BookCopies({ bookId, accessToken, borrowerEmail, onMessage }) {
  const [copies, setCopies] = useState(null);
  const [busyCopyId, setBusyCopyId] = useState(null);

  async function loadCopies() {
    const { book } = await getBook(bookId);
    setCopies(book.copies);
  }

  useEffect(() => {
    setCopies(null);
    loadCopies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId]);

  async function handleLoan(copyId) {
    if (!borrowerEmail) {
      onMessage({ type: 'error', text: "Renseigne l'email de l'emprunteur d'abord." });
      return;
    }
    setBusyCopyId(copyId);
    try {
      await createLoan(accessToken, { userEmail: borrowerEmail, copyId });
      onMessage({ type: 'success', text: `Exemplaire #${copyId} prêté à ${borrowerEmail}.` });
      await loadCopies();
    } catch (err) {
      onMessage({ type: 'error', text: err.message });
    } finally {
      setBusyCopyId(null);
    }
  }

  async function handleReturn(copyId) {
    setBusyCopyId(copyId);
    try {
      await returnLoan(accessToken, copyId);
      onMessage({ type: 'success', text: `Exemplaire #${copyId} marqué comme rendu.` });
      await loadCopies();
    } catch (err) {
      onMessage({ type: 'error', text: err.message });
    } finally {
      setBusyCopyId(null);
    }
  }

  if (!copies) return <p className="text-sm text-text-secondary">Chargement des exemplaires...</p>;

  return (
    <ul className="flex flex-col gap-2">
      {copies.map((copy) => (
        <li
          key={copy.id}
          className="flex items-center justify-between rounded-md border border-black/10 px-3 py-2 text-sm"
        >
          <span className="text-text">
            Exemplaire #{copy.id} — {copy.state} —{' '}
            <span className={copy.available ? 'text-accent' : 'text-bordeaux'}>
              {copy.available ? 'disponible' : 'emprunté'}
            </span>
          </span>
          {copy.available ? (
            <button
              onClick={() => handleLoan(copy.id)}
              disabled={busyCopyId === copy.id}
              className="rounded-md bg-accent px-3 py-1 text-white disabled:opacity-60"
            >
              Prêter
            </button>
          ) : (
            <button
              onClick={() => handleReturn(copy.id)}
              disabled={busyCopyId === copy.id}
              className="rounded-md border border-black/15 px-3 py-1 text-text disabled:opacity-60"
            >
              Marquer rendu
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
