CREATE TABLE interview_coordination_rows (
  id TEXT PRIMARY KEY,
  view_name TEXT NOT NULL CHECK (view_name IN ('departments', 'confirmed', 'blacklist')),
  source_sheet TEXT NOT NULL,
  source_row INTEGER NOT NULL,
  row_kind TEXT NOT NULL CHECK (row_kind IN ('header', 'data')),
  cells_json TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'done')),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX idx_interview_coordination_rows_view ON interview_coordination_rows(view_name, source_sheet, source_row);
