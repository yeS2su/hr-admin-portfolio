PRAGMA foreign_keys = ON;

CREATE TABLE import_batches (
  id TEXT PRIMARY KEY,
  source_sha256 TEXT NOT NULL UNIQUE CHECK (length(source_sha256) = 64),
  source_sheet_count INTEGER NOT NULL CHECK (source_sheet_count > 0),
  status TEXT NOT NULL CHECK (status IN ('previewed', 'imported', 'failed')),
  created_at INTEGER NOT NULL,
  imported_at INTEGER
);

ALTER TABLE work_entries RENAME TO work_entries_legacy;

CREATE TABLE work_entries (
  id TEXT PRIMARY KEY,
  owner_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cadence TEXT NOT NULL DEFAULT 'daily' CHECK (cadence IN ('daily', 'weekly', 'monthly', 'yearly', 'undated')),
  work_date TEXT,
  period_year INTEGER CHECK (period_year IS NULL OR period_year BETWEEN 1900 AND 2200),
  period_month INTEGER CHECK (period_month IS NULL OR period_month BETWEEN 1 AND 12),
  week_label TEXT,
  day_label TEXT,
  category TEXT,
  content TEXT NOT NULL CHECK (length(content) BETWEEN 1 AND 2000),
  is_completed INTEGER NOT NULL DEFAULT 0 CHECK (is_completed IN (0, 1)),
  needs_review INTEGER NOT NULL DEFAULT 0 CHECK (needs_review IN (0, 1)),
  source_batch_id TEXT REFERENCES import_batches(id) ON DELETE RESTRICT,
  source_sheet_key TEXT,
  source_cell TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  CHECK (cadence != 'daily' OR work_date IS NOT NULL),
  CHECK (cadence != 'monthly' OR (period_year IS NOT NULL AND period_month IS NOT NULL)),
  CHECK (cadence != 'yearly' OR period_year IS NOT NULL),
  CHECK (cadence != 'undated' OR needs_review = 1),
  CHECK (
    source_batch_id IS NULL
    OR (source_sheet_key IS NOT NULL AND source_cell IS NOT NULL)
  ),
  UNIQUE (source_batch_id, source_sheet_key, source_cell)
);

INSERT INTO work_entries (
  id,
  owner_user_id,
  cadence,
  work_date,
  period_year,
  period_month,
  content,
  is_completed,
  needs_review,
  created_at,
  updated_at
)
SELECT
  id,
  owner_user_id,
  'daily',
  work_date,
  CAST(substr(work_date, 1, 4) AS INTEGER),
  CAST(substr(work_date, 6, 2) AS INTEGER),
  content,
  is_completed,
  0,
  created_at,
  updated_at
FROM work_entries_legacy;

DROP TABLE work_entries_legacy;

CREATE INDEX idx_work_entries_owner_period
  ON work_entries(owner_user_id, cadence, work_date DESC, period_year DESC, period_month DESC);
CREATE INDEX idx_work_entries_review
  ON work_entries(needs_review, owner_user_id);
CREATE INDEX idx_work_entries_source
  ON work_entries(source_batch_id, source_sheet_key, source_cell);

CREATE TABLE reference_records (
  id TEXT PRIMARY KEY,
  import_batch_id TEXT NOT NULL REFERENCES import_batches(id) ON DELETE CASCADE,
  record_kind TEXT NOT NULL CHECK (
    record_kind IN ('weekly_summary', 'annual_timeline', 'quarter_archive', 'reference_or_other')
  ),
  period_year INTEGER CHECK (period_year IS NULL OR period_year BETWEEN 1900 AND 2200),
  period_month INTEGER CHECK (period_month IS NULL OR period_month BETWEEN 1 AND 12),
  content TEXT NOT NULL CHECK (length(content) BETWEEN 1 AND 10000),
  source_sheet_key TEXT NOT NULL,
  source_cell TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  UNIQUE (import_batch_id, record_kind, source_sheet_key, source_cell)
);

CREATE INDEX idx_reference_records_kind_period
  ON reference_records(record_kind, period_year DESC, period_month DESC);

PRAGMA optimize;
