PRAGMA foreign_keys = ON;

CREATE TABLE general_expense_entries (
  id TEXT PRIMARY KEY,
  transfer_date TEXT NOT NULL CHECK (transfer_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
  deadline_date TEXT CHECK (deadline_date IS NULL OR deadline_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
  content TEXT NOT NULL CHECK (length(content) BETWEEN 1 AND 500),
  assigned_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  is_completed INTEGER NOT NULL DEFAULT 0 CHECK (is_completed IN (0, 1)),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX idx_general_expense_month
  ON general_expense_entries(transfer_date, is_completed);
CREATE INDEX idx_general_expense_assignee
  ON general_expense_entries(assigned_user_id, transfer_date);

PRAGMA optimize;
