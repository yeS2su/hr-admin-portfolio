ALTER TABLE manual_entries ADD COLUMN subcategory TEXT NOT NULL DEFAULT '';
ALTER TABLE manual_entries ADD COLUMN row_kind TEXT NOT NULL DEFAULT 'data'
  CHECK (row_kind IN ('header', 'data'));
ALTER TABLE manual_entries ADD COLUMN cells_json TEXT NOT NULL DEFAULT '[]';

CREATE INDEX idx_manual_entries_subcategory ON manual_entries(category, subcategory, source_row);
