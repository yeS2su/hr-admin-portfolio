PRAGMA foreign_keys = ON;

CREATE TABLE asset_history (
  id TEXT PRIMARY KEY,
  asset_id TEXT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  recorded_at_raw TEXT,
  respondent_name TEXT,
  department TEXT,
  equipment_label TEXT NOT NULL,
  model_name TEXT,
  manufacture_date_raw TEXT,
  source_sha256 TEXT NOT NULL,
  source_sheet_key TEXT NOT NULL,
  source_row INTEGER NOT NULL,
  source_column INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  UNIQUE (source_sheet_key, source_row, source_column)
);

CREATE INDEX idx_asset_history_asset_recorded
  ON asset_history(asset_id, source_row DESC);
