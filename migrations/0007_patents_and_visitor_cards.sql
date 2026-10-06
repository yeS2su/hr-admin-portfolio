PRAGMA foreign_keys = ON;

CREATE TABLE patents (
  id TEXT PRIMARY KEY,
  source_group TEXT NOT NULL,
  title TEXT NOT NULL,
  registration_number TEXT NOT NULL,
  source_fingerprint TEXT NOT NULL,
  source_sheet TEXT NOT NULL,
  source_row INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  UNIQUE(source_group, registration_number)
);

CREATE TABLE patent_annual_fees (
  id TEXT PRIMARY KEY,
  patent_id TEXT NOT NULL REFERENCES patents(id) ON DELETE CASCADE,
  fee_year INTEGER NOT NULL,
  deadline_raw TEXT,
  installment TEXT,
  amount INTEGER,
  payment_status TEXT NOT NULL CHECK (payment_status IN ('paid', 'unpaid', 'prepaid', 'unknown')),
  note TEXT,
  UNIQUE(patent_id, fee_year)
);

CREATE TABLE visitor_card_records (
  id TEXT PRIMARY KEY,
  applicant TEXT,
  has_approval INTEGER NOT NULL DEFAULT 0,
  reason TEXT,
  card_user TEXT,
  usage_period_raw TEXT,
  access_scope TEXT,
  visitor_badge_number TEXT,
  card_number TEXT,
  checkout_date TEXT,
  return_date TEXT,
  return_date_raw TEXT,
  source_fingerprint TEXT NOT NULL,
  source_row INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX idx_patent_fees_year ON patent_annual_fees(fee_year, payment_status);
CREATE INDEX idx_patents_registration ON patents(registration_number);
CREATE INDEX idx_visitor_cards_status ON visitor_card_records(return_date, checkout_date);

PRAGMA optimize;
