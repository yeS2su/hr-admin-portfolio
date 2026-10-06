import { hash } from 'bcryptjs'
import { beforeEach, describe, expect, it } from 'vitest'

import { fetchWorker, formRequest, testEnv } from './helpers'

const USER_A = 'mock-user-a'
const USER_B = 'mock-user-b'
const USER_C = 'mock-user-c'

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
    testEnv.DB.prepare('DELETE FROM annual_schedule_items'),
    testEnv.DB.prepare('DELETE FROM general_expense_entries'),
    testEnv.DB.prepare('DELETE FROM asset_custody_records'),
    testEnv.DB.prepare('DELETE FROM assets'),
    testEnv.DB.prepare('DELETE FROM asset_import_batches'),
    testEnv.DB.prepare('DELETE FROM visitor_card_records'),
    testEnv.DB.prepare('DELETE FROM patent_annual_fees'),
    testEnv.DB.prepare('DELETE FROM patents'),
    testEnv.DB.prepare('DELETE FROM users'),
  ])
  const now = Date.now()
  const passwordHash = await hash('DemoOnly!2026', 4)
  const date = todayInSeoul()
  await testEnv.DB.batch([
    testEnv.DB.prepare(
      'INSERT INTO users (id, login_id, display_name, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    ).bind(USER_A, 'user-a', '사용자 A', passwordHash, now, now),
    testEnv.DB.prepare(
      'INSERT INTO users (id, login_id, display_name, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    ).bind(USER_B, 'user-b', '사용자 B', passwordHash, now, now),
    testEnv.DB.prepare(
      'INSERT INTO users (id, login_id, display_name, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    ).bind(USER_C, 'user-c', '사용자 C', passwordHash, now, now),
    testEnv.DB.prepare(
      'INSERT INTO work_entries (id, owner_user_id, work_date, content, is_completed, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ).bind('work-a-1', USER_A, date, '주간 일정 확인', 0, now, now),
    testEnv.DB.prepare(
      'INSERT INTO work_entries (id, owner_user_id, work_date, content, is_completed, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ).bind('work-a-2', USER_A, date, '문서 목록 정리', 1, now + 1, now + 1),
    testEnv.DB.prepare(
      'INSERT INTO work_entries (id, owner_user_id, work_date, content, is_completed, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ).bind('work-b-1', USER_B, date, '회의 준비', 0, now, now),
    testEnv.DB.prepare(
      `INSERT INTO assets
        (id, asset_code, asset_type, asset_name, current_user_name, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ).bind('asset-1', 'MOCK-D3-001', 'laptop', '가상 노트북', '가상 사용자', now, now),
  ])
})

async function publicAccessCookie(): Promise<string> {
  return ''
}

describe('home and workspaces', () => {
  it('shows all three fictional workspaces and weekly summaries', async () => {
    const cookie = await publicAccessCookie()
    const response = await fetchWorker(
      new Request('https://example.test/', { headers: { cookie } }),
    )
    const html = await response.text()

    expect(response.status).toBe(200)
    expect(html).toContain('사용자 A')
    expect(html).toContain('사용자 B')
    expect(html).toContain('사용자 C')
    expect(html).toContain('이번 주 2건')
    expect(html).toContain('미완료 1건')
    expect(html).toContain('주간 일정 확인')
  })

  it('shows the current month annual schedule on home and allows patent status edits', async () => {
    const now = Date.now()
    const month = Number.parseInt(todayInSeoul().slice(5, 7), 10)
    const year = Number.parseInt(todayInSeoul().slice(0, 4), 10)
    await testEnv.DB.batch([
      testEnv.DB.prepare(
        `INSERT INTO annual_schedule_items
          (id, schedule_year, major_category, subcategory, task, month_number, detail, sort_order, source_fingerprint)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).bind('annual-mock-1', year, '인사', '연차관리', '연차', month, '가상 월간업무 1', 1, 'mock'),
      testEnv.DB.prepare(
        `INSERT INTO patents
          (id, source_group, title, registration_number, source_fingerprint, source_sheet, source_row, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ).bind('00000000-0000-4000-8000-0000000000d1', '가상', '가상 특허', '가상-2026', 'mock', 'mock', 1, now),
      testEnv.DB.prepare(
        `INSERT INTO patent_annual_fees
          (id, patent_id, fee_year, deadline_raw, installment, amount, payment_status, note)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ).bind('patent-fee-mock-1', '00000000-0000-4000-8000-0000000000d1', 2027, '10월', '제1년분', 1000, 'unknown', null),
    ])

    const home = await fetchWorker(new Request('https://example.test/'))
    const homeHtml = await home.text()
    expect(homeHtml).toContain('월간업무')
    expect(homeHtml).toContain('가상 월간업무 1')

    const patents = await fetchWorker(new Request('https://example.test/patents?year=2027'))
    const patentHtml = await patents.text()
    expect(patentHtml).not.toContain('<th>구분</th>')
    expect(patentHtml).toContain('기안 필요')
    expect(patentHtml).toContain('name="status"')

    const updated = await fetchWorker(formRequest(
      '/patents/00000000-0000-4000-8000-0000000000d1/2027/status',
      { status: 'drafting' },
    ))
    expect(updated.status).toBe(303)
    const status = await testEnv.DB.prepare(
      'SELECT workflow_status FROM patent_annual_fees WHERE patent_id = ? AND fee_year = ?',
    ).bind('00000000-0000-4000-8000-0000000000d1', 2027).first<{ workflow_status: string }>()
    expect(status).toEqual({ workflow_status: 'drafting' })
  })

  it('allows adding shared expense calendar items without a workspace unlock', async () => {
    const home = await fetchWorker(new Request('https://example.test/'))
    const html = await home.text()
    expect(html).toContain('action="/general-expenses"')
    expect(html).not.toContain('항목을 추가하려면 본인 업무공간')

    const date = todayInSeoul()
    const requestId = '00000000-0000-4000-8000-000000000123'
    const created = await fetchWorker(formRequest('/general-expenses', {
      requestId, transferDate: date, content: '가상 팀 공용 소모품', assignedUserId: '', month: date.slice(0, 7),
    }))
    expect(created.status).toBe(302)
    const expense = await testEnv.DB.prepare(
      'SELECT content FROM general_expense_entries WHERE id = ?',
    ).bind(requestId).first<{ content: string }>()
    expect(expense).toEqual({ content: '가상 팀 공용 소모품' })
  })

  it('shows another user workspace as read-only', async () => {
    const cookie = await publicAccessCookie()
    const response = await fetchWorker(
      new Request(`https://example.test/workspace/${USER_B}`, { headers: { cookie } }),
    )
    const html = await response.text()

    expect(response.status).toBe(200)
    expect(html).toContain('사용자 B')
    expect(html).toContain('회의 준비')
    expect(html).toContain('잠김 · 조회 전용')
    expect(html).toContain(`action="/workspace/${USER_B}/unlock"`)
    expect(html.indexOf('class="unlock-strip"')).toBeLessThan(html.indexOf('class="planning-board"'))
    expect(html).toContain('월간업무의 수정·삭제와 업무목록 편집 버튼은 잠금 해제 후 표시됩니다.')
  })

  it('shows the edit-mode recheck only in the owner workspace', async () => {
    const cookie = await publicAccessCookie()
    const response = await fetchWorker(
      new Request(`https://example.test/workspace/${USER_A}`, { headers: { cookie } }),
    )
    const html = await response.text()

    expect(response.status).toBe(200)
    expect(html).toContain('🔒 잠김 · 조회 전용')
    expect(html).toContain(`action="/workspace/${USER_A}/unlock"`)
  })

  it('allows workspace viewing without a site login', async () => {
    const response = await fetchWorker(
      new Request(`https://example.test/workspace/${USER_A}`),
    )
    const html = await response.text()

    expect(response.status).toBe(200)
    expect(html).toContain('사용자 A 업무공간')
    expect(html).toContain('비밀번호')
  })

  it('opens the asset register and finds an asset code', async () => {
    const home = await fetchWorker(new Request('https://example.test/'))
    const homeHtml = await home.text()
    expect(homeHtml).toContain('href="/assets"')

    const response = await fetchWorker(
      new Request('https://example.test/assets?q=MOCK-D3-001'),
    )
    const html = await response.text()
    expect(response.status).toBe(200)
    expect(html).toContain('<h1>자산관리대장</h1>')
    expect(html).toContain('MOCK-D3-001')
    expect(html).toContain('가상 사용자')
    expect(html).toContain('class="asset-history-link" href="/assets/asset-1"')
    expect(html).toContain('href="/assets/register">자산등록</a>')
    expect(html).toContain('href="/assets/outbound">반출·반납 관리</a>')
  })

  it('shows near return deadlines and edits assets from the list and detail page', async () => {
    const now = Date.now()
    const date = todayInSeoul()
    await testEnv.DB.prepare(
      `INSERT INTO asset_custody_records
        (id, asset_id, recipient_name, outbound_date, expected_return_date, purpose,
         created_at, updated_at, outbound_department, actual_user_name, has_proposal)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind('custody-due-1', 'asset-1', '가상 반출자', date, date, '가상 반납 임박 테스트', now, now, '가상 총무팀', '가상 실사용자', 0).run()

    const list = await fetchWorker(new Request('https://example.test/assets'))
    const listHtml = await list.text()
    expect(listHtml).toContain('반납기한 임박')
    expect(listHtml).toContain('href="/assets/asset-1">수정</a>')

    const detail = await fetchWorker(new Request('https://example.test/assets/asset-1'))
    const detailHtml = await detail.text()
    expect(detailHtml).toContain('자산 정보 수정')
    expect(detailHtml).toContain('action="/assets/asset-1"')

    const updated = await fetchWorker(formRequest('/assets/asset-1', {
      assetCode: 'MOCK-D3-001-EDITED', assetType: 'desktop', assetName: '수정된 가상 자산',
      currentUserName: '수정된 사용자', usageScope: '프로젝트', usageStartDate: '2026-10-01',
      usageEndDate: '2027-10-01', historyNote: '수정 메모',
    }))
    expect(updated.status).toBe(303)
    expect(updated.headers.get('location')).toBe('/assets/asset-1')
    const asset = await testEnv.DB.prepare(
      'SELECT asset_code, asset_type, asset_name, current_user_name, usage_scope, usage_start_date, usage_end_date, history_note FROM assets WHERE id = ?',
    ).bind('asset-1').first()
    expect(asset).toEqual({
      asset_code: 'MOCK-D3-001-EDITED', asset_type: 'desktop', asset_name: '수정된 가상 자산',
      current_user_name: '수정된 사용자', usage_scope: '프로젝트', usage_start_date: '2026-10-01',
      usage_end_date: '2027-10-01', history_note: '수정 메모',
    })
  })

  it('keeps shared asset management editable without a workspace lock', async () => {
    const register = await fetchWorker(new Request('https://example.test/assets/register'))
    const registerHtml = await register.text()
    const outbound = await fetchWorker(new Request('https://example.test/assets/outbound'))
    const outboundHtml = await outbound.text()

    expect(registerHtml).not.toContain('🔒 잠김 · 조회 전용')
    expect(registerHtml).not.toContain('<fieldset disabled>')
    expect(registerHtml).not.toContain('업무공간 잠금')
    expect(outboundHtml).toContain('현재 반출 중')
    expect(outboundHtml).toContain('반출·반납 이력')
    expect(outboundHtml).not.toContain('업무공간 잠금')
    expect(outboundHtml).not.toContain('<fieldset disabled>')
    expect(outboundHtml).toContain('id="outbound-asset-search"')
    expect(outboundHtml).toContain('data-asset-search=')
    expect(outboundHtml).toContain('name="outboundDepartment"')
    expect(outboundHtml).toContain('name="actualUserName"')
    expect(outboundHtml).toContain('name="hasProposal"')
    expect(outboundHtml).toContain('<span>기안 유무</span>')
    expect(outboundHtml).toContain('<th>기안 유무</th>')
  })

  it('registers an asset and records its outbound and return without changing its register data', async () => {
    const registered = await fetchWorker(formRequest('/assets/register', {
      assetCode: 'MOCK-REG-002', assetType: 'monitor', assetName: '가상 회의용 모니터',
      currentUserName: '가상 배정자', usageScope: '공용', usageStartDate: '', usageEndDate: '', historyNote: '',
    }))
    expect(registered.status).toBe(303)
    expect(registered.headers.get('location')).toBe('/assets')

    const date = todayInSeoul()
    const outbound = await fetchWorker(formRequest('/assets/outbound', {
      assetId: (await testEnv.DB.prepare('SELECT id FROM assets WHERE asset_code = ?').bind('MOCK-REG-002').first<{ id: string }>())!.id,
      recipientName: '가상 반출자', outboundDepartment: '가상 총무팀', actualUserName: '가상 실사용자',
      outboundDate: date, expectedReturnDate: date, purpose: '가상 회의실 설치', hasProposal: '1',
    }))
    expect(outbound.status).toBe(303)

    const asset = await testEnv.DB.prepare(
      'SELECT current_user_name, usage_scope FROM assets WHERE asset_code = ?',
    ).bind('MOCK-REG-002').first<{ current_user_name: string; usage_scope: string }>()
    expect(asset).toEqual({ current_user_name: '가상 배정자', usage_scope: '공용' })

    const record = await testEnv.DB.prepare(
      'SELECT id FROM asset_custody_records WHERE asset_id = (SELECT id FROM assets WHERE asset_code = ?)',
    ).bind('MOCK-REG-002').first<{ id: string }>()
    expect(record).not.toBeNull()
    const custody = await testEnv.DB.prepare(
      'SELECT outbound_department, actual_user_name, has_proposal FROM asset_custody_records WHERE id = ?',
    ).bind(record!.id).first<{ outbound_department: string; actual_user_name: string; has_proposal: number }>()
    expect(custody).toEqual({ outbound_department: '가상 총무팀', actual_user_name: '가상 실사용자', has_proposal: 1 })
    const returned = await fetchWorker(formRequest(`/assets/outbound/${record!.id}/return`, { returnedDate: date }))
    expect(returned.status).toBe(303)
    const page = await fetchWorker(new Request('https://example.test/assets/outbound'))
    const html = await page.text()
    expect(html).toContain('가상 회의실 설치')
    expect(html).toContain('MOCK-REG-002')
    expect(html).toContain('가상 총무팀')
    expect(html).toContain('가상 실사용자')
    expect(html).toContain('<td>있음</td>')
    expect(html).not.toContain('반납 처리</button>')
  })

  it('opens the selected asset and shows only its linked historical survey records', async () => {
    const now = Date.now()
    await testEnv.DB.prepare(
      `INSERT INTO asset_history
        (id, asset_id, recorded_at_raw, respondent_name, department, equipment_label, model_name,
         manufacture_date_raw, source_sha256, source_sheet_key, source_row, source_column, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind('history-1', 'asset-1', '2025-11-25', '가상 과거 사용자', '가상 부서', '노트북1', '가상 모델', '2024-01', 'mock-hash', 'mock-sheet', 2, 7, now).run()

    const response = await fetchWorker(new Request('https://example.test/assets/asset-1'))
    const html = await response.text()

    expect(response.status).toBe(200)
    expect(html).toContain('2025년 재물조사 기록')
    expect(html).toContain('가상 과거 사용자')
    expect(html).toContain('2025-11-25')
    expect(html).toContain('가상 모델')
    expect(html).not.toContain('없는 자산의 기록')
  })

  it('creates and edits visitor cards with calendar dates and multiple access scopes', async () => {
    const created = await fetchWorker(formRequest('/visitor-cards', {
      applicant: '가상 신청자 이름이 긴 방문객', hasApproval: 'O', reason: '가상 방문 사유',
      cardUser: '가상 사용인', visitorBadgeNumber: '방문증-001', cardNumber: '카드-001',
      checkoutDate: '2026-10-02', returnDate: '', usageStartDate: '2026-10-05',
      usageEndDate: '2026-10-07', usagePeriodRaw: '', access5: '1', access10: '1', access11: '',
    }))
    expect(created.status).toBe(303)
    const record = await testEnv.DB.prepare(
      'SELECT id, has_approval, usage_start_date, usage_end_date, access_scope FROM visitor_card_records WHERE card_number = ?',
    ).bind('카드-001').first<{ id: string; has_approval: number; usage_start_date: string; usage_end_date: string; access_scope: string }>()
    expect(record).toMatchObject({ has_approval: 1, usage_start_date: '2026-10-05', usage_end_date: '2026-10-07', access_scope: '5,10' })

    const page = await fetchWorker(new Request('https://example.test/visitor-cards?q=가상'))
    const html = await page.text()
    expect(page.status).toBe(200)
    expect(html).toContain('가상 신청자 이름이 긴 방문객')
    expect(html).toContain('class="visitor-applicant"')
    expect(html).toContain('>O</span>')
    expect(html).toContain('type="date"')
    expect(html).toContain(`action="/visitor-cards/${record!.id}"`)

    const updated = await fetchWorker(formRequest(`/visitor-cards/${record!.id}`, {
      applicant: '수정된 신청자', hasApproval: 'X', reason: '수정된 사유', cardUser: '수정된 사용인',
      visitorBadgeNumber: '방문증-002', cardNumber: '카드-002', checkoutDate: '2026-10-03',
      returnDate: '2026-10-04', usageStartDate: '2026-10-10', usageEndDate: '2026-10-11',
      usagePeriodRaw: '', access5: '', access10: '', access11: '1',
    }))
    expect(updated.status).toBe(303)
    const edited = await testEnv.DB.prepare(
      'SELECT applicant, has_approval, access_scope, usage_start_date, usage_end_date FROM visitor_card_records WHERE id = ?',
    ).bind(record!.id).first()
    expect(edited).toEqual({ applicant: '수정된 신청자', has_approval: 0, access_scope: '11', usage_start_date: '2026-10-10', usage_end_date: '2026-10-11' })
  })
})



