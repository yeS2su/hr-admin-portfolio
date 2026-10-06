import { env } from 'cloudflare:workers'
import { describe, expect, it } from 'vitest'

import { findUserByLoginId, listWorkEntries } from '../src/db'

const db = (env as unknown as { DB: D1Database }).DB

describe('database queries', () => {
  it('finds a fictional user case-insensitively and maps work status', async () => {
    const now = Date.now()
    await db
      .prepare(
        'INSERT INTO users (id, login_id, display_name, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      )
      .bind('mock-user-a', 'user-a', '사용자 A', 'mock-hash', now, now)
      .run()
    await db
      .prepare(
        'INSERT INTO work_entries (id, owner_user_id, work_date, content, is_completed, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      )
      .bind('mock-work-a', 'mock-user-a', '2026-09-21', '주간 일정 확인', 1, now, now)
      .run()

    const user = await findUserByLoginId(db, 'USER-A')
    const entries = await listWorkEntries(db, 'mock-user-a')

    expect(user).toMatchObject({
      id: 'mock-user-a',
      loginId: 'user-a',
      displayName: '사용자 A',
      isActive: true,
    })
    expect(entries).toEqual([
      expect.objectContaining({
        id: 'mock-work-a',
        ownerUserId: 'mock-user-a',
        content: '주간 일정 확인',
        isCompleted: true,
      }),
    ])
  })
})

