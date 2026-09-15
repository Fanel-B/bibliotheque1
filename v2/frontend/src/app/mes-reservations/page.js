'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { myReservations, cancelReservation } from '../../services/reservationsService';

export default function MesReservationsPage() {
  const { user, accessToken, loading } = useAuth();
  const [reservations, setReservations] = useState(null);
  const [message, setMessage] = useState(null);
  const [busyId, setBusyId] = useState(null);

  function load() {
    myReservations(accessToken)
      .then((data) => setReservations(data.reservations))
      .catch((err) => setMessage({ type: 'error', text: err.message }));
  }

  useEffect(() => {
    if (accessToken) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  async function handleCancel(id) {
    setBusyId(id);
    setMessage(null);
    try {
      await cancelReservation(accessToken, id);
      setMessage({ type: 'success', text: 'Réservation annulée.' });
      load();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <p className="p-10 text-text-secondary">Chargement...</p>;

  if (!user) {
    return (
      <main className="flex min-h-full flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-text">Connecte-toi pour voir tes réservations.</p>
        <Link href="/login" className="rounded-md bg-accent px-4 py-2 text-white">
          Se connecter
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text">Mes réservations</h1>
        <Link href="/" className="text-sm text-text-secondary underline">
          ← Accueil
        </Link>
      </div>

      <Link href="/reservation" className="w-fit rounded-md bg-accent px-4 py-2 text-sm font-medium text-white">
        + Nouvelle réservation
      </Link>

      {message && (
        <p className={message.type === 'error' ? 'text-bordeaux' : 'text-accent'}>
          {message.text}
        </p>
      )}

      {reservations && reservations.length === 0 && (
        <p className="text-text-secondary">Aucune réservation pour le moment.</p>
      )}

      <ul className="flex flex-col gap-3">
        {reservations?.map((res) => (
          <li
            key={res.id}
            className="flex items-center justify-between rounded-lg border border-black/10 bg-surface p-4"
          >
            <div>
              <p className="font-medium text-text">{res.room_name}</p>
              <p className="text-sm text-text-secondary">
                {res.date} · {res.start_time.slice(0, 5)}–{res.end_time.slice(0, 5)}
              </p>
            </div>
            <button
              onClick={() => handleCancel(res.id)}
              disabled={busyId === res.id}
              className="rounded-md border border-black/15 px-3 py-1 text-sm text-bordeaux disabled:opacity-60"
            >
              Annuler
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
