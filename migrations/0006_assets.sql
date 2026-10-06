PRAGMA foreign_keys = ON;

CREATE TABLE asset_import_batches (
  id TEXT PRIMARY KEY,
  source_sha256 TEXT NOT NULL UNIQUE,
  source_sheet_count INTEGER NOT NULL,
  asset_count INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('imported', 'verified')),
  created_at INTEGER NOT NULL,
  verified_at INTEGER
);

CREATE TABLE assets (
  id TEXT PRIMARY KEY,
  asset_code TEXT NOT NULL UNIQUE,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('laptop', 'desktop', 'monitor', 'other')),
  asset_name TEXT,
  current_user_name TEXT,
  usage_scope TEXT,
  usage_start_date TEXT,
  usage_start_raw TEXT,
  usage_end_date TEXT,
  usage_end_raw TEXT,
  history_note TEXT,
  source_batch_id TEXT REFERENCES asset_import_batches(id) ON DELETE SET NULL,
  source_sheet_key TEXT,
  source_row INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX idx_assets_type_code ON assets(asset_type, asset_code);
CREATE INDEX idx_assets_current_user ON assets(current_user_name);
CREATE INDEX idx_assets_usage_end ON assets(usage_end_date);

PRAGMA optimize;
