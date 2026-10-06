import type { Context } from 'hono'

import type { AppContext } from './auth'
import type { AssetType, InterviewCoordinationRow, PatentWorkflowStatus, RecruitmentRecordDraft, RecruitmentRecordKind, RecruitmentRecordStatus, RecruitmentRow, WorkCadence } from './types'
import { getSeoulWeekRange } from './dates'
import {
  addWorkspaceCategory,
  createAsset,
  createAssetCustodyRecord,
  createVisitorCard as createVisitorCardRecord,
  findUserById,
  findAssetById,
  assignTeamGeneralExpense,
  deleteOwnedMonthlyWorkEntry,
  deleteOwnedWorkEntry,
  insertTeamGeneralExpense,
  insertWorkEntry,
  listAnnualScheduleItems,
  listAssetPage,
  listAssetHistory,
  listAssetChoices,
  listAssetCustodyRecords,
  listAssetDueRecords,
  listPatentFees,
  updatePatentWorkflowStatus,
  listTeamGeneralExpenseSuggestions,
  listTeamGeneralExpenses,
  listMonthlyWorkEntries,
  listManualEntries,
  listRecruitmentRows,
  listRecruitmentRecords,
  listRecruitmentRecordCounts,
  createRecruitmentRecord,
  updateRecruitmentRecord,
  toggleRecruitmentTask,
  listWorkspaceSummaries,
  listWorkCategories,
  listWorkEntryPage,
  listVisitorCards,
  moveOwnedIncompleteWorkEntry,
  recordActivity,
  returnAssetCustodyRecord,
  toggleOwnedWorkEntry,
  toggleAnnualScheduleItem,
  toggleTeamGeneralExpense,
  updateTeamGeneralExpense,
  updateOwnedMonthlyWorkEntry,
  updateOwnedWorkEntry,
  updateOwnedWorkEntryMemo,
  updateAsset,
  updateVisitorCard as updateVisitorCardRecord,
  insertRecruitmentRows,
  updateRecruitmentRow,
  updateManualEntry,
  toggleRecruitmentRow,
  listInterviewCoordinationRows,
  insertInterviewCoordinationRows,
  updateInterviewCoordinationRow,
  toggleInterviewCoordinationRow,
} from './db'
import { styles } from './styles'
import { homePage } from './views/home'
import { assetHistoryPage, assetOutboundPage, assetRegistrationPage, assetsPage } from './views/assets'
import { patentsPage } from './views/patents'
import { visitorCardsPage } from './views/visitor-cards'
import { manualPage } from './views/manual'
import { recruitmentPage } from './views/recruitment'
import { interviewCoordinationPage } from './views/interview-coordination'
import { workspacePage, type WorkspaceView } from './views/workspace'
import { excelResponse } from './excel'

export function stylesheet(c: Context<AppContext>): Response {
  return c.body(styles, 200, { 'content-type': 'text/css; charset=utf-8' })
}

export async function showAssets(c: Context<AppContext>): Promise<Response> {
  const query = (c.req.query('q') ?? '').trim().slice(0, 100)
  const typeValue = c.req.query('type') ?? ''
  const allowedTypes: AssetType[] = ['laptop', 'desktop', 'monitor', 'other']
  const activeType = allowedTypes.includes(typeValue as AssetType) ? typeValue as AssetType : null
  const requestedPage = Number.parseInt(c.req.query('page') ?? '1', 10)
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1
  const [result, dueReturns] = await Promise.all([
    listAssetPage(c.env.DB, query, activeType, page, 50),
    listAssetDueRecords(c.env.DB, addDays(currentSeoulDate(), 30)),
  ])
  const today = currentSeoulDate()
  return c.html(assetsPage({ result, query, activeType, dueReturns, today }))
}

export async function showAssetHistory(c: Context<AppContext>): Promise<Response> {
  const assetId = c.req.param('assetId') ?? ''
  if (assetId.length > 100) return c.text('자산을 찾을 수 없습니다.', 404)
  const asset = await findAssetById(c.env.DB, assetId)
  if (!asset) return c.text('자산을 찾을 수 없습니다.', 404)
  const history = await listAssetHistory(c.env.DB, asset.id)
  return c.html(assetHistoryPage({ asset, history, error: c.req.query('error') ?? null }))
}

export async function showAssetRegistration(c: Context<AppContext>): Promise<Response> {
  return c.html(assetRegistrationPage({
    error: c.req.query('error') ?? null,
  }))
}

export async function showAssetOutbound(c: Context<AppContext>): Promise<Response> {
  const [assets, openRecords, returnedRecords] = await Promise.all([
    listAssetChoices(c.env.DB),
    listAssetCustodyRecords(c.env.DB, false),
    listAssetCustodyRecords(c.env.DB, true),
  ])
  return c.html(assetOutboundPage({
    assets, openRecords, returnedRecords,
    today: currentSeoulDate(), error: c.req.query('error') ?? null,
  }))
}

export async function createAssetRegistration(c: Context<AppContext>): Promise<Response> {
  const input = parseAssetInput(await c.req.parseBody())
  if (!input) return c.redirect('/assets/register?error=invalid', 303)

  try {
    await createAsset(c.env.DB, {
      id: crypto.randomUUID(), ...input, now: Date.now(),
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed: assets.asset_code')) {
      return c.redirect('/assets/register?error=duplicate', 303)
    }
    throw error
  }
  return c.redirect('/assets', 303)
}

export async function updateAssetDetails(c: Context<AppContext>): Promise<Response> {
  const assetId = c.req.param('assetId') ?? ''
  if (!assetId || assetId.length > 100) return c.text('자산을 찾을 수 없습니다.', 404)
  if (!await findAssetById(c.env.DB, assetId)) return c.text('자산을 찾을 수 없습니다.', 404)
  const input = parseAssetInput(await c.req.parseBody())
  if (!input) return c.redirect(`/assets/${encodeURIComponent(assetId)}?error=invalid`, 303)
  try {
    if (!await updateAsset(c.env.DB, { id: assetId, ...input, now: Date.now() })) {
      return c.text('자산을 찾을 수 없습니다.', 404)
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed: assets.asset_code')) {
      return c.redirect(`/assets/${encodeURIComponent(assetId)}?error=duplicate`, 303)
    }
    throw error
  }
  return c.redirect(`/assets/${encodeURIComponent(assetId)}`, 303)
}

export async function createAssetOutbound(c: Context<AppContext>): Promise<Response> {
  const body = await c.req.parseBody()
  const assetId = readFormField(body, 'assetId')
  const recipientName = readFormField(body, 'recipientName').trim()
  const outboundDepartment = readFormField(body, 'outboundDepartment').trim()
  const actualUserName = readFormField(body, 'actualUserName').trim()
  const outboundDate = readFormField(body, 'outboundDate')
  const expectedReturnDate = readFormField(body, 'expectedReturnDate')
  const purpose = readFormField(body, 'purpose').trim()
  const hasProposalValue = readFormField(body, 'hasProposal')
  if (
    !assetId || assetId.length > 100 || !recipientName || recipientName.length > 200
    || !outboundDepartment || outboundDepartment.length > 200 || actualUserName.length > 200
    || !isValidIsoDate(outboundDate)
    || (expectedReturnDate !== '' && (!isValidIsoDate(expectedReturnDate) || expectedReturnDate < outboundDate))
    || purpose.length > 500 || (hasProposalValue !== '' && hasProposalValue !== '1')
  ) return c.redirect('/assets/outbound?error=invalid', 303)
  if (!await findAssetById(c.env.DB, assetId)) return c.redirect('/assets/outbound?error=asset', 303)

  try {
    await createAssetCustodyRecord(c.env.DB, {
      id: crypto.randomUUID(), assetId, recipientName, outboundDepartment,
      actualUserName: actualUserName || null, outboundDate,
      expectedReturnDate: optionalDate(expectedReturnDate), purpose: purpose || null,
      hasProposal: hasProposalValue === '1', now: Date.now(),
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('asset_custody_records.asset_id')) {
      return c.redirect('/assets/outbound?error=outbound', 303)
    }
    throw error
  }
  return c.redirect('/assets/outbound', 303)
}

export async function returnAssetOutbound(c: Context<AppContext>): Promise<Response> {
  const recordId = c.req.param('recordId') ?? ''
  const body = await c.req.parseBody()
  const returnedDate = readFormField(body, 'returnedDate')
  if (!isUuid(recordId)) return c.text('반출 기록을 찾을 수 없습니다.', 404)
  if (!isValidIsoDate(returnedDate)) return c.redirect('/assets/outbound?error=returnDate', 303)
  const record = await c.env.DB.prepare(
    'SELECT outbound_date, returned_date FROM asset_custody_records WHERE id = ? LIMIT 1',
  ).bind(recordId).first<{ outbound_date: string; returned_date: string | null }>()
  if (!record) return c.text('반출 기록을 찾을 수 없습니다.', 404)
  if (record.returned_date) return c.redirect('/assets/outbound?error=returned', 303)
  if (returnedDate < record.outbound_date) return c.redirect('/assets/outbound?error=returnDate', 303)
  if (!await returnAssetCustodyRecord(c.env.DB, recordId, returnedDate, Date.now())) {
    return c.redirect('/assets/outbound?error=returned', 303)
  }
  return c.redirect('/assets/outbound', 303)
}

export async function showPatents(c: Context<AppContext>): Promise<Response> {
  const query = (c.req.query('q') ?? '').trim().slice(0, 100)
  const rawYear = c.req.query('year') ?? '2026'
  const year = rawYear === 'all' ? null : Number.parseInt(rawYear, 10)
  const activeYear = year !== null && [2023, 2024, 2025, 2026, 2027].includes(year) ? year : rawYear === 'all' ? null : 2026
  return c.html(patentsPage({ result: await listPatentFees(c.env.DB, query, activeYear), query, year: activeYear }))
}

export async function updatePatentStatus(c: Context<AppContext>): Promise<Response> {
  const patentId = c.req.param('patentId') ?? ''
  const feeYearValue = c.req.param('feeYear') ?? ''
  const feeYear = Number.parseInt(feeYearValue, 10)
  const body = await c.req.parseBody()
  const status = readFormField(body, 'status') as PatentWorkflowStatus
  if (!isUuid(patentId) || !/^\d{4}$/.test(feeYearValue) || feeYear < 1900 || feeYear > 2200 || !patentWorkflowStatuses.includes(status)) {
    return c.text('특허 상태를 확인해 주세요.', 422)
  }
  if (!await updatePatentWorkflowStatus(c.env.DB, patentId, feeYear, status)) {
    return c.text('특허 납부 항목을 찾을 수 없습니다.', 404)
  }
  return c.redirect(`/patents?year=${feeYear}`, 303)
}

export async function toggleAnnualScheduleCompletion(c: Context<AppContext>): Promise<Response> {
  const itemId = c.req.param('itemId') ?? ''
  const body = await c.req.parseBody()
  const month = readFormField(body, 'month')
  if (!itemId || itemId.length > 200) return c.text('연간업무 항목을 찾을 수 없습니다.', 404)
  if (!await toggleAnnualScheduleItem(c.env.DB, itemId)) {
    return c.text('연간업무 항목을 찾을 수 없습니다.', 404)
  }
  const returnMonth = validMonth(month) ? month : currentSeoulMonth()
  return c.redirect(`/?month=${returnMonth}#monthly-work-${encodeURIComponent(itemId)}`, 303)
}

export async function showVisitorCards(c: Context<AppContext>): Promise<Response> {
  const query = (c.req.query('q') ?? '').trim().slice(0, 100)
  const rawStatus = c.req.query('status') ?? 'all'
  const status = rawStatus === 'out' || rawStatus === 'returned' ? rawStatus : 'all'
  return c.html(visitorCardsPage({
    result: await listVisitorCards(c.env.DB, query, status),
    query, status, today: currentSeoulDate(), error: c.req.query('error') ?? null,
  }))
}

export async function showManual(c: Context<AppContext>): Promise<Response> {
  const query = (c.req.query('q') ?? '').trim().slice(0, 100)
  const category = (c.req.query('category') ?? '').trim().slice(0, 100)
  const subcategory = (c.req.query('subcategory') ?? '').trim().slice(0, 100)
  return c.html(manualPage({ ...(await listManualEntries(c.env.DB, query, category, subcategory)), query, category, subcategory }))
}

const redactManualValue = (value: string): string => value
  .replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, '[이메일 주소 비공개]')
  .replace(/(?<!\d)(?:0\d{1,2})[- .]\d{3,4}[- .]\d{4}(?!\d)/g, '[전화번호 비공개]')
  .replace(/(비밀번호|password|패스워드|\bpw\b)\s*[:：]?\s*[^\s,;]+/gi, '$1 [민감정보 삭제]')
  .replace(/(아이디|login\s*id|user\s*id|\bid\b)\s*[:：]?\s*[^\s,;]+/gi, '$1 [계정정보 비공개]')

export async function updateManual(c: Context<AppContext>): Promise<Response> {
  const entryId = c.req.param('entryId') ?? ''
  const body = await c.req.parseBody()
  const pasted = readFormField(body, 'cells')
  const cells = pasted.split('\t').map((cell) => redactManualValue(cell.trim()))
  if (!isUuid(entryId) || pasted.length > 100_000 || cells.length > 60 || cells.some((cell) => cell.length > 2000)) {
    return c.redirect('/manual?error=invalid', 303)
  }
  const visibleCells = cells.filter((cell) => cell !== '')
  if (visibleCells.length === 0) return c.redirect('/manual?error=invalid', 303)
  const bodyText = visibleCells.join(' | ')
  if (!await updateManualEntry(c.env.DB, entryId, cells, bodyText, Date.now())) {
    return c.text('매뉴얼 행을 찾을 수 없습니다.', 404)
  }
  return c.redirect('/manual', 303)
}

const recruitmentAreas: RecruitmentRow['area'][] = ['onboarding', 'resume', 'interview', 'executive']

const parseRecruitmentArea = (value: string): RecruitmentRow['area'] => (
  recruitmentAreas.includes(value as RecruitmentRow['area']) ? value as RecruitmentRow['area'] : 'onboarding'
)

export async function showRecruitment(c: Context<AppContext>): Promise<Response> {
  const area = parseRecruitmentArea(c.req.query('area') ?? '') as RecruitmentRecordKind
  const query = (c.req.query('q') ?? '').trim().slice(0, 100)
  const [records, counts] = await Promise.all([
    listRecruitmentRecords(c.env.DB, area, query),
    listRecruitmentRecordCounts(c.env.DB),
  ])
  return c.html(recruitmentPage({ area, records, counts, query, error: c.req.query('error') ?? null }))
}

const recruitmentRecordKinds: RecruitmentRecordKind[] = ['onboarding', 'resume', 'interview', 'executive']
const recruitmentRecordStatuses: RecruitmentRecordStatus[] = ['pending', 'scheduled', 'sent', 'in_progress', 'completed', 'on_hold', 'cancelled']

const parseRecruitmentKind = (value: string): RecruitmentRecordKind => (
  recruitmentRecordKinds.includes(value as RecruitmentRecordKind) ? value as RecruitmentRecordKind : 'onboarding'
)

const recruitmentRecordInput = (body: Record<string, string | File>): RecruitmentRecordDraft | null => {
  const kind = parseRecruitmentKind(readFormField(body, 'kind'))
  const name = readFormField(body, 'name').trim()
  const jobTitle = readFormField(body, 'jobTitle').trim()
  const eventDateValue = readFormField(body, 'eventDate')
  const eventTime = readFormField(body, 'eventTime').trim()
  const interviewerAvailabilityDate = readFormField(body, 'interviewerAvailability').trim()
  const interviewerAvailabilityPeriod = readFormField(body, 'interviewerAvailabilityPeriod') === 'pm' ? '오후' : '오전'
  const interviewerAvailabilityTime = readFormField(body, 'interviewerAvailabilityTime').trim()
  const interviewerAvailability = interviewerAvailabilityDate
    ? `${interviewerAvailabilityDate} ${interviewerAvailabilityPeriod}${interviewerAvailabilityTime ? ` ${interviewerAvailabilityTime}` : ''}`
    : ''
  const statusValue = readFormField(body, 'status')
  const status = recruitmentRecordStatuses.includes(statusValue as RecruitmentRecordStatus) ? statusValue as RecruitmentRecordStatus : 'pending'
  const input: RecruitmentRecordDraft = {
    kind,
    name,
    department: readFormField(body, 'department').trim() || null,
    position: readFormField(body, 'position').trim() || null,
    experienceType: readFormField(body, 'experienceType').trim() || null,
    phone: readFormField(body, 'phone').trim() || null,
    email: readFormField(body, 'email').trim() || null,
    jobTitle: jobTitle || null,
    recipient: readFormField(body, 'recipient').trim() || null,
    eventDate: optionalDate(eventDateValue),
    eventTime: eventTime || null,
    interviewer: readFormField(body, 'interviewer').trim() || null,
    interviewerAvailability: interviewerAvailability || null,
    location: readFormField(body, 'location').trim() || null,
    status,
    result: readFormField(body, 'result').trim() || null,
    notes: readFormField(body, 'notes').trim() || null,
  }
  if ((kind !== 'resume' && name.length < 1) || (kind === 'resume' && jobTitle.length < 1)
    || name.length > 100 || jobTitle.length > 300
    || [input.department, input.position, input.experienceType, input.phone, input.email, input.recipient, input.interviewer, input.interviewerAvailability, input.location, input.result].some((field) => (field?.length ?? 0) > 2000)
    || (input.notes?.length ?? 0) > 2000
    || (input.email !== null && !/^\S+@\S+\.\S+$/.test(input.email))
    || (input.eventDate !== null && !isValidIsoDate(input.eventDate))
    || (input.eventTime !== null && !/^([01]\d|2[0-3]):[0-5]\d$/.test(input.eventTime))) return null
  return input
}

export async function createRecruitmentWorkspaceRecord(c: Context<AppContext>): Promise<Response> {
  const body = await c.req.parseBody()
  const input = recruitmentRecordInput(body)
  const kind = parseRecruitmentKind(readFormField(body, 'kind'))
  if (!input) return c.redirect(`/recruitment?area=${kind}&error=invalid`, 303)
  const now = Date.now()
  await createRecruitmentRecord(c.env.DB, { id: crypto.randomUUID(), ...input, createdAt: now, updatedAt: now })
  return c.redirect(`/recruitment?area=${input.kind}`, 303)
}

export async function updateRecruitmentWorkspaceRecord(c: Context<AppContext>): Promise<Response> {
  const recordId = c.req.param('recordId') ?? ''
  const body = await c.req.parseBody()
  const input = recruitmentRecordInput(body)
  const kind = parseRecruitmentKind(readFormField(body, 'kind'))
  if (!isUuid(recordId)) return c.text('채용 기록을 찾을 수 없습니다.', 404)
  if (!input) return c.redirect(`/recruitment?area=${kind}&error=invalid`, 303)
  if (!await updateRecruitmentRecord(c.env.DB, recordId, input, Date.now())) return c.text('채용 기록을 찾을 수 없습니다.', 404)
  return c.redirect(`/recruitment?area=${input.kind}`, 303)
}

export async function toggleRecruitmentWorkspaceTask(c: Context<AppContext>): Promise<Response> {
  const taskId = c.req.param('taskId') ?? ''
  const body = await c.req.parseBody()
  const area = parseRecruitmentKind(readFormField(body, 'area'))
  if (!isUuid(taskId)) return c.text('채용 체크항목을 찾을 수 없습니다.', 404)
  if (!await toggleRecruitmentTask(c.env.DB, taskId, Date.now())) return c.text('채용 체크항목을 찾을 수 없습니다.', 404)
  const query = readFormField(body, 'q')
  return c.redirect(`/recruitment?area=${area}${query ? `&q=${encodeURIComponent(query)}` : ''}`, 303)
}

export async function extractRecruitmentResume(c: Context<AppContext>): Promise<Response> {
  const contentType = c.req.header('content-type') ?? ''
  if (!contentType.toLowerCase().startsWith('multipart/form-data')) return c.json({ error: '이력서 파일을 올려 주세요.' }, 400)
  const bytes = new Uint8Array(await c.req.raw.arrayBuffer())
  if (bytes.byteLength === 0 || bytes.byteLength > 5 * 1024 * 1024) return c.json({ error: '파일은 5MB 이하로 올려 주세요.' }, 400)
  const source = new TextDecoder().decode(bytes)
  const email = source.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? ''
  const phone = source.match(/(?:01[016789]|02|0[3-9]\d)[^\d\r\n]?\d{3,4}[^\d\r\n]?\d{4}/)?.[0].replace(/[^\d-]/g, '') ?? ''
  return c.json({ phone, email })
}

const recruitmentStatusLabel = (status: RecruitmentRecordStatus): string => ({
  pending: '대기',
  scheduled: '예정',
  sent: '발송완료',
  in_progress: '진행중',
  completed: '완료',
  on_hold: '보류',
  cancelled: '취소',
}[status] ?? status)

const recruitmentTaskProgressLabel = (record: { tasks: Array<{ isCompleted: boolean }> }): string =>
  record.tasks.length ? `${record.tasks.filter((task) => task.isCompleted).length}/${record.tasks.length}` : '-'

export async function exportRecruitment(c: Context<AppContext>): Promise<Response> {
  const area = parseRecruitmentKind(c.req.query('area') ?? '')
  const query = (c.req.query('q') ?? '').trim().slice(0, 100)
  const records = await listRecruitmentRecords(c.env.DB, area, query)
  const columns = area === 'onboarding'
    ? ['이름', '소속', '직급·직무', '신입·경력', '연락처', '이메일', '입사일', '상태', '진행률', '메모']
    : area === 'resume'
      ? ['발송일', '공고명', '수신처·수신자', '상태', '메모']
      : ['면접일', '시간', '지원자', '소속·직무', '신입·경력', '연락처', '이메일', '면접관', '면접관 가능일', '장소', '상태', '결과', '메모']
  const rows = records.map((record) => area === 'onboarding'
    ? [record.name, record.department ?? '', record.position ?? '', record.experienceType ?? '', record.phone ?? '', record.email ?? '', record.eventDate ?? '', recruitmentStatusLabel(record.status), recruitmentTaskProgressLabel(record), record.notes ?? '']
    : area === 'resume'
      ? [record.eventDate ?? '', record.jobTitle ?? '', record.recipient ?? '', recruitmentStatusLabel(record.status), record.notes ?? '']
      : [record.eventDate ?? '', record.eventTime ?? '', record.name, [record.department, record.position].filter(Boolean).join(' · '), record.experienceType ?? '', record.phone ?? '', record.email ?? '', record.interviewer ?? '', record.interviewerAvailability ?? '', record.location ?? '', recruitmentStatusLabel(record.status), record.result ?? '', record.notes ?? ''])
  return excelResponse(`채용·입사-${area}-${currentSeoulDate()}.xlsx`, [{ name: '데이터', columns, rows }])
}

export async function importRecruitmentRows(c: Context<AppContext>): Promise<Response> {
  const body = await c.req.parseBody()
  const area = parseRecruitmentArea(readFormField(body, 'area'))
  const pasted = readFormField(body, 'paste')
  const lines = pasted.split(/\r?\n/).filter((line) => line.trim() !== '')
  if (pasted.length > 300_000 || lines.length === 0 || lines.length > 300 || lines.some((line) => {
    const cells = line.split('\t')
    return cells.length > 40 || cells.some((cell) => cell.length > 500)
  })) return c.redirect(`/recruitment?area=${area}&error=invalid`, 303)
  const now = Date.now()
  await insertRecruitmentRows(c.env.DB, lines.map((line, index) => ({
    id: crypto.randomUUID(), area, sourceSheet: '웹 붙여넣기', sourceRow: index + 1,
    rowKind: 'data', cells: line.split('\t').map((cell) => cell.trim()), status: 'pending',
  })), now)
  return c.redirect(`/recruitment?area=${area}`, 303)
}

export async function toggleRecruitment(c: Context<AppContext>): Promise<Response> {
  const rowId = c.req.param('rowId') ?? ''
  const body = await c.req.parseBody()
  const area = parseRecruitmentArea(readFormField(body, 'area'))
  if (!isUuid(rowId)) return c.text('채용·입사 행을 찾을 수 없습니다.', 404)
  if (!await toggleRecruitmentRow(c.env.DB, rowId)) return c.text('채용·입사 행을 찾을 수 없습니다.', 404)
  return c.redirect(`/recruitment?area=${area}`, 303)
}

const parseGridRow = (value: string, maxColumns: number): string[] | null => {
  if (value === '' || value.includes('\r') || value.includes('\n') || value.length > 20_000) return null
  const cells = value.split('\t')
  if (cells.length > maxColumns || cells.some((cell) => cell.length > 500)) return null
  return cells.map((cell) => cell.trim())
}

export async function updateRecruitment(c: Context<AppContext>): Promise<Response> {
  const rowId = c.req.param('rowId') ?? ''
  const body = await c.req.parseBody()
  const area = parseRecruitmentArea(readFormField(body, 'area'))
  const cells = parseGridRow(readFormField(body, 'cells'), 40)
  if (!isUuid(rowId) || !cells) return c.redirect(`/recruitment?area=${area}&error=invalid`, 303)
  if (!await updateRecruitmentRow(c.env.DB, rowId, cells, Date.now())) {
    return c.text('채용·입사 행을 찾을 수 없습니다.', 404)
  }
  return c.redirect(`/recruitment?area=${area}`, 303)
}

const coordinationViews: InterviewCoordinationRow['view'][] = ['departments', 'confirmed', 'blacklist']

const parseCoordinationView = (value: string): InterviewCoordinationRow['view'] => (
  coordinationViews.includes(value as InterviewCoordinationRow['view']) ? value as InterviewCoordinationRow['view'] : 'departments'
)

export async function showInterviewCoordination(c: Context<AppContext>): Promise<Response> {
  const query = (c.req.query('q') ?? '').trim()
  return c.redirect(`/recruitment?area=interview${query ? `&q=${encodeURIComponent(query)}` : ''}`, 303)
}

export async function importInterviewCoordinationRows(c: Context<AppContext>): Promise<Response> {
  const body = await c.req.parseBody()
  const view = parseCoordinationView(readFormField(body, 'view'))
  const pasted = readFormField(body, 'paste')
  const lines = pasted.split(/\r?\n/).filter((line) => line.trim() !== '')
  if (pasted.length > 300_000 || lines.length === 0 || lines.length > 300 || lines.some((line) => {
    const cells = line.split('\t')
    return cells.length > 60 || cells.some((cell) => cell.length > 500)
  })) return c.redirect(`/interview-coordination?view=${view}&error=invalid`, 303)
  await insertInterviewCoordinationRows(c.env.DB, lines.map((line, index) => ({
    id: crypto.randomUUID(), view, sourceSheet: '웹 붙여넣기', sourceRow: index + 1,
    rowKind: 'data', cells: line.split('\t').map((cell) => cell.trim()), status: 'pending',
  })), Date.now())
  return c.redirect(`/interview-coordination?view=${view}`, 303)
}

export async function toggleInterviewCoordination(c: Context<AppContext>): Promise<Response> {
  const rowId = c.req.param('rowId') ?? ''
  const body = await c.req.parseBody()
  const view = parseCoordinationView(readFormField(body, 'view'))
  if (!isUuid(rowId)) return c.text('면접일정 행을 찾을 수 없습니다.', 404)
  if (!await toggleInterviewCoordinationRow(c.env.DB, rowId)) return c.text('면접일정 행을 찾을 수 없습니다.', 404)
  return c.redirect(`/interview-coordination?view=${view}`, 303)
}

export async function updateInterviewCoordination(c: Context<AppContext>): Promise<Response> {
  const rowId = c.req.param('rowId') ?? ''
  const body = await c.req.parseBody()
  const view = parseCoordinationView(readFormField(body, 'view'))
  const cells = parseGridRow(readFormField(body, 'cells'), 60)
  if (!isUuid(rowId) || !cells) return c.redirect(`/interview-coordination?view=${view}&error=invalid`, 303)
  if (!await updateInterviewCoordinationRow(c.env.DB, rowId, cells, Date.now())) {
    return c.text('면접일정 행을 찾을 수 없습니다.', 404)
  }
  return c.redirect(`/interview-coordination?view=${view}`, 303)
}

export async function createVisitorCard(c: Context<AppContext>): Promise<Response> {
  const input = visitorCardInput(await c.req.parseBody())
  if (!input) return c.redirect('/visitor-cards?error=invalid', 303)
  await createVisitorCardRecord(c.env.DB, { id: crypto.randomUUID(), now: Date.now(), ...input })
  return c.redirect('/visitor-cards', 303)
}

export async function updateVisitorCard(c: Context<AppContext>): Promise<Response> {
  const recordId = c.req.param('recordId') ?? ''
  if (!isUuid(recordId)) return c.text('방문증 기록을 찾을 수 없습니다.', 404)
  const input = visitorCardInput(await c.req.parseBody())
  if (!input) return c.redirect('/visitor-cards?error=invalid', 303)
  if (!await updateVisitorCardRecord(c.env.DB, recordId, input)) {
    return c.text('방문증 기록을 찾을 수 없습니다.', 404)
  }
  return c.redirect('/visitor-cards', 303)
}

export async function showHome(c: Context<AppContext>): Promise<Response> {
  const week = getSeoulWeekRange()
  const requestedMonth = c.req.query('month') ?? currentSeoulMonth()
  const expenseMonth = validMonth(requestedMonth) ? requestedMonth : currentSeoulMonth()
  const monthlyPeriod = currentSeoulMonth()
  const expenseRange = monthRange(expenseMonth)
  const [summaries, expenseEntries, expenseSuggestions, annualSchedule] = await Promise.all([
    listWorkspaceSummaries(c.env.DB, week.start, week.end),
    listTeamGeneralExpenses(c.env.DB, expenseRange.start, expenseRange.end),
    listTeamGeneralExpenseSuggestions(c.env.DB),
    listAnnualScheduleItems(c.env.DB),
  ])
  return c.html(homePage({
    summaries, weekLabel: week.label, expenseEntries, expenseMonth, monthlyPeriod, expenseSuggestions, annualSchedule,
  }))
}

const currentSeoulMonth = (): string => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit',
  }).formatToParts(new Date())
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${values.year}-${values.month}`
}

const currentSeoulDate = (): string => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date())
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${values.year}-${values.month}-${values.day}`
}

const addDays = (dateValue: string, days: number): string => {
  const date = new Date(`${dateValue}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

const parseAssetInput = (body: Record<string, string | File>) => {
  const assetCode = readFormField(body, 'assetCode').trim()
  const assetName = readFormField(body, 'assetName').trim()
  const assetType = readFormField(body, 'assetType') as AssetType
  const currentUserName = readFormField(body, 'currentUserName').trim()
  const usageScope = readFormField(body, 'usageScope').trim()
  const usageStartDate = readFormField(body, 'usageStartDate')
  const usageEndDate = readFormField(body, 'usageEndDate')
  const historyNote = readFormField(body, 'historyNote').trim()
  const allowedTypes: AssetType[] = ['laptop', 'desktop', 'monitor', 'other']
  if (
    !assetCode || assetCode.length > 100 || !assetName || assetName.length > 200
    || !allowedTypes.includes(assetType)
    || currentUserName.length > 200 || usageScope.length > 200 || historyNote.length > 2000
    || (usageStartDate !== '' && !isValidIsoDate(usageStartDate))
    || (usageEndDate !== '' && !isValidIsoDate(usageEndDate))
    || (usageStartDate !== '' && usageEndDate !== '' && usageEndDate < usageStartDate)
  ) return null
  return {
    assetCode,
    assetType,
    assetName,
    currentUserName: currentUserName || null,
    usageScope: usageScope || null,
    usageStartDate: optionalDate(usageStartDate),
    usageEndDate: optionalDate(usageEndDate),
    historyNote: historyNote || null,
  }
}

const defaultCategories = ['인사', '채용', '총무', '기타']

const validMonth = (value: string): boolean => {
  if (!/^\d{4}-\d{2}$/.test(value)) return false
  const year = Number.parseInt(value.slice(0, 4), 10)
  const month = Number.parseInt(value.slice(5, 7), 10)
  return year >= 1900 && year <= 2200 && month >= 1 && month <= 12
}

const monthRange = (yearMonth: string): { start: string; end: string } => {
  const year = Number.parseInt(yearMonth.slice(0, 4), 10)
  const month = Number.parseInt(yearMonth.slice(5, 7), 10)
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate()
  return { start: `${yearMonth}-01`, end: `${yearMonth}-${String(lastDay).padStart(2, '0')}` }
}

export async function showWorkspace(c: Context<AppContext>): Promise<Response> {
  const session = c.get('session')
  const ownerId = c.req.param('ownerId') ?? ''
  const owner = await findUserById(c.env.DB, ownerId)
  if (!owner || !owner.isActive) return c.text('업무공간을 찾을 수 없습니다.', 404)

  const allowedCadences: WorkCadence[] = ['daily', 'monthly', 'undated']
  const requestedView = c.req.query('view') ?? 'daily'
  const activeCadence: WorkCadence | null = requestedView === 'all'
    ? null
    : allowedCadences.includes(requestedView as WorkCadence)
      ? (requestedView as WorkCadence)
      : 'daily'
  const requestedPage = Number.parseInt(c.req.query('page') ?? '1', 10)
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1
  const requestedMonthlyPeriod = c.req.query('month') ?? currentSeoulMonth()
  const monthlyPeriod = validMonth(requestedMonthlyPeriod) ? requestedMonthlyPeriod : currentSeoulMonth()
  const monthlyYear = Number.parseInt(monthlyPeriod.slice(0, 4), 10)
  const monthlyMonth = Number.parseInt(monthlyPeriod.slice(5, 7), 10)

  const expenseRange = monthRange(monthlyPeriod)
  const [entryPage, monthlyEntries, customCategories, annualSchedule, generalExpenses] = await Promise.all([
    listWorkEntryPage(c.env.DB, owner.id, activeCadence, page, 50),
    listMonthlyWorkEntries(c.env.DB, owner.id, monthlyYear, monthlyMonth),
    listWorkCategories(c.env.DB, owner.id),
    listAnnualScheduleItems(c.env.DB),
    listTeamGeneralExpenses(c.env.DB, expenseRange.start, expenseRange.end),
  ])

  return c.html(workspacePage({
    owner,
    entryPage,
    monthlyEntries,
    monthlyLabel: `${monthlyMonth}월`,
    monthlyPeriod,
    categories: [...defaultCategories, ...customCategories.filter((category) => !defaultCategories.includes(category))],
    annualSchedule,
    generalExpenses,
    today: currentSeoulDate(),
    activeView: activeCadence,
    editUnlockedUntil: session?.userId === owner.id ? session.editUnlockedUntil : null,
  }))
}
const readFormField = (body: Record<string, string | File>, name: string): string => {
  const value = body[name]
  return typeof value === 'string' ? value : ''
}

const isValidIsoDate = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

const isUuid = (value: string): boolean =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)

const validNewContent = (value: string): boolean => value.length >= 1 && value.length <= 500
const validExistingContent = (value: string): boolean => value.length >= 1 && value.length <= 2000
const validCategory = (value: string): boolean => value.length <= 100
const optionalDate = (value: string): string | null => value === '' ? null : value

const visitorAccessScopes = ['5', '10', '11'] as const
const patentWorkflowStatuses: PatentWorkflowStatus[] = ['draft_needed', 'drafting', 'drafted', 'paid']

const visitorCardInput = (body: Record<string, string | File>) => {
  const applicant = readFormField(body, 'applicant').trim()
  const hasApprovalValue = readFormField(body, 'hasApproval')
  const reason = readFormField(body, 'reason').trim()
  const cardUser = readFormField(body, 'cardUser').trim()
  const usageStartDate = optionalDate(readFormField(body, 'usageStartDate'))
  const usageEndDate = optionalDate(readFormField(body, 'usageEndDate'))
  const accessScope = visitorAccessScopes
    .filter((scope) => readFormField(body, `access${scope}`) === '1')
    .join(',') || null
  const visitorBadgeNumber = readFormField(body, 'visitorBadgeNumber').trim()
  const cardNumber = readFormField(body, 'cardNumber').trim()
  const checkoutDate = optionalDate(readFormField(body, 'checkoutDate'))
  const returnDate = optionalDate(readFormField(body, 'returnDate'))
  const legacyPeriod = readFormField(body, 'usagePeriodRaw').trim()
  if (
    !applicant || applicant.length > 200 || (hasApprovalValue !== 'O' && hasApprovalValue !== 'X')
    || reason.length > 1000 || cardUser.length > 200 || legacyPeriod.length > 200
    || visitorBadgeNumber.length > 100 || cardNumber.length > 100
    || (usageStartDate !== null && !isValidIsoDate(usageStartDate))
    || (usageEndDate !== null && !isValidIsoDate(usageEndDate))
    || (usageStartDate !== null && usageEndDate !== null && usageEndDate < usageStartDate)
    || (checkoutDate !== null && !isValidIsoDate(checkoutDate))
    || (returnDate !== null && !isValidIsoDate(returnDate))
    || (checkoutDate !== null && returnDate !== null && returnDate < checkoutDate)
  ) return null
  const usagePeriodRaw = usageStartDate || usageEndDate
    ? [usageStartDate, usageEndDate].filter(Boolean).join(' ~ ')
    : legacyPeriod || null
  return {
    applicant,
    hasApproval: hasApprovalValue === 'O',
    reason: reason || null,
    cardUser: cardUser || null,
    usagePeriodRaw,
    usageStartDate,
    usageEndDate,
    accessScope,
    visitorBadgeNumber: visitorBadgeNumber || null,
    cardNumber: cardNumber || null,
    checkoutDate,
    returnDate,
  }
}

export async function createWorkEntry(c: Context<AppContext>): Promise<Response> {
  const session = c.get('session')
  if (!session) return c.text('수정하려면 업무공간 비밀번호를 확인해 주세요.', 401)
  const ownerId = c.req.param('ownerId') ?? ''
  const body = await c.req.parseBody()
  const requestId = readFormField(body, 'requestId')
  const workDate = readFormField(body, 'workDate') || currentSeoulDate()
  const deadlineDate = optionalDate(readFormField(body, 'deadlineDate'))
  const categoryValue = readFormField(body, 'category').trim()
  const category = categoryValue === '' ? null : categoryValue
  const content = readFormField(body, 'content').trim()
  if (
    !isUuid(requestId)
    || !isValidIsoDate(workDate)
    || (deadlineDate !== null && !isValidIsoDate(deadlineDate))
    || !validCategory(categoryValue)
    || !validNewContent(content)
  ) return c.text('업무일, 마감일과 업무 내용을 확인해 주세요.', 422)

  const now = Date.now()
  const inserted = await insertWorkEntry(c.env.DB, {
    id: requestId,
    ownerUserId: ownerId,
    cadence: 'daily',
    workDate,
    periodYear: Number.parseInt(workDate.slice(0, 4), 10),
    periodMonth: Number.parseInt(workDate.slice(5, 7), 10),
    weekLabel: null,
    dayLabel: null,
    category,
    deadlineDate,
    content,
    isCompleted: false,
    needsReview: false,
    createdAt: now,
    updatedAt: now,
  })
  if (inserted) {
    await recordActivity(c.env.DB, {
      id: crypto.randomUUID(), actorUserId: session.userId, action: 'work.create',
      targetType: 'work_entry', targetId: requestId, succeeded: true, createdAt: now,
    })
  }
  return c.redirect(`/workspace/${encodeURIComponent(ownerId)}`)
}

export async function createMonthlyWorkEntry(c: Context<AppContext>): Promise<Response> {
  const session = c.get('session')
  if (!session) return c.text('수정하려면 업무공간 비밀번호를 확인해 주세요.', 401)
  const ownerId = c.req.param('ownerId') ?? ''
  const body = await c.req.parseBody()
  const requestId = readFormField(body, 'requestId')
  const period = readFormField(body, 'period')
  const categoryValue = readFormField(body, 'category').trim()
  const content = readFormField(body, 'content').trim()
  if (!isUuid(requestId) || !validMonth(period) || !validCategory(categoryValue) || !validNewContent(content)) {
    return c.text('월, 분류와 업무 내용을 확인해 주세요.', 422)
  }
  const now = Date.now()
  const inserted = await insertWorkEntry(c.env.DB, {
    id: requestId,
    ownerUserId: ownerId,
    cadence: 'monthly',
    workDate: null,
    periodYear: Number.parseInt(period.slice(0, 4), 10),
    periodMonth: Number.parseInt(period.slice(5, 7), 10),
    weekLabel: null,
    dayLabel: null,
    category: categoryValue || null,
    deadlineDate: null,
    content,
    memo: null,
    isCompleted: false,
    needsReview: false,
    createdAt: now,
    updatedAt: now,
  })
  if (inserted) await recordActivity(c.env.DB, {
    id: crypto.randomUUID(), actorUserId: session.userId, action: 'work.create.monthly',
    targetType: 'work_entry', targetId: requestId, succeeded: true, createdAt: now,
  })
  return c.redirect(`/workspace/${encodeURIComponent(ownerId)}?month=${period}`)
}

export async function updateMonthlyWorkEntry(c: Context<AppContext>): Promise<Response> {
  const session = c.get('session')
  if (!session) return c.text('수정하려면 업무공간 비밀번호를 확인해 주세요.', 401)
  const ownerId = c.req.param('ownerId') ?? ''
  const entryId = c.req.param('entryId') ?? ''
  const body = await c.req.parseBody()
  const period = readFormField(body, 'period')
  const categoryValue = readFormField(body, 'category').trim()
  const content = readFormField(body, 'content').trim()
  if (!isUuid(entryId) || !validMonth(period) || !validCategory(categoryValue) || !validExistingContent(content)) {
    return c.text('월, 분류와 업무 내용을 확인해 주세요.', 422)
  }

  const updatedAt = Date.now()
  const updated = await updateOwnedMonthlyWorkEntry(
    c.env.DB,
    entryId,
    ownerId,
    Number.parseInt(period.slice(0, 4), 10),
    Number.parseInt(period.slice(5, 7), 10),
    categoryValue || null,
    content,
    updatedAt,
  )
  if (!updated) return c.text('월간업무를 찾을 수 없습니다.', 404)
  await recordActivity(c.env.DB, {
    id: crypto.randomUUID(), actorUserId: session.userId, action: 'work.update.monthly',
    targetType: 'work_entry', targetId: entryId, succeeded: true, createdAt: updatedAt,
  })
  return c.redirect(`/workspace/${encodeURIComponent(ownerId)}?month=${period}`)
}

export async function deleteMonthlyWorkEntry(c: Context<AppContext>): Promise<Response> {
  const session = c.get('session')
  if (!session) return c.text('수정하려면 업무공간 비밀번호를 확인해 주세요.', 401)
  const ownerId = c.req.param('ownerId') ?? ''
  const entryId = c.req.param('entryId') ?? ''
  const body = await c.req.parseBody()
  const period = readFormField(body, 'period')
  if (!isUuid(entryId) || !validMonth(period)) return c.text('월간업무를 찾을 수 없습니다.', 404)

  const deleted = await deleteOwnedMonthlyWorkEntry(
    c.env.DB,
    entryId,
    ownerId,
    Number.parseInt(period.slice(0, 4), 10),
    Number.parseInt(period.slice(5, 7), 10),
  )
  if (!deleted) return c.text('월간업무를 찾을 수 없습니다.', 404)
  await recordActivity(c.env.DB, {
    id: crypto.randomUUID(), actorUserId: session.userId, action: 'work.delete.monthly',
    targetType: 'work_entry', targetId: entryId, succeeded: true, createdAt: Date.now(),
  })
  return c.redirect(`/workspace/${encodeURIComponent(ownerId)}?month=${period}`)
}

export async function addWorkspaceCategoryEntry(c: Context<AppContext>): Promise<Response> {
  const session = c.get('session')
  if (!session) return c.text('수정하려면 업무공간 비밀번호를 확인해 주세요.', 401)
  const ownerId = c.req.param('ownerId') ?? ''
  const body = await c.req.parseBody()
  const name = readFormField(body, 'name').trim()
  if (!validCategory(name) || name.length === 0) return c.text('분류명을 확인해 주세요.', 422)
  const now = Date.now()
  await addWorkspaceCategory(c.env.DB, ownerId, name, now)
  await recordActivity(c.env.DB, {
    id: crypto.randomUUID(), actorUserId: session.userId, action: 'workspace.category.add',
    targetType: 'workspace_category', targetId: ownerId, succeeded: true, createdAt: now,
  })
  return c.redirect(`/workspace/${encodeURIComponent(ownerId)}`)
}

export async function updateWorkEntry(c: Context<AppContext>): Promise<Response> {
  const session = c.get('session')
  if (!session) return c.text('수정하려면 업무공간 비밀번호를 확인해 주세요.', 401)
  const ownerId = c.req.param('ownerId') ?? ''
  const entryId = c.req.param('entryId') ?? ''
  const body = await c.req.parseBody()
  const workDate = readFormField(body, 'workDate')
  const deadlineDate = optionalDate(readFormField(body, 'deadlineDate'))
  const categoryValue = readFormField(body, 'category').trim()
  const category = categoryValue === '' ? null : categoryValue
  const content = readFormField(body, 'content').trim()
  if (
    !isUuid(entryId)
    || !isValidIsoDate(workDate)
    || (deadlineDate !== null && !isValidIsoDate(deadlineDate))
    || !validCategory(categoryValue)
    || !validExistingContent(content)
  ) return c.text('업무일, 마감일과 업무 내용을 확인해 주세요.', 422)

  const updatedAt = Date.now()
  const updated = await updateOwnedWorkEntry(
    c.env.DB, entryId, ownerId, workDate, deadlineDate, category, content, updatedAt,
  )
  if (!updated) return c.text('업무를 찾을 수 없습니다.', 404)
  await recordActivity(c.env.DB, {
    id: crypto.randomUUID(), actorUserId: session.userId, action: 'work.update',
    targetType: 'work_entry', targetId: entryId, succeeded: true, createdAt: updatedAt,
  })
  return c.redirect(`/workspace/${encodeURIComponent(ownerId)}`)
}

export async function deleteWorkEntry(c: Context<AppContext>): Promise<Response> {
  const session = c.get('session')
  if (!session) return c.text('수정하려면 업무공간 비밀번호를 확인해 주세요.', 401)
  const ownerId = c.req.param('ownerId') ?? ''
  const entryId = c.req.param('entryId') ?? ''
  const body = await c.req.parseBody()
  const month = readFormField(body, 'month')
  if (!isUuid(entryId) || !validMonth(month)) return c.text('일일업무를 찾을 수 없습니다.', 404)
  const deleted = await deleteOwnedWorkEntry(c.env.DB, entryId, ownerId)
  if (!deleted) return c.text('업무를 찾을 수 없습니다.', 404)
  await recordActivity(c.env.DB, {
    id: crypto.randomUUID(), actorUserId: session.userId, action: 'work.delete',
    targetType: 'work_entry', targetId: entryId, succeeded: true, createdAt: Date.now(),
  })
  const requestedView = readFormField(body, 'view')
  const view = ['daily', 'weekly', 'monthly', 'yearly', 'undated', 'all'].includes(requestedView) ? requestedView : 'daily'
  const requestedPage = Number.parseInt(readFormField(body, 'page'), 10)
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1
  return c.redirect(`/workspace/${encodeURIComponent(ownerId)}?view=${view}&page=${page}&month=${month}`)
}

export async function updateWorkEntryMemo(c: Context<AppContext>): Promise<Response> {
  const session = c.get('session')
  if (!session) return c.text('수정하려면 업무공간 비밀번호를 확인해 주세요.', 401)
  const ownerId = c.req.param('ownerId') ?? ''
  const entryId = c.req.param('entryId') ?? ''
  const body = await c.req.parseBody()
  const memoValue = readFormField(body, 'memo').trim()
  if (!isUuid(entryId) || memoValue.length > 2000) return c.text('메모 내용을 확인해 주세요.', 422)
  const updatedAt = Date.now()
  const updated = await updateOwnedWorkEntryMemo(c.env.DB, entryId, ownerId, memoValue || null, updatedAt)
  if (!updated) return c.text('업무를 찾을 수 없습니다.', 404)
  await recordActivity(c.env.DB, {
    id: crypto.randomUUID(), actorUserId: session.userId, action: 'work.memo',
    targetType: 'work_entry', targetId: entryId, succeeded: true, createdAt: updatedAt,
  })
  return c.redirect(`/workspace/${encodeURIComponent(ownerId)}`)
}

export async function toggleWorkEntry(c: Context<AppContext>): Promise<Response> {
  const session = c.get('session')
  if (!session) return c.text('수정하려면 업무공간 비밀번호를 확인해 주세요.', 401)
  const ownerId = c.req.param('ownerId') ?? ''
  const entryId = c.req.param('entryId') ?? ''
  const body = await c.req.parseBody()
  if (!isUuid(entryId)) return c.text('업무를 찾을 수 없습니다.', 404)
  const updatedAt = Date.now()
  const updated = await toggleOwnedWorkEntry(c.env.DB, entryId, ownerId, updatedAt)
  if (!updated) return c.text('업무를 찾을 수 없습니다.', 404)
  await recordActivity(c.env.DB, {
    id: crypto.randomUUID(), actorUserId: session.userId, action: 'work.toggle',
    targetType: 'work_entry', targetId: entryId, succeeded: true, createdAt: updatedAt,
  })
  const month = readFormField(body, 'month')
  const requestedView = readFormField(body, 'view')
  const requestedPage = Number.parseInt(readFormField(body, 'page'), 10)
  const view = ['daily', 'weekly', 'monthly', 'yearly', 'undated', 'all'].includes(requestedView) ? requestedView : 'daily'
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1
  const returnMonth = validMonth(month) ? month : currentSeoulMonth()
  return c.redirect(`/workspace/${encodeURIComponent(ownerId)}?view=${view}&page=${page}&month=${returnMonth}#work-entry-${encodeURIComponent(entryId)}`)
}

export async function moveWorkEntry(c: Context<AppContext>): Promise<Response> {
  const session = c.get('session')
  if (!session) return c.text('수정하려면 업무공간 비밀번호를 확인해 주세요.', 401)
  const ownerId = c.req.param('ownerId') ?? ''
  const entryId = c.req.param('entryId') ?? ''
  const body = await c.req.parseBody()
  const target = readFormField(body, 'target')
  const period = readFormField(body, 'period') || currentSeoulMonth()
  if (!isUuid(entryId) || (target !== 'monthly' && target !== 'undated') || (target === 'monthly' && !validMonth(period))) {
    return c.text('이동할 위치를 확인해 주세요.', 422)
  }
  const updatedAt = Date.now()
  const moved = await moveOwnedIncompleteWorkEntry(
    c.env.DB, entryId, ownerId, target,
    Number.parseInt(period.slice(0, 4), 10), Number.parseInt(period.slice(5, 7), 10), updatedAt,
  )
  if (!moved) return c.text('업무를 찾을 수 없습니다.', 404)
  await recordActivity(c.env.DB, {
    id: crypto.randomUUID(), actorUserId: session.userId, action: `work.move.${target}`,
    targetType: 'work_entry', targetId: entryId, succeeded: true, createdAt: updatedAt,
  })
  return c.redirect(`/workspace/${encodeURIComponent(ownerId)}${target === 'monthly' ? `?month=${period}` : '?view=undated'}`)
}
const expenseRedirect = (month: string): string =>
  `/?month=${validMonth(month) ? month : currentSeoulMonth()}#general-expenses`

export async function createTeamGeneralExpense(c: Context<AppContext>): Promise<Response> {
  const session = c.get('session')
  const body = await c.req.parseBody()
  const requestId = readFormField(body, 'requestId')
  const transferDate = readFormField(body, 'transferDate')
  const content = readFormField(body, 'content').trim()
  const assignedValue = readFormField(body, 'assignedUserId')
  const assignedUserId = assignedValue === '' ? null : assignedValue
  if (!isUuid(requestId) || !isValidIsoDate(transferDate) || !validNewContent(content)) {
    return c.text('자금이체일과 총무비용 항목을 확인해 주세요.', 422)
  }
  if (assignedUserId !== null) {
    const user = await findUserById(c.env.DB, assignedUserId)
    if (!user || !user.isActive) return c.text('담당자를 확인해 주세요.', 422)
  }
  const now = Date.now()
  const inserted = await insertTeamGeneralExpense(c.env.DB, {
    id: requestId,
    transferDate,
    deadlineDate: null,
    content,
    assignedUserId,
    assignedDisplayName: null,
    isCompleted: false,
    createdAt: now,
    updatedAt: now,
  })
  if (inserted) await recordActivity(c.env.DB, {
    id: crypto.randomUUID(), actorUserId: session?.userId ?? null, action: 'expense.create',
    targetType: 'general_expense', targetId: requestId, succeeded: true, createdAt: now,
  })
  return c.redirect(expenseRedirect(transferDate.slice(0, 7)))
}

export async function toggleTeamGeneralExpenseEntry(c: Context<AppContext>): Promise<Response> {
  const session = c.get('session')
  const entryId = c.req.param('entryId') ?? ''
  const body = await c.req.parseBody()
  if (!isUuid(entryId)) return c.text('총무비용 항목을 찾을 수 없습니다.', 404)
  const now = Date.now()
  const updated = await toggleTeamGeneralExpense(c.env.DB, entryId, now)
  if (!updated) return c.text('총무비용 항목을 찾을 수 없습니다.', 404)
  await recordActivity(c.env.DB, {
    id: crypto.randomUUID(), actorUserId: session?.userId ?? null, action: 'expense.toggle',
    targetType: 'general_expense', targetId: entryId, succeeded: true, createdAt: now,
  })
  return c.redirect(expenseRedirect(readFormField(body, 'month')))
}

export async function updateTeamGeneralExpenseEntry(c: Context<AppContext>): Promise<Response> {
  const session = c.get('session')
  const entryId = c.req.param('entryId') ?? ''
  const body = await c.req.parseBody()
  const transferDate = readFormField(body, 'transferDate')
  const content = readFormField(body, 'content').trim()
  const fallbackMonth = readFormField(body, 'month')
  if (!isUuid(entryId)) return c.text('총무비용 항목을 찾을 수 없습니다.', 404)
  if (!isValidIsoDate(transferDate) || content.length < 1 || content.length > 500) {
    return c.redirect(expenseRedirect(validMonth(fallbackMonth) ? fallbackMonth : currentSeoulMonth()), 303)
  }
  const now = Date.now()
  const updated = await updateTeamGeneralExpense(c.env.DB, entryId, transferDate, content, now)
  if (!updated) return c.text('총무비용 항목을 찾을 수 없습니다.', 404)
  await recordActivity(c.env.DB, {
    id: crypto.randomUUID(), actorUserId: session?.userId ?? null, action: 'expense.update',
    targetType: 'general_expense', targetId: entryId, succeeded: true, createdAt: now,
  })
  return c.redirect(expenseRedirect(transferDate.slice(0, 7)), 303)
}

export async function assignTeamGeneralExpenseEntry(c: Context<AppContext>): Promise<Response> {
  const session = c.get('session')
  const entryId = c.req.param('entryId') ?? ''
  const body = await c.req.parseBody()
  const assignedValue = readFormField(body, 'assignedUserId')
  const assignedUserId = assignedValue === '' ? null : assignedValue
  if (!isUuid(entryId)) return c.text('총무비용 항목을 찾을 수 없습니다.', 404)
  if (assignedUserId !== null) {
    const user = await findUserById(c.env.DB, assignedUserId)
    if (!user || !user.isActive) return c.text('담당자를 확인해 주세요.', 422)
  }
  const now = Date.now()
  const updated = await assignTeamGeneralExpense(c.env.DB, entryId, assignedUserId, now)
  if (!updated) return c.text('총무비용 항목을 찾을 수 없습니다.', 404)
  await recordActivity(c.env.DB, {
    id: crypto.randomUUID(), actorUserId: session?.userId ?? null, action: 'expense.assign',
    targetType: 'general_expense', targetId: entryId, succeeded: true, createdAt: now,
  })
  return c.redirect(expenseRedirect(readFormField(body, 'month')))
}

