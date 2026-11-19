PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS barbers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  service_id TEXT NOT NULL REFERENCES services(id),
  barber_id TEXT NOT NULL REFERENCES barbers(id),
  appointment_date TEXT NOT NULL,
  appointment_time TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 45,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled','expired')),
  hold_expires_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_appointments_date_barber
ON appointments(appointment_date, barber_id, status);

CREATE UNIQUE INDEX IF NOT EXISTS idx_appointments_active_slot
ON appointments(barber_id, appointment_date, appointment_time)
WHERE status IN ('pending','confirmed');

INSERT OR IGNORE INTO services (id, name, price_cents, duration_minutes)
VALUES ('fade', 'Fade', 5000, 45), ('fade-dye', 'Fade with Dye', 7000, 45);

INSERT OR IGNORE INTO barbers (id, name)
VALUES ('barber1', 'Barber 1'), ('barber2', 'Barber 2');
