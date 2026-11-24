-- One globally active owner session. Logging in on a new device replaces the previous session.
CREATE TABLE IF NOT EXISTS admin_sessions (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  token_hash TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
