-- Règles de démonstration IF -> THEN (section 9 du dossier d'architecture).
-- La 3e règle du brief ("porte archives ouverte hors horaires -> alerte")
-- est gérée par un pipeline dédié (security.service.js), pas ici : c'est
-- une fonction de sécurité toujours active, pas une automatisation qu'on
-- peut désactiver depuis le dashboard.

INSERT INTO automations (id, name, condition_json, action_json, enabled) VALUES
  (1, 'Ventilation Rayon A',
   '{"metric":"temperature","zone":"Rayon A","operator":">","value":27}',
   '{"deviceName":"Ventilation Rayon A","state":"on"}',
   true),
  (2, 'Éclairage auto Rayon A',
   '{"metric":"luminosite","zone":"Rayon A","operator":"<","value":100,"requireOpen":true}',
   '{"deviceName":"Éclairage Rayon A","state":"on"}',
   true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  condition_json = EXCLUDED.condition_json,
  action_json = EXCLUDED.action_json;

SELECT setval('automations_id_seq', (SELECT MAX(id) FROM automations));
