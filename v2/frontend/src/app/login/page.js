'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { roleHomePath } from '../../lib/roleHome';

// Purement de la présentation — mène toujours au même formulaire, et le
// rôle réel après connexion vient uniquement de la réponse du serveur
// (roleHomePath(user.role)), jamais de ce paramètre choisi avant de se
// connecter. Se tromper de bouton ne donne aucun accès en plus.
const ROLE_META = {
  user: {
    title: 'Connexion usager',
    borderClass: 'border-accent',
    buttonClass: 'bg-accent',
    hint: null,
  },
  employee: {
    title: 'Connexion employé',
    borderClass: 'border-blue',
    buttonClass: 'bg-blue',
    hint: "Réservé au personnel. Pas de compte ? Demande à un administrateur.",
  },
  admin: {
    title: 'Connexion admin',
    borderClass: 'border-bordeaux',
    buttonClass: 'bg-bordeaux',
    hint: 'Réservé aux administrateurs.',
  },
};

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const meta = ROLE_META[searchParams.get('role')] ?? ROLE_META.user;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await login(email, password);
      router.push(roleHomePath(user.role));
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-full flex-1 items-center justify-center bg-gradient-to-br from-bg via-bg to-accent-soft/60 px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className={`flex w-full max-w-sm flex-col gap-4 rounded-xl border-t-4 bg-surface p-8 shadow-md ${meta.borderClass}`}
      >
        <h1 className="text-xl font-semibold text-text">{meta.title}</h1>
        {meta.hint && <p className="text-sm text-text-secondary">{meta.hint}</p>}

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
          className={`mt-2 rounded-md px-4 py-2 font-medium text-white disabled:opacity-60 ${meta.buttonClass}`}
        >
          {submitting ? 'Connexion...' : 'Se connecter'}
        </button>

        {!meta.hint && (
          <p className="text-center text-sm text-text-secondary">
            Pas encore de compte ?{' '}
            <Link href="/register" className="font-medium text-accent underline">
              S'inscrire
            </Link>
          </p>
        )}

        <p className="text-center text-xs text-text-secondary">
          Comptes de démo (mot de passe <code>demo1234</code>) : claire@bibliotech.demo (usager),
          hugo@bibliotech.demo (employé), admin@bibliotech.demo (admin)
        </p>
      </form>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
