import type { AnnualScheduleItem, GeneralExpenseEntry, WorkspaceSummary } from '../types'
import { escapeHtml, pageLayout } from './layout'

const recentItems = (summary: WorkspaceSummary): string => {
  if (summary.recentEntries.length === 0) return '<p class="lead">등록된 업무가 없습니다.</p>'
  return `<ul class="recent">${summary.recentEntries
    .map((entry) => `<li>${escapeHtml(entry.content)}</li>`)
    .join('')}</ul>`
}

const shiftMonth = (yearMonth: string, offset: number): string => {
  const year = Number.parseInt(yearMonth.slice(0, 4), 10)
  const month = Number.parseInt(yearMonth.slice(5, 7), 10)
  const shifted = new Date(Date.UTC(year, month - 1 + offset, 1))
  return `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, '0')}`
}

const monthlyScheduleItems = (items: AnnualScheduleItem[], yearMonth: string): AnnualScheduleItem[] => {
  const year = Number.parseInt(yearMonth.slice(0, 4), 10)
  const month = Number.parseInt(yearMonth.slice(5, 7), 10)
  return items.filter((item) => item.scheduleYear === year && item.monthNumber === month)
}

const expenseCalendar = (
  entries: GeneralExpenseEntry[],
  yearMonth: string,
): string => {
  const year = Number.parseInt(yearMonth.slice(0, 4), 10)
  const month = Number.parseInt(yearMonth.slice(5, 7), 10)
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate()
  const byDay = new Map<number, GeneralExpenseEntry[]>()
  for (const entry of entries) {
    const day = Number.parseInt(entry.transferDate.slice(8, 10), 10)
    const current = byDay.get(day) ?? []
    current.push(entry)
    byDay.set(day, current)
  }
  const activeColumns = Array.from({ length: 7 }, (_, column) => entries.some((entry) => {
    const entryDay = Number.parseInt(entry.transferDate.slice(8, 10), 10)
    return (entryDay - 1) % 7 === column
  }))
  const columnTemplate = `62px ${activeColumns.map((active) => active ? 'minmax(220px, 1fr)' : '54px').join(' ')}`
  const calendarMinWidth = 62 + activeColumns.reduce((width, active) => width + (active ? 220 : 54), 0)

  const weekLabels = ['첫째 주', '둘째 주', '셋째 주', '넷째 주', '다섯째 주', '여섯째 주']
  const weeks: string[] = []
  let calendarDay = 1
  let weekIndex = 0
  while (calendarDay <= lastDay) {
    const weekCells: string[] = []
    for (let weekday = 0; weekday < 7; weekday += 1) {
      const day = calendarDay
      calendarDay += 1
      if (day < 1 || day > lastDay) {
        weekCells.push('<div class="expense-day outside" aria-hidden="true"></div>')
        continue
      }
    const dayEntries = byDay.get(day) ?? []
    const entryHtml = dayEntries.map((entry) => {
      const status = entry.isCompleted ? '✓' : '△'
      const statusControl = `<form class="completion-form" method="post" action="/general-expenses/${encodeURIComponent(entry.id)}/toggle"><input type="hidden" name="month" value="${yearMonth}"><button class="completion-toggle ${entry.isCompleted ? 'is-done' : ''}" type="submit" aria-label="${entry.isCompleted ? '미완료로 변경' : '완료로 변경'}">${status}</button></form>`
      const editControl = `<details class="expense-edit"><summary aria-label="총무비용 수정" title="총무비용 수정">✎</summary><form method="post" action="/general-expenses/${encodeURIComponent(entry.id)}"><input type="hidden" name="month" value="${yearMonth}"><label>이체일<input name="transferDate" type="date" value="${escapeHtml(entry.transferDate)}" required></label><label>항목<input name="content" maxlength="500" value="${escapeHtml(entry.content)}" required></label><button type="submit">저장</button></form></details>`
      return `<div class="expense-calendar-item${entry.isCompleted ? ' completed' : ''}">
        <div class="expense-calendar-copy"><span title="${escapeHtml(entry.content)}">${escapeHtml(entry.content)}</span></div><div class="expense-calendar-actions">${editControl}${statusControl}</div>
      </div>`
    }).join('')
      weekCells.push(`<div class="expense-day ${dayEntries.length > 0 ? 'has-items' : 'is-empty'}"><strong>${day}</strong>${entryHtml}</div>`)
    }
    weeks.push(`<div class="expense-week-row"><div class="expense-week-label">${weekLabels[weekIndex]}</div>${weekCells.join('')}</div>`)
    weekIndex += 1
  }

  const previousYear = shiftMonth(yearMonth, -12)
  const nextYear = shiftMonth(yearMonth, 12)
  const monthTabs = Array.from({ length: 12 }, (_, index) => {
    const tabMonth = index + 1
    const tabValue = `${year}-${String(tabMonth).padStart(2, '0')}`
    const selected = tabMonth === month
    return `<a class="expense-month-tab${selected ? ' active' : ''}" href="/?month=${tabValue}#general-expenses"${selected ? ' aria-current="page"' : ''}>${tabMonth}월</a>`
  }).join('')
  return `<section class="expense-calendar" aria-label="${year}년 ${month}월 총무비용 달력">
    <div class="expense-calendar-toolbar"><a href="/?month=${previousYear}#general-expenses">← ${year - 1}년</a><h3>${year}년 총무비용</h3><a href="/?month=${nextYear}#general-expenses">${year + 1}년 →</a></div>
    <nav class="expense-month-tabs" aria-label="${year}년 월 선택">${monthTabs}</nav>
    <div class="expense-legend"><span class="legend-pending">미완료</span><span class="legend-complete">해당 날짜 모두 완료</span></div>
    <div class="expense-calendar-table" style="--expense-columns:${columnTemplate};--expense-min-width:${calendarMinWidth}px"><div class="expense-calendar-grid">${weeks.join('')}</div></div>
  </section>`
}

export function homePage(input: {
  summaries: WorkspaceSummary[]
  weekLabel: string
  expenseEntries: GeneralExpenseEntry[]
  expenseMonth: string
  monthlyPeriod: string
  expenseSuggestions: string[]
  annualSchedule: AnnualScheduleItem[]
}): string {
  const cards = input.summaries.map((summary, index) => `<a class="workspace-card workspace-card-${index + 1}" href="/workspace/${encodeURIComponent(summary.user.id)}">
    <div class="workspace-card-top"><span class="workspace-avatar" aria-hidden="true">${escapeHtml(summary.user.displayName.slice(0, 1))}</span><span class="card-arrow" aria-hidden="true">↗</span></div>
    <div class="card-heading"><h2>${escapeHtml(summary.user.displayName)}</h2></div>
    <div class="counts"><strong class="count">이번 주 ${summary.weeklyTotal}건</strong><strong class="count incomplete">미완료 ${summary.incompleteTotal}건</strong></div>
    ${recentItems(summary)}
  </a>`).join('')
  const suggestions = input.expenseSuggestions.map((value) => `<option value="${escapeHtml(value)}"></option>`).join('')
  const monthlyItems = monthlyScheduleItems(input.annualSchedule, input.monthlyPeriod)
  const monthlyMonth = Number.parseInt(input.monthlyPeriod.slice(5, 7), 10)
  const monthlyWork = monthlyItems.length === 0
    ? '<p class="home-monthly-empty">등록된 월간업무가 없습니다.</p>'
    : `<div class="home-monthly-items">${monthlyItems.map((item) => {
      const category = [item.majorCategory, item.subcategory, item.task].filter(Boolean).join(' · ')
      const status = item.isCompleted ? 'is-completed' : ''
      const label = item.isCompleted ? '미완료로 변경' : '완료로 변경'
      return `<div id="monthly-work-${escapeHtml(item.id)}" class="home-monthly-item ${status}"><i></i><span><strong>${escapeHtml(item.detail || item.task)}</strong><small>${escapeHtml(category)}</small></span><form class="home-monthly-toggle" method="post" action="/annual-schedule/${encodeURIComponent(item.id)}/toggle"><input type="hidden" name="month" value="${escapeHtml(input.expenseMonth)}"><button class="home-monthly-toggle-button" type="submit" aria-pressed="${item.isCompleted ? 'true' : 'false'}" aria-label="${label}" title="${label}">${item.isCompleted ? '✓' : '△'}</button></form></div>`
    }).join('')}</div>`
  const editPanel = `<form class="team-expense-create" method="post" action="/general-expenses">
        <input type="hidden" name="requestId" value="${crypto.randomUUID()}"><input type="hidden" name="month" value="${input.expenseMonth}">
        <div><label for="expense-date">자금이체일</label><input id="expense-date" name="transferDate" type="date" required></div>
        <div class="grow"><label for="expense-content">총무비용 항목</label><input id="expense-content" name="content" list="team-expense-options" maxlength="500" required placeholder="입력하면 기존 항목이 추천됩니다"></div>
        <button type="submit">추가</button>
      </form>`

  return pageLayout(
    'TEAM WORKSPACE',
    `<header class="topbar home-topbar"><div class="home-header-inner"><a class="home-brand" href="/"><span class="home-brand-mark">HR</span><span>PEOPLE GARDEN</span></a><div class="home-actions"><span>알림</span><b>C</b></div></div></header>
    <main class="shell team-home">
      <section class="c-home-hero">
        <div class="c-home-hero-copy"><h1>TEAM WORKSPACE</h1>
        <p>업무와 자산, 꼭 필요한 일정을 쉽고 편하게 찾아보는 인사총무팀 공간입니다.</p>
        <a class="home-manual-shortcut" href="/manual">업무매뉴얼 바로가기 <span aria-hidden="true">↗</span></a></div>
      </section>
      <nav class="c-home-shortcuts" aria-label="주요 메뉴">
        <a class="active" href="#team-workspaces" aria-current="page">업무공간</a>
        <details class="home-menu-group"><summary>채용·입사</summary><div>
          <a href="/recruitment?area=onboarding">입사 체크리스트</a><a href="/recruitment?area=resume">이력서 송부 체크</a><a href="/recruitment?area=interview">면접 일정</a><a href="/recruitment?area=executive">경영진면접</a>
        </div></details>
        <details class="home-menu-group"><summary>총무관리</summary><div>
          <a href="/?month=${input.expenseMonth}#general-expenses">총무비용</a><a href="/assets">자산관리대장</a><a href="/visitor-cards">방문증 관리</a><a href="/patents">특허관리</a>
        </div></details>
      </nav>
      <div class="c-home-content" id="team-workspaces">
        <section><div class="portal-section-heading"><div><span>TEAM</span><h2>팀 업무공간</h2></div><small>수정할 때만 비밀번호가 필요합니다.</small></div>
        <div class="workspace-grid" aria-label="팀원 업무공간">${cards}</div></section>
        <aside class="c-home-aside"><div class="home-monthly-meta"><h2>월간업무</h2><small>${monthlyMonth}월 · ${monthlyItems.length}건</small></div>${monthlyWork}</aside>
      </div>
      <section class="team-expense-section" id="general-expenses">
        <div class="section-heading"><div><h2>총무비용 캘린더</h2><p>날짜와 관계없이 실제 처리 여부를 직접 체크합니다.</p></div><span>이달 ${input.expenseEntries.length}건</span></div>
        <datalist id="team-expense-options">${suggestions}</datalist>${editPanel}
        ${expenseCalendar(input.expenseEntries, input.expenseMonth)}
      </section>
    </main>
    <footer class="shell footer"><span>이력·로그는 화면 앞쪽에 표시하지 않고 내부 기록으로 보관합니다.</span></footer>`,
  )
}
