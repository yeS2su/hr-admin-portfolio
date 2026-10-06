import { hash } from 'bcryptjs'
import { beforeEach, describe, expect, it } from 'vitest'

import { fetchWorker, formRequest, testEnv } from './helpers'

const USER_A = 'mock-user-a'
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
  await testEnv.DB.prepare(
    'INSERT INTO users (id, login_id, display_name, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
  ).bind(USER_A, 'user-a', '사용자 A', passwordHash, now, now).run()
})

describe('workspace password', () => {
  it('opens the home and workspace without a site login', async () => {
    const home = await fetchWorker(new Request('https://example.test/'))
    const workspace = await fetchWorker(new Request(`https://example.test/workspace/${USER_A}`))

    expect(home.status).toBe(200)
    expect(workspace.status).toBe(200)
    expect(await workspace.text()).toContain('비밀번호')
  })

  it('creates a secure persistent edit cookie for the correct workspace password', async () => {
    const before = Date.now()
    const response = await fetchWorker(
      formRequest(`/workspace/${USER_A}/unlock`, { password: PASSWORD }),
    )
    const after = Date.now()

    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe(`/workspace/${USER_A}`)
    const setCookie = response.headers.get('set-cookie') ?? ''
    expect(setCookie).toContain('hr_session=')
    expect(setCookie.toLowerCase()).toContain('httponly')
    expect(setCookie.toLowerCase()).toContain('secure')
    expect(setCookie.toLowerCase()).toContain('samesite=lax')
    expect(setCookie).not.toContain(USER_A)

    const row = await testEnv.DB.prepare(
      'SELECT user_id, expires_at, edit_unlocked_until FROM sessions LIMIT 1',
    ).first<{ user_id: string; expires_at: number; edit_unlocked_until: number }>()
    const longTerm = 400 * 24 * 60 * 60 * 1000
    expect(row?.user_id).toBe(USER_A)
    expect(row?.expires_at).toBeGreaterThanOrEqual(before + longTerm)
    expect(row?.expires_at).toBeLessThanOrEqual(after + longTerm)
    expect(row?.edit_unlocked_until).toBe(row?.expires_at)
  })

  it('does not create an edit session for a wrong password', async () => {
    const response = await fetchWorker(
      formRequest(`/workspace/${USER_A}/unlock`, { password: 'wrong' }),
    )

    expect(response.status).toBe(401)
    expect(await response.text()).toContain('비밀번호를 확인해 주세요.')
    const count = await testEnv.DB.prepare('SELECT COUNT(*) AS count FROM sessions').first<{ count: number }>()
    expect(count?.count).toBe(0)
  })

  it('blocks the sixth failed password attempt for the same workspace and IP', async () => {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const response = await fetchWorker(
        formRequest(`/workspace/${USER_A}/unlock`, { password: 'wrong' }),
      )
      expect(response.status).toBe(401)
    }
    const blocked = await fetchWorker(
      formRequest(`/workspace/${USER_A}/unlock`, { password: 'wrong' }),
    )
    expect(blocked.status).toBe(429)
  })

  it('does not expose the removed site-login route', async () => {
    const response = await fetchWorker(new Request('https://example.test/login'))
    expect(response.status).toBe(404)
  })
})




