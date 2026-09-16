'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import * as iotService from '../../services/iotService';

export default function EspaceEmployePage() {
  const { user, accessToken, loading, logout } = useAuth();
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    if (!accessToken) return;
    iotService
      .getAlerts(accessToken)
      .then((data) => setAlertCount(data.alerts.length))
      .catch(() => {});
  }, [accessToken]);

  if (loading) return <p className="p-10 text-text-secondary">Chargement...</p>;

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
    <main className="flex min-h-full flex-1 flex-col">
      <div className="bg-blue px-4 py-10 text-white">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wide text-blue-soft">
            Espace employé
          </span>
          <h1 className="text-2xl font-semibold">Bonjour {user.name.split(' ')[0]} 👋</h1>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-8">
        {alertCount > 0 && (
          <Link
            href="/iot"
            className="flex items-center justify-between rounded-lg border border-bordeaux/30 bg-error px-4 py-3 text-sm text-bordeaux"
          >
            <span>
              🚨 {alertCount} alerte{alertCount > 1 ? 's' : ''} active{alertCount > 1 ? 's' : ''}
            </span>
            <span className="underline">Voir</span>
          </Link>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            href="/employe/pret"
            className="flex flex-col gap-2 rounded-xl border border-black/10 bg-surface p-5 shadow-sm transition hover:shadow-md"
          >
            <span className="text-2xl">🗂️</span>
            <h2 className="font-semibold text-text">Poste de prêt</h2>
            <p className="text-sm text-text-secondary">Enregistrer un emprunt ou un retour.</p>
          </Link>

          <Link
            href="/iot"
            className="flex flex-col gap-2 rounded-xl border border-black/10 bg-surface p-5 shadow-sm transition hover:shadow-md"
          >
            <span className="text-2xl">🌐</span>
            <h2 className="font-semibold text-text">Smart Library</h2>
            <p className="text-sm text-text-secondary">Capteurs, équipements et alertes en direct.</p>
          </Link>

          <Link
            href="/catalogue"
            className="flex flex-col gap-2 rounded-xl border border-black/10 bg-surface p-5 shadow-sm transition hover:shadow-md"
          >
            <span className="text-2xl">📖</span>
            <h2 className="font-semibold text-text">Catalogue</h2>
            <p className="text-sm text-text-secondary">Rechercher un livre pour un usager.</p>
          </Link>

          <button
            onClick={logout}
            className="flex flex-col items-start gap-2 rounded-xl border border-black/10 bg-surface p-5 text-left shadow-sm transition hover:shadow-md"
          >
            <span className="text-2xl">🚪</span>
            <h2 className="font-semibold text-text">Se déconnecter</h2>
            <p className="text-sm text-text-secondary">Fin de service.</p>
          </button>
        </div>
      </div>
    </main>
  );
}
