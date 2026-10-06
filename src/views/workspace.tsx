import type { AnnualScheduleItem, GeneralExpenseEntry, User, WorkCadence, WorkEntry, WorkEntryPage } from '../types'
import { detailHeader, escapeHtml, pageLayout } from './layout'

export type WorkspaceView = WorkCadence | null

const periodLabel = (entry: WorkEntry): string => {
  if (entry.cadence === 'daily') return entry.workDate?.slice(5).replace('-', '.') ?? '날짜 없음'
  if (entry.cadence === 'weekly') {
    const month = entry.periodMonth ? `${entry.periodMonth}월` : ''
    return [month, entry.weekLabel ?? '주 미지정'].filter(Boolean).join(' · ')
  }
  if (entry.cadence === 'monthly') {
    return [entry.periodYear ? `${entry.periodYear}년` : '', entry.periodMonth ? `${entry.periodMonth}월` : '']
      .filter(Boolean).join(' ') || '월 미지정'
  }
  if (entry.cadence === 'yearly') return entry.periodYear ? `${entry.periodYear}년` : '연도 미지정'
  return '기간 미지정'
}

const dateCell = (entry: WorkEntry): string => {
  if (!entry.workDate) return escapeHtml(periodLabel(entry))
  const year = Number.parseInt(entry.workDate.slice(0, 4), 10)
  const month = Number.parseInt(entry.workDate.slice(5, 7), 10)
  const day = Number.parseInt(entry.workDate.slice(8, 10), 10)
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][new Date(Date.UTC(year, month - 1, day)).getUTCDay()]
  return escapeHtml(`${month}/${day}(${weekday})`)
}

const weekKey = (workDate: string | null): string | null => {
  if (!workDate) return null
  const date = new Date(`${workDate}T00:00:00Z`)
  const daysFromMonday = (date.getUTCDay() + 6) % 7
  date.setUTCDate(date.getUTCDate() - daysFromMonday)
  return date.toISOString().slice(0, 10)
}

const endsDisplayedWeek = (entries: WorkEntry[], index: number): boolean => {
  const currentWeek = weekKey(entries[index]?.workDate ?? null)
  const nextWeek = weekKey(entries[index + 1]?.workDate ?? null)
  return currentWeek !== null && nextWeek !== null && currentWeek !== nextWeek
}

const statusIcon = (entry: WorkEntry): string =>
  `<span class="completion-icon ${entry.isCompleted ? 'is-done' : ''}" role="img" aria-label="${entry.isCompleted ? '완료' : '진행 중'}" title="${entry.isCompleted ? '완료' : '진행 중'}">${entry.isCompleted ? '✓' : '△'}</span>`

const completionControl = (
  ownerId: string,
  entry: WorkEntry,
  isUnlocked: boolean,
  monthlyPeriod: string,
  activeView: WorkspaceView,
  page: number,
): string => {
  if (!isUnlocked) return statusIcon(entry)
  return `<form class="completion-form" method="post" action="/workspace/${encodeURIComponent(ownerId)}/entries/${encodeURIComponent(entry.id)}/toggle">
    <input type="hidden" name="month" value="${escapeHtml(monthlyPeriod)}"><input type="hidden" name="view" value="${escapeHtml(activeView ?? 'all')}"><input type="hidden" name="page" value="${page}">
    <button class="completion-toggle ${entry.isCompleted ? 'is-done' : ''}" type="submit" aria-label="${entry.isCompleted ? '미완료로 변경' : '완료로 변경'}" title="${entry.isCompleted ? '완료됨' : '진행 중'}">${entry.isCompleted ? '✓' : '△'}</button>
  </form>`
}

const categoryOptions = (currentCategory: string | null, categories: string[]): string => {
  const current = currentCategory?.trim() ?? ''
  const values = current && !categories.includes(current) ? [current, ...categories] : categories
  return `<option value=""${current === '' ? ' selected' : ''}>분류 없음</option>${values.map((category) =>
    `<option value="${escapeHtml(category)}"${category === current ? ' selected' : ''}>${escapeHtml(category)}</option>`,
  ).join('')}`
}

const expenseOptions = (entries: GeneralExpenseEntry[]): string => {
  const byDay = new Map<number, GeneralExpenseEntry[]>()
  for (const entry of entries) {
    const day = Number.parseInt(entry.transferDate.slice(8, 10), 10)
    byDay.set(day, [...(byDay.get(day) ?? []), entry])
  }
  return `<button class="expense-entry-direct" type="button" onclick="const t=this.form.querySelector('[name=content]');if(t)t.focus();this.closest('details').open=false">직접 입력</button>${[...byDay].map(([day, expenses]) =>
    `<section class="expense-entry-group"><h3>${day}일</h3>${expenses.map((entry) => `<button type="button" data-value="${escapeHtml(entry.content)}" onclick="const t=this.form.querySelector('[name=content]');if(t)t.value=this.dataset.value;this.closest('details').open=false">${escapeHtml(entry.content)}</button>`).join('')}</section>`,
  ).join('')}`
}

const isExpenseCategory = (category: string | null | undefined): boolean =>
  category === '총무' || category === '총무비용'

const expensePicker = (entries: GeneralExpenseEntry[], visible = false): string =>
  `<details class="expense-entry-picker"${visible ? '' : ' hidden'}><summary>총무비용 항목 선택</summary><div class="expense-entry-options">${expenseOptions(entries)}</div></details>`

const trashIcon = '<svg aria-hidden="true" viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 5.5h13M7 5.5V3.8h6v1.7m-8.2 0 .8 11h8.8l.8-11M8 8.5v5.5m4-5.5v5.5"/></svg>'

const monthlyCategoryControl = (
  ownerId: string,
  period: string,
  entry: WorkEntry,
  categories: string[],
  isUnlocked: boolean,
): string => {
  const label = escapeHtml(entry.category ?? '분류 없음')
  if (!isUnlocked) return label
  return `<form class="monthly-category-form" method="post" action="/workspace/${encodeURIComponent(ownerId)}/monthly-entries/${encodeURIComponent(entry.id)}">
    <input type="hidden" name="period" value="${escapeHtml(period)}"><input type="hidden" name="content" value="${escapeHtml(entry.content)}">
    <select name="category" aria-label="월간업무 분류 수정" title="분류 수정" onchange="this.form.requestSubmit()">${categoryOptions(entry.category, categories)}</select>
  </form>`
}

const categoryControl = (
  ownerId: string,
  entry: WorkEntry,
  categories: string[],
  isUnlocked: boolean,
): string => {
  if (!isUnlocked || entry.cadence !== 'daily' || !entry.workDate) {
    return `<span class="category-cell-label">${escapeHtml(entry.category ?? '분류 없음')}</span>`
  }
  return `<form class="inline-category-form" method="post" action="/workspace/${encodeURIComponent(ownerId)}/entries/${encodeURIComponent(entry.id)}">
    <input type="hidden" name="workDate" value="${escapeHtml(entry.workDate)}">
    <input type="hidden" name="deadlineDate" value="${escapeHtml(entry.deadlineDate ?? '')}">
    <input type="hidden" name="content" value="${escapeHtml(entry.content)}">
    <select name="category" aria-label="분류" onchange="this.form.requestSubmit()">${categoryOptions(entry.category, categories)}</select>
  </form>`
}

const dateEditControl = (ownerId: string, entry: WorkEntry, isUnlocked: boolean): string => {
  if (!isUnlocked || entry.cadence !== 'daily' || !entry.workDate) return ''
  return `<details class="inline-entry-edit date-entry-edit">
    <summary aria-label="업무일 수정" title="업무일 수정">✎</summary>
    <form method="post" action="/workspace/${encodeURIComponent(ownerId)}/entries/${encodeURIComponent(entry.id)}">
      <input type="hidden" name="deadlineDate" value="${escapeHtml(entry.deadlineDate ?? '')}">
      <input type="hidden" name="category" value="${escapeHtml(entry.category ?? '')}">
      <input type="hidden" name="content" value="${escapeHtml(entry.content)}">
      <label class="sr-only" for="date-${escapeHtml(entry.id)}">업무일</label>
      <input id="date-${escapeHtml(entry.id)}" name="workDate" type="date" value="${escapeHtml(entry.workDate)}" required>
      <button type="submit">저장</button>
    </form>
  </details>`
}

const contentEditControl = (ownerId: string, entry: WorkEntry, expenses: GeneralExpenseEntry[], isUnlocked: boolean): string => {
  if (!isUnlocked || entry.cadence !== 'daily' || !entry.workDate) return ''
  return `<details class="inline-entry-edit content-entry-edit">
    <summary aria-label="업무 내용 수정" title="업무 내용 수정">✎</summary>
    <form method="post" action="/workspace/${encodeURIComponent(ownerId)}/entries/${encodeURIComponent(entry.id)}">
      <input type="hidden" name="workDate" value="${escapeHtml(entry.workDate)}">
      <input type="hidden" name="deadlineDate" value="${escapeHtml(entry.deadlineDate ?? '')}">
      <input type="hidden" name="category" value="${escapeHtml(entry.category ?? '')}">
      <label class="sr-only" for="content-${escapeHtml(entry.id)}">업무 내용</label>
      <textarea id="content-${escapeHtml(entry.id)}" name="content" required maxlength="2000">${escapeHtml(entry.content)}</textarea>
      ${expensePicker(expenses, isExpenseCategory(entry.category))}
      <button type="submit">저장</button>
    </form>
  </details>`
}

const deadlineEditControl = (ownerId: string, entry: WorkEntry, isUnlocked: boolean): string => {
  if (!isUnlocked || entry.cadence !== 'daily' || !entry.workDate) return ''
  return `<details class="inline-entry-edit deadline-entry-edit">
    <summary aria-label="마감일 수정" title="마감일 수정">✎</summary>
    <form method="post" action="/workspace/${encodeURIComponent(ownerId)}/entries/${encodeURIComponent(entry.id)}">
      <input type="hidden" name="workDate" value="${escapeHtml(entry.workDate)}">
      <input type="hidden" name="category" value="${escapeHtml(entry.category ?? '')}">
      <input type="hidden" name="content" value="${escapeHtml(entry.content)}">
      <label class="sr-only" for="deadline-${escapeHtml(entry.id)}">마감일</label>
      <input id="deadline-${escapeHtml(entry.id)}" name="deadlineDate" type="date" value="${escapeHtml(entry.deadlineDate ?? '')}">
      <button type="submit">저장</button>
    </form>
  </details>`
}

const memoControl = (ownerId: string, entry: WorkEntry, isUnlocked: boolean): string => {
  const memoText = entry.memo?.trim() ? escapeHtml(entry.memo) : '메모'
  if (!isUnlocked) return `<span class="memo-text" title="${memoText}">${memoText}</span>`
  return `<div class="memo-line"><span class="memo-text" title="${memoText}">${memoText}</span><details class="entry-memo">
    <summary aria-label="메모 수정" title="메모 수정">✎</summary>
    <form method="post" action="/workspace/${encodeURIComponent(ownerId)}/entries/${encodeURIComponent(entry.id)}/memo"><label class="sr-only" for="memo-${escapeHtml(entry.id)}">업무 메모</label><textarea id="memo-${escapeHtml(entry.id)}" name="memo" maxlength="2000" placeholder="필요한 내용을 메모하세요">${escapeHtml(entry.memo ?? '')}</textarea><button type="submit">저장</button></form>
  </details></div>`
}

const moveControl = (ownerId: string, entry: WorkEntry, isUnlocked: boolean, monthlyPeriod: string): string => {
  if (!isUnlocked) return ''
  return `<details class="move-entry">
    <summary aria-label="업무 이동" title="업무 이동">→</summary>
    <form method="post" action="/workspace/${encodeURIComponent(ownerId)}/entries/${encodeURIComponent(entry.id)}/move">
      <label class="sr-only" for="move-${escapeHtml(entry.id)}">이동할 목록</label>
      <select id="move-${escapeHtml(entry.id)}" name="target" required>
        <option value="monthly">월간업무</option>
        <option value="undated">기간 미지정</option>
      </select>
      <label class="sr-only" for="move-period-${escapeHtml(entry.id)}">이동할 월</label>
      <input id="move-period-${escapeHtml(entry.id)}" name="period" type="month" value="${escapeHtml(monthlyPeriod)}">
      <button type="submit">이동</button>
    </form>
  </details>`
}

const deadlineBadge = (entry: WorkEntry): string => {
  if (!entry.deadlineDate) return ''
  const today = new Date().toISOString().slice(0, 10)
  const overdue = !entry.isCompleted && entry.deadlineDate < today
  return `<span class="deadline-badge${overdue ? ' overdue' : ''}">마감 ${escapeHtml(entry.deadlineDate.slice(5).replace('-', '.'))}${overdue ? ' · 지남' : ''}</span>`
}

const monthlyEntryActions = (
  ownerId: string,
  period: string,
  entry: WorkEntry,
  isUnlocked: boolean,
): string => {
  if (!isUnlocked) return ''
  const encodedOwnerId = encodeURIComponent(ownerId)
  const encodedEntryId = encodeURIComponent(entry.id)
  const editId = `monthly-entry-content-${entry.id}`
  return `<div class="monthly-entry-actions">
    <details class="monthly-entry-edit">
      <summary aria-label="월간업무 수정" title="월간업무 수정">✎</summary>
      <form method="post" action="/workspace/${encodedOwnerId}/monthly-entries/${encodedEntryId}">
        <input type="hidden" name="period" value="${escapeHtml(period)}">
        <input type="hidden" name="category" value="${escapeHtml(entry.category ?? '')}">
        <label for="${editId}">업무 내용<textarea id="${editId}" name="content" required maxlength="2000" rows="5">${escapeHtml(entry.content)}</textarea></label>
        <div class="monthly-entry-edit-actions"><button type="submit">저장</button><button type="button" class="secondary" onclick="this.closest('details').open=false">닫기</button></div>
      </form>
    </details>
    <form method="post" action="/workspace/${encodedOwnerId}/monthly-entries/${encodedEntryId}/delete" onsubmit="return confirm('이 월간업무를 삭제하시겠습니까?')">
      <input type="hidden" name="period" value="${escapeHtml(period)}">
      <button type="submit" class="monthly-entry-delete icon-button" aria-label="월간업무 삭제" title="월간업무 삭제">${trashIcon}</button>
    </form>
  </div>`
}

const planList = (
  ownerId: string,
  period: string,
  entries: WorkEntry[],
  categories: string[],
  isUnlocked: boolean,
  emptyText: string,
): string => {
  if (entries.length === 0) return `<p class="empty-plan">${emptyText}</p>`
  return `<div class="plan-table"><div class="plan-table-head" aria-hidden="true"><span>분류</span><span>업무 내용</span></div><ul class="plan-list">${entries.map((entry) => `<li>
    <span class="plan-category">${monthlyCategoryControl(ownerId, period, entry, categories, isUnlocked)}</span>
    <div class="plan-copy"><span>${escapeHtml(entry.content)}</span>${monthlyEntryActions(ownerId, period, entry, isUnlocked)}</div>
  </li>`).join('')}</ul></div>`
}

const annualSchedule = (items: AnnualScheduleItem[]): string => {
  if (items.length === 0) return `<details class="annual-schedule"><summary><strong>연간업무 확인</strong><span>일정 데이터 없음</span></summary></details>`
  const grouped = new Map<string, { category: string; task: string; months: Map<number, string[]>; sort: number }>()
  for (const item of items) {
    const category = [item.majorCategory, item.subcategory].filter(Boolean).join(' / ') || '기타'
    const key = `${category}\u0000${item.task}`
    const row = grouped.get(key) ?? { category, task: item.task, months: new Map(), sort: item.sortOrder }
    const details = row.months.get(item.monthNumber) ?? []
    details.push(item.detail)
    row.months.set(item.monthNumber, details)
    grouped.set(key, row)
  }
  const rows = [...grouped.values()].sort((a, b) => a.sort - b.sort).map((row) => `<tr><th scope="row">${escapeHtml(row.category)}</th><td>${escapeHtml(row.task)}</td>${Array.from({ length: 12 }, (_, index) => `<td>${(row.months.get(index + 1) ?? []).map((detail) => escapeHtml(detail)).join('<br>')}</td>`).join('')}</tr>`).join('')
  const year = items[0]?.scheduleYear
  return `<details class="annual-schedule"><summary><strong>연간업무 확인</strong><span>${year}년 주요 일정을 펼쳐서 확인하세요</span></summary><div class="annual-schedule-wrap"><table><thead><tr><th>분류</th><th>주요 업무</th>${Array.from({ length: 12 }, (_, index) => `<th>${index + 1}월</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div></details>`
}

const filterLink = (
  ownerId: string,
  query: string,
  isActive: boolean,
  label: string,
  monthlyPeriod: string,
): string => {
  const separator = query === '' ? '?' : '&'
  return `<a class="filter-link${isActive ? ' active' : ''}" href="/workspace/${encodeURIComponent(ownerId)}${query}${separator}month=${monthlyPeriod}">${label}</a>`
}

const monthlyNavigation = (ownerId: string, yearMonth: string, label: string): string => {
  const year = Number.parseInt(yearMonth.slice(0, 4), 10)
  const month = Number.parseInt(yearMonth.slice(5, 7), 10)
  const monthTabs = Array.from({ length: 12 }, (_, index) => {
    const tabMonth = index + 1
    const tabPeriod = `${year}-${String(tabMonth).padStart(2, '0')}`
    const selected = tabMonth === month
    return `<a class="workspace-month-tab${selected ? ' active' : ''}" href="/workspace/${encodeURIComponent(ownerId)}?month=${tabPeriod}"${selected ? ' aria-current="page"' : ''}>${tabMonth}월</a>`
  }).join('')
  return `<div class="workspace-month-nav"><a href="/workspace/${encodeURIComponent(ownerId)}?month=${year - 1}-${String(month).padStart(2, '0')}">← ${year - 1}년</a><h2 class="month-title">${escapeHtml(label)}</h2><a href="/workspace/${encodeURIComponent(ownerId)}?month=${year + 1}-${String(month).padStart(2, '0')}">${year + 1}년 →</a></div>
    <nav class="workspace-month-tabs" aria-label="${year}년 월간업무 월 선택">${monthTabs}</nav>`
}

export function workspacePage(input: {
  owner: User
  entryPage: WorkEntryPage
  monthlyEntries: WorkEntry[]
  monthlyLabel: string
  monthlyPeriod: string
  categories: string[]
  annualSchedule: AnnualScheduleItem[]
  generalExpenses: GeneralExpenseEntry[]
  today: string
  activeView: WorkspaceView
  editUnlockedUntil: number | null
}): string {
  const isUnlocked = input.editUnlockedUntil !== null && input.editUnlockedUntil > Date.now()
  const status = isUnlocked ? '수정 가능' : '잠김 · 조회 전용'
  const items = input.entryPage.entries.length
    ? `<div class="work-table"><div class="work-table-head" aria-hidden="true"><span>날짜</span><span>분류</span><span>업무 내용</span><span>메모</span><span>마감</span><span>완료</span><span>이동</span><span>삭제</span></div>
      <ul class="work-list">${input.entryPage.entries.map((entry, index) => `<li id="work-entry-${escapeHtml(entry.id)}" class="work-item ${entry.isCompleted ? 'completed' : ''}${endsDisplayedWeek(input.entryPage.entries, index) ? ' week-boundary' : ''}">
        <div class="work-date"><time${entry.workDate ? ` datetime="${escapeHtml(entry.workDate)}"` : ''}>${dateCell(entry)}</time>${dateEditControl(input.owner.id, entry, isUnlocked)}</div>
        <div class="work-category-cell">${categoryControl(input.owner.id, entry, input.categories, isUnlocked)}</div>
        <div class="work-main">
          <span class="work-content" title="${escapeHtml(entry.content)}">${escapeHtml(entry.content)}</span>
          ${contentEditControl(input.owner.id, entry, input.generalExpenses, isUnlocked)}
          ${entry.needsReview ? '<div class="work-labels"><span class="review-badge">검토 필요</span></div>' : ''}
        </div>
        <div class="work-tools">
          ${memoControl(input.owner.id, entry, isUnlocked)}
        </div>
        <div class="work-deadline-cell"><span>${deadlineBadge(entry)}</span>${deadlineEditControl(input.owner.id, entry, isUnlocked)}</div>
        ${completionControl(input.owner.id, entry, isUnlocked, input.monthlyPeriod, input.activeView, input.entryPage.page)}
        <div class="work-move-cell">${moveControl(input.owner.id, entry, isUnlocked, input.monthlyPeriod)}</div>
        <div class="work-delete-cell">${isUnlocked ? `<form method="post" action="/workspace/${encodeURIComponent(input.owner.id)}/entries/${encodeURIComponent(entry.id)}/delete" onsubmit="return confirm('이 업무를 삭제하시겠습니까?')"><input type="hidden" name="month" value="${escapeHtml(input.monthlyPeriod)}"><input type="hidden" name="view" value="${input.activeView ?? 'all'}"><input type="hidden" name="page" value="${input.entryPage.page}"><button class="icon-button work-entry-delete" type="submit" aria-label="업무목록에서 삭제" title="업무 삭제">${trashIcon}</button></form>` : ''}</div>
      </li>`).join('')}</ul></div>`
    : '<p class="empty-plan">등록된 업무가 없습니다.</p>'


  const unlockPanel = !isUnlocked
    ? `<section class="unlock-strip" aria-label="업무공간 잠금 상태">
        <div><strong>🔒 잠김 · 조회 전용</strong><span>월간업무의 수정·삭제와 업무목록 편집 버튼은 잠금 해제 후 표시됩니다.</span></div>
        <form method="post" action="/workspace/${encodeURIComponent(input.owner.id)}/unlock">
          <label class="sr-only" for="workspace-password">업무공간 비밀번호</label>
          <input id="workspace-password" name="password" type="password" autocomplete="current-password" required maxlength="200" placeholder="수정 비밀번호">
          <button type="submit">잠금 해제하고 수정하기</button>
        </form>
      </section>`
    : ''

  const editPanel = isUnlocked
    ? `<section class="create-strip">
        <form method="post" action="/workspace/${encodeURIComponent(input.owner.id)}/entries">
          <input type="hidden" name="requestId" value="${crypto.randomUUID()}">
          <div><label for="new-date">업무일</label><input id="new-date" name="workDate" type="date" value="${escapeHtml(input.today)}" required></div>
          <div><label for="new-deadline">마감일 <small>선택</small></label><input id="new-deadline" name="deadlineDate" type="date"></div>
          <div><label for="new-category">분류</label><select id="new-category" name="category" onchange="const show=['총무','총무비용'].includes(this.value);const p=this.form.querySelector('.expense-entry-picker');if(p){p.hidden=!show;p.open=false}const c=this.form.querySelector('.expense-entry-composer');if(c)c.classList.toggle('has-expense-picker',show)">${categoryOptions(null, input.categories)}</select></div>
          <div class="expense-entry-composer"><div class="grow"><label for="new-content">새 업무</label><input id="new-content" name="content" required maxlength="500" placeholder="업무 내용을 입력하세요"></div>${expensePicker(input.generalExpenses)}</div>
          <button type="submit">추가</button>
        </form><details class="category-manager"><summary>분류 추가</summary><form method="post" action="/workspace/${encodeURIComponent(input.owner.id)}/categories"><label class="sr-only" for="category-name">새 분류명</label><input id="category-name" name="name" maxlength="100" required placeholder="새 분류명"><button type="submit">추가</button></form></details>
      </section>`
    : ''

  const monthlyCreate = isUnlocked
    ? `<form class="monthly-entry-create" method="post" action="/workspace/${encodeURIComponent(input.owner.id)}/monthly-entries"><input type="hidden" name="requestId" value="${crypto.randomUUID()}"><input type="hidden" name="period" value="${escapeHtml(input.monthlyPeriod)}"><label class="sr-only" for="monthly-category">분류</label><select id="monthly-category" name="category">${categoryOptions(null, input.categories)}</select><label class="sr-only" for="monthly-content">월간업무</label><input id="monthly-content" name="content" maxlength="500" required placeholder="이 달의 업무를 입력하세요"><button type="submit">월간업무 추가</button></form>`
    : ''

  const totalPages = Math.max(1, Math.ceil(input.entryPage.total / input.entryPage.pageSize))
  const viewValue = input.activeView ?? 'all'
  const previous = input.entryPage.page > 1
    ? `<a class="button secondary" href="/workspace/${encodeURIComponent(input.owner.id)}?view=${viewValue}&page=${input.entryPage.page - 1}&month=${input.monthlyPeriod}">이전</a>` : ''
  const next = input.entryPage.page < totalPages
    ? `<a class="button secondary" href="/workspace/${encodeURIComponent(input.owner.id)}?view=${viewValue}&page=${input.entryPage.page + 1}&month=${input.monthlyPeriod}">다음</a>` : ''
  const pagination = input.entryPage.total > input.entryPage.pageSize
    ? `<nav class="pagination" aria-label="업무 목록 페이지">${previous}<span>${input.entryPage.page} / ${totalPages}</span>${next}</nav>` : ''

  const filters = `<nav class="work-filters" aria-label="업무 목록 구분">
    ${filterLink(input.owner.id, '', input.activeView === 'daily', '일일업무', input.monthlyPeriod)}
    ${filterLink(input.owner.id, '?view=undated', input.activeView === 'undated', '기간 미지정', input.monthlyPeriod)}
    ${filterLink(input.owner.id, '?view=all', input.activeView === null, '전체', input.monthlyPeriod)}
  </nav>`

  return pageLayout(
    `${input.owner.displayName} 업무공간`,
    `${detailHeader('workspaces')}
    <main class="shell workspace-shell">
      <section class="workspace-hero">
        <span class="workspace-hero-avatar" aria-hidden="true">${escapeHtml(input.owner.displayName.slice(0, 1))}</span>
        <div><a class="back" href="/">← 전체 업무공간</a><p class="eyebrow">PERSONAL WORKSPACE</p><h1>${escapeHtml(input.owner.displayName)} 업무공간</h1></div>
        <span class="${isUnlocked ? 'status' : 'status readonly'}">${status}</span>
      </section>
      ${annualSchedule(input.annualSchedule)}
      ${unlockPanel}
      <section class="planning-board" aria-label="월별 업무">
        <article class="monthly-plan">${monthlyNavigation(input.owner.id, input.monthlyPeriod, input.monthlyLabel)}${monthlyCreate}${planList(input.owner.id, input.monthlyPeriod, input.monthlyEntries, input.categories, isUnlocked, '이 달에 등록된 업무가 없습니다.')}</article>
      </section>
      ${editPanel}
      <section class="work-section">
        <div class="section-heading"><h2>업무목록</h2><span>총 ${input.entryPage.total}건</span></div>
        ${filters}${items}${pagination}
      </section>
    </main>
    <footer class="shell footer"><span>이력·로그는 내부 기록으로 보관합니다.</span></footer>`,
  )
}








