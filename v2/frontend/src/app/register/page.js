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
    <main className="flex flex-1 items-center justify-center bg-bg px-4 py-16">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-4 rounded-sm border-t-8 border-periwinkle bg-surface p-8 shadow-[0_12px_32px_-16px_rgba(0,0,0,0.25)] sm:p-10"
      >
        <h1 className="text-3xl text-ink">Inscription</h1>
        <p className="text-sm text-text-secondary">
          Crée ton compte pour emprunter des livres et réserver une salle.
        </p>

        {error && (
          <p className="rounded-sm bg-error px-3 py-2 text-sm text-bordeaux">{error}</p>
        )}

        <label className="flex flex-col gap-1 text-sm text-text-secondary">
          Nom
          <input
            type="text"
            required
            minLength={2}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-sm border border-line bg-bg px-4 py-3 text-ink focus:border-ink focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-text-secondary">
          Email
          <input
            type="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-sm border border-line bg-bg px-4 py-3 text-ink focus:border-ink focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-text-secondary">
          Mot de passe
          <input
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-sm border border-line bg-bg px-4 py-3 text-ink focus:border-ink focus:outline-none"
          />
          <span className="text-xs text-text-secondary">8 caractères minimum.</span>
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-sm bg-ink px-4 py-3 font-semibold text-white hover:bg-ink/85 disabled:opacity-60"
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
