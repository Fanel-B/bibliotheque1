import * as automationsRepository from '../repositories/automations.repository.js';
import * as iotRepository from '../repositories/iot.repository.js';
import { isLibraryOpen } from './simulator.service.js';

function compare(value, operator, threshold) {
  switch (operator) {
    case '>':
      return value > threshold;
    case '<':
      return value < threshold;
    case '>=':
      return value >= threshold;
    case '<=':
      return value <= threshold;
    default:
      return false;
  }
}

// Évaluée à chaque lecture du dashboard IoT (GET /api/iot/zones) plutôt que
// par une tâche de fond permanente — cohérent avec le simulateur
// (simulator.service.js) : rien ne dépend d'un process qui doit tourner
// sans interruption.
export async function evaluateAutomations(snapshot) {
  const automations = await automationsRepository.listAutomations();
  const now = new Date();
  const triggered = [];

  for (const automation of automations) {
    if (!automation.enabled) continue;
    const condition = automation.condition_json;

    const zone = snapshot.zones.find((z) => z.name === condition.zone);
    if (!zone) continue;

    const sensor = zone.sensors.find((s) => s.type === condition.metric);
    if (!sensor || sensor.offline || sensor.value === null) continue;

    if (condition.requireOpen && !isLibraryOpen(now)) continue;
    if (!compare(sensor.value, condition.operator, condition.value)) continue;

    const device = zone.devices.find((d) => d.name === automation.action_json.deviceName);
    if (!device || device.current_state === automation.action_json.state) continue;

    await iotRepository.updateDeviceState(device.id, automation.action_json.state);
    await automationsRepository.insertLog(automation.id, sensor.value);

    // Reflète immédiatement le changement dans la snapshot déjà calculée,
    // pour que la réponse renvoyée au frontend soit à jour sans requête en plus.
    device.current_state = automation.action_json.state;
    triggered.push(automation.name);
  }

  return triggered;
}

export const listAutomations = automationsRepository.listAutomations;
export const setEnabled = automationsRepository.setEnabled;
export const listLogs = automationsRepository.listLogs;
