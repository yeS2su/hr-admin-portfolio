import { env } from 'cloudflare:workers'
import { beforeEach, describe, expect, it } from 'vitest'

const db = (env as unknown as { DB: D1Database }).DB

beforeEach(async () => {
  await db.batch([
    db.prepare('DELETE FROM reference_records'),
    db.prepare('DELETE FROM work_entries'),
    db.prepare('DELETE FROM import_batches'),
    db.prepare('DELETE FROM users'),
  ])
  const now = Date.now()
  await db
    .prepare(
      'INSERT INTO users (id, login_id, display_name, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    )
    .bind('schema-user', 'schema-user', '가상 사용자', 'hash', now, now)
    .run()
})

describe('workbook import schema', () => {
  it('stores imported daily, yearly, and undated work without inventing dates', async () => {
    const now = Date.now()
    await db
      .prepare(
        'INSERT INTO import_batches (id, source_sha256, source_sheet_count, status, created_at) VALUES (?, ?, ?, ?, ?)',
      )
      .bind('batch-1', 'a'.repeat(64), 17, 'previewed', now)
      .run()

    await db.batch([
      db.prepare(
        `INSERT INTO work_entries
          (id, owner_user_id, cadence, work_date, period_year, period_month, content, is_completed, needs_review, source_batch_id, source_sheet_key, source_cell, created_at, updated_at)
         VALUES (?, ?, 'daily', ?, ?, ?, ?, 1, 0, ?, ?, ?, ?, ?)`,
      ).bind('daily-1', 'schema-user', '2026-09-21', 2026, 9, '가상 일일업무', 'batch-1', 'sheet_01', 'G2', now, now),
      db.prepare(
        `INSERT INTO work_entries
          (id, owner_user_id, cadence, work_date, period_year, content, is_completed, needs_review, source_batch_id, source_sheet_key, source_cell, created_at, updated_at)
         VALUES (?, ?, 'yearly', NULL, ?, ?, 0, 1, ?, ?, ?, ?, ?)`,
      ).bind('yearly-1', 'schema-user', 2026, '가상 연간업무', 'batch-1', 'sheet_01', 'G3', now, now),
      db.prepare(
        `INSERT INTO work_entries
          (id, owner_user_id, cadence, work_date, content, is_completed, needs_review, source_batch_id, source_sheet_key, source_cell, created_at, updated_at)
         VALUES (?, ?, 'undated', NULL, ?, 0, 1, ?, ?, ?, ?, ?)`,
      ).bind('undated-1', 'schema-user', '가상 기간 미지정 업무', 'batch-1', 'sheet_01', 'G4', now, now),
    ])

    const rows = await db
      .prepare('SELECT cadence, work_date, needs_review FROM work_entries ORDER BY id')
      .all<{ cadence: string; work_date: string | null; needs_review: number }>()
    expect(rows.results).toEqual([
      { cadence: 'daily', work_date: '2026-09-21', needs_review: 0 },
      { cadence: 'undated', work_date: null, needs_review: 1 },
      { cadence: 'yearly', work_date: null, needs_review: 1 },
    ])
  })

  it('prevents duplicate source cells in the same import batch', async () => {
    const now = Date.now()
    await db
      .prepare(
        'INSERT INTO import_batches (id, source_sha256, source_sheet_count, status, created_at) VALUES (?, ?, ?, ?, ?)',
      )
      .bind('batch-2', 'b'.repeat(64), 17, 'previewed', now)
      .run()
    const statement = () =>
      db.prepare(
        `INSERT INTO work_entries
          (id, owner_user_id, cadence, content, is_completed, needs_review, source_batch_id, source_sheet_key, source_cell, created_at, updated_at)
         VALUES (?, ?, 'undated', ?, 0, 1, ?, ?, ?, ?, ?)`,
      )

    await statement().bind('entry-1', 'schema-user', '가상 기록 1', 'batch-2', 'sheet_01', 'G2', now, now).run()
    await expect(
      statement().bind('entry-2', 'schema-user', '가상 기록 2', 'batch-2', 'sheet_01', 'G2', now, now).run(),
    ).rejects.toThrow()
  })

  it('stores reference history separately from personal work', async () => {
    const now = Date.now()
    await db
      .prepare(
        'INSERT INTO import_batches (id, source_sha256, source_sheet_count, status, created_at) VALUES (?, ?, ?, ?, ?)',
      )
      .bind('batch-3', 'c'.repeat(64), 17, 'previewed', now)
      .run()
    await db
      .prepare(
        `INSERT INTO reference_records
          (id, import_batch_id, record_kind, content, source_sheet_key, source_cell, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind('reference-1', 'batch-3', 'annual_timeline', '가상 참고 일정', 'sheet_05', 'C8', now)
      .run()

    const count = await db.prepare('SELECT COUNT(*) AS count FROM reference_records').first<{ count: number }>()
    expect(count?.count).toBe(1)
  })
})

