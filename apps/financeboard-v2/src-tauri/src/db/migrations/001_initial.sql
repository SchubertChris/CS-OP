CREATE TABLE IF NOT EXISTS accounts (
  id          TEXT PRIMARY KEY,
  data        TEXT NOT NULL,
  sort_order  INTEGER DEFAULT 0,
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS posten (
  id          TEXT PRIMARY KEY,
  data        TEXT NOT NULL,
  account_id  TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  category_id TEXT,
  goal_id     TEXT,
  creditor_id TEXT,
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS transfers (
  id          TEXT PRIMARY KEY,
  data        TEXT NOT NULL,
  from_id     TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  to_id       TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS goals (
  id          TEXT PRIMARY KEY,
  data        TEXT NOT NULL,
  account_id  TEXT REFERENCES accounts(id) ON DELETE SET NULL,
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS categories (
  id          TEXT PRIMARY KEY,
  data        TEXT NOT NULL,
  sort_order  INTEGER DEFAULT 0,
  is_default  INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS creditors (
  id          TEXT PRIMARY KEY,
  data        TEXT NOT NULL,
  account_id  TEXT REFERENCES accounts(id) ON DELETE SET NULL,
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS settings (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL,
  updated_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS year_notes (
  month_key   TEXT PRIMARY KEY,
  note        TEXT NOT NULL,
  updated_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS closed_months (
  month_key   TEXT PRIMARY KEY,
  closed_at   TEXT DEFAULT (datetime('now'))
);
