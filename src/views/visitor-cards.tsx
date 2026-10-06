import type { VisitorCardPage, VisitorCardRecord } from '../types'
import { detailHeader, escapeHtml, pageLayout } from './layout'

const accessOptions = ['5', '10', '11'] as const

const selectedAccess = (scope: string | null): Set<string> =>
  new Set((scope ?? '').split(/[,/\s]+/).map((value) => value.replace('층', '')).filter(Boolean))

const formatVisitorDate = (value: string | null): string => {
  const match = value?.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/)
  return match ? `${match[1].slice(-2)}/${match[2].padStart(2, '0')}/${match[3].padStart(2, '0')}` : value ?? '-'
}

const periodLabel = (record: VisitorCardRecord): string => {
  if (record.usageStartDate || record.usageEndDate) {
    return [record.usageStartDate, record.usageEndDate].filter(Boolean).map(formatVisitorDate).join(' ~ ')
  }
  const rawDates = record.usagePeriodRaw?.match(/\d{4}[-/.]\d{1,2}[-/.]\d{1,2}/g)
  return rawDates?.map(formatVisitorDate).join(' ~ ') ?? record.usagePeriodRaw ?? '-'
}

const visitorForm = (record: VisitorCardRecord | null, today: string): string => {
  const selected = selectedAccess(record?.accessScope ?? null)
  const action = record ? `/visitor-cards/${record.id}` : '/visitor-cards'
  const periodRaw = record?.usagePeriodRaw ?? ''
  const approval = record?.hasApproval ? 'O' : 'X'
  const accessFields = accessOptions.map((scope) => `<label class="visitor-access-option"><input type="checkbox" name="access${scope}" value="1"${selected.has(scope) ? ' checked' : ''}> ${scope}</label>`).join('')
  return `<form class="asset-form-grid visitor-form" method="post" action="${action}">
    <label>신청자<input name="applicant" value="${escapeHtml(record?.applicant ?? '')}" maxlength="200" required></label>
    <label>기안 여부<select name="hasApproval"><option value="O"${approval === 'O' ? ' selected' : ''}>O</option><option value="X"${approval === 'X' ? ' selected' : ''}>X</option></select></label>
    <label>사용인<input name="cardUser" value="${escapeHtml(record?.cardUser ?? '')}" maxlength="200"></label>
    <label>방문증<input name="visitorBadgeNumber" value="${escapeHtml(record?.visitorBadgeNumber ?? '')}" maxlength="100"></label>
    <label>카드번호<input name="cardNumber" value="${escapeHtml(record?.cardNumber ?? '')}" maxlength="100"></label>
    <label>반출일<input type="date" name="checkoutDate" value="${escapeHtml(record?.checkoutDate ?? today)}"></label>
    <label>반납일<input type="date" name="returnDate" value="${escapeHtml(record?.returnDate ?? '')}"></label>
    <label>사용 시작일<input type="date" name="usageStartDate" value="${escapeHtml(record?.usageStartDate ?? '')}"></label>
    <label>사용 종료일<input type="date" name="usageEndDate" value="${escapeHtml(record?.usageEndDate ?? '')}"></label>
    <input type="hidden" name="usagePeriodRaw" value="${escapeHtml(periodRaw)}">
    <div class="visitor-access-field"><span>출입권한</span><div class="visitor-access-options">${accessFields}</div></div>
    <label class="wide">사유<textarea name="reason" maxlength="1000" rows="2">${escapeHtml(record?.reason ?? '')}</textarea></label>
    <div class="asset-form-actions wide"><button type="submit">${record ? '수정 저장' : '방문증 기록 추가'}</button></div>
  </form>`
}

export function visitorCardsPage(input: {
  result: VisitorCardPage
  query: string
  status: 'all' | 'out' | 'returned'
  today: string
  error: string | null
}): string {
  const rows = input.result.records.map((record) => `<tr>
    <td class="visitor-applicant">${escapeHtml(record.applicant ?? '-')}</td>
    <td><span class="visitor-approval ${record.hasApproval ? 'yes' : 'no'}">${record.hasApproval ? 'O' : 'X'}</span></td>
    <td class="visitor-wrap">${escapeHtml(record.reason ?? '-')}</td>
    <td>${escapeHtml(record.cardUser ?? '-')}</td>
    <td class="visitor-period">${escapeHtml(periodLabel(record))}</td>
    <td>${escapeHtml(record.accessScope ?? '-')}</td>
    <td>${escapeHtml(record.visitorBadgeNumber ?? '-')}</td>
    <td>${escapeHtml(record.cardNumber ?? '-')}</td>
    <td class="visitor-date">${escapeHtml(formatVisitorDate(record.checkoutDate))}</td>
    <td><span class="return-status ${record.returnDate ? 'returned' : 'out'}">${record.returnDate ? escapeHtml(formatVisitorDate(record.returnDateRaw ?? record.returnDate)) : '반출 중'}</span></td>
    <td class="visitor-actions"><details><summary>수정</summary>${visitorForm(record, input.today)}</details></td>
  </tr>`).join('')
  const tab = (value: 'all' | 'out' | 'returned', label: string) => `<a class="tool-tab${input.status === value ? ' active' : ''}" href="/visitor-cards?status=${value}">${label}</a>`
  const error = input.error === 'invalid' ? '<p class="form-error">입력값을 확인해 주세요. 날짜 순서와 필수 항목을 확인해 주세요.</p>' : ''
  return pageLayout('방문증 관리', `${detailHeader('visitors')}
    <main class="shell register-shell"><section class="tool-page-heading"><p class="eyebrow">VISITOR CARD LOG</p><h1>방문증 관리</h1><p class="lead">출입카드의 반출과 반납 기록을 확인하고 직접 등록·수정합니다.</p></section>
    <section class="visitor-entry-panel"><h2>방문증 기록 입력</h2><p class="form-help">기간은 달력에서 선택하고, 출입권한은 복수 선택할 수 있습니다.</p>${error}${visitorForm(null, input.today)}</section>
    <section class="tool-summary"><div><small>전체 기록</small><strong>${input.result.total}건</strong></div><div><small>반출 중</small><strong>${input.result.checkedOut}건</strong></div><div><small>반납 완료</small><strong>${input.result.returned}건</strong></div></section>
    <form class="tool-search" method="get" action="/visitor-cards"><input type="hidden" name="status" value="${input.status}"><label class="sr-only" for="visitor-query">방문증 검색</label><input id="visitor-query" name="q" value="${escapeHtml(input.query)}" maxlength="100" placeholder="신청자, 사용인, 카드번호 또는 사유"><button type="submit">검색</button></form>
    <nav class="tool-tabs" aria-label="반납 상태">${tab('all', '전체')}${tab('out', '반출 중')}${tab('returned', '반납 완료')}</nav>
    <section class="tool-table-panel"><div class="tool-table-wrap"><table class="tool-table visitor-table"><thead><tr><th>신청자</th><th>기안</th><th>사유</th><th>사용인</th><th>사용기간</th><th>출입권한</th><th>방문증</th><th>카드번호</th><th>반출일</th><th>반납일</th><th>관리</th></tr></thead><tbody>${rows || '<tr><td class="tool-empty" colspan="11">조건에 맞는 기록이 없습니다.</td></tr>'}</tbody></table></div></section></main>`)
}
