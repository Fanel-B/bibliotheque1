import { isLibraryOpen } from './simulator.service.js';
import * as iotRepository from '../repositories/iot.repository.js';

// Le pipeline complet section 11 du dossier d'architecture :
// détection → vérification horaires → événement → alerte si hors horaires → historique.
export async function handleDoorOpened(zoneId) {
  const now = new Date();
  const withinHours = isLibraryOpen(now);

  const event = await iotRepository.insertEvent({
    type: 'door_open',
    zoneId,
    payload: { withinHours },
  });

  let alert = null;
  if (!withinHours) {
    alert = await iotRepository.insertAlert({ eventId: event.id, severity: 'critical' });
  }

  return { event, alert };
}
