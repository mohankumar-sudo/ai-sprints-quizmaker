CREATE TABLE mcq (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  question TEXT NOT NULL,
  created_by_user_id TEXT NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_mcq_created_by_user_id ON mcq (created_by_user_id);

CREATE TABLE mcq_choice (
  id TEXT PRIMARY KEY NOT NULL,
  mcq_id TEXT NOT NULL REFERENCES mcq (id) ON DELETE CASCADE,
  choice_text TEXT NOT NULL,
  is_correct INTEGER NOT NULL DEFAULT 0 CHECK (is_correct IN (0, 1)),
  sort_order INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_mcq_choice_mcq_id ON mcq_choice (mcq_id);

CREATE TABLE mcq_attempt (
  id TEXT PRIMARY KEY NOT NULL,
  mcq_id TEXT NOT NULL REFERENCES mcq (id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
  selected_choice_id TEXT NOT NULL REFERENCES mcq_choice (id) ON DELETE CASCADE,
  is_correct INTEGER NOT NULL CHECK (is_correct IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_mcq_attempt_mcq_id ON mcq_attempt (mcq_id);
CREATE INDEX idx_mcq_attempt_user_id ON mcq_attempt (user_id);
