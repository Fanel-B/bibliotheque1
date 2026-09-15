import { apiClient } from '../lib/apiClient';

export function getZones(accessToken) {
  return apiClient('/api/iot/zones', { accessToken });
}

export function getSensorHistory(accessToken, sensorId, range = '24h') {
  return apiClient(`/api/iot/sensors/${sensorId}/history?range=${range}`, { accessToken });
}

export function setDeviceState(accessToken, deviceId, state) {
  return apiClient(`/api/iot/devices/${deviceId}`, {
    method: 'PATCH',
    accessToken,
    body: { state },
  });
}

export function getAlerts(accessToken) {
  return apiClient('/api/iot/alerts', { accessToken });
}

export function acknowledgeAlert(accessToken, id) {
  return apiClient(`/api/iot/alerts/${id}/acknowledge`, { method: 'PATCH', accessToken });
}

export function runScenario(accessToken, type) {
  return apiClient('/api/iot/simulator/scenario', {
    method: 'POST',
    accessToken,
    body: { type },
  });
}
