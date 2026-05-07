CREATE TABLE IF NOT EXISTS participants (
  id SERIAL PRIMARY KEY,
  raffle_no VARCHAR(20) UNIQUE NOT NULL,
  nickname VARCHAR(60),
  student_no VARCHAR(40) UNIQUE NOT NULL,
  real_name VARCHAR(60),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS prizes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  description TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS winner_records (
  id SERIAL PRIMARY KEY,
  participant_id INTEGER NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  prize_id INTEGER NOT NULL REFERENCES prizes(id) ON DELETE CASCADE,
  raffle_no VARCHAR(20) NOT NULL,
  nickname VARCHAR(60),
  claimed BOOLEAN DEFAULT FALSE,
  claimed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (participant_id, prize_id)
);

CREATE TABLE IF NOT EXISTS site_settings (
  id SMALLINT PRIMARY KEY DEFAULT 1,
  ticket_theme VARCHAR(40) NOT NULL DEFAULT 'aurora',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT site_settings_single_row CHECK (id = 1)
);

INSERT INTO site_settings (id, ticket_theme)
VALUES (1, 'aurora')
ON CONFLICT (id) DO NOTHING;
