import type {
  AnnualScheduleItem,
  AssetChoice,
  AssetCustodyRecord,
  AssetDueRecord,
  Asset,
  AssetHistoryRecord,
  AssetPage,
  AssetType,
  GeneralExpenseEntry,
  InterviewCoordinationRow,
  ManualEntry,
  PatentFeeRecord,
  PatentPage,
  PatentPaymentStatus,
  PatentWorkflowStatus,
  Session,
  SessionContext,
  User,
  WorkCadence,
  WorkEntry,
  WorkEntryPage,
  WorkspaceSummary,
  RecruitmentRecord,
  RecruitmentRecordDraft,
  RecruitmentRecordKind,
  RecruitmentRecordStatus,
  RecruitmentTask,
  RecruitmentRow,
  VisitorCardPage,
  VisitorCardInput,
  VisitorCardRecord,
} from './types'

type AssetRow = {
  id: string
  asset_code: string
  asset_type: AssetType
  asset_name: string | null
  current_user_name: string | null
  usage_scope: string | null
  usage_start_date: string | null
  usage_start_raw: string | null
  usage_end_date: string | null
  usage_end_raw: string | null
  history_note: string | null
}

const toAsset = (row: AssetRow): Asset => ({
  id: row.id,
  assetCode: row.asset_code,
  assetType: row.asset_type,
  assetName: row.asset_name,
  currentUserName: row.current_user_name,
  usageScope: row.usage_scope,
  usageStartDate: row.usage_start_date,
  usageStartRaw: row.usage_start_raw,
  usageEndDate: row.usage_end_date,
  usageEndRaw: row.usage_end_raw,
  historyNote: row.history_note,
})

const emptyAssetCounts = (): Record<AssetType, number> => ({
  laptop: 0,
  desktop: 0,
  monitor: 0,
  other: 0,
})

export async function listAssetPage(
  db: D1Database,
  query: string,
  assetType: AssetType | null,
  page: number,
  pageSize: number,
): Promise<AssetPage> {
  const filters: string[] = []
  const bindings: string[] = []
  if (assetType !== null) {
    filters.push('asset_type = ?')
    bindings.push(assetType)
  }
  if (query !== '') {
    filters.push("(asset_code LIKE ? ESCAPE '\\' OR asset_name LIKE ? ESCAPE '\\' OR current_user_name LIKE ? ESCAPE '\\')")
    const like = `%${query.replaceAll('\\', '\\\\').replaceAll('%', '\\%').replaceAll('_', '\\_')}%`
    bindings.push(like, like, like)
  }
  const where = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : ''
  const count = await db
    .prepare(`SELECT COUNT(*) AS count FROM assets ${where}`)
    .bind(...bindings)
    .first<{ count: number }>()
  const total = count?.count ?? 0
  const maxPage = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(Math.max(1, page), maxPage)
  const offset = (safePage - 1) * pageSize
  const rows = await db
    .prepare(
      `SELECT id, asset_code, asset_type, asset_name, current_user_name, usage_scope,
        usage_start_date, usage_start_raw, usage_end_date, usage_end_raw, history_note
      FROM assets ${where}
      ORDER BY asset_type, asset_code
      LIMIT ? OFFSET ?`,
    )
    .bind(...bindings, pageSize, offset)
    .all<AssetRow>()
  const countRows = await db
    .prepare('SELECT asset_type, COUNT(*) AS count FROM assets GROUP BY asset_type')
    .all<{ asset_type: AssetType; count: number }>()
  const counts = emptyAssetCounts()
  for (const row of countRows.results) counts[row.asset_type] = row.count
  return { assets: rows.results.map(toAsset), total, page: safePage, pageSize, counts }
}

export async function findAssetById(db: D1Database, id: string): Promise<Asset | null> {
  const row = await db.prepare(
    `SELECT id, asset_code, asset_type, asset_name, current_user_name, usage_scope,
      usage_start_date, usage_start_raw, usage_end_date, usage_end_raw, history_note
    FROM assets WHERE id = ? LIMIT 1`,
  ).bind(id).first<AssetRow>()
  return row ? toAsset(row) : null
}

export async function listAssetHistory(db: D1Database, assetId: string): Promise<AssetHistoryRecord[]> {
  const rows = await db.prepare(
    `SELECT id, recorded_at_raw, respondent_name, department, equipment_label, model_name, manufacture_date_raw
    FROM asset_history WHERE asset_id = ? ORDER BY source_row DESC, source_column ASC`,
  ).bind(assetId).all<{
    id: string
    recorded_at_raw: string | null
    respondent_name: string | null
    department: string | null
    equipment_label: string
    model_name: string | null
    manufacture_date_raw: string | null
  }>()
  return rows.results.map((row) => ({
    id: row.id,
    recordedAtRaw: row.recorded_at_raw,
    respondentName: row.respondent_name,
    department: row.department,
    equipmentLabel: row.equipment_label,
    modelName: row.model_name,
    manufactureDateRaw: row.manufacture_date_raw,
  }))
}

export async function listAssetChoices(db: D1Database): Promise<AssetChoice[]> {
  const rows = await db.prepare('SELECT id, asset_code, asset_name FROM assets ORDER BY asset_code').all<{
    id: string
    asset_code: string
    asset_name: string | null
  }>()
  return rows.results.map((row) => ({ id: row.id, assetCode: row.asset_code, assetName: row.asset_name }))
}

export async function listAssetDueRecords(
  db: D1Database,
  untilDate: string,
  limit = 100,
): Promise<AssetDueRecord[]> {
  const rows = await db.prepare(
    `SELECT id, asset_code, asset_name, current_user_name, usage_scope, usage_end_date
     FROM assets
     WHERE usage_end_date IS NOT NULL AND usage_end_date <= ?
     ORDER BY usage_end_date ASC, asset_code ASC
     LIMIT ?`,
  ).bind(untilDate, limit).all<{
    id: string
    asset_code: string
    asset_name: string | null
    current_user_name: string | null
    usage_scope: string | null
    usage_end_date: string
  }>()
  return rows.results.map((row) => ({
    id: row.id,
    assetCode: row.asset_code,
    assetName: row.asset_name,
    currentUserName: row.current_user_name,
    usageScope: row.usage_scope,
    usageEndDate: row.usage_end_date,
  }))
}

export async function createAsset(db: D1Database, input: {
  id: string
  assetCode: string
  assetType: AssetType
  assetName: string
  currentUserName: string | null
  usageScope: string | null
  usageStartDate: string | null
  usageEndDate: string | null
  historyNote: string | null
  now: number
}): Promise<void> {
  await db.prepare(
    `INSERT INTO assets (id, asset_code, asset_type, asset_name, current_user_name, usage_scope,
      usage_start_date, usage_end_date, history_note, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(input.id, input.assetCode, input.assetType, input.assetName, input.currentUserName,
    input.usageScope, input.usageStartDate, input.usageEndDate, input.historyNote, input.now, input.now).run()
}

export async function updateAsset(db: D1Database, input: {
  id: string
  assetCode: string
  assetType: AssetType
  assetName: string
  currentUserName: string | null
  usageScope: string | null
  usageStartDate: string | null
  usageEndDate: string | null
  historyNote: string | null
  now: number
}): Promise<boolean> {
  const result = await db.prepare(
    `UPDATE assets SET asset_code = ?, asset_type = ?, asset_name = ?, current_user_name = ?,
      usage_scope = ?, usage_start_date = ?, usage_end_date = ?, history_note = ?, updated_at = ?
    WHERE id = ?`,
  ).bind(input.assetCode, input.assetType, input.assetName, input.currentUserName,
    input.usageScope, input.usageStartDate, input.usageEndDate, input.historyNote, input.now, input.id).run()
  return result.meta.changes === 1
}

export async function listAssetCustodyRecords(
  db: D1Database,
  returned: boolean,
): Promise<AssetCustodyRecord[]> {
  const rows = await db.prepare(
    `SELECT r.id, r.asset_id, a.asset_code, a.asset_name, r.recipient_name,
      r.outbound_department, r.actual_user_name, r.outbound_date, r.expected_return_date,
      r.returned_date, r.purpose, r.has_proposal
    FROM asset_custody_records r JOIN assets a ON a.id = r.asset_id
    WHERE ${returned ? 'r.returned_date IS NOT NULL' : 'r.returned_date IS NULL'}
    ORDER BY r.outbound_date DESC, r.created_at DESC`,
  ).all<{
    id: string
    asset_id: string
    asset_code: string
    asset_name: string | null
    recipient_name: string
    outbound_department: string
    actual_user_name: string | null
    outbound_date: string
    expected_return_date: string | null
    returned_date: string | null
    purpose: string | null
    has_proposal: number
  }>()
  return rows.results.map((row) => ({
    id: row.id, assetId: row.asset_id, assetCode: row.asset_code, assetName: row.asset_name,
    recipientName: row.recipient_name, outboundDepartment: row.outbound_department,
    actualUserName: row.actual_user_name, outboundDate: row.outbound_date,
    expectedReturnDate: row.expected_return_date, returnedDate: row.returned_date,
    purpose: row.purpose, hasProposal: row.has_proposal === 1,
  }))
}

export async function createAssetCustodyRecord(db: D1Database, input: {
  id: string
  assetId: string
  recipientName: string
  outboundDepartment: string
  actualUserName: string | null
  outboundDate: string
  expectedReturnDate: string | null
  purpose: string | null
  hasProposal: boolean
  now: number
}): Promise<void> {
  await db.prepare(
    `INSERT INTO asset_custody_records
      (id, asset_id, recipient_name, outbound_department, actual_user_name, outbound_date,
       expected_return_date, purpose, has_proposal, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(input.id, input.assetId, input.recipientName, input.outboundDepartment,
    input.actualUserName, input.outboundDate, input.expectedReturnDate, input.purpose,
    input.hasProposal ? 1 : 0, input.now, input.now).run()
}

export async function returnAssetCustodyRecord(
  db: D1Database,
  id: string,
  returnedDate: string,
  now: number,
): Promise<boolean> {
  const result = await db.prepare(
    `UPDATE asset_custody_records SET returned_date = ?, updated_at = ?
    WHERE id = ? AND returned_date IS NULL`,
  ).bind(returnedDate, now, id).run()
  return result.meta.changes === 1
}

type PatentFeeRow = {
  patent_id: string
  source_group: string
  title: string
  registration_number: string
  fee_year: number
  deadline_raw: string | null
  installment: string | null
  amount: number | null
  payment_status: PatentPaymentStatus
  workflow_status: PatentWorkflowStatus
  note: string | null
}

export async function listPatentFees(db: D1Database, query: string, year: number | null): Promise<PatentPage> {
  const filters: string[] = []
  const bindings: (string | number)[] = []
  if (query !== '') {
    const like = `%${query.replaceAll('\\', '\\\\').replaceAll('%', '\\%').replaceAll('_', '\\_')}%`
    filters.push("(p.title LIKE ? ESCAPE '\\' OR p.registration_number LIKE ? ESCAPE '\\')")
    bindings.push(like, like)
  }
  if (year !== null) {
    filters.push('f.fee_year = ?')
    bindings.push(year)
  }
  const where = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : ''
  const rows = await db.prepare(
    `SELECT p.id AS patent_id, p.source_group, p.title, p.registration_number,
      f.fee_year, f.deadline_raw, f.installment, f.amount, f.payment_status, f.workflow_status, f.note
    FROM patents p JOIN patent_annual_fees f ON f.patent_id = p.id
    ${where}
    ORDER BY f.fee_year DESC, f.deadline_raw, p.title`,
  ).bind(...bindings).all<PatentFeeRow>()
  const records: PatentFeeRecord[] = rows.results.map((row) => ({
    patentId: row.patent_id,
    sourceGroup: row.source_group,
    title: row.title,
    registrationNumber: row.registration_number,
    feeYear: row.fee_year,
    deadlineRaw: row.deadline_raw,
    installment: row.installment,
    amount: row.amount,
    paymentStatus: row.payment_status,
    workflowStatus: row.workflow_status,
    note: row.note,
  }))
  const patentIds = new Set(records.map((record) => record.patentId))
  return {
    records,
    totalPatents: patentIds.size,
    totalAmount: records.reduce((total, record) => total + (record.amount ?? 0), 0),
    pendingCount: records.filter((record) => record.workflowStatus !== 'paid').length,
  }
}

export async function updatePatentWorkflowStatus(
  db: D1Database,
  patentId: string,
  feeYear: number,
  status: PatentWorkflowStatus,
): Promise<boolean> {
  const result = await db.prepare(
    'UPDATE patent_annual_fees SET workflow_status = ? WHERE patent_id = ? AND fee_year = ?',
  ).bind(status, patentId, feeYear).run()
  return result.meta.changes === 1
}

type VisitorCardRow = {
  id: string
  applicant: string | null
  has_approval: number
  reason: string | null
  card_user: string | null
  usage_period_raw: string | null
  usage_start_date: string | null
  usage_end_date: string | null
  access_scope: string | null
  visitor_badge_number: string | null
  card_number: string | null
  checkout_date: string | null
  return_date: string | null
  return_date_raw: string | null
}

export async function listVisitorCards(
  db: D1Database,
  query: string,
  status: 'all' | 'out' | 'returned',
): Promise<VisitorCardPage> {
  const filters: string[] = []
  const bindings: string[] = []
  if (query !== '') {
    const like = `%${query.replaceAll('\\', '\\\\').replaceAll('%', '\\%').replaceAll('_', '\\_')}%`
    filters.push("(applicant LIKE ? ESCAPE '\\' OR card_user LIKE ? ESCAPE '\\' OR reason LIKE ? ESCAPE '\\' OR card_number LIKE ? ESCAPE '\\' OR visitor_badge_number LIKE ? ESCAPE '\\')")
    bindings.push(like, like, like, like, like)
  }
  if (status === 'out') filters.push('return_date IS NULL')
  if (status === 'returned') filters.push('return_date IS NOT NULL')
  const where = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : ''
  const rows = await db.prepare(
    `SELECT id, applicant, has_approval, reason, card_user, usage_period_raw,
      usage_start_date, usage_end_date, access_scope, visitor_badge_number, card_number,
      checkout_date, return_date, return_date_raw
    FROM visitor_card_records ${where}
    ORDER BY checkout_date DESC, source_row DESC`,
  ).bind(...bindings).all<VisitorCardRow>()
  const counts = await db.prepare(
    'SELECT COUNT(*) AS total, SUM(CASE WHEN return_date IS NULL THEN 1 ELSE 0 END) AS checked_out FROM visitor_card_records',
  ).first<{ total: number; checked_out: number }>()
  const records: VisitorCardRecord[] = rows.results.map((row) => ({
    id: row.id,
    applicant: row.applicant,
    hasApproval: row.has_approval === 1,
    reason: row.reason,
    cardUser: row.card_user,
    usagePeriodRaw: row.usage_period_raw,
    usageStartDate: row.usage_start_date,
    usageEndDate: row.usage_end_date,
    accessScope: row.access_scope,
    visitorBadgeNumber: row.visitor_badge_number,
    cardNumber: row.card_number,
    checkoutDate: row.checkout_date,
    returnDate: row.return_date,
    returnDateRaw: row.return_date_raw,
  }))
  const total = counts?.total ?? 0
  const checkedOut = counts?.checked_out ?? 0
  return { records, total, checkedOut, returned: total - checkedOut }
}

export async function createVisitorCard(
  db: D1Database,
  input: VisitorCardInput & { id: string; now: number },
): Promise<void> {
  await db.prepare(
    `INSERT INTO visitor_card_records
      (id, applicant, has_approval, reason, card_user, usage_period_raw, usage_start_date,
       usage_end_date, access_scope, visitor_badge_number, card_number, checkout_date,
       return_date, return_date_raw, source_fingerprint, source_row, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(
    input.id, input.applicant, input.hasApproval ? 1 : 0, input.reason, input.cardUser,
    input.usagePeriodRaw, input.usageStartDate, input.usageEndDate, input.accessScope,
    input.visitorBadgeNumber, input.cardNumber, input.checkoutDate, input.returnDate, input.returnDate,
    'manual', 0, input.now,
  ).run()
}

export async function updateVisitorCard(
  db: D1Database,
  id: string,
  input: VisitorCardInput,
): Promise<boolean> {
  const result = await db.prepare(
    `UPDATE visitor_card_records SET applicant = ?, has_approval = ?, reason = ?, card_user = ?,
      usage_period_raw = ?, usage_start_date = ?, usage_end_date = ?, access_scope = ?,
      visitor_badge_number = ?, card_number = ?, checkout_date = ?, return_date = ?, return_date_raw = ?
    WHERE id = ?`,
  ).bind(
    input.applicant, input.hasApproval ? 1 : 0, input.reason, input.cardUser, input.usagePeriodRaw,
    input.usageStartDate, input.usageEndDate, input.accessScope, input.visitorBadgeNumber,
    input.cardNumber, input.checkoutDate, input.returnDate, input.returnDate, id,
  ).run()
  return result.meta.changes === 1
}

type UserRow = {
  id: string
  login_id: string
  display_name: string
  password_hash: string
  is_active: number
  created_at: number
  updated_at: number
}

type SessionRow = {
  token_hash: string
  user_id: string
  expires_at: number
  edit_unlocked_until: number | null
  last_seen_at: number
  created_at: number
}

type WorkEntryRow = {
  id: string
  owner_user_id: string
  cadence: WorkCadence
  work_date: string | null
  period_year: number | null
  period_month: number | null
  week_label: string | null
  day_label: string | null
  category: string | null
  deadline_date: string | null
  content: string
  memo: string | null
  is_completed: number
  needs_review: number
  created_at: number
  updated_at: number
}

const toUser = (row: UserRow): User => ({
  id: row.id,
  loginId: row.login_id,
  displayName: row.display_name,
  passwordHash: row.password_hash,
  isActive: row.is_active === 1,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

const toSession = (row: SessionRow): Session => ({
  tokenHash: row.token_hash,
  userId: row.user_id,
  expiresAt: row.expires_at,
  editUnlockedUntil: row.edit_unlocked_until,
  lastSeenAt: row.last_seen_at,
  createdAt: row.created_at,
})

const toWorkEntry = (row: WorkEntryRow): WorkEntry => ({
  id: row.id,
  ownerUserId: row.owner_user_id,
  cadence: row.cadence,
  workDate: row.work_date,
  periodYear: row.period_year,
  periodMonth: row.period_month,
  weekLabel: row.week_label,
  dayLabel: row.day_label,
  category: row.category,
  deadlineDate: row.deadline_date,
  content: row.content,
  memo: row.memo,
  isCompleted: row.is_completed === 1,
  needsReview: row.needs_review === 1,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

export async function findUserByLoginId(
  db: D1Database,
  loginId: string,
): Promise<User | null> {
  const row = await db
    .prepare(
      'SELECT id, login_id, display_name, password_hash, is_active, created_at, updated_at FROM users WHERE login_id = ? LIMIT 1',
    )
    .bind(loginId)
    .first<UserRow>()
  return row ? toUser(row) : null
}

export async function findUserById(
  db: D1Database,
  userId: string,
): Promise<User | null> {
  const row = await db
    .prepare(
      'SELECT id, login_id, display_name, password_hash, is_active, created_at, updated_at FROM users WHERE id = ? LIMIT 1',
    )
    .bind(userId)
    .first<UserRow>()
  return row ? toUser(row) : null
}

export async function listUsers(db: D1Database): Promise<User[]> {
  const rows = await db
    .prepare(
      'SELECT id, login_id, display_name, password_hash, is_active, created_at, updated_at FROM users WHERE is_active = 1 ORDER BY display_name',
    )
    .all<UserRow>()
  return rows.results.map(toUser)
}

export async function createSession(
  db: D1Database,
  session: Session,
): Promise<void> {
  await db
    .prepare(
      'INSERT INTO sessions (token_hash, user_id, expires_at, edit_unlocked_until, last_seen_at, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    )
    .bind(
      session.tokenHash,
      session.userId,
      session.expiresAt,
      session.editUnlockedUntil,
      session.lastSeenAt,
      session.createdAt,
    )
    .run()
}

export async function findSessionContext(
  db: D1Database,
  tokenHash: string,
): Promise<SessionContext | null> {
  const row = await db
    .prepare(
      `SELECT
        s.token_hash, s.user_id, s.expires_at, s.edit_unlocked_until, s.last_seen_at, s.created_at,
        u.login_id, u.display_name, u.password_hash, u.is_active, u.created_at AS user_created_at,
        u.updated_at AS user_updated_at
      FROM sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = ? AND u.is_active = 1
      LIMIT 1`,
    )
    .bind(tokenHash)
    .first<SessionRow & UserRow & { user_created_at: number; user_updated_at: number }>()

  if (!row) return null
  const session = toSession(row)
  return {
    ...session,
    user: toUser({
      id: row.user_id,
      login_id: row.login_id,
      display_name: row.display_name,
      password_hash: row.password_hash,
      is_active: row.is_active,
      created_at: row.user_created_at,
      updated_at: row.user_updated_at,
    }),
  }
}

export async function deleteSession(
  db: D1Database,
  tokenHash: string,
): Promise<void> {
  await db.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(tokenHash).run()
}

export async function touchSession(
  db: D1Database,
  tokenHash: string,
  lastSeenAt: number,
): Promise<void> {
  await db
    .prepare('UPDATE sessions SET last_seen_at = ? WHERE token_hash = ?')
    .bind(lastSeenAt, tokenHash)
    .run()
}

export async function extendEditSession(
  db: D1Database,
  tokenHash: string,
  expiresAt: number,
): Promise<void> {
  await db
    .prepare('UPDATE sessions SET expires_at = ?, edit_unlocked_until = ? WHERE token_hash = ?')
    .bind(expiresAt, expiresAt, tokenHash)
    .run()
}

export async function unlockSession(
  db: D1Database,
  tokenHash: string,
  unlockedUntil: number,
): Promise<boolean> {
  const result = await db
    .prepare('UPDATE sessions SET edit_unlocked_until = ? WHERE token_hash = ?')
    .bind(unlockedUntil, tokenHash)
    .run()
  return result.meta.changes === 1
}

export async function listWorkEntries(
  db: D1Database,
  ownerUserId: string,
): Promise<WorkEntry[]> {
  const rows = await db
    .prepare(
      `SELECT id, owner_user_id, cadence, work_date, period_year, period_month,
        week_label, day_label, category, deadline_date, content, memo, is_completed, needs_review,
        created_at, updated_at
      FROM work_entries
      WHERE owner_user_id = ?
      ORDER BY COALESCE(work_date, printf('%04d-%02d-01', period_year, period_month), printf('%04d-01-01', period_year), '0000-01-01') DESC,
        created_at DESC`,
    )
    .bind(ownerUserId)
    .all<WorkEntryRow>()
  return rows.results.map(toWorkEntry)
}

export async function listWorkEntryPage(
  db: D1Database,
  ownerUserId: string,
  cadence: WorkCadence | null,
  page: number,
  pageSize: number,
): Promise<WorkEntryPage> {
  const where = cadence ? 'owner_user_id = ? AND cadence = ?' : 'owner_user_id = ?'
  const bindings: (string | number)[] = cadence ? [ownerUserId, cadence] : [ownerUserId]
  const count = await db
    .prepare(`SELECT COUNT(*) AS count FROM work_entries WHERE ${where}`)
    .bind(...bindings)
    .first<{ count: number }>()
  const total = count?.count ?? 0
  const maxPage = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(Math.max(1, page), maxPage)
  const offset = (safePage - 1) * pageSize
  const rows = await db
    .prepare(
      `SELECT id, owner_user_id, cadence, work_date, period_year, period_month,
        week_label, day_label, category, deadline_date, content, memo, is_completed, needs_review,
        created_at, updated_at
      FROM work_entries
      WHERE ${where}
      ORDER BY COALESCE(work_date, printf('%04d-%02d-01', period_year, period_month), printf('%04d-01-01', period_year), '0000-01-01') DESC,
        created_at DESC
      LIMIT ? OFFSET ?`,
    )
    .bind(...bindings, pageSize, offset)
    .all<WorkEntryRow>()
  return { entries: rows.results.map(toWorkEntry), total, page: safePage, pageSize }
}

export async function listWorkCategories(db: D1Database, ownerUserId: string): Promise<string[]> {
  const rows = await db
    .prepare(
      `SELECT name AS category FROM workspace_categories
      WHERE owner_user_id = ? ORDER BY name COLLATE NOCASE ASC`,
    )
    .bind(ownerUserId)
    .all<{ category: string }>()
  return rows.results.map((row) => row.category)
}

export async function addWorkspaceCategory(
  db: D1Database,
  ownerUserId: string,
  name: string,
  createdAt: number,
): Promise<boolean> {
  const result = await db.prepare(
    'INSERT OR IGNORE INTO workspace_categories (owner_user_id, name, created_at) VALUES (?, ?, ?)',
  ).bind(ownerUserId, name, createdAt).run()
  return result.meta.changes === 1
}

export async function listMonthlyWorkEntries(
  db: D1Database,
  ownerUserId: string,
  periodYear: number,
  periodMonth: number,
): Promise<WorkEntry[]> {
  const rows = await db
    .prepare(
      `SELECT id, owner_user_id, cadence, work_date, period_year, period_month,
        week_label, day_label, category, deadline_date, content, memo, is_completed, needs_review,
        created_at, updated_at
      FROM work_entries
      WHERE owner_user_id = ? AND cadence = 'monthly' AND period_year = ? AND period_month = ?
      ORDER BY created_at DESC`,
    )
    .bind(ownerUserId, periodYear, periodMonth)
    .all<WorkEntryRow>()
  return rows.results.map(toWorkEntry)
}

export async function listWorkspaceSummaries(
  db: D1Database,
  weekStart: string,
  weekEnd: string,
): Promise<WorkspaceSummary[]> {
  const users = await listUsers(db)
  return Promise.all(
    users.map(async (user) => {
      const counts = await db
        .prepare(
          `SELECT
            COUNT(CASE WHEN work_date BETWEEN ? AND ? THEN 1 END) AS weekly_total,
            COUNT(CASE WHEN is_completed = 0 THEN 1 END) AS incomplete_total
          FROM work_entries
          WHERE owner_user_id = ?`,
        )
        .bind(weekStart, weekEnd, user.id)
        .first<{ weekly_total: number; incomplete_total: number }>()
      const recentRows = await db
        .prepare(
          `SELECT id, owner_user_id, cadence, work_date, period_year, period_month,
            week_label, day_label, category, deadline_date, content, memo, is_completed, needs_review,
            created_at, updated_at
          FROM work_entries
          WHERE owner_user_id = ?
          ORDER BY COALESCE(work_date, printf('%04d-%02d-01', period_year, period_month), printf('%04d-01-01', period_year), '0000-01-01') DESC,
            created_at DESC
          LIMIT 3`,
        )
        .bind(user.id)
        .all<WorkEntryRow>()
      return {
        user,
        weeklyTotal: counts?.weekly_total ?? 0,
        incompleteTotal: counts?.incomplete_total ?? 0,
        recentEntries: recentRows.results.map(toWorkEntry),
      }
    }),
  )
}

export async function insertWorkEntry(
  db: D1Database,
  entry: WorkEntry,
): Promise<boolean> {
  const result = await db
    .prepare(
      'INSERT OR IGNORE INTO work_entries (id, owner_user_id, cadence, work_date, period_year, period_month, week_label, day_label, category, deadline_date, content, memo, is_completed, needs_review, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    )
    .bind(
      entry.id,
      entry.ownerUserId,
      entry.cadence,
      entry.workDate,
      entry.periodYear,
      entry.periodMonth,
      entry.weekLabel,
      entry.dayLabel,
      entry.category,
      entry.deadlineDate ?? null,
      entry.content,
      entry.memo ?? null,
      entry.isCompleted ? 1 : 0,
      entry.needsReview ? 1 : 0,
      entry.createdAt,
      entry.updatedAt,
    )
    .run()
  return result.meta.changes === 1
}

export async function updateOwnedWorkEntry(
  db: D1Database,
  entryId: string,
  ownerUserId: string,
  workDate: string,
  deadlineDate: string | null,
  category: string | null,
  content: string,
  updatedAt: number,
): Promise<boolean> {
  const result = await db
    .prepare(
      'UPDATE work_entries SET work_date = ?, deadline_date = ?, category = ?, content = ?, updated_at = ? WHERE id = ? AND owner_user_id = ?',
    )
    .bind(workDate, deadlineDate, category, content, updatedAt, entryId, ownerUserId)
    .run()
  return result.meta.changes === 1
}

export async function updateOwnedMonthlyWorkEntry(
  db: D1Database,
  entryId: string,
  ownerUserId: string,
  periodYear: number,
  periodMonth: number,
  category: string | null,
  content: string,
  updatedAt: number,
): Promise<boolean> {
  const result = await db.prepare(
    `UPDATE work_entries SET category = ?, content = ?, updated_at = ?
    WHERE id = ? AND owner_user_id = ? AND cadence = 'monthly' AND period_year = ? AND period_month = ?`,
  ).bind(category, content, updatedAt, entryId, ownerUserId, periodYear, periodMonth).run()
  return result.meta.changes === 1
}

export async function deleteOwnedMonthlyWorkEntry(
  db: D1Database,
  entryId: string,
  ownerUserId: string,
  periodYear: number,
  periodMonth: number,
): Promise<boolean> {
  const result = await db.prepare(
    `DELETE FROM work_entries
    WHERE id = ? AND owner_user_id = ? AND cadence = 'monthly' AND period_year = ? AND period_month = ?`,
  ).bind(entryId, ownerUserId, periodYear, periodMonth).run()
  return result.meta.changes === 1
}

export async function deleteOwnedWorkEntry(
  db: D1Database,
  entryId: string,
  ownerUserId: string,
): Promise<boolean> {
  const result = await db.prepare(
    'DELETE FROM work_entries WHERE id = ? AND owner_user_id = ?',
  ).bind(entryId, ownerUserId).run()
  return result.meta.changes === 1
}

export async function updateOwnedWorkEntryMemo(
  db: D1Database,
  entryId: string,
  ownerUserId: string,
  memo: string | null,
  updatedAt: number,
): Promise<boolean> {
  const result = await db.prepare(
    'UPDATE work_entries SET memo = ?, updated_at = ? WHERE id = ? AND owner_user_id = ?',
  ).bind(memo, updatedAt, entryId, ownerUserId).run()
  return result.meta.changes === 1
}

export async function toggleOwnedWorkEntry(
  db: D1Database,
  entryId: string,
  ownerUserId: string,
  updatedAt: number,
): Promise<boolean> {
  const result = await db
    .prepare(
      'UPDATE work_entries SET is_completed = CASE is_completed WHEN 1 THEN 0 ELSE 1 END, updated_at = ? WHERE id = ? AND owner_user_id = ?',
    )
    .bind(updatedAt, entryId, ownerUserId)
    .run()
  return result.meta.changes === 1
}

export async function listWeeklyOverviewEntries(
  db: D1Database,
  ownerUserId: string,
  weekStart: string,
  weekEnd: string,
  limit: number,
): Promise<{ entries: WorkEntry[]; total: number }> {
  const where = "owner_user_id = ? AND (cadence = 'weekly' OR deadline_date BETWEEN ? AND ?)"
  const count = await db
    .prepare(`SELECT COUNT(*) AS count FROM work_entries WHERE ${where}`)
    .bind(ownerUserId, weekStart, weekEnd)
    .first<{ count: number }>()
  const rows = await db
    .prepare(
      `SELECT id, owner_user_id, cadence, work_date, period_year, period_month,
        week_label, day_label, category, deadline_date, content, memo, is_completed, needs_review,
        created_at, updated_at
      FROM work_entries
      WHERE ${where}
      ORDER BY
        CASE WHEN deadline_date BETWEEN ? AND ? THEN 0 ELSE 1 END,
        deadline_date ASC,
        COALESCE(work_date, printf('%04d-%02d-01', period_year, period_month), printf('%04d-01-01', period_year), '0000-01-01') DESC,
        created_at DESC
      LIMIT ?`,
    )
    .bind(ownerUserId, weekStart, weekEnd, weekStart, weekEnd, limit)
    .all<WorkEntryRow>()
  return { entries: rows.results.map(toWorkEntry), total: count?.count ?? 0 }
}

export async function listGeneralExpenseMonthEntries(
  db: D1Database,
  ownerUserId: string,
  monthStart: string,
  monthEnd: string,
): Promise<WorkEntry[]> {
  const rows = await db
    .prepare(
      `SELECT id, owner_user_id, cadence, work_date, period_year, period_month,
        week_label, day_label, category, deadline_date, content, memo, is_completed, needs_review,
        created_at, updated_at
      FROM work_entries
      WHERE owner_user_id = ?
        AND category = '총무비용'
        AND work_date BETWEEN ? AND ?
      ORDER BY work_date ASC, created_at ASC`,
    )
    .bind(ownerUserId, monthStart, monthEnd)
    .all<WorkEntryRow>()
  return rows.results.map(toWorkEntry)
}
export async function listGeneralExpenseEntryPage(
  db: D1Database,
  ownerUserId: string,
  page: number,
  pageSize: number,
): Promise<WorkEntryPage> {
  const where = "owner_user_id = ? AND category = '총무비용'"
  const count = await db
    .prepare(`SELECT COUNT(*) AS count FROM work_entries WHERE ${where}`)
    .bind(ownerUserId)
    .first<{ count: number }>()
  const total = count?.count ?? 0
  const maxPage = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(Math.max(1, page), maxPage)
  const offset = (safePage - 1) * pageSize
  const rows = await db
    .prepare(
      `SELECT id, owner_user_id, cadence, work_date, period_year, period_month,
        week_label, day_label, category, deadline_date, content, memo, is_completed, needs_review,
        created_at, updated_at
      FROM work_entries
      WHERE ${where}
      ORDER BY COALESCE(deadline_date, work_date, '9999-12-31') ASC, created_at DESC
      LIMIT ? OFFSET ?`,
    )
    .bind(ownerUserId, pageSize, offset)
    .all<WorkEntryRow>()
  return { entries: rows.results.map(toWorkEntry), total, page: safePage, pageSize }
}

export async function listGeneralExpenseSuggestions(
  db: D1Database,
  ownerUserId: string,
): Promise<string[]> {
  const rows = await db
    .prepare(
      `SELECT content, MAX(updated_at) AS latest
      FROM work_entries
      WHERE owner_user_id = ? AND category = '총무비용'
      GROUP BY content
      ORDER BY latest DESC
      LIMIT 100`,
    )
    .bind(ownerUserId)
    .all<{ content: string; latest: number }>()
  return rows.results.map((row) => row.content)
}

export async function moveOwnedIncompleteWorkEntry(
  db: D1Database,
  entryId: string,
  ownerUserId: string,
  target: 'monthly' | 'undated',
  periodYear: number,
  periodMonth: number,
  updatedAt: number,
): Promise<boolean> {
  const isUndated = target === 'undated'
  const result = await db
    .prepare(
      `UPDATE work_entries
      SET cadence = ?, work_date = NULL, period_year = ?, period_month = ?,
        week_label = NULL, day_label = NULL, needs_review = ?, updated_at = ?
      WHERE id = ? AND owner_user_id = ?`,
    )
    .bind(target, isUndated ? null : periodYear, isUndated ? null : periodMonth, isUndated ? 1 : 0, updatedAt, entryId, ownerUserId)
    .run()
  return result.meta.changes === 1
}

type AnnualScheduleRow = {
  id: string
  schedule_year: number
  major_category: string | null
  subcategory: string | null
  task: string
  month_number: number
  detail: string
  sort_order: number
  is_completed: number
}

export async function listAnnualScheduleItems(db: D1Database): Promise<AnnualScheduleItem[]> {
  const rows = await db.prepare(
    `SELECT id, schedule_year, major_category, subcategory, task, month_number, detail, sort_order, is_completed
    FROM annual_schedule_items
    WHERE schedule_year = (SELECT MAX(schedule_year) FROM annual_schedule_items)
    ORDER BY sort_order, month_number`,
  ).all<AnnualScheduleRow>()
  return rows.results.map((row) => ({
    id: row.id,
    scheduleYear: row.schedule_year,
    majorCategory: row.major_category,
    subcategory: row.subcategory,
    task: row.task,
    monthNumber: row.month_number,
    detail: row.detail,
    sortOrder: row.sort_order,
    isCompleted: row.is_completed === 1,
  }))
}

export async function toggleAnnualScheduleItem(db: D1Database, id: string): Promise<boolean> {
  const result = await db.prepare(
    'UPDATE annual_schedule_items SET is_completed = CASE is_completed WHEN 1 THEN 0 ELSE 1 END WHERE id = ?',
  ).bind(id).run()
  return result.meta.changes === 1
}
type GeneralExpenseRow = {
  id: string
  transfer_date: string
  deadline_date: string | null
  content: string
  assigned_user_id: string | null
  assigned_display_name: string | null
  is_completed: number
  created_at: number
  updated_at: number
}

const toGeneralExpenseEntry = (row: GeneralExpenseRow): GeneralExpenseEntry => ({
  id: row.id,
  transferDate: row.transfer_date,
  deadlineDate: row.deadline_date,
  content: row.content,
  assignedUserId: row.assigned_user_id,
  assignedDisplayName: row.assigned_display_name,
  isCompleted: row.is_completed === 1,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

export async function listTeamGeneralExpenses(
  db: D1Database,
  monthStart: string,
  monthEnd: string,
): Promise<GeneralExpenseEntry[]> {
  const rows = await db
    .prepare(
      `SELECT e.id, e.transfer_date, e.deadline_date, e.content, e.assigned_user_id,
        u.display_name AS assigned_display_name, e.is_completed, e.created_at, e.updated_at
      FROM general_expense_entries e
      LEFT JOIN users u ON u.id = e.assigned_user_id
      WHERE e.transfer_date BETWEEN ? AND ?
      ORDER BY e.transfer_date ASC, e.created_at ASC`,
    )
    .bind(monthStart, monthEnd)
    .all<GeneralExpenseRow>()
  return rows.results.map(toGeneralExpenseEntry)
}

export async function listTeamGeneralExpenseSuggestions(db: D1Database): Promise<string[]> {
  const rows = await db
    .prepare(
      `SELECT content, MAX(updated_at) AS latest
      FROM general_expense_entries
      GROUP BY content
      ORDER BY latest DESC
      LIMIT 100`,
    )
    .all<{ content: string; latest: number }>()
  return rows.results.map((row) => row.content)
}

export async function insertTeamGeneralExpense(
  db: D1Database,
  entry: GeneralExpenseEntry,
): Promise<boolean> {
  const result = await db
    .prepare(
      `INSERT OR IGNORE INTO general_expense_entries
        (id, transfer_date, deadline_date, content, assigned_user_id, is_completed, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      entry.id, entry.transferDate, entry.deadlineDate, entry.content, entry.assignedUserId,
      entry.isCompleted ? 1 : 0, entry.createdAt, entry.updatedAt,
    )
    .run()
  return result.meta.changes === 1
}

export async function toggleTeamGeneralExpense(
  db: D1Database,
  entryId: string,
  updatedAt: number,
): Promise<boolean> {
  const result = await db
    .prepare(
      `UPDATE general_expense_entries
      SET is_completed = CASE is_completed WHEN 1 THEN 0 ELSE 1 END, updated_at = ?
      WHERE id = ?`,
    )
    .bind(updatedAt, entryId)
    .run()
  return result.meta.changes === 1
}

type ManualEntryRow = {
  id: string
  category: string
  subcategory: string
  title: string
  body: string
  source_sheet: string
  source_row: number
  row_kind: ManualEntry['rowKind']
  cells_json: string
  sensitive_redacted: number
}

export async function listManualEntries(
  db: D1Database,
  query: string,
  category: string,
  subcategory: string,
): Promise<{ entries: ManualEntry[]; categories: string[]; subcategories: string[] }> {
  const categories = await db.prepare(
    'SELECT DISTINCT category FROM manual_entries ORDER BY category',
  ).all<{ category: string }>()
  const subcategoryRows = await db.prepare(
    category === ''
      ? 'SELECT DISTINCT subcategory FROM manual_entries ORDER BY subcategory'
      : 'SELECT DISTINCT subcategory FROM manual_entries WHERE category = ? ORDER BY subcategory',
  ).bind(...(category === '' ? [] : [category])).all<{ subcategory: string }>()
  const filters: string[] = []
  const bindings: string[] = []
  if (category !== '') {
    filters.push('category = ?')
    bindings.push(category)
  }
  if (subcategory !== '') {
    filters.push('subcategory = ?')
    bindings.push(subcategory)
  }
  if (query !== '') {
    filters.push('(title LIKE ? OR body LIKE ? OR cells_json LIKE ? OR source_sheet LIKE ?)')
    const like = `%${query.replaceAll('%', '\\%').replaceAll('_', '\\_')}%`
    bindings.push(like, like, like, like)
  }
  const where = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : ''
  const rows = await db.prepare(
    `SELECT id, category, subcategory, title, body, source_sheet, source_row, row_kind, cells_json, sensitive_redacted
     FROM manual_entries ${where}
     ORDER BY category, subcategory, source_row, id
     LIMIT 2000`,
  ).bind(...bindings).all<ManualEntryRow>()
  return {
    categories: categories.results.map((row) => row.category),
    subcategories: subcategoryRows.results.map((row) => row.subcategory),
    entries: rows.results.flatMap((row) => {
      try {
        const cells = JSON.parse(row.cells_json)
        if (!Array.isArray(cells) || cells.some((cell) => typeof cell !== 'string')) return []
        return [{
          id: row.id,
          category: row.category,
          subcategory: row.subcategory,
          title: row.title,
          body: row.body,
          sourceSheet: row.source_sheet,
          sourceRow: row.source_row,
          rowKind: row.row_kind,
          cells,
          sensitiveRedacted: row.sensitive_redacted === 1,
        }]
      } catch {
        return []
      }
    }),
  }
}

export async function updateManualEntry(
  db: D1Database,
  id: string,
  cells: string[],
  body: string,
  now: number,
): Promise<boolean> {
  const result = await db.prepare(
    'UPDATE manual_entries SET title = ?, body = ?, cells_json = ?, updated_at = ? WHERE id = ?',
  ).bind(cells.find((cell) => cell !== '') ?? '빈 행', body, JSON.stringify(cells), now, id).run()
  return result.meta.changes === 1
}

type RecruitmentRowRecord = {
  id: string
  area: RecruitmentRow['area']
  source_sheet: string
  source_row: number
  row_kind: RecruitmentRow['rowKind']
  cells_json: string
  status: RecruitmentRow['status']
}

export async function listRecruitmentRows(
  db: D1Database,
  area: RecruitmentRow['area'],
  query: string,
): Promise<RecruitmentRow[]> {
  const bindings: (string | number)[] = [area]
  const queryFilter = query === '' ? '' : 'AND cells_json LIKE ?'
  if (query !== '') bindings.push(`%${query.replaceAll('%', '\\%').replaceAll('_', '\\_')}%`)
  const rows = await db.prepare(
    `SELECT id, area, source_sheet, source_row, row_kind, cells_json, status
     FROM recruitment_rows WHERE area = ? ${queryFilter}
     ORDER BY source_row, row_kind DESC, id LIMIT 500`,
  ).bind(...bindings).all<RecruitmentRowRecord>()
  return rows.results.flatMap((row) => {
    try {
      const parsed = JSON.parse(row.cells_json)
      if (!Array.isArray(parsed) || parsed.some((cell) => typeof cell !== 'string')) return []
      return [{
        id: row.id,
        area: row.area,
        sourceSheet: row.source_sheet,
        sourceRow: row.source_row,
        rowKind: row.row_kind,
        cells: parsed,
        status: row.status,
      }]
    } catch {
      return []
    }
  })
}

export async function insertRecruitmentRows(
  db: D1Database,
  rows: RecruitmentRow[],
  now: number,
): Promise<void> {
  if (rows.length === 0) return
  await db.batch(rows.map((row) => db.prepare(
    `INSERT INTO recruitment_rows
      (id, area, source_sheet, source_row, row_kind, cells_json, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(
    row.id, row.area, row.sourceSheet, row.sourceRow, row.rowKind,
    JSON.stringify(row.cells), row.status === 'done' ? 'done' : 'pending', now, now,
  )))
}

export async function toggleRecruitmentRow(db: D1Database, id: string): Promise<boolean> {
  const result = await db.prepare(
    `UPDATE recruitment_rows SET status = CASE status WHEN 'done' THEN 'pending' ELSE 'done' END,
      updated_at = ? WHERE id = ?`,
  ).bind(Date.now(), id).run()
  return result.meta.changes === 1
}

export async function updateRecruitmentRow(
  db: D1Database,
  id: string,
  cells: string[],
  now: number,
): Promise<boolean> {
  const result = await db.prepare(
    `UPDATE recruitment_rows SET cells_json = ?, updated_at = ?
     WHERE id = ? AND row_kind = 'data'`,
  ).bind(JSON.stringify(cells), now, id).run()
  return result.meta.changes === 1
}

type RecruitmentRecordDbRow = {
  id: string
  kind: RecruitmentRecordKind
  name: string
  department: string | null
  position: string | null
  experience_type: string | null
  phone: string | null
  email: string | null
  job_title: string | null
  recipient: string | null
  event_date: string | null
  event_time: string | null
  interviewer: string | null
  interviewer_availability: string | null
  location: string | null
  status: RecruitmentRecordStatus
  result: string | null
  notes: string | null
  created_at: number
  updated_at: number
}

type RecruitmentTaskDbRow = {
  id: string
  record_id: string
  task_key: string
  label: string
  is_completed: number
  memo: string | null
  sort_order: number
}

const recruitmentTaskTemplates: Record<RecruitmentRecordKind, Array<{ key: string; label: string }>> = {
  onboarding: [
    { key: 'final_email', label: '최종합격 안내메일 발송' },
    { key: 'ojt_room', label: '신규입사자 OJT 회의실 예약' },
    { key: 'access_card', label: '출입카드 권한 부여' },
    { key: 'asset_license', label: '자산·PC·노트북·모니터·라이선스 준비' },
    { key: 'personal_documents', label: '개인서류 수취' },
    { key: 'e_contract', label: '전자계약 발송·다운로드 확인' },
    { key: 'groupware', label: '그룹웨어 계정 생성' },
    { key: 'office_files', label: '오피스 파일 전달' },
    { key: 'wanted_space', label: '원티드스페이스 초대' },
    { key: 'employee_id', label: '사원증 신청' },
    { key: 'cafe', label: '5층 카페 등록' },
  ],
  resume: [],
  interview: [
    { key: 'interview_notice', label: '면접 일정 안내' },
    { key: 'result_notice', label: '면접 결과 안내' },
  ],
  executive: [
    { key: 'working_result_message', label: '실무진면접 결과 문자 발송' },
    { key: 'executive_email', label: '경영진면접 안내메일 발송' },
    { key: 'executive_message', label: '경영진면접 안내문자 발송' },
    { key: 'company_email', label: '경영진면접 일정 안내메일 발송' },
  ],
}

const toRecruitmentTask = (row: RecruitmentTaskDbRow): RecruitmentTask => ({
  id: row.id,
  recordId: row.record_id,
  taskKey: row.task_key,
  label: row.label,
  isCompleted: row.is_completed === 1,
  memo: row.memo,
  sortOrder: row.sort_order,
})

const toRecruitmentRecord = (row: RecruitmentRecordDbRow, tasks: RecruitmentTask[]): RecruitmentRecord => ({
  id: row.id,
  kind: row.kind,
  name: row.name,
  department: row.department,
  position: row.position,
  experienceType: row.experience_type,
  phone: row.phone,
  email: row.email,
  jobTitle: row.job_title,
  recipient: row.recipient,
  eventDate: row.event_date,
  eventTime: row.event_time,
  interviewer: row.interviewer,
  interviewerAvailability: row.interviewer_availability,
  location: row.location,
  status: row.status,
  result: row.result,
  notes: row.notes,
  tasks,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

export async function listRecruitmentRecordCounts(db: D1Database): Promise<Record<RecruitmentRecordKind, number>> {
  const counts: Record<RecruitmentRecordKind, number> = { onboarding: 0, resume: 0, interview: 0, executive: 0 }
  const rows = await db.prepare(
    'SELECT kind, COUNT(*) AS count FROM recruitment_records GROUP BY kind',
  ).all<{ kind: RecruitmentRecordKind; count: number }>()
  for (const row of rows.results) {
    if (row.kind in counts) counts[row.kind] = row.count
  }
  return counts
}

export async function listRecruitmentRecords(
  db: D1Database,
  kind: RecruitmentRecordKind,
  query: string,
): Promise<RecruitmentRecord[]> {
  const bindings: string[] = [kind]
  const queryFilter = query === ''
    ? ''
    : `AND (name LIKE ? ESCAPE '\\' OR department LIKE ? ESCAPE '\\' OR job_title LIKE ? ESCAPE '\\'
      OR recipient LIKE ? ESCAPE '\\' OR email LIKE ? ESCAPE '\\' OR notes LIKE ? ESCAPE '\\')`
  if (query !== '') {
    const like = `%${query.replaceAll('\\', '\\\\').replaceAll('%', '\\%').replaceAll('_', '\\_')}%`
    bindings.push(like, like, like, like, like, like)
  }
  const rows = await db.prepare(
    `SELECT id, kind, name, department, position, experience_type, phone, email,
       job_title, recipient, event_date, event_time, interviewer, interviewer_availability, location,
       status, result, notes, created_at, updated_at
     FROM recruitment_records
     WHERE kind = ? ${queryFilter}
     ORDER BY CASE WHEN event_date IS NULL THEN 1 ELSE 0 END, event_date DESC, event_time ASC, updated_at DESC
     LIMIT 1000`,
  ).bind(...bindings).all<RecruitmentRecordDbRow>()
  if (rows.results.length === 0) return []
  const taskMap = new Map<string, RecruitmentTask[]>()
  for (let start = 0; start < rows.results.length; start += 40) {
    const chunk = rows.results.slice(start, start + 40)
    const placeholders = chunk.map(() => '?').join(',')
    const taskRows = await db.prepare(
      `SELECT id, record_id, task_key, label, is_completed, memo, sort_order
       FROM recruitment_tasks WHERE record_id IN (${placeholders}) ORDER BY sort_order, id`,
    ).bind(...chunk.map((row) => row.id)).all<RecruitmentTaskDbRow>()
    for (const task of taskRows.results) {
      const list = taskMap.get(task.record_id) ?? []
      list.push(toRecruitmentTask(task))
      taskMap.set(task.record_id, list)
    }
  }
  return rows.results.map((row) => toRecruitmentRecord(row, taskMap.get(row.id) ?? []))
}

export async function createRecruitmentRecord(
  db: D1Database,
  input: RecruitmentRecordDraft & { id: string; createdAt: number; updatedAt: number },
): Promise<boolean> {
  const now = input.createdAt
  const statements: D1PreparedStatement[] = [db.prepare(
    `INSERT INTO recruitment_records
      (id, kind, name, department, position, experience_type, phone, email, job_title,
       recipient, event_date, event_time, interviewer, interviewer_availability, location, status, result, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(
    input.id, input.kind, input.name, input.department, input.position, input.experienceType,
    input.phone, input.email, input.jobTitle, input.recipient, input.eventDate, input.eventTime,
    input.interviewer, input.interviewerAvailability, input.location, input.status, input.result, input.notes, input.createdAt, input.updatedAt,
  )]
  for (const [sortOrder, task] of recruitmentTaskTemplates[input.kind].entries()) {
    statements.push(db.prepare(
      `INSERT INTO recruitment_tasks
        (id, record_id, task_key, label, is_completed, memo, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, 0, NULL, ?, ?, ?)`,
    ).bind(crypto.randomUUID(), input.id, task.key, task.label, sortOrder, now, now))
  }
  const result = await db.batch(statements)
  return result.length > 0
}

export async function updateRecruitmentRecord(
  db: D1Database,
  id: string,
  input: RecruitmentRecordDraft,
  updatedAt: number,
): Promise<boolean> {
  const result = await db.prepare(
    `UPDATE recruitment_records SET kind = ?, name = ?, department = ?, position = ?,
       experience_type = ?, phone = ?, email = ?, job_title = ?, recipient = ?,
       event_date = ?, event_time = ?, interviewer = ?, interviewer_availability = ?, location = ?, status = ?,
       result = ?, notes = ?, updated_at = ? WHERE id = ?`,
  ).bind(
    input.kind, input.name, input.department, input.position, input.experienceType,
    input.phone, input.email, input.jobTitle, input.recipient, input.eventDate, input.eventTime,
    input.interviewer, input.interviewerAvailability, input.location, input.status, input.result, input.notes, updatedAt, id,
  ).run()
  return result.meta.changes === 1
}

export async function toggleRecruitmentTask(db: D1Database, taskId: string, updatedAt: number): Promise<boolean> {
  const result = await db.prepare(
    `UPDATE recruitment_tasks SET is_completed = CASE is_completed WHEN 1 THEN 0 ELSE 1 END,
      updated_at = ? WHERE id = ?`,
  ).bind(updatedAt, taskId).run()
  return result.meta.changes === 1
}

type InterviewCoordinationRowRecord = {
  id: string
  view_name: InterviewCoordinationRow['view']
  source_sheet: string
  source_row: number
  row_kind: InterviewCoordinationRow['rowKind']
  cells_json: string
  status: InterviewCoordinationRow['status']
}

export async function listInterviewCoordinationRows(
  db: D1Database,
  view: InterviewCoordinationRow['view'],
  query: string,
): Promise<InterviewCoordinationRow[]> {
  const bindings: string[] = [view]
  const queryFilter = query === '' ? '' : 'AND (cells_json LIKE ? OR source_sheet LIKE ?)'
  if (query !== '') {
    const like = `%${query.replaceAll('%', '\\%').replaceAll('_', '\\_')}%`
    bindings.push(like, like)
  }
  const rows = await db.prepare(
    `SELECT id, view_name, source_sheet, source_row, row_kind, cells_json, status
     FROM interview_coordination_rows WHERE view_name = ? ${queryFilter}
     ORDER BY source_sheet, source_row, row_kind DESC, id LIMIT 700`,
  ).bind(...bindings).all<InterviewCoordinationRowRecord>()
  return rows.results.flatMap((row) => {
    try {
      const parsed = JSON.parse(row.cells_json)
      if (!Array.isArray(parsed) || parsed.some((cell) => typeof cell !== 'string')) return []
      return [{
        id: row.id,
        view: row.view_name,
        sourceSheet: row.source_sheet,
        sourceRow: row.source_row,
        rowKind: row.row_kind,
        cells: parsed,
        status: row.status,
      }]
    } catch {
      return []
    }
  })
}

export async function insertInterviewCoordinationRows(
  db: D1Database,
  rows: InterviewCoordinationRow[],
  now: number,
): Promise<void> {
  if (rows.length === 0) return
  await db.batch(rows.map((row) => db.prepare(
    `INSERT INTO interview_coordination_rows
      (id, view_name, source_sheet, source_row, row_kind, cells_json, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(
    row.id, row.view, row.sourceSheet, row.sourceRow, row.rowKind,
    JSON.stringify(row.cells), row.status === 'done' ? 'done' : 'pending', now, now,
  )))
}

export async function toggleInterviewCoordinationRow(db: D1Database, id: string): Promise<boolean> {
  const result = await db.prepare(
    `UPDATE interview_coordination_rows SET status = CASE status WHEN 'done' THEN 'pending' ELSE 'done' END,
      updated_at = ? WHERE id = ?`,
  ).bind(Date.now(), id).run()
  return result.meta.changes === 1
}

export async function updateInterviewCoordinationRow(
  db: D1Database,
  id: string,
  cells: string[],
  now: number,
): Promise<boolean> {
  const result = await db.prepare(
    `UPDATE interview_coordination_rows SET cells_json = ?, updated_at = ?
     WHERE id = ? AND row_kind = 'data'`,
  ).bind(JSON.stringify(cells), now, id).run()
  return result.meta.changes === 1
}

export async function updateTeamGeneralExpense(
  db: D1Database,
  entryId: string,
  transferDate: string,
  content: string,
  updatedAt: number,
): Promise<boolean> {
  const result = await db.prepare(
    `UPDATE general_expense_entries
     SET transfer_date = ?, content = ?, updated_at = ?
     WHERE id = ?`,
  ).bind(transferDate, content, updatedAt, entryId).run()
  return result.meta.changes === 1
}

export async function assignTeamGeneralExpense(
  db: D1Database,
  entryId: string,
  assignedUserId: string | null,
  updatedAt: number,
): Promise<boolean> {
  const result = await db
    .prepare('UPDATE general_expense_entries SET assigned_user_id = ?, updated_at = ? WHERE id = ?')
    .bind(assignedUserId, updatedAt, entryId)
    .run()
  return result.meta.changes === 1
}
export async function recordActivity(
  db: D1Database,
  input: {
    id: string
    actorUserId: string | null
    action: string
    targetType: string
    targetId: string | null
    succeeded: boolean
    createdAt: number
  },
): Promise<void> {
  await db
    .prepare(
      'INSERT INTO activity_logs (id, actor_user_id, action, target_type, target_id, succeeded, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    )
    .bind(
      input.id,
      input.actorUserId,
      input.action,
      input.targetType,
      input.targetId,
      input.succeeded ? 1 : 0,
      input.createdAt,
    )
    .run()
}

export async function recordLoginAttempt(
  db: D1Database,
  input: {
    id: string
    loginKeyHash: string
    attemptedAt: number
    succeeded: boolean
  },
): Promise<void> {
  await db
    .prepare(
      'INSERT INTO login_attempts (id, login_key_hash, attempted_at, succeeded) VALUES (?, ?, ?, ?)',
    )
    .bind(
      input.id,
      input.loginKeyHash,
      input.attemptedAt,
      input.succeeded ? 1 : 0,
    )
    .run()
}

export async function countRecentFailedLogins(
  db: D1Database,
  loginKeyHash: string,
  since: number,
): Promise<number> {
  const row = await db
    .prepare(
      'SELECT COUNT(*) AS count FROM login_attempts WHERE login_key_hash = ? AND attempted_at >= ? AND succeeded = 0',
    )
    .bind(loginKeyHash, since)
    .first<{ count: number }>()
  return row?.count ?? 0
}









