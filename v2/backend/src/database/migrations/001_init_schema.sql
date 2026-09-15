-- Schéma initial de Biblio-Tech 2.0 (PostgreSQL / Neon)
-- Voir le dossier d'architecture, section 16, pour le détail des choix.

-- ===== Comptes & rôles =====

CREATE TABLE roles (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(30) UNIQUE NOT NULL
);

CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role_id       INTEGER NOT NULL REFERENCES roles(id),
  created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ===== Catalogue =====

CREATE TABLE authors (
  id        SERIAL PRIMARY KEY,
  name      VARCHAR(150) NOT NULL,
  photo_url TEXT
);

CREATE TABLE genres (
  id    SERIAL PRIMARY KEY,
  label VARCHAR(80) UNIQUE NOT NULL
);

CREATE TABLE books (
  id              SERIAL PRIMARY KEY,
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  format          VARCHAR(50),
  published_year  INTEGER,
  cover_url       TEXT,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE book_authors (
  book_id   INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  author_id INTEGER NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
  PRIMARY KEY (book_id, author_id)
);

CREATE TABLE book_genres (
  book_id  INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  genre_id INTEGER NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
  PRIMARY KEY (book_id, genre_id)
);

CREATE TABLE copies (
  id        SERIAL PRIMARY KEY,
  book_id   INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  state     VARCHAR(30) NOT NULL DEFAULT 'bon',
  available BOOLEAN NOT NULL DEFAULT TRUE
);

-- ===== Prêts =====

CREATE TABLE loans (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id),
  copy_id     INTEGER NOT NULL REFERENCES copies(id),
  loan_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date    DATE NOT NULL,
  return_date DATE
);

CREATE INDEX idx_loans_user ON loans(user_id);
CREATE INDEX idx_loans_copy ON loans(copy_id);

-- ===== Salles & réservations =====

CREATE TABLE rooms (
  id       SERIAL PRIMARY KEY,
  name     VARCHAR(100) NOT NULL,
  capacity INTEGER NOT NULL
);

CREATE TABLE reservations (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id),
  room_id    INTEGER NOT NULL REFERENCES rooms(id),
  date       DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time   TIME NOT NULL
);

CREATE INDEX idx_reservations_room_date ON reservations(room_id, date);

-- ===== IoT / Smart Library =====

CREATE TABLE iot_zones (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE iot_devices (
  id            SERIAL PRIMARY KEY,
  zone_id       INTEGER NOT NULL REFERENCES iot_zones(id),
  type          VARCHAR(50) NOT NULL,
  name          VARCHAR(150) NOT NULL,
  controllable  BOOLEAN NOT NULL DEFAULT FALSE,
  current_state VARCHAR(30) NOT NULL DEFAULT 'off'
);

CREATE TABLE sensors (
  id        SERIAL PRIMARY KEY,
  zone_id   INTEGER NOT NULL REFERENCES iot_zones(id),
  device_id INTEGER REFERENCES iot_devices(id),
  type      VARCHAR(50) NOT NULL,
  unit      VARCHAR(20)
);

CREATE TABLE sensor_readings (
  id          BIGSERIAL PRIMARY KEY,
  sensor_id   INTEGER NOT NULL REFERENCES sensors(id) ON DELETE CASCADE,
  value       NUMERIC NOT NULL,
  recorded_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sensor_readings_sensor_time ON sensor_readings(sensor_id, recorded_at);

CREATE TABLE events (
  id         SERIAL PRIMARY KEY,
  type       VARCHAR(50) NOT NULL,
  zone_id    INTEGER REFERENCES iot_zones(id),
  payload    JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_zone_time ON events(zone_id, created_at);

CREATE TABLE alerts (
  id           SERIAL PRIMARY KEY,
  event_id     INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  severity     VARCHAR(20) NOT NULL,
  acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ===== Automatisations =====

CREATE TABLE automations (
  id             SERIAL PRIMARY KEY,
  name           VARCHAR(150) NOT NULL,
  condition_json JSONB NOT NULL,
  action_json    JSONB NOT NULL,
  enabled        BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE automation_logs (
  id               SERIAL PRIMARY KEY,
  automation_id    INTEGER NOT NULL REFERENCES automations(id) ON DELETE CASCADE,
  triggered_value  NUMERIC,
  executed_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ===== Journal des actions sensibles =====

CREATE TABLE logs (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER REFERENCES users(id),
  action     VARCHAR(100) NOT NULL,
  target     VARCHAR(150),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
