'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useAuth } from '../../context/AuthContext';
import * as iotService from '../../services/iotService';
import { LibraryMap } from '../../components/LibraryMap';
import { RoomsStatus } from '../../components/RoomsStatus';
import { StaffNav } from '../../components/StaffNav';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip);

const ACCENT = '#1B5E20';
const TEXT_SECONDARY = '#5D4037';
const GRID_COLOR = 'rgba(44, 24, 16, 0.08)';
const REFRESH_MS = 15000;

const SENSOR_META = {
  temperature: { label: 'Température', icon: '🌡️' },
  humidite: { label: 'Humidité', icon: '💧' },
  luminosite: { label: 'Luminosité', icon: '💡' },
  uv: { label: 'UV', icon: '☀️' },
  occupation: { label: 'Occupation', icon: '👥' },
  porte: { label: 'Porte', icon: '🚪' },
};

const SCENARIOS = [
  { type: 'open_archives', label: '🔓 Ouvrir les archives' },
  { type: 'raise_temperature', label: '🌡️ Augmenter la température' },
  { type: 'increase_visitors', label: '👥 Augmenter les visiteurs' },
  { type: 'simulate_outage', label: '⚠️ Simuler une panne' },
  { type: 'toggle_light', label: '💡 Allumer / éteindre une lumière' },
];

function formatSensorValue(sensor) {
  if (sensor.offline || sensor.value === null) return 'Indisponible';
  if (sensor.type === 'porte') return sensor.value === 1 ? 'Ouverte' : 'Fermée';
  return `${sensor.value} ${sensor.unit ?? ''}`.trim();
}

export default function IotDashboardPage() {
  const { user, accessToken, loading } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [zones, setZones] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [message, setMessage] = useState(null);
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [history, setHistory] = useState([]);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(() => {
    if (!accessToken) return;
    Promise.all([iotService.getZones(accessToken), iotService.getAlerts(accessToken)])
      .then(([z, a]) => {
        setZones(z.zones);
        setAlerts(a.alerts);
      })
      .catch((err) => setMessage({ type: 'error', text: err.message }));
  }, [accessToken]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, REFRESH_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  useEffect(() => {
    if (!selectedSensor || !accessToken) return;
    iotService
      .getSensorHistory(accessToken, selectedSensor.id, '24h')
      .then((data) => setHistory(data.readings))
      .catch((err) => setMessage({ type: 'error', text: err.message }));
  }, [selectedSensor, accessToken]);

  async function handleDeviceToggle(device) {
    setBusy(true);
    setMessage(null);
    try {
      const nextState = device.current_state === 'on' ? 'off' : 'on';
      await iotService.setDeviceState(accessToken, device.id, nextState);
      refresh();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setBusy(false);
    }
  }

  async function handleScenario(type) {
    setBusy(true);
    setMessage(null);
    try {
      const result = await iotService.runScenario(accessToken, type);
      setMessage({ type: 'success', text: result.message });
      refresh();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setBusy(false);
    }
  }

  async function handleAcknowledge(alertId) {
    try {
      await iotService.acknowledgeAlert(accessToken, alertId);
      refresh();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  }

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
    <>
      <StaffNav role={user.role} />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-10">
      <h1 className="text-2xl font-semibold text-text">Smart Library — IoT</h1>

      {message && (
        <p className={message.type === 'error' ? 'text-bordeaux' : 'text-accent'}>{message.text}</p>
      )}

      {alerts.length > 0 && (
        <section className="flex flex-col gap-2 rounded-xl border border-bordeaux/30 bg-error p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-bordeaux">
            Alertes actives
          </h2>
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-center justify-between text-sm text-bordeaux">
              <span>
                🚨 {alert.zone_name} — {alert.event_type === 'door_open' ? 'porte ouverte hors horaires' : alert.event_type}
                {' · '}
                {new Date(alert.created_at).toLocaleString('fr-FR')}
              </span>
              <button
                onClick={() => handleAcknowledge(alert.id)}
                className="rounded-md border border-bordeaux/40 px-2 py-1 text-xs"
              >
                Acquitter
              </button>
            </div>
          ))}
        </section>
      )}

      {isAdmin && (
        <section className="flex flex-wrap gap-2 rounded-xl border border-black/10 bg-surface p-4">
          <h2 className="w-full text-sm font-semibold uppercase tracking-wide text-text-secondary">
            Simulateur — actions de démonstration
          </h2>
          {SCENARIOS.map((s) => (
            <button
              key={s.type}
              onClick={() => handleScenario(s.type)}
              disabled={busy}
              className="rounded-md border border-black/15 px-3 py-2 text-sm text-text disabled:opacity-60"
            >
              {s.label}
            </button>
          ))}
        </section>
      )}

      {zones.length > 0 && <LibraryMap zones={zones} />}

      <RoomsStatus />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {zones.map((zone) => (
          <div key={zone.id} className="flex flex-col gap-3 rounded-xl border border-black/10 bg-surface p-4">
            <h3 className="font-medium text-text">{zone.name}</h3>

            <div className="flex flex-col gap-2">
              {zone.sensors.map((sensor) => {
                const meta = SENSOR_META[sensor.type] ?? { label: sensor.type, icon: '📟' };
                const clickable = sensor.type !== 'porte' && !sensor.offline;
                return (
                  <button
                    key={sensor.id}
                    onClick={() => clickable && setSelectedSensor({ id: sensor.id, label: `${zone.name} — ${meta.label}` })}
                    disabled={!clickable}
                    className={`flex items-center justify-between rounded-md px-3 py-2 text-sm ${
                      sensor.offline ? 'bg-error text-bordeaux' : 'bg-bg text-text'
                    } ${clickable ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                  >
                    <span>{meta.icon} {meta.label}</span>
                    <span className="font-medium">{formatSensorValue(sensor)}</span>
                  </button>
                );
              })}
            </div>

            {zone.devices.length > 0 && (
              <div className="flex flex-col gap-2 border-t border-black/10 pt-3">
                {zone.devices.map((device) => (
                  <div key={device.id} className="flex items-center justify-between text-sm">
                    <span className="text-text">
                      {device.name}{' '}
                      <span
                        className={`ml-1 rounded-full px-2 py-0.5 text-xs ${
                          device.current_state === 'offline'
                            ? 'bg-error text-bordeaux'
                            : device.current_state === 'on' || device.current_state === 'open'
                              ? 'bg-success text-accent'
                              : 'bg-black/5 text-text-secondary'
                        }`}
                      >
                        {device.current_state}
                      </span>
                    </span>
                    {isAdmin && device.controllable && (
                      <button
                        onClick={() => handleDeviceToggle(device)}
                        disabled={busy}
                        className="rounded-md border border-black/15 px-2 py-1 text-xs text-text disabled:opacity-60"
                      >
                        Basculer
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </section>

      {selectedSensor && (
        <section className="rounded-xl border border-black/10 bg-surface p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-secondary">
            Historique 24h — {selectedSensor.label}
          </h2>
          <Line
            data={{
              labels: history.map((h) => new Date(h.recorded_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })),
              datasets: [
                {
                  data: history.map((h) => Number(h.value)),
                  borderColor: ACCENT,
                  backgroundColor: 'rgba(27, 94, 32, 0.12)',
                  fill: true,
                  tension: 0.3,
                  pointRadius: 0,
                },
              ],
            }}
            options={{
              plugins: { legend: { display: false } },
              scales: {
                x: { ticks: { color: TEXT_SECONDARY, maxTicksLimit: 8 }, grid: { display: false } },
                y: { ticks: { color: TEXT_SECONDARY }, grid: { color: GRID_COLOR } },
              },
            }}
          />
        </section>
      )}
      </main>
    </>
  );
}
