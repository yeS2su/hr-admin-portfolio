CREATE TABLE recruitment_rows (
  id TEXT PRIMARY KEY,
  area TEXT NOT NULL CHECK (area IN ('onboarding', 'resume', 'interview', 'executive')),
  source_sheet TEXT NOT NULL,
  source_row INTEGER NOT NULL,
  row_kind TEXT NOT NULL CHECK (row_kind IN ('header', 'data')),
  cells_json TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'done')),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX idx_recruitment_rows_area ON recruitment_rows(area, source_row);
