import type { ManualEntry } from '../types'
import { detailHeader, escapeHtml, pageLayout } from './layout'

export function manualPage(input: {
  entries: ManualEntry[]
  categories: string[]
  subcategories: string[]
  query: string
  category: string
  subcategory: string
}): string {
  const categoryLinks = [
    `<a class="manual-category${input.category === '' ? ' active' : ''}" href="/manual${input.query ? `?q=${encodeURIComponent(input.query)}` : ''}">전체</a>`,
    ...input.categories.map((category) => `<a class="manual-category${input.category === category ? ' active' : ''}" href="/manual?category=${encodeURIComponent(category)}${input.query ? `&q=${encodeURIComponent(input.query)}` : ''}">${escapeHtml(category)}</a>`),
  ].join('')
  const subcategoryLinks = input.category === '' ? '' : `<nav class="manual-subcategories" aria-label="${escapeHtml(input.category)} 소분류">
    <span class="manual-subcategory-label">${escapeHtml(input.category)} 소분류</span>
    <a class="manual-subcategory${input.subcategory === '' ? ' active' : ''}" href="/manual?category=${encodeURIComponent(input.category)}${input.query ? `&q=${encodeURIComponent(input.query)}` : ''}">전체</a>
    ${input.subcategories.map((subcategory) => `<a class="manual-subcategory${input.subcategory === subcategory ? ' active' : ''}" href="/manual?category=${encodeURIComponent(input.category)}&subcategory=${encodeURIComponent(subcategory)}${input.query ? `&q=${encodeURIComponent(input.query)}` : ''}">${escapeHtml(subcategory)}</a>`).join('')}
  </nav>`
  const grouped = new Map<string, ManualEntry[]>()
  for (const entry of input.entries) {
    const current = grouped.get(entry.subcategory) ?? []
    current.push(entry)
    grouped.set(entry.subcategory, current)
  }
  const sheets = Array.from(grouped.entries()).map(([subcategory, entries]) => {
    const maxColumns = Math.max(1, ...entries.map((entry) => entry.cells.length))
    const rows = entries.map((entry) => `<tr class="${entry.rowKind === 'header' ? 'manual-grid-header' : ''}">
      <th scope="row">${entry.sourceRow}</th>${Array.from({ length: maxColumns }, (_, index) => `<td>${escapeHtml(entry.cells[index] ?? '')}</td>`).join('')}
      <td class="manual-row-action"><details class="manual-edit"><summary>수정</summary><form method="post" action="/manual/${encodeURIComponent(entry.id)}"><label>행 데이터(열은 Tab으로 구분)<textarea name="cells" rows="5">${escapeHtml(entry.cells.join('\t'))}</textarea></label><button type="submit">저장</button></form></details></td>
    </tr>`).join('')
    return `<section class="manual-sheet"><div class="manual-sheet-heading"><div><span class="manual-category-label">${escapeHtml(input.category || entries[0]?.category || '')}</span><h2>${escapeHtml(subcategory)}</h2></div><small>${escapeHtml(entries[0]?.sourceSheet ?? subcategory)} · ${entries.length}행</small></div><div class="manual-grid-wrap"><table class="manual-grid"><caption class="sr-only">${escapeHtml(subcategory)} 원본 표</caption><thead><tr><th>행</th>${Array.from({ length: maxColumns }, (_, index) => `<th>열 ${index + 1}</th>`).join('')}<th>관리</th></tr></thead><tbody>${rows}</tbody></table></div>${entries.some((entry) => entry.sensitiveRedacted) ? '<p class="manual-redacted">계정·비밀번호·연락처 등 민감정보는 마스킹되어 있습니다.</p>' : ''}</section>`
  }).join('')
  return pageLayout('업무매뉴얼', `${detailHeader('manual')}
    <main class="shell manual-shell">
      <a class="back" href="/">← 팀 업무공간</a>
      <section class="manual-hero"><p class="eyebrow">TEAM MANUAL</p><h1>업무매뉴얼</h1><p class="lead">대분류와 시트별 소분류로 나누고, 원본 행·열을 유지해 수정합니다. 원본 엑셀은 수정하지 않습니다.</p></section>
      <form class="manual-search" method="get" action="/manual"><label class="sr-only" for="manual-query">매뉴얼 검색</label><input id="manual-query" name="q" value="${escapeHtml(input.query)}" maxlength="100" placeholder="업무명, 키워드, 절차 검색"><button type="submit">검색</button>${input.query || input.category ? '<a class="button secondary" href="/manual">초기화</a>' : ''}</form>
      <nav class="manual-categories" aria-label="매뉴얼 분류">${categoryLinks}</nav>
      ${subcategoryLinks}
      <div class="manual-results-heading"><h2>${input.query ? `“${escapeHtml(input.query)}” 검색 결과` : input.category ? `${escapeHtml(input.category)} 업무` : '전체 업무매뉴얼'}</h2><span>${input.entries.length}행</span></div>
      <section class="manual-results">${sheets || '<p class="manual-empty">조건에 맞는 매뉴얼이 없습니다.</p>'}</section>
    </main>`)
}
