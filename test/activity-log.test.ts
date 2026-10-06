import { hash } from 'bcryptjs'
import { beforeEach, describe, expect, it } from 'vitest'

import { fetchWorker, formRequest, responseCookie, testEnv } from './helpers'

const USER_A = 'mock-user-a'
const USER_B = 'mock-user-b'
const WORK_ID = '30000000-0000-4000-8000-000000000001'
const PASSWORD = 'DemoOnly!2026'

const todayInSeoul = (): string =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())

beforeEach(async () => {
  await testEnv.DB.batch([
    testEnv.DB.prepare('DELETE FROM activity_logs'),
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

async function unlockedCookie(): Promise<string> {
  const unlock = await fetchWorker(
    formRequest(`/workspace/${USER_A}/unlock`, { password: PASSWORD }),
  )
  expect(unlock.status).toBe(302)
  return responseCookie(unlock)

}

type ActivityRow = {
  actor_user_id: string | null
  action: string
  target_type: string
  target_id: string | null
  succeeded: number
  created_at: number
}

describe('activity logging', () => {
  it('records create, update, and toggle without sensitive or work content', async () => {
    const cookie = await unlockedCookie()
    const workDate = todayInSeoul()
    const privateWorkText = '기록에 들어가면 안 되는 가상 업무 문구'

    await fetchWorker(
      formRequest(
        `/workspace/${USER_A}/entries`,
        { requestId: WORK_ID, workDate, content: privateWorkText },
        cookie,
      ),
    )
    await fetchWorker(
      formRequest(
        `/workspace/${USER_A}/entries/${WORK_ID}`,
        { workDate, content: '수정된 가상 업무 문구' },
        cookie,
      ),
    )
    await fetchWorker(
      formRequest(`/workspace/${USER_A}/entries/${WORK_ID}/toggle`, {}, cookie),
    )

    const rows = await testEnv.DB.prepare(
      'SELECT actor_user_id, action, target_type, target_id, succeeded, created_at FROM activity_logs ORDER BY created_at, rowid',
    ).all<ActivityRow>()
    expect(rows.results.map((row) => row.action)).toEqual([
      'work.create',
      'work.update',
      'work.toggle',
    ])
    expect(rows.results.every((row) => row.actor_user_id === USER_A)).toBe(true)
    expect(rows.results.every((row) => row.target_type === 'work_entry')).toBe(true)
    expect(rows.results.every((row) => row.target_id === WORK_ID)).toBe(true)
    expect(rows.results.every((row) => row.succeeded === 1)).toBe(true)
    expect(rows.results.every((row) => row.created_at > 0)).toBe(true)

    const serialized = JSON.stringify(rows.results)
    expect(serialized).not.toContain(privateWorkText)
    expect(serialized).not.toContain(PASSWORD)
    expect(serialized).not.toContain(cookie)
    expect(serialized).not.toContain('203.0.113.10')
  })

  it('records a blocked cross-user update without storing the submitted content', async () => {
    const cookie = await unlockedCookie()
    const deniedContent = '저장되면 안 되는 차단 요청 문구'
    const response = await fetchWorker(
      formRequest(
        `/workspace/${USER_B}/entries/${WORK_ID}`,
        { workDate: todayInSeoul(), content: deniedContent },
        cookie,
      ),
    )

    expect(response.status).toBe(403)
    const row = await testEnv.DB.prepare(
      'SELECT actor_user_id, action, target_type, target_id, succeeded, created_at FROM activity_logs LIMIT 1',
    ).first<ActivityRow>()
    expect(row).toMatchObject({
      actor_user_id: USER_A,
      action: 'work.update',
      target_type: 'work_entry',
      target_id: WORK_ID,
      succeeded: 0,
    })
    expect(JSON.stringify(row)).not.toContain(deniedContent)
  })
})


