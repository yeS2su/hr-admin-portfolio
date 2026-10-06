import type { PatentPage, PatentWorkflowStatus } from '../types'
import { detailHeader, escapeHtml, pageLayout } from './layout'

const workflowStatusLabel: Record<PatentWorkflowStatus, string> = {
  draft_needed: '기안 필요', drafting: '기안중', drafted: '기안완료', paid: '납부완료',
}

const workflowStatuses: PatentWorkflowStatus[] = ['draft_needed', 'drafting', 'drafted', 'paid']

export function patentsPage(input: { result: PatentPage; query: string; year: number | null }): string {
  const years = [2023, 2024, 2025, 2026, 2027]
  const tabs = years.map((year) => `<a class="tool-tab${input.year === year ? ' active' : ''}" href="/patents?year=${year}">${year}년</a>`).join('')
  const rows = input.result.records.map((record) => `<tr>
    <td>${escapeHtml(record.title)}</td>
    <td>${escapeHtml(record.registrationNumber)}</td><td>${record.feeYear}년</td>
    <td>${escapeHtml(record.deadlineRaw ?? '-')}</td><td>${escapeHtml(record.installment ?? '-')}</td>
    <td class="money">${record.amount === null ? '-' : `${record.amount.toLocaleString('ko-KR')}원`}</td>
    <td><form class="patent-status-form" method="post" action="/patents/${encodeURIComponent(record.patentId)}/${record.feeYear}/status">
      <label class="sr-only" for="patent-status-${escapeHtml(record.patentId)}-${record.feeYear}">${escapeHtml(record.title)} ${record.feeYear}년 상태</label>
      <select id="patent-status-${escapeHtml(record.patentId)}-${record.feeYear}" name="status">${workflowStatuses.map((status) => `<option value="${status}"${record.workflowStatus === status ? ' selected' : ''}>${workflowStatusLabel[status]}</option>`).join('')}</select>
      <button type="submit">저장</button>
    </form>${record.note ? `<small>${escapeHtml(record.note)}</small>` : ''}</td>
  </tr>`).join('')
  return pageLayout('특허관리', `${detailHeader('patents')}
    <main class="shell register-shell"><section class="tool-page-heading"><p class="eyebrow">PATENT REGISTER</p><h1>특허관리</h1><p class="lead">특허별 연차등록료와 납부 현황을 확인합니다.</p></section>
    <section class="tool-summary"><div><small>조회 특허</small><strong>${input.result.totalPatents}건</strong></div><div><small>등록료 합계</small><strong>${input.result.totalAmount.toLocaleString('ko-KR')}원</strong></div><div><small>확인 필요</small><strong>${input.result.pendingCount}건</strong></div></section>
    <form class="tool-search" method="get" action="/patents"><input type="hidden" name="year" value="${input.year ?? 'all'}"><label class="sr-only" for="patent-query">특허 검색</label><input id="patent-query" name="q" value="${escapeHtml(input.query)}" maxlength="100" placeholder="특허명 또는 등록번호"><button type="submit">검색</button></form>
    <nav class="tool-tabs" aria-label="납부 연도">${tabs}<a class="tool-tab${input.year === null ? ' active' : ''}" href="/patents?year=all">전체</a></nav>
    <section class="tool-table-panel"><div class="tool-table-wrap"><table class="tool-table patent-table"><thead><tr><th>특허명</th><th>등록번호</th><th>연도</th><th>납부기한</th><th>납부연차</th><th>연차등록료</th><th>상태</th></tr></thead><tbody>${rows || '<tr><td class="tool-empty" colspan="7">조건에 맞는 특허가 없습니다.</td></tr>'}</tbody></table></div></section></main>`)
}
