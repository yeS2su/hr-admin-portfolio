PRAGMA foreign_keys = ON;

ALTER TABLE work_entries
  ADD COLUMN deadline_date TEXT
  CHECK (
    deadline_date IS NULL
    OR deadline_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'
  );

CREATE INDEX idx_work_entries_owner_deadline
  ON work_entries(owner_user_id, deadline_date, is_completed);

CREATE INDEX idx_work_entries_owner_category
  ON work_entries(owner_user_id, category, updated_at DESC);

PRAGMA optimize;
