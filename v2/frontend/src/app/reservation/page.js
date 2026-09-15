'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { listRooms } from '../../services/roomsService';
import { createReservation } from '../../services/reservationsService';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function ReservationPage() {
  const { user, accessToken, loading } = useAuth();
  const [date, setDate] = useState(todayISO());
  const [rooms, setRooms] = useState([]);
  const [roomId, setRoomId] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    listRooms(date)
      .then(({ rooms }) => {
        setRooms(rooms);
        if (!roomId && rooms.length > 0) setRoomId(String(rooms[0].id));
      })
      .catch((err) => setMessage({ type: 'error', text: err.message }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const selectedRoom = rooms.find((r) => String(r.id) === roomId);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage(null);
    setSubmitting(true);
    try {
      await createReservation(accessToken, {
        roomId: Number(roomId),
        date,
        startTime,
        endTime,
      });
      setMessage({ type: 'success', text: 'Réservation effectuée !' });
      const { rooms } = await listRooms(date);
      setRooms(rooms);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="p-10 text-text-secondary">Chargement...</p>;

  if (!user) {
    return (
      <main className="flex min-h-full flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-text">Connecte-toi pour réserver une salle.</p>
        <Link href="/login" className="rounded-md bg-accent px-4 py-2 text-white">
          Se connecter
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text">Réserver une salle</h1>
        <Link href="/" className="text-sm text-text-secondary underline">
          ← Accueil
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl border border-black/10 bg-surface p-6">
        <label className="flex flex-col gap-1 text-sm text-text-secondary">
          Date
          <input
            type="date"
            min={todayISO()}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="rounded-md border border-black/15 px-3 py-2 text-text"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-text-secondary">
          Salle
          <select
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            required
            className="rounded-md border border-black/15 px-3 py-2 text-text"
          >
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name} — capacité {room.capacity}
              </option>
            ))}
          </select>
        </label>

        {selectedRoom && (
          <p className="text-xs text-text-secondary">
            {selectedRoom.reservations.length === 0
              ? 'Aucun créneau réservé ce jour-là.'
              : `Déjà réservé : ${selectedRoom.reservations
                  .map((r) => `${r.start_time.slice(0, 5)}–${r.end_time.slice(0, 5)}`)
                  .join(', ')}`}
          </p>
        )}

        <div className="flex gap-3">
          <label className="flex flex-1 flex-col gap-1 text-sm text-text-secondary">
            Début
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              className="rounded-md border border-black/15 px-3 py-2 text-text"
            />
          </label>
          <label className="flex flex-1 flex-col gap-1 text-sm text-text-secondary">
            Fin
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
              className="rounded-md border border-black/15 px-3 py-2 text-text"
            />
          </label>
        </div>

        {message && (
          <p className={message.type === 'error' ? 'text-bordeaux' : 'text-accent'}>
            {message.text}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting || !roomId}
          className="rounded-md bg-accent px-4 py-2 font-medium text-white disabled:opacity-60"
        >
          {submitting ? 'Réservation...' : 'Réserver'}
        </button>
      </form>
    </main>
  );
}
