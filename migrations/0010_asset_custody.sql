PRAGMA foreign_keys = ON;

CREATE TABLE asset_custody_records (
  id TEXT PRIMARY KEY,
  asset_id TEXT NOT NULL REFERENCES assets(id) ON DELETE RESTRICT,
  recipient_name TEXT NOT NULL,
  outbound_date TEXT NOT NULL,
  expected_return_date TEXT,
  returned_date TEXT,
  purpose TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE UNIQUE INDEX idx_asset_custody_one_open_per_asset
  ON asset_custody_records(asset_id) WHERE returned_date IS NULL;
CREATE INDEX idx_asset_custody_returned_date
  ON asset_custody_records(returned_date, outbound_date);
