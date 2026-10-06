import type { InterviewCoordinationRow, InterviewCoordinationView } from '../types'
import { detailHeader, escapeHtml, pageLayout } from './layout'

const viewLabels: Record<InterviewCoordinationView, string> = {
  departments: '부서별 일정 조율',
  confirmed: '확정 일정',
  blacklist: '블랙리스트',
}

const rowCells = (cells: string[], limit: number): string => Array.from({ length: limit }, (_, index) => `<td>${escapeHtml(cells[index] ?? '')}</td>`).join('')

const rowEdit = (row: InterviewCoordinationRow, view: InterviewCoordinationView): string => `<td class="grid-row-actions"><details class="grid-row-edit"><summary>수정</summary><form method="post" action="/interview-coordination/${encodeURIComponent(row.id)}"><input type="hidden" name="view" value="${view}"><label for="coordination-cells-${encodeURIComponent(row.id)}">행 내용 <small>Tab으로 열 구분</small></label><textarea id="coordination-cells-${encodeURIComponent(row.id)}" name="cells" rows="4" maxlength="20000" required>${escapeHtml(row.cells.join('\t'))}</textarea><button type="submit">저장</button></form></details></td>`

export function interviewCoordinationPage(input: {
  view: InterviewCoordinationView
  rows: InterviewCoordinationRow[]
  query: string
  error: string | null
}): string {
  const tabs = (Object.keys(viewLabels) as InterviewCoordinationView[]).map((view) => `<a class="recruitment-tab${view === input.view ? ' active' : ''}" href="/interview-coordination?view=${view}">${viewLabels[view]}</a>`).join('')
  const maxColumns = Math.min(60, Math.max(1, ...input.rows.map((row) => row.cells.length)))
  const sheets = new Map<string, InterviewCoordinationRow[]>()
  for (const row of input.rows) {
    const current = sheets.get(row.sourceSheet) ?? []
    current.push(row)
    sheets.set(row.sourceSheet, current)
  }
  const tables = Array.from(sheets.entries()).map(([sheet, rows]) => {
    const header = rows.find((row) => row.rowKind === 'header')
    const dataRows = rows.filter((row) => row.rowKind !== 'header')
    return `<section class="manual-sheet"><div class="manual-sheet-heading"><div><span class="manual-category-label">면접일정 조율</span><h2>${escapeHtml(sheet)}</h2></div><small>${dataRows.length}행</small></div><div class="recruitment-table-wrap"><table class="recruitment-table"><thead><tr><th>상태</th>${rowCells(header?.cells ?? [], maxColumns).replaceAll('<td>', '<th>').replaceAll('</td>', '</th>')}<th>관리</th></tr></thead><tbody>${dataRows.map((row) => `<tr class="${row.status === 'done' ? 'is-done' : ''}"><td><form method="post" action="/interview-coordination/${encodeURIComponent(row.id)}/toggle"><input type="hidden" name="view" value="${input.view}"><button class="recruitment-status" type="submit" aria-label="${row.status === 'done' ? '미완료로 변경' : '완료로 변경'}">${row.status === 'done' ? '✓' : '△'}</button></form></td>${rowCells(row.cells, maxColumns)}${rowEdit(row, input.view)}</tr>`).join('')}</tbody></table></div></section>`
  }).join('')
  const error = input.error === 'invalid' ? '<p class="asset-form-error" role="alert">붙여넣은 범위를 확인해 주세요. 한 번에 300행, 행당 60열까지 입력할 수 있습니다.</p>' : ''
  return pageLayout('면접일정 조율', `${detailHeader('coordination')}
    <main class="shell recruitment-shell">
      <a class="back" href="/">← 팀 업무공간</a>
      <section class="manual-hero"><p class="eyebrow">INTERVIEW COORDINATION</p><h1>면접일정 조율</h1><p class="lead">부서별 일정 조율 원본을 유지하고, 확정 일정과 블랙리스트를 분리해 확인합니다.</p></section>
      <nav class="recruitment-tabs" aria-label="면접일정 조율 메뉴">${tabs}</nav>
      <form class="manual-search" method="get" action="/interview-coordination"><input type="hidden" name="view" value="${input.view}"><label class="sr-only" for="coordination-query">면접 일정 검색</label><input id="coordination-query" name="q" value="${escapeHtml(input.query)}" maxlength="100" placeholder="부서·지원자·일정 검색"><button type="submit">검색</button>${input.query ? '<a class="button secondary" href="/interview-coordination?view=' + input.view + '">초기화</a>' : ''}</form>
      <section class="paste-panel"><div><h2>${viewLabels[input.view]} 빠른 입력</h2><p>엑셀 범위를 복사해 붙여넣으면 현재 분류에 새 행으로 추가됩니다.</p></div><form method="post" action="/interview-coordination/import"><input type="hidden" name="view" value="${input.view}"><textarea name="paste" rows="5" placeholder="열은 Tab, 행은 줄바꿈으로 구분됩니다."></textarea><button type="submit">복붙한 행 추가</button></form></section>
      ${error}
      <div class="manual-results-heading"><h2>${viewLabels[input.view]}</h2><span>${input.rows.filter((row) => row.rowKind !== 'header').length}행</span></div>
      <section class="manual-results">${tables || '<p class="manual-empty">조건에 맞는 일정이 없습니다.</p>'}</section>
    </main>`)
}
