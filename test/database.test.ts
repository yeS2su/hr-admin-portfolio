import { env } from 'cloudflare:workers'
import { describe, expect, it } from 'vitest'

const db = (env as unknown as { DB: D1Database }).DB

describe('foundation database', () => {
  it('contains the required application tables and enforces unique login IDs', async () => {
    const tables = await db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name IN ('activity_logs', 'general_expense_entries', 'login_attempts', 'sessions', 'users', 'work_entries') ORDER BY name",
      )
      .all<{ name: string }>()

    expect(tables.results.map((row) => row.name)).toEqual([
      'activity_logs',
      'general_expense_entries',
      'login_attempts',
      'sessions',
      'users',
      'work_entries',
    ])

    const foreignKeys = await db.prepare('PRAGMA foreign_keys').first<{ foreign_keys: number }>()
    expect(foreignKeys?.foreign_keys).toBe(1)

    const now = Date.now()
    await db
      .prepare(
        'INSERT INTO users (id, login_id, display_name, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      )
      .bind('duplicate-a', 'user-a', '사용자 A', 'hash', now, now)
      .run()

    await expect(
      db
        .prepare(
          'INSERT INTO users (id, login_id, display_name, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        )
        .bind('duplicate-b', 'USER-A', '다른 사용자', 'hash', now, now)
        .run(),
    ).rejects.toThrow()
  })
})


