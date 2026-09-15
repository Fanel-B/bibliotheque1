import { HttpError } from '../utils/HttpError.js';
import * as iotRepository from '../repositories/iot.repository.js';
import * as simulatorService from './simulator.service.js';
import { handleDoorOpened } from './security.service.js';

const VALID_HISTORY_RANGES = { '24h': 24, '7d': 24 * 7 };
const VALID_DEVICE_STATES = ['on', 'off'];

export function getZonesSnapshot() {
  return simulatorService.getZonesSnapshot();
}

export async function getSensorHistory(sensorId, range) {
  const hours = VALID_HISTORY_RANGES[range];
  if (!hours) {
    throw new HttpError(400, 'Plage invalide (attendu : 24h ou 7d).');
  }
  const result = await simulatorService.getSensorHistory(sensorId, hours);
  if (!result) {
    throw new HttpError(404, 'Capteur introuvable.');
  }
  return result;
}

// Whitelist des équipements contrôlables : seuls les dispositifs marqués
// "controllable" en base peuvent être pilotés depuis cet endpoint, et
// uniquement avec un état on/off reconnu. Ça empêche par exemple de piloter
// la porte des archives comme un simple interrupteur.
export async function setDeviceState(deviceId, state) {
  if (!VALID_DEVICE_STATES.includes(state)) {
    throw new HttpError(400, 'État invalide (attendu : on ou off).');
  }

  const device = await iotRepository.getDeviceById(deviceId);
  if (!device) {
    throw new HttpError(404, 'Dispositif introuvable.');
  }
  if (!device.controllable) {
    throw new HttpError(403, "Ce dispositif n'est pas contrôlable à distance.");
  }

  return iotRepository.updateDeviceState(deviceId, state);
}

export function listActiveAlerts() {
  return iotRepository.listActiveAlerts();
}

export async function acknowledgeAlert(id) {
  const alert = await iotRepository.acknowledgeAlert(id);
  if (!alert) {
    throw new HttpError(404, 'Alerte introuvable.');
  }
  return alert;
}

export { handleDoorOpened };
