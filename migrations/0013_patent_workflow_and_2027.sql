ALTER TABLE patent_annual_fees ADD COLUMN workflow_status TEXT NOT NULL DEFAULT 'draft_needed'
  CHECK (workflow_status IN ('draft_needed', 'drafting', 'drafted', 'paid'));

UPDATE patent_annual_fees
SET workflow_status = CASE
  WHEN payment_status IN ('paid', 'prepaid') THEN 'paid'
  ELSE 'draft_needed'
END;

INSERT OR IGNORE INTO patent_annual_fees
  (id, patent_id, fee_year, deadline_raw, installment, amount, payment_status, note, workflow_status)
SELECT
  patent_id || '-2027',
  patent_id,
  2027,
  deadline_raw,
  '제' || (CAST(substr(installment, 2, instr(installment, '년') - 2) AS INTEGER) + 1) || '년분',
  amount,
  'unknown',
  '2027년 납부기한은 2026년 자료를 기준으로 자동 추정',
  'draft_needed'
FROM patent_annual_fees
WHERE fee_year = 2026
  AND deadline_raw GLOB '[0-9]*월'
  AND installment GLOB '제*년분';
