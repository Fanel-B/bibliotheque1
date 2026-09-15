-- Données de référence pour développer et démontrer le projet.
-- Pas de mot de passe ici (voir seed.js) : uniquement du contenu "catalogue" et "inventaire IoT".

INSERT INTO roles (id, name) VALUES
  (1, 'user'), (2, 'employee'), (3, 'admin')
ON CONFLICT (id) DO NOTHING;

INSERT INTO authors (id, name) VALUES
  (1, 'Antoine de Saint-Exupéry'),
  (2, 'Jules Verne'),
  (3, 'George Orwell'),
  (4, 'Harper Lee')
ON CONFLICT (id) DO NOTHING;

INSERT INTO genres (id, label) VALUES
  (1, 'Littérature'),
  (2, 'Science-fiction'),
  (3, 'Aventure'),
  (4, 'Classique')
ON CONFLICT (id) DO NOTHING;

INSERT INTO books (id, title, description, format, published_year, cover_url) VALUES
  (1, 'Le Petit Prince', 'Un aviateur en panne dans le désert rencontre un jeune prince venu d''un autre monde.', 'papier', 1943, '/covers/le-petit-prince.jpg'),
  (2, 'Voyage au centre de la Terre', 'Un savant et son neveu explorent les entrailles de la Terre.', 'papier', 1864, '/covers/voyage-centre-terre.jpg'),
  (3, '1984', 'Une dystopie totalitaire où Big Brother surveille chaque citoyen.', 'papier', 1949, '/covers/1984.jpg'),
  (4, 'Ne tirez pas sur l''oiseau moqueur', 'Un avocat défend un homme injustement accusé dans le sud des États-Unis.', 'papier', 1960, '/covers/mockingbird.jpg')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  format = EXCLUDED.format,
  published_year = EXCLUDED.published_year,
  cover_url = EXCLUDED.cover_url;

INSERT INTO book_authors (book_id, author_id) VALUES
  (1, 1), (2, 2), (3, 3), (4, 4)
ON CONFLICT DO NOTHING;

INSERT INTO book_genres (book_id, genre_id) VALUES
  (1, 1), (1, 3),
  (2, 2), (2, 3),
  (3, 2), (3, 4),
  (4, 1), (4, 4)
ON CONFLICT DO NOTHING;

INSERT INTO copies (id, book_id, state, available) VALUES
  (1, 1, 'bon', true),
  (2, 1, 'bon', true),
  (3, 2, 'usé', false),
  (4, 3, 'neuf', true),
  (5, 3, 'bon', true),
  (6, 4, 'bon', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO rooms (id, name, capacity) VALUES
  (1, 'Salle Lecture', 10),
  (2, 'Salle Info', 15)
ON CONFLICT (id) DO NOTHING;

INSERT INTO iot_zones (id, name) VALUES
  (1, 'Hall'),
  (2, 'Rayon A'),
  (3, 'Archives')
ON CONFLICT (id) DO NOTHING;

INSERT INTO iot_devices (id, zone_id, type, name, controllable, current_state) VALUES
  (1, 1, 'eclairage',   'Éclairage Hall',      true,  'off'),
  (2, 2, 'eclairage',   'Éclairage Rayon A',   true,  'off'),
  (3, 2, 'ventilation', 'Ventilation Rayon A', true,  'off'),
  (4, 3, 'serrure',     'Porte Archives',      false, 'closed'),
  (5, 3, 'alarme',      'Alarme Archives',     true,  'off')
ON CONFLICT (id) DO NOTHING;

INSERT INTO sensors (id, zone_id, device_id, type, unit) VALUES
  (1, 1, NULL, 'occupation',  'personnes'),
  (2, 2, NULL, 'temperature', '°C'),
  (3, 2, NULL, 'humidite',    '%'),
  (4, 2, NULL, 'luminosite',  'lux'),
  (5, 2, NULL, 'uv',          'indice'),
  (6, 3, 4,    'porte',       'etat')
ON CONFLICT (id) DO NOTHING;

-- Resynchronise les compteurs auto-incrémentés après ces insertions à ID fixe.
SELECT setval('authors_id_seq', (SELECT MAX(id) FROM authors));
SELECT setval('genres_id_seq', (SELECT MAX(id) FROM genres));
SELECT setval('books_id_seq', (SELECT MAX(id) FROM books));
SELECT setval('copies_id_seq', (SELECT MAX(id) FROM copies));
SELECT setval('rooms_id_seq', (SELECT MAX(id) FROM rooms));
SELECT setval('iot_zones_id_seq', (SELECT MAX(id) FROM iot_zones));
SELECT setval('iot_devices_id_seq', (SELECT MAX(id) FROM iot_devices));
SELECT setval('sensors_id_seq', (SELECT MAX(id) FROM sensors));
SELECT setval('roles_id_seq', (SELECT MAX(id) FROM roles));
