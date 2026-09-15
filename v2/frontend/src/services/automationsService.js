import { apiClient } from '../lib/apiClient';

export function listAutomations(accessToken) {
  return apiClient('/api/automations', { accessToken });
}

export function setEnabled(accessToken, id, enabled) {
  return apiClient(`/api/automations/${id}`, {
    method: 'PATCH',
    accessToken,
    body: { enabled },
  });
}

export function listLogs(accessToken) {
  return apiClient('/api/automations/logs', { accessToken });
}
