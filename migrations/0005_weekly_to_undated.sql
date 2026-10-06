UPDATE work_entries
SET cadence = 'undated',
    needs_review = 1
WHERE cadence = 'weekly';
