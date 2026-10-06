export interface Env {
  DB: D1Database
}

export interface User {
  id: string
  loginId: string
  displayName: string
  passwordHash: string
  isActive: boolean
  createdAt: number
  updatedAt: number
}

export interface Session {
  tokenHash: string
  userId: string
  expiresAt: number
  editUnlockedUntil: number | null
  lastSeenAt: number
  createdAt: number
}

export interface SessionContext extends Session {
  user: User
}

export type WorkCadence = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'undated'

export interface WorkEntry {
  id: string
  ownerUserId: string
  cadence: WorkCadence
  workDate: string | null
  periodYear: number | null
  periodMonth: number | null
  weekLabel: string | null
  dayLabel: string | null
  category: string | null
  deadlineDate?: string | null
  content: string
  memo?: string | null
  isCompleted: boolean
  needsReview: boolean
  createdAt: number
  updatedAt: number
}

export interface AnnualScheduleItem {
  id: string
  scheduleYear: number
  majorCategory: string | null
  subcategory: string | null
  task: string
  monthNumber: number
  detail: string
  sortOrder: number
  isCompleted: boolean
}

export interface WorkEntryPage {
  entries: WorkEntry[]
  total: number
  page: number
  pageSize: number
}

export interface WorkspaceSummary {
  user: User
  weeklyTotal: number
  incompleteTotal: number
  recentEntries: WorkEntry[]
}
export interface GeneralExpenseEntry {
  id: string
  transferDate: string
  deadlineDate: string | null
  content: string
  assignedUserId: string | null
  assignedDisplayName: string | null
  isCompleted: boolean
  createdAt: number
  updatedAt: number
}

export type AssetType = 'laptop' | 'desktop' | 'monitor' | 'other'

export interface Asset {
  id: string
  assetCode: string
  assetType: AssetType
  assetName: string | null
  currentUserName: string | null
  usageScope: string | null
  usageStartDate: string | null
  usageStartRaw: string | null
  usageEndDate: string | null
  usageEndRaw: string | null
  historyNote: string | null
}

export interface AssetPage {
  assets: Asset[]
  total: number
  page: number
  pageSize: number
  counts: Record<AssetType, number>
}

export interface AssetHistoryRecord {
  id: string
  recordedAtRaw: string | null
  respondentName: string | null
  department: string | null
  equipmentLabel: string
  modelName: string | null
  manufactureDateRaw: string | null
}

export interface AssetChoice {
  id: string
  assetCode: string
  assetName: string | null
}

export interface AssetDueRecord {
  id: string
  assetCode: string
  assetName: string | null
  currentUserName: string | null
  usageScope: string | null
  usageEndDate: string
}

export interface AssetCustodyRecord {
  id: string
  assetId: string
  assetCode: string
  assetName: string | null
  recipientName: string
  outboundDepartment: string
  actualUserName: string | null
  outboundDate: string
  expectedReturnDate: string | null
  returnedDate: string | null
  purpose: string | null
  hasProposal: boolean
}

export type PatentPaymentStatus = 'paid' | 'unpaid' | 'prepaid' | 'unknown'
export type PatentWorkflowStatus = 'draft_needed' | 'drafting' | 'drafted' | 'paid'

export interface PatentFeeRecord {
  patentId: string
  sourceGroup: string
  title: string
  registrationNumber: string
  feeYear: number
  deadlineRaw: string | null
  installment: string | null
  amount: number | null
  paymentStatus: PatentPaymentStatus
  workflowStatus: PatentWorkflowStatus
  note: string | null
}

export interface PatentPage {
  records: PatentFeeRecord[]
  totalPatents: number
  totalAmount: number
  pendingCount: number
}

export interface VisitorCardRecord {
  id: string
  applicant: string | null
  hasApproval: boolean
  reason: string | null
  cardUser: string | null
  usagePeriodRaw: string | null
  usageStartDate: string | null
  usageEndDate: string | null
  accessScope: string | null
  visitorBadgeNumber: string | null
  cardNumber: string | null
  checkoutDate: string | null
  returnDate: string | null
  returnDateRaw: string | null
}

export interface VisitorCardInput {
  applicant: string
  hasApproval: boolean
  reason: string | null
  cardUser: string | null
  usagePeriodRaw: string | null
  usageStartDate: string | null
  usageEndDate: string | null
  accessScope: string | null
  visitorBadgeNumber: string | null
  cardNumber: string | null
  checkoutDate: string | null
  returnDate: string | null
}

export interface VisitorCardPage {
  records: VisitorCardRecord[]
  total: number
  checkedOut: number
  returned: number
}

export interface ManualEntry {
  id: string
  category: string
  subcategory: string
  title: string
  body: string
  sourceSheet: string
  sourceRow: number
  rowKind: 'header' | 'data'
  cells: string[]
  sensitiveRedacted: boolean
}

export interface RecruitmentRow {
  id: string
  area: 'onboarding' | 'resume' | 'interview' | 'executive'
  sourceSheet: string
  sourceRow: number
  rowKind: 'header' | 'data'
  cells: string[]
  status: 'pending' | 'done'
}

export type RecruitmentRecordKind = 'onboarding' | 'resume' | 'interview' | 'executive'

export type RecruitmentRecordStatus =
  | 'pending'
  | 'scheduled'
  | 'sent'
  | 'in_progress'
  | 'completed'
  | 'on_hold'
  | 'cancelled'

export interface RecruitmentTask {
  id: string
  recordId: string
  taskKey: string
  label: string
  isCompleted: boolean
  memo: string | null
  sortOrder: number
}

export interface RecruitmentRecord {
  id: string
  kind: RecruitmentRecordKind
  name: string
  department: string | null
  position: string | null
  experienceType: string | null
  phone: string | null
  email: string | null
  jobTitle: string | null
  recipient: string | null
  eventDate: string | null
  eventTime: string | null
  interviewer: string | null
  interviewerAvailability: string | null
  location: string | null
  status: RecruitmentRecordStatus
  result: string | null
  notes: string | null
  tasks: RecruitmentTask[]
  createdAt: number
  updatedAt: number
}

export interface RecruitmentRecordDraft {
  kind: RecruitmentRecordKind
  name: string
  department: string | null
  position: string | null
  experienceType: string | null
  phone: string | null
  email: string | null
  jobTitle: string | null
  recipient: string | null
  eventDate: string | null
  eventTime: string | null
  interviewer: string | null
  interviewerAvailability: string | null
  location: string | null
  status: RecruitmentRecordStatus
  result: string | null
  notes: string | null
}

export type InterviewCoordinationView = 'departments' | 'confirmed' | 'blacklist'

export interface InterviewCoordinationRow {
  id: string
  view: InterviewCoordinationView
  sourceSheet: string
  sourceRow: number
  rowKind: 'header' | 'data'
  cells: string[]
  status: 'pending' | 'done'
}

