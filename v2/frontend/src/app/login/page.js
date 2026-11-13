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
    borderClass: 'border-rose',
    hint: null,
  },
  employee: {
    title: 'Connexion employé',
    borderClass: 'border-tangerine',
    hint: "Réservé au personnel. Pas de compte ? Demande à un administrateur.",
  },
  admin: {
    title: 'Connexion admin',
    borderClass: 'border-lilac',
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
  const [slowServer, setSlowServer] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    // Si la réponse tarde plus de 4 s, c'est presque toujours le réveil du serveur.
    const slowTimer = setTimeout(() => setSlowServer(true), 4000);
    try {
      const user = await login(email, password);
      router.push(roleHomePath(user.role));
    } catch (err) {
      setError(err.message);
    } finally {
      clearTimeout(slowTimer);
      setSlowServer(false);
      setSubmitting(false);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-bg px-4 py-16">
      <form
        onSubmit={handleSubmit}
        className={`flex w-full max-w-sm flex-col gap-4 rounded-sm border-t-8 bg-surface p-8 shadow-[0_12px_32px_-16px_rgba(0,0,0,0.25)] sm:p-10 ${meta.borderClass}`}
      >
        <h1 className="text-3xl text-ink">{meta.title}</h1>
        {meta.hint && <p className="text-sm text-text-secondary">{meta.hint}</p>}

        {error && (
          <p className="rounded-sm bg-error px-3 py-2 text-sm text-bordeaux">
            {error}
          </p>
        )}

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
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-sm border border-line bg-bg px-4 py-3 text-ink focus:border-ink focus:outline-none"
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-sm bg-ink px-4 py-3 font-semibold text-white hover:bg-ink/85 disabled:opacity-60"
        >
          {submitting ? 'Connexion...' : 'Se connecter'}
        </button>

        {/* L'API gratuite se met en veille : on prévient au lieu de laisser
            croire que les identifiants sont refusés. */}
        {slowServer && (
          <p className="text-center text-xs text-text-secondary">
            {"Le serveur se réveille (hébergement gratuit), cela peut prendre jusqu'à une minute..."}
          </p>
        )}

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
