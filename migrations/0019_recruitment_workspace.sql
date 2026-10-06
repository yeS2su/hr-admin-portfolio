PRAGMA foreign_keys = ON;

CREATE TABLE recruitment_records (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('onboarding', 'resume', 'interview', 'executive')),
  name TEXT NOT NULL DEFAULT '',
  department TEXT,
  position TEXT,
  experience_type TEXT,
  phone TEXT,
  email TEXT,
  job_title TEXT,
  recipient TEXT,
  event_date TEXT CHECK (event_date IS NULL OR event_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
  event_time TEXT,
  interviewer TEXT,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  result TEXT,
  notes TEXT,
  legacy_row_id TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX idx_recruitment_records_kind_date
  ON recruitment_records(kind, event_date, updated_at);
CREATE INDEX idx_recruitment_records_kind_status
  ON recruitment_records(kind, status, name);

CREATE TABLE recruitment_tasks (
  id TEXT PRIMARY KEY,
  record_id TEXT NOT NULL REFERENCES recruitment_records(id) ON DELETE CASCADE,
  task_key TEXT NOT NULL,
  label TEXT NOT NULL,
  is_completed INTEGER NOT NULL DEFAULT 0 CHECK (is_completed IN (0, 1)),
  memo TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE(record_id, task_key)
);

CREATE INDEX idx_recruitment_tasks_record
  ON recruitment_tasks(record_id, sort_order);

PRAGMA optimize;
