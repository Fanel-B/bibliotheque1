'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      router.push('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-full flex-1 items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-black/10 bg-surface p-8 shadow-sm"
      >
        <h1 className="text-xl font-semibold text-text">Connexion</h1>

        {error && (
          <p className="rounded-md bg-error px-3 py-2 text-sm text-bordeaux">
            {error}
          </p>
        )}

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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-md border border-black/15 px-3 py-2 text-text"
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-md bg-accent px-4 py-2 font-medium text-white disabled:opacity-60"
        >
          {submitting ? 'Connexion...' : 'Se connecter'}
        </button>

        <p className="text-center text-xs text-text-secondary">
          Compte de démo : admin@bibliotech.demo / demo1234
        </p>
      </form>
    </main>
  );
}
