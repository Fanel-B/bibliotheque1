'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import * as automationsService from '../../services/automationsService';

const METRIC_LABELS = {
  temperature: 'la température',
  humidite: "l'humidité",
  luminosite: 'la luminosité',
  uv: "l'UV",
  occupation: "l'occupation",
};

function describeCondition(condition) {
  const metric = METRIC_LABELS[condition.metric] ?? condition.metric;
  const openPart = condition.requireOpen ? ' ET la bibliothèque est ouverte' : '';
  return `SI ${metric} (${condition.zone}) ${condition.operator} ${condition.value}${openPart}`;
}

function describeAction(action) {
  return `ALORS ${action.deviceName} → ${action.state === 'on' ? 'allumé' : 'éteint'}`;
}

export default function AutomationsPage() {
  const { user, accessToken, loading } = useAuth();
  const [automations, setAutomations] = useState([]);
  const [logs, setLogs] = useState([]);
  const [message, setMessage] = useState(null);

  function load() {
    Promise.all([
      automationsService.listAutomations(accessToken),
      automationsService.listLogs(accessToken),
    ])
      .then(([a, l]) => {
        setAutomations(a.automations);
        setLogs(l.logs);
      })
      .catch((err) => setMessage({ type: 'error', text: err.message }));
  }

  useEffect(() => {
    if (accessToken) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  async function handleToggle(automation) {
    try {
      await automationsService.setEnabled(accessToken, automation.id, !automation.enabled);
      load();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  }

  if (loading) return <p className="p-10 text-text-secondary">Chargement...</p>;

  if (!user || user.role !== 'admin') {
    return (
      <main className="flex min-h-full flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-text">Cette page est réservée aux administrateurs.</p>
        <Link href="/login" className="rounded-md bg-accent px-4 py-2 text-white">
          Se connecter
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text">Automatisations</h1>
        <Link href="/" className="text-sm text-text-secondary underline">
          ← Accueil
        </Link>
      </div>

      {message && <p className="text-bordeaux">{message.text}</p>}

      <section className="flex flex-col gap-3">
        {automations.map((automation) => (
          <div
            key={automation.id}
            className="flex items-center justify-between rounded-lg border border-black/10 bg-surface p-4"
          >
            <div>
              <p className="font-medium text-text">{automation.name}</p>
              <p className="text-sm text-text-secondary">
                {describeCondition(automation.condition_json)} {describeAction(automation.action_json)}
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm text-text-secondary">
              <input
                type="checkbox"
                checked={automation.enabled}
                onChange={() => handleToggle(automation)}
              />
              Active
            </label>
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-black/10 bg-surface p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-secondary">
          Journal d'exécution
        </h2>
        {logs.length === 0 ? (
          <p className="text-sm text-text-secondary">Aucune règle déclenchée pour le moment.</p>
        ) : (
          <ul className="flex flex-col gap-2 text-sm">
            {logs.map((log) => (
              <li key={log.id} className="flex justify-between border-t border-black/10 py-2 text-text">
                <span>
                  {log.automation_name} — valeur déclenchante : {log.triggered_value}
                </span>
                <span className="text-text-secondary">
                  {new Date(log.executed_at).toLocaleString('fr-FR')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
