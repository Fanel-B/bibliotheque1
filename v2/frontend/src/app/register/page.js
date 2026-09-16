'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register(name, email, password);
      // L'inscription publique crée toujours un compte "user".
      router.push('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-full flex-1 items-center justify-center bg-gradient-to-br from-bg via-bg to-blue-soft/60 px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-4 rounded-xl border-t-4 border-blue bg-surface p-8 shadow-md"
      >
        <h1 className="text-xl font-semibold text-text">Inscription</h1>
        <p className="text-sm text-text-secondary">
          Crée ton compte pour emprunter des livres et réserver une salle.
        </p>

        {error && (
          <p className="rounded-md bg-error px-3 py-2 text-sm text-bordeaux">{error}</p>
        )}

        <label className="flex flex-col gap-1 text-sm text-text-secondary">
          Nom
          <input
            type="text"
            required
            minLength={2}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-md border border-black/15 px-3 py-2 text-text"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-text-secondary">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-md border border-black/15 px-3 py-2 text-text"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-text-secondary">
          Mot de passe
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-md border border-black/15 px-3 py-2 text-text"
          />
          <span className="text-xs text-text-secondary">8 caractères minimum.</span>
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-md bg-blue px-4 py-2 font-medium text-white disabled:opacity-60"
        >
          {submitting ? 'Création du compte...' : "S'inscrire"}
        </button>

        <p className="text-center text-sm text-text-secondary">
          Déjà un compte ?{' '}
          <Link href="/login" className="font-medium text-accent underline">
            Se connecter
          </Link>
        </p>
      </form>
    </main>
  );
}
