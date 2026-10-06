ALTER TABLE annual_schedule_items ADD COLUMN is_completed INTEGER NOT NULL DEFAULT 0
  CHECK (is_completed IN (0, 1));
