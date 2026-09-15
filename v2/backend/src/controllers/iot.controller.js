import * as iotService from '../services/iot.service.js';
import * as scenariosService from '../services/scenarios.service.js';
import { HttpError } from '../utils/HttpError.js';

export async function zones(req, res) {
  res.json(await iotService.getZonesSnapshot());
}

export async function sensorHistory(req, res) {
  const sensorId = Number(req.params.id);
  if (!Number.isInteger(sensorId)) {
    throw new HttpError(400, 'Identifiant de capteur invalide.');
  }
  const range = req.query.range || '24h';
  const { sensor, readings } = await iotService.getSensorHistory(sensorId, range);
  res.json({ sensor, readings });
}

export async function setDeviceState(req, res) {
  const deviceId = Number(req.params.id);
  if (!Number.isInteger(deviceId)) {
    throw new HttpError(400, 'Identifiant de dispositif invalide.');
  }
  const device = await iotService.setDeviceState(deviceId, req.body.state);
  res.json({ device });
}

export async function alerts(req, res) {
  res.json({ alerts: await iotService.listActiveAlerts() });
}

export async function acknowledgeAlert(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    throw new HttpError(400, "Identifiant d'alerte invalide.");
  }
  const alert = await iotService.acknowledgeAlert(id);
  res.json({ alert });
}

export async function runScenario(req, res) {
  const result = await scenariosService.runScenario(req.body.type);
  res.json(result);
}
