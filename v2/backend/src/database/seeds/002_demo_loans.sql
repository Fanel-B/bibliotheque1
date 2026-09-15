-- Prêts de démonstration : sans ça, le dashboard analytics (livres
-- populaires, tendances) serait vide. Les user_id (1=claire, 2=hugo,
-- 3=admin) et copy_id correspondent à 001_reference_data.sql.

-- Prêt actif ET en retard, sur l'exemplaire 3 (Voyage au centre de la Terre)
-- déjà marqué indisponible dans les données de référence — cohérent avec
-- son état "usé" : ce livre traîne dehors depuis un moment.
INSERT INTO loans (id, user_id, copy_id, loan_date, due_date, return_date) VALUES
  (101, 2, 3, CURRENT_DATE - 20, CURRENT_DATE - 6, NULL)
ON CONFLICT (id) DO NOTHING;

-- Historique de prêts déjà rendus, étalés sur le dernier mois, pour peupler
-- les statistiques (livres/genres populaires, tendance dans le temps).
INSERT INTO loans (id, user_id, copy_id, loan_date, due_date, return_date) VALUES
  (102, 1, 1, CURRENT_DATE - 20, CURRENT_DATE - 6,  CURRENT_DATE - 13),
  (103, 2, 2, CURRENT_DATE - 10, CURRENT_DATE + 4,  CURRENT_DATE - 3),
  (104, 1, 4, CURRENT_DATE - 25, CURRENT_DATE - 11, CURRENT_DATE - 18),
  (105, 1, 4, CURRENT_DATE - 8,  CURRENT_DATE + 6,  CURRENT_DATE - 2),
  (106, 3, 5, CURRENT_DATE - 15, CURRENT_DATE - 1,  CURRENT_DATE - 12),
  (107, 2, 6, CURRENT_DATE - 6,  CURRENT_DATE + 8,  CURRENT_DATE - 1)
ON CONFLICT (id) DO NOTHING;

SELECT setval('loans_id_seq', (SELECT MAX(id) FROM loans));
