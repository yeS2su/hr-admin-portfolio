ALTER TABLE work_entries ADD COLUMN memo TEXT;

CREATE TABLE workspace_categories (
  owner_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 100),
  created_at INTEGER NOT NULL,
  PRIMARY KEY (owner_user_id, name)
);

CREATE TABLE annual_schedule_items (
  id TEXT PRIMARY KEY,
  schedule_year INTEGER NOT NULL CHECK (schedule_year BETWEEN 1900 AND 2200),
  major_category TEXT,
  subcategory TEXT,
  task TEXT NOT NULL,
  month_number INTEGER NOT NULL CHECK (month_number BETWEEN 1 AND 12),
  detail TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  source_fingerprint TEXT NOT NULL
);

CREATE INDEX idx_annual_schedule_year_sort
  ON annual_schedule_items(schedule_year, sort_order);
