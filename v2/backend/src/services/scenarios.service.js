import { HttpError } from '../utils/HttpError.js';
import * as iotRepository from '../repositories/iot.repository.js';
import { handleDoorOpened } from './security.service.js';

const BOOST_DURATION_MINUTES = 10;

async function findZoneByName(name) {
  const zones = await iotRepository.listZones();
  const zone = zones.find((z) => z.name === name);
  if (!zone) throw new HttpError(404, `Zone "${name}" introuvable.`);
  return zone;
}

async function findDeviceByName(name) {
  const devices = await iotRepository.listDevices();
  const device = devices.find((d) => d.name === name);
  if (!device) throw new HttpError(404, `Dispositif "${name}" introuvable.`);
  return device;
}

async function boostZone(zoneName, sensorType, boost) {
  const zone = await findZoneByName(zoneName);
  const now = new Date();

  // Un nouveau déclenchement remplace l'effet en cours plutôt que de s'y
  // additionner (sinon cliquer 2x "augmenter température" en moins de
  // 10 minutes doublerait l'effet).
  await iotRepository.clearActiveScenarioBoosts(zone.id, sensorType, now);

  const expiresAt = new Date(now.getTime() + BOOST_DURATION_MINUTES * 60 * 1000);
  await iotRepository.insertEvent({
    type: 'scenario_boost',
    zoneId: zone.id,
    payload: { sensorType, boost, expiresAt: expiresAt.toISOString() },
  });
  return zone;
}

// Les 5 actions de démonstration du dossier d'architecture (section 8).
// Chacune agit sur des dispositifs/zones précis plutôt que "n'importe quoi
// choisi par l'appelant" — un scénario est une mise en scène préparée, pas
// un contrôle libre (celui-ci existe séparément, avec sa whitelist).
export async function runScenario(type) {
  switch (type) {
    case 'open_archives': {
      const zone = await findZoneByName('Archives');
      const device = await findDeviceByName('Porte Archives');
      await iotRepository.updateDeviceState(device.id, 'open');
      const { alert } = await handleDoorOpened(zone.id);
      return {
        message: alert
          ? 'Porte des archives ouverte hors horaires — alerte de sécurité générée.'
          : "Porte des archives ouverte pendant les horaires d'ouverture.",
      };
    }

    case 'raise_temperature': {
      const zone = await boostZone('Rayon A', 'temperature', 6);
      return { message: `Température de "${zone.name}" en hausse pour ${BOOST_DURATION_MINUTES} minutes.` };
    }

    case 'increase_visitors': {
      const zone = await boostZone('Hall', 'occupation', 25);
      return { message: `Affluence de visiteurs simulée dans "${zone.name}" pour ${BOOST_DURATION_MINUTES} minutes.` };
    }

    case 'simulate_outage': {
      const device = await findDeviceByName('Ventilation Rayon A');
      await iotRepository.updateDeviceState(device.id, 'offline');
      return { message: `"${device.name}" est tombée en panne (hors service jusqu'à remise en route manuelle).` };
    }

    case 'toggle_light': {
      const device = await findDeviceByName('Éclairage Rayon A');
      const nextState = device.current_state === 'on' ? 'off' : 'on';
      await iotRepository.updateDeviceState(device.id, nextState);
      return { message: `"${device.name}" est maintenant ${nextState === 'on' ? 'allumé' : 'éteint'}.` };
    }

    default:
      throw new HttpError(400, 'Scénario inconnu.');
  }
}
