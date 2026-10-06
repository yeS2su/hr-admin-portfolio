import { hash } from 'bcryptjs'
import { beforeEach, describe, expect, it } from 'vitest'

import { fetchWorker, formRequest, responseCookie, testEnv } from './helpers'

const USER_A = 'mock-user-a'
const USER_B = 'mock-user-b'
const WORK_ID = '20000000-0000-4000-8000-000000000001'
const MONTHLY_ID = '20000000-0000-4000-8000-000000000002'

const todayInSeoul = (): string =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())

beforeEach(async () => {
  await testEnv.DB.batch([
    testEnv.DB.prepare('DELETE FROM login_attempts'),
    testEnv.DB.prepare('DELETE FROM sessions'),
    testEnv.DB.prepare('DELETE FROM work_entries'),
    testEnv.DB.prepare('DELETE FROM general_expense_entries'),
    testEnv.DB.prepare('DELETE FROM users'),
  ])
  const now = Date.now()
  const passwordHash = await hash('DemoOnly!2026', 4)
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
    formRequest(`/workspace/${USER_A}/unlock`, { password: 'DemoOnly!2026' }),
  )
  expect(unlock.status).toBe(302)
  return responseCookie(unlock)

}

describe('owner writes', () => {
  it('creates one entry and treats a repeated request ID as the same request', async () => {
    const cookie = await unlockedCookie()
    const values = {
      requestId: WORK_ID,
      workDate: todayInSeoul(),
      content: '가상 업무 추가',
    }

    const first = await fetchWorker(formRequest(`/workspace/${USER_A}/entries`, values, cookie))
    const repeated = await fetchWorker(
      formRequest(`/workspace/${USER_A}/entries`, values, cookie),
    )

    expect(first.status).toBe(302)
    expect(repeated.status).toBe(302)
    const rows = await testEnv.DB.prepare(
      'SELECT content FROM work_entries WHERE id = ?',
    )
      .bind(WORK_ID)
      .all<{ content: string }>()
    expect(rows.results).toEqual([{ content: '가상 업무 추가' }])
  })

  it('edits and toggles an owned entry', async () => {
    const cookie = await unlockedCookie()
    const date = todayInSeoul()
    await fetchWorker(
      formRequest(
        `/workspace/${USER_A}/entries`,
        { requestId: WORK_ID, workDate: date, content: '수정 전' },
        cookie,
      ),
    )

    const edited = await fetchWorker(
      formRequest(
        `/workspace/${USER_A}/entries/${WORK_ID}`,
        { workDate: date, category: '채용', content: '수정 후' },
        cookie,
      ),
    )
    const toggled = await fetchWorker(
      formRequest(`/workspace/${USER_A}/entries/${WORK_ID}/toggle`, {}, cookie),
    )

    expect(edited.status).toBe(302)
    expect(toggled.status).toBe(302)
    const row = await testEnv.DB.prepare(
      'SELECT category, content, is_completed FROM work_entries WHERE id = ?',
    )
      .bind(WORK_ID)
      .first<{ category: string; content: string; is_completed: number }>()
    expect(row).toEqual({ category: '채용', content: '수정 후', is_completed: 1 })

    const workspace = await fetchWorker(
      new Request(`https://example.test/workspace/${USER_A}`, { headers: { cookie } }),
    )
    const html = await workspace.text()
    expect(html).toContain('class="work-table-head"')
    expect(html).toContain('class="inline-category-form"')
    expect(html).toContain('<option value="채용" selected>채용</option>')
    expect(html).toContain('aria-label="업무목록에서 삭제"')

    const deleted = await fetchWorker(formRequest(`/workspace/${USER_A}/entries/${WORK_ID}/delete`, {
      month: date.slice(0, 7), view: 'daily', page: '1',
    }, cookie))
    expect(deleted.status).toBe(302)
    expect(deleted.headers.get('location')).toBe(`/workspace/${USER_A}?view=daily&page=1&month=${date.slice(0, 7)}`)
    expect(await testEnv.DB.prepare('SELECT id FROM work_entries WHERE id = ?').bind(WORK_ID).first()).toBeNull()
  })

  it.each([
    [{ requestId: WORK_ID, workDate: todayInSeoul(), content: '' }, 'blank content'],
    [{ requestId: WORK_ID, workDate: todayInSeoul(), content: '가'.repeat(501) }, 'long content'],
    [{ requestId: WORK_ID, workDate: '2026-02-31', content: '가상 업무' }, 'invalid date'],
    [{ requestId: WORK_ID, workDate: todayInSeoul(), deadlineDate: '2026-02-31', content: '가상 업무' }, 'invalid deadline'],
    [{ requestId: 'not-a-uuid', workDate: todayInSeoul(), content: '가상 업무' }, 'invalid request ID'],
  ])('rejects invalid input: %s', async (values, _label) => {
    const cookie = await unlockedCookie()
    const response = await fetchWorker(
      formRequest(`/workspace/${USER_A}/entries`, values, cookie),
    )

    expect(response.status).toBe(422)
    const count = await testEnv.DB.prepare('SELECT COUNT(*) AS count FROM work_entries').first<{
      count: number
    }>()
    expect(count?.count).toBe(0)
  })

  it('returns not found without changing data for a missing entry', async () => {
    const cookie = await unlockedCookie()
    const response = await fetchWorker(
      formRequest(
        `/workspace/${USER_A}/entries/${WORK_ID}`,
        { workDate: todayInSeoul(), content: '없는 업무' },
        cookie,
      ),
    )

    expect(response.status).toBe(404)
  })
  it('stores a team expense on the home calendar and checks it manually', async () => {
    const cookie = await unlockedCookie()
    const date = todayInSeoul()
    const month = date.slice(0, 7)
    const created = await fetchWorker(
      formRequest(
        '/general-expenses',
        {
          requestId: WORK_ID,
          transferDate: date,
          month,
          content: '가상 통신비 전표 제출',
        },
        cookie,
      ),
    )
    expect(created.status).toBe(302)
    expect(created.headers.get('location')).toBe(`/?month=${month}#general-expenses`)
    const linkedWork = await fetchWorker(formRequest(`/workspace/${USER_A}/entries`, {
      requestId: WORK_ID, workDate: date, category: '총무비용', content: '가상 총무비용 업무',
    }, cookie))
    const linkedAdminWork = await fetchWorker(formRequest(`/workspace/${USER_A}/entries`, {
      requestId: MONTHLY_ID, workDate: date, category: '총무', content: '가상 총무 업무',
    }, cookie))
    expect(linkedWork.status).toBe(302)
    expect(linkedAdminWork.status).toBe(302)

    const home = await fetchWorker(new Request(`https://example.test/?month=${month}`, { headers: { cookie } }))
    const homeHtml = await home.text()
    expect(home.status).toBe(200)
    expect(homeHtml).toContain('총무비용 캘린더')
    expect(homeHtml).toContain('expense-calendar-grid')
    expect(homeHtml).toContain(`${date.slice(0, 4)}년 총무비용`)
    expect(homeHtml).toContain('>1월</a>')
    expect(homeHtml).toContain('>12월</a>')
    expect(homeHtml).toContain(`class="expense-month-tab active" href="/?month=${month}#general-expenses"`)
    expect(homeHtml).toContain('가상 통신비 전표 제출')
    expect(homeHtml).not.toContain('[미정]')
    expect(homeHtml).not.toContain('담당 미정')

    const workspace = await fetchWorker(new Request(`https://example.test/workspace/${USER_A}`))
    expect(await workspace.text()).not.toContain('가상 통신비 전표 제출')
    const unlockedWorkspace = await fetchWorker(new Request(`https://example.test/workspace/${USER_A}?month=${month}`, { headers: { cookie } }))
    const unlockedHtml = await unlockedWorkspace.text()
    expect(unlockedHtml).toContain('class="expense-entry-picker"')
    expect(unlockedHtml).toContain(`<section class="expense-entry-group"><h3>${Number.parseInt(date.slice(8), 10)}일</h3>`)
    expect(unlockedHtml).toContain('<button class="expense-entry-direct" type="button"')
    expect(unlockedHtml.indexOf('class="expense-entry-direct"')).toBeLessThan(unlockedHtml.indexOf('class="expense-entry-group"'))
    expect((unlockedHtml.match(/class="expense-entry-picker"/g) ?? []).length).toBe(3)
    expect((unlockedHtml.match(/class="expense-entry-picker" open/g) ?? []).length).toBe(0)
    expect((unlockedHtml.match(/class="expense-entry-picker" hidden/g) ?? []).length).toBe(1)
    expect(unlockedHtml).toContain("['총무','총무비용'].includes(this.value)")
    const editor = unlockedHtml.split('class="inline-entry-edit content-entry-edit">')[1]?.split('</details>')[0] ?? ''
    expect(editor).not.toContain('<select')
    expect(editor).toContain('type="hidden" name="category"')

    const publicHome = await fetchWorker(new Request(`https://example.test/?month=${month}`))
    expect(await publicHome.text()).toContain(`/general-expenses/${WORK_ID}/toggle`)
    const toggled = await fetchWorker(formRequest(`/general-expenses/${WORK_ID}/toggle`, { month }))
    expect(toggled.status).toBe(302)
    const row = await testEnv.DB.prepare(
      'SELECT assigned_user_id, is_completed FROM general_expense_entries WHERE id = ?',
    ).bind(WORK_ID).first<{ assigned_user_id: string; is_completed: number }>()
    expect(row).toEqual({ assigned_user_id: null, is_completed: 1 })
  })
  it('moves an entry to monthly work', async () => {
    const cookie = await unlockedCookie()
    await fetchWorker(
      formRequest(
        `/workspace/${USER_A}/entries`,
        { requestId: WORK_ID, workDate: todayInSeoul(), content: '가상 미완료 업무' },
        cookie,
      ),
    )

    const moved = await fetchWorker(
      formRequest(
        `/workspace/${USER_A}/entries/${WORK_ID}/move`,
        { target: 'monthly', period: '2026-10' },
        cookie,
      ),
    )
    expect(moved.status).toBe(302)
    const row = await testEnv.DB.prepare(
      'SELECT cadence, work_date, period_year, period_month, is_completed FROM work_entries WHERE id = ?',
    ).bind(WORK_ID).first<{
      cadence: string; work_date: string | null; period_year: number; period_month: number; is_completed: number
    }>()
    expect(row?.cadence).toBe('monthly')
    expect(row?.work_date).toBeNull()
    expect(row?.period_year).toBe(2026)
    expect(row?.period_month).toBe(10)
    expect(row?.is_completed).toBe(0)
  })
  it('defaults the work date and stores a custom category, monthly work, and a memo', async () => {
    const cookie = await unlockedCookie()
    expect((await fetchWorker(formRequest(`/workspace/${USER_A}/categories`, { name: '교육' }, cookie))).status).toBe(302)
    expect((await fetchWorker(formRequest(`/workspace/${USER_A}/entries`, {
      requestId: WORK_ID, category: '교육', content: '가상 당일 업무',
    }, cookie))).status).toBe(302)
    expect((await fetchWorker(formRequest(`/workspace/${USER_A}/entries/${WORK_ID}/memo`, {
      memo: '가상 메모',
    }, cookie))).status).toBe(302)
    expect((await fetchWorker(formRequest(`/workspace/${USER_A}/monthly-entries`, {
      requestId: MONTHLY_ID, period: '2026-11', category: '인사', content: '가상 월간 업무',
    }, cookie))).status).toBe(302)

    const daily = await testEnv.DB.prepare(
      'SELECT work_date, category, memo FROM work_entries WHERE id = ?',
    ).bind(WORK_ID).first<{ work_date: string; category: string; memo: string }>()
    const monthly = await testEnv.DB.prepare(
      'SELECT cadence, period_year, period_month FROM work_entries WHERE id = ?',
    ).bind(MONTHLY_ID).first<{ cadence: string; period_year: number; period_month: number }>()
    expect(daily).toEqual({ work_date: todayInSeoul(), category: '교육', memo: '가상 메모' })
    expect(monthly).toEqual({ cadence: 'monthly', period_year: 2026, period_month: 11 })

    const workspace = await fetchWorker(new Request(`https://example.test/workspace/${USER_A}`, { headers: { cookie } }))
    const html = await workspace.text()
    expect(html).toContain(`value="${todayInSeoul()}"`)
    expect(html).toContain('<option value="인사">인사</option>')
    expect(html).toContain('<option value="교육">교육</option>')
  })

  it('edits and deletes only the selected monthly work entry', async () => {
    const cookie = await unlockedCookie()
    const period = '2026-11'
    const created = await fetchWorker(formRequest(`/workspace/${USER_A}/monthly-entries`, {
      requestId: MONTHLY_ID, period, category: '인사', content: '수정 전 월간업무',
    }, cookie))
    expect(created.status).toBe(302)

    const workspace = await fetchWorker(new Request(`https://example.test/workspace/${USER_A}?month=${period}`, { headers: { cookie } }))
    const html = await workspace.text()
    expect(html).toContain(`action="/workspace/${USER_A}/monthly-entries/${MONTHLY_ID}"`)
    expect(html).toContain(`action="/workspace/${USER_A}/monthly-entries/${MONTHLY_ID}/delete"`)
    expect(html).toContain('월간업무 수정')
    expect(html).toContain('aria-label="월간업무 분류 수정"')
    expect(html).toContain('aria-label="월간업무 삭제"')

    const edited = await fetchWorker(formRequest(`/workspace/${USER_A}/monthly-entries/${MONTHLY_ID}`, {
      period, category: '교육', content: '수정 후 월간업무',
    }, cookie))
    expect(edited.status).toBe(302)
    expect(edited.headers.get('location')).toBe(`/workspace/${USER_A}?month=${period}`)
    const updatedRow = await testEnv.DB.prepare(
      'SELECT cadence, period_year, period_month, category, content FROM work_entries WHERE id = ?',
    ).bind(MONTHLY_ID).first<{
      cadence: string; period_year: number; period_month: number; category: string; content: string
    }>()
    expect(updatedRow).toEqual({
      cadence: 'monthly', period_year: 2026, period_month: 11,
      category: '교육', content: '수정 후 월간업무',
    })

    const wrongPeriodDelete = await fetchWorker(formRequest(`/workspace/${USER_A}/monthly-entries/${MONTHLY_ID}/delete`, {
      period: '2026-12',
    }, cookie))
    expect(wrongPeriodDelete.status).toBe(404)
    const deleted = await fetchWorker(formRequest(`/workspace/${USER_A}/monthly-entries/${MONTHLY_ID}/delete`, {
      period,
    }, cookie))
    expect(deleted.status).toBe(302)
    const remaining = await testEnv.DB.prepare(
      'SELECT id FROM work_entries WHERE id = ?',
    ).bind(MONTHLY_ID).first<{ id: string }>()
    expect(remaining).toBeNull()
  })
})






