CREATE TABLE IF NOT EXISTS safepoints (
  id          TEXT PRIMARY KEY,
  label       TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'manual',
  created_at  TEXT NOT NULL,
  state_json  TEXT NOT NULL
);
