CREATE TABLE manual_entries (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  source_sheet TEXT NOT NULL,
  source_row INTEGER NOT NULL DEFAULT 1,
  sensitive_redacted INTEGER NOT NULL DEFAULT 0 CHECK (sensitive_redacted IN (0, 1)),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX idx_manual_entries_category ON manual_entries(category);
CREATE INDEX idx_manual_entries_source ON manual_entries(source_sheet, source_row);
