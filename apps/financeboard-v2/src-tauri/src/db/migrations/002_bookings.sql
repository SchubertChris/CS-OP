CREATE TABLE IF NOT EXISTS bookings (
  id          TEXT PRIMARY KEY,
  posten_id   TEXT REFERENCES posten(id) ON DELETE CASCADE,
  transfer_id TEXT REFERENCES transfers(id) ON DELETE CASCADE,
  date        TEXT NOT NULL,
  month_key   TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'vorgemerkt',
  amount      REAL NOT NULL,
  base_amount REAL NOT NULL,
  account_id  TEXT NOT NULL,
  data        TEXT NOT NULL,
  created_at  TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_bookings_month   ON bookings(month_key);
CREATE INDEX IF NOT EXISTS idx_bookings_status  ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_account ON bookings(account_id);
CREATE INDEX IF NOT EXISTS idx_bookings_posten  ON bookings(posten_id);
