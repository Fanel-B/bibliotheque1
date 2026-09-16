'use client';

import { useEffect, useState } from 'react';
import { listRooms } from '../services/roomsService';

function todayISO() {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

function nowHHMMSS() {
  const d = new Date();
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}:00`;
}

function roomStatus(room, now) {
  const current = room.reservations.find((r) => r.start_time <= now && now < r.end_time);
  if (current) {
    return { occupied: true, label: `Occupée jusqu'à ${current.end_time.slice(0, 5)}` };
  }
  const next = room.reservations.find((r) => r.start_time > now);
  if (next) {
    return { occupied: false, label: `Libre — prochaine résa à ${next.start_time.slice(0, 5)}` };
  }
  return { occupied: false, label: 'Libre toute la journée' };
}

// Les salles de réservation (Salle Lecture, Salle Info) ne sont pas des
// zones domotiques comme le Hall ou Rayon A — elles n'ont pas de capteurs,
// juste un calendrier de réservations. On affiche leur statut "en direct"
// (occupée / libre) à partir de ce calendrier, à côté du reste du dashboard.
export function RoomsStatus() {
  const [rooms, setRooms] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    listRooms(todayISO())
      .then((data) => setRooms(data.rooms))
      .catch((err) => setError(err.message));
  }, []);

  if (error) return null;
  if (!rooms) return null;

  const now = nowHHMMSS();

  return (
    <div className="rounded-xl border border-black/10 bg-surface p-4">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-text-secondary">
        Salles de réservation
      </h2>
      <p className="mb-3 text-xs text-text-secondary">
        Statut calculé à partir du calendrier de réservations — pas de capteurs ici.
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {rooms.map((room) => {
          const status = roomStatus(room, now);
          return (
            <div
              key={room.id}
              className="flex items-center justify-between rounded-lg border border-black/10 bg-bg px-4 py-3"
            >
              <div>
                <p className="font-medium text-text">{room.name}</p>
                <p className="text-xs text-text-secondary">Capacité : {room.capacity}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  status.occupied ? 'bg-error text-bordeaux' : 'bg-success text-accent'
                }`}
              >
                {status.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
