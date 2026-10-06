import { hash } from 'bcryptjs'
import { beforeEach, describe, expect, it } from 'vitest'

import { fetchWorker, formRequest, responseCookie, testEnv } from './helpers'

const USER_A = 'mock-import-user-a'
const currentParts = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit',
}).formatToParts(new Date())
const CURRENT_YEAR = Number.parseInt(currentParts.find((part) => part.type === 'year')?.value ?? '', 10)
const CURRENT_MONTH = Number.parseInt(currentParts.find((part) => part.type === 'month')?.value ?? '', 10)
const previousMonthDate = new Date(Date.UTC(CURRENT_YEAR, CURRENT_MONTH - 2, 1))
const PREVIOUS_YEAR = previousMonthDate.getUTCFullYear()
const PREVIOUS_MONTH = previousMonthDate.getUTCMonth() + 1
const PREVIOUS_PERIOD = `${PREVIOUS_YEAR}-${String(PREVIOUS_MONTH).padStart(2, '0')}`

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
  await testEnv.DB.prepare(
    'INSERT INTO users (id, login_id, display_name, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
  ).bind(USER_A, 'import-user-a', '가상 사용자 A', passwordHash, now, now).run()

  const statements: D1PreparedStatement[] = []
  for (let index = 0; index < 51; index += 1) {
    statements.push(testEnv.DB.prepare(
      `INSERT INTO work_entries
        (id, owner_user_id, cadence, work_date, period_year, period_month, content, is_completed, needs_review, created_at, updated_at)
       VALUES (?, ?, 'daily', ?, 2026, 9, ?, 0, 0, ?, ?)`,
    ).bind(`daily-${index}`, USER_A, `2026-09-${String((index % 28) + 1).padStart(2, '0')}`, `가상 일일업무 ${index}`, now + index, now + index))
  }
  statements.push(
    testEnv.DB.prepare(
      `INSERT INTO work_entries
        (id, owner_user_id, cadence, period_year, period_month, category, content, is_completed, needs_review, created_at, updated_at)
       VALUES (?, ?, 'monthly', ?, ?, '가상 분류', '가상 월별업무', 0, 0, ?, ?)`,
    ).bind('monthly-1', USER_A, CURRENT_YEAR, CURRENT_MONTH, now + 99, now + 99),
    testEnv.DB.prepare(
      `INSERT INTO work_entries
        (id, owner_user_id, cadence, period_year, period_month, category, content, is_completed, needs_review, created_at, updated_at)
       VALUES (?, ?, 'monthly', ?, ?, '이전 달 분류', '이전 달 월별업무', 0, 0, ?, ?)`,
    ).bind('monthly-previous', USER_A, PREVIOUS_YEAR, PREVIOUS_MONTH, now + 98, now + 98),
    testEnv.DB.prepare(
      `INSERT INTO work_entries
        (id, owner_user_id, cadence, period_year, period_month, week_label, content, is_completed, needs_review, created_at, updated_at)
       VALUES (?, ?, 'undated', 2026, 9, '9/21-25', '가상 주간업무', 0, 1, ?, ?)`,
    ).bind('weekly-1', USER_A, now + 100, now + 100),
    testEnv.DB.prepare(
      `INSERT INTO work_entries
        (id, owner_user_id, cadence, period_year, content, is_completed, needs_review, created_at, updated_at)
       VALUES (?, ?, 'yearly', 2026, '가상 연간업무', 0, 0, ?, ?)`,
    ).bind('yearly-1', USER_A, now + 101, now + 101),
    testEnv.DB.prepare(
      `INSERT INTO work_entries
        (id, owner_user_id, cadence, content, is_completed, needs_review, created_at, updated_at)
       VALUES (?, ?, 'undated', '가상 기간 미지정 업무', 0, 1, ?, ?)`,
    ).bind('undated-1', USER_A, now + 102, now + 102),
  )
  await testEnv.DB.batch(statements)
})

async function publicAccessCookie(): Promise<string> {
  return ''
}

describe('imported work list', () => {
  it('shows only 50 entries at once and provides a next page', async () => {
    const cookie = await publicAccessCookie()
    const response = await fetchWorker(new Request(`https://example.test/workspace/${USER_A}`, { headers: { cookie } }))
    const html = await response.text()

    expect(response.status).toBe(200)
    expect(html).toContain('총 51건')
    expect(html).toContain('1 / 2')
    expect(html).toContain('page=2')
    expect(html).toContain('<time datetime="2026-09-28">9/28(월)</time>')
    expect(html).toContain('week-boundary')
    expect((html.match(/class="work-item/g) ?? []).length).toBe(50)
  })

  it('shows monthly work above the bottom task list and keeps former weekly work undated', async () => {
    const cookie = await publicAccessCookie()
    const response = await fetchWorker(new Request(`https://example.test/workspace/${USER_A}`, { headers: { cookie } }))
    const html = await response.text()

    expect(html).not.toContain('<h2>주간업무</h2>')
    expect(html.indexOf(`<h2 class="month-title">${CURRENT_MONTH}월</h2>`)).toBeLessThan(html.indexOf('<h2>업무목록</h2>'))
    expect(html).toContain('<span>분류</span><span>업무 내용</span>')
    expect(html).toContain('가상 분류')
    expect(html).toContain('가상 월별업무')
    expect(html).not.toContain('<span>해당 월</span>')
    expect(html).toContain('aria-label="진행 중"')
    expect(html).toContain('>△</span>')

    const undated = await fetchWorker(
      new Request(`https://example.test/workspace/${USER_A}?view=undated`, { headers: { cookie } }),
    )
    expect(await undated.text()).toContain('가상 주간업무')
  })

  it('switches the monthly summary with the month tabs', async () => {
    const response = await fetchWorker(
      new Request(`https://example.test/workspace/${USER_A}?month=${PREVIOUS_PERIOD}`),
    )
    const html = await response.text()

    expect(response.status).toBe(200)
    expect(html).toContain(`<h2 class="month-title">${PREVIOUS_MONTH}월</h2>`)
    expect(html).toContain(`class="workspace-month-tab active" href="/workspace/${USER_A}?month=${PREVIOUS_PERIOD}"`)
    expect(html).toContain('이전 달 분류')
    expect(html).toContain('이전 달 월별업무')
    expect(html).not.toContain('가상 월별업무')
  })

  it('keeps old yearly data in all and uses the annual schedule disclosure instead of a yearly tab', async () => {
    const cookie = await publicAccessCookie()
    const all = await fetchWorker(new Request(`https://example.test/workspace/${USER_A}?view=all`, { headers: { cookie } }))
    const allHtml = await all.text()
    const allSecond = await fetchWorker(new Request(`https://example.test/workspace/${USER_A}?view=all&page=2`, { headers: { cookie } }))
    const allSecondHtml = await allSecond.text()
    const undated = await fetchWorker(new Request(`https://example.test/workspace/${USER_A}?view=undated`, { headers: { cookie } }))
    const undatedHtml = await undated.text()

    expect(all.status).toBe(200)
    expect(allSecondHtml).toContain('가상 연간업무')
    expect(allHtml).toContain('연간업무 확인')
    expect(allHtml).not.toContain('?view=yearly')
    expect(undated.status).toBe(200)
    expect(undatedHtml).toContain('가상 기간 미지정 업무')
    expect(undatedHtml).toContain('검토 필요')
  })

  it('clamps a page beyond the end to the last available page', async () => {
    const cookie = await publicAccessCookie()
    const response = await fetchWorker(new Request(`https://example.test/workspace/${USER_A}?page=999`, { headers: { cookie } }))
    const html = await response.text()

    expect(response.status).toBe(200)
    expect(html).toContain('2 / 2')
    expect((html.match(/class="work-item/g) ?? []).length).toBe(1)
  })
})




