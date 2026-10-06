ALTER TABLE asset_custody_records
  ADD COLUMN outbound_department TEXT NOT NULL DEFAULT '';
ALTER TABLE asset_custody_records
  ADD COLUMN actual_user_name TEXT;
ALTER TABLE asset_custody_records
  ADD COLUMN has_proposal INTEGER NOT NULL DEFAULT 0 CHECK (has_proposal IN (0, 1));
