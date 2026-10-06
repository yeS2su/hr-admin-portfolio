import { hash } from 'bcryptjs'
import { beforeEach, describe, expect, it } from 'vitest'

import { fetchWorker, formRequest, responseCookie, testEnv } from './helpers'

const USER_A = 'mock-user-a'
const USER_B = 'mock-user-b'
const PASSWORD = 'DemoOnly!2026'

beforeEach(async () => {
  await testEnv.DB.batch([
    testEnv.DB.prepare('DELETE FROM login_attempts'),
    testEnv.DB.prepare('DELETE FROM sessions'),
    testEnv.DB.prepare('DELETE FROM work_entries'),
    testEnv.DB.prepare('DELETE FROM general_expense_entries'),
    testEnv.DB.prepare('DELETE FROM users'),
  ])
  const now = Date.now()
  const passwordHash = await hash(PASSWORD, 4)
  await testEnv.DB.batch([
    testEnv.DB.prepare(
      'INSERT INTO users (id, login_id, display_name, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    ).bind(USER_A, 'user-a', '사용자 A', passwordHash, now, now),
    testEnv.DB.prepare(
      'INSERT INTO users (id, login_id, display_name, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    ).bind(USER_B, 'user-b', '사용자 B', passwordHash, now, now),
  ])
})

async function unlockCookie(ownerId = USER_A): Promise<string> {
  const response = await fetchWorker(
    formRequest(`/workspace/${ownerId}/unlock`, { password: PASSWORD }),
  )
  expect(response.status).toBe(302)
  return responseCookie(response)
}

describe('workspace authorization', () => {
  it('allows viewing but rejects writes before the workspace password is confirmed', async () => {
    const view = await fetchWorker(new Request(`https://example.test/workspace/${USER_A}`))
    const write = await fetchWorker(
      formRequest(`/workspace/${USER_A}/entries`, { content: '가상 업무' }),
    )

    expect(view.status).toBe(200)
    expect(write.status).toBe(401)
  })

  it('rejects direct writes to another workspace with a different workspace cookie', async () => {
    const cookie = await unlockCookie(USER_A)
    const response = await fetchWorker(
      formRequest(`/workspace/${USER_B}/entries`, { content: '변경 시도' }, cookie),
    )
    const monthlyUpdate = await fetchWorker(formRequest(
      `/workspace/${USER_B}/monthly-entries/20000000-0000-4000-8000-000000000003`,
      { period: '2026-11', category: '인사', content: '변경 시도' },
      cookie,
    ))
    const monthlyDelete = await fetchWorker(formRequest(
      `/workspace/${USER_B}/monthly-entries/20000000-0000-4000-8000-000000000003/delete`,
      { period: '2026-11' },
      cookie,
    ))
    const dailyDelete = await fetchWorker(formRequest(
      `/workspace/${USER_B}/entries/20000000-0000-4000-8000-000000000004/delete`,
      { month: '2026-11' },
      cookie,
    ))
    expect(response.status).toBe(403)
    expect(monthlyUpdate.status).toBe(403)
    expect(monthlyDelete.status).toBe(403)
    expect(dailyDelete.status).toBe(403)
  })

  it('keeps editing locked for a wrong workspace password', async () => {
    const response = await fetchWorker(
      formRequest(`/workspace/${USER_A}/unlock`, { password: 'wrong' }),
    )
    expect(response.status).toBe(401)
    const count = await testEnv.DB.prepare('SELECT COUNT(*) AS count FROM sessions').first<{ count: number }>()
    expect(count?.count).toBe(0)
  })

  it('allows guarded writes after the workspace password is confirmed', async () => {
    const cookie = await unlockCookie(USER_A)
    const guarded = await fetchWorker(
      formRequest(`/workspace/${USER_A}/entries`, { content: '' }, cookie),
    )
    expect(guarded.status).toBe(422)
  })

  it('rejects writes after the saved edit session is no longer valid', async () => {
    const cookie = await unlockCookie(USER_A)
    await testEnv.DB.prepare('UPDATE sessions SET edit_unlocked_until = ?, expires_at = ?')
      .bind(Date.now() - 1, Date.now() - 1)
      .run()
    const response = await fetchWorker(
      formRequest(`/workspace/${USER_A}/entries`, { content: '가상 업무' }, cookie),
    )
    expect(response.status).toBe(401)
  })
})




