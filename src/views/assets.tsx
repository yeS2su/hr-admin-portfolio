import type { Asset, AssetChoice, AssetCustodyRecord, AssetDueRecord, AssetHistoryRecord, AssetPage, AssetType } from '../types'
import { detailHeader, escapeHtml, pageLayout } from './layout'

const typeLabels: Record<AssetType, string> = {
  laptop: '노트북',
  desktop: '데스크탑',
  monitor: '모니터',
  other: '기타자산',
}

const assetLink = (query: string, type: AssetType | null, page = 1): string => {
  const params = new URLSearchParams()
  if (query !== '') params.set('q', query)
  if (type !== null) params.set('type', type)
  if (page > 1) params.set('page', String(page))
  const suffix = params.toString()
  return suffix === '' ? '/assets' : `/assets?${suffix}`
}

const dateForDisplay = (date: string | null | undefined): string | null => {
  if (!date) return null
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)
  return match ? `${match[1].slice(2)}/${match[2]}/${match[3]}` : date
}

const periodText = (asset: Asset): string => {
  const start = asset.usageStartRaw ?? asset.usageStartDate
  const end = asset.usageEndRaw ?? asset.usageEndDate
  if (!start && !end) return '-'
  return `${dateForDisplay(start) ?? '?'} ~ ${dateForDisplay(end) ?? ''}`
}

const dateForMessage = (date: string): string => date.replaceAll('-', '/')

const smsEditor = (message: string): string => `<details class="asset-sms" data-sms-panel>
  <summary>문자 생성</summary>
  <div class="asset-sms-editor">
    <textarea readonly data-sms-text aria-label="문자 내용">${escapeHtml(message)}</textarea>
    <div><button type="button" class="secondary asset-sms-copy" data-copy-sms>문자 복사</button><small data-copy-status>복사해서 문자 앱에 붙여넣으세요.</small></div>
  </div>
</details>`

const smsCopyScript = `<script>
  document.querySelectorAll('[data-copy-sms]').forEach((button) => button.addEventListener('click', async () => {
    const panel = button.closest('[data-sms-panel]')
    const textarea = panel?.querySelector('[data-sms-text]')
    const status = panel?.querySelector('[data-copy-status]')
    if (!textarea || !status) return
    try {
      await navigator.clipboard.writeText(textarea.value)
      status.textContent = '복사했습니다.'
    } catch {
      textarea.focus()
      textarea.select()
      status.textContent = '선택된 문구를 복사하세요.'
    }
  }))
</script>`

export function assetsPage(input: {
  result: AssetPage
  query: string
  activeType: AssetType | null
  dueReturns: AssetDueRecord[]
  today: string
}): string {
  const totalAssets = Object.values(input.result.counts).reduce((sum, count) => sum + count, 0)
  const tabs = ([null, 'laptop', 'desktop', 'monitor', 'other'] as const).map((type) => {
    const active = input.activeType === type
    const label = type === null ? '전체' : typeLabels[type]
    const count = type === null ? totalAssets : input.result.counts[type]
    return `<a class="asset-tab${active ? ' active' : ''}" href="${assetLink(input.query, type)}"${active ? ' aria-current="page"' : ''}>${label}<span>${count}</span></a>`
  }).join('')
  const rows = input.result.assets.map((asset) => `<tr class="asset-row">
    <td><a class="asset-history-link" href="/assets/${encodeURIComponent(asset.id)}" aria-label="${escapeHtml(asset.assetCode)} 과거 조사 기록 보기"><strong>${escapeHtml(asset.assetCode)}</strong></a></td>
    <td><span class="asset-type">${typeLabels[asset.assetType]}</span></td>
    <td>${escapeHtml(asset.assetName ?? '-')}</td>
    <td>${escapeHtml(asset.currentUserName ?? '-')}</td>
    <td>${escapeHtml(asset.usageScope ?? '-')}</td>
    <td>${escapeHtml(periodText(asset))}</td>
    <td class="asset-row-actions"><a class="button secondary asset-edit-link" href="/assets/${encodeURIComponent(asset.id)}">수정</a></td>
  </tr>`).join('')
  const dueRows = input.dueReturns.map((record) => {
    const dueDate = record.usageEndDate
    const overdue = dueDate < input.today
    const message = `[자산 반납 안내] ${record.currentUserName ?? '담당자'}님, ${record.assetCode} ${record.assetName ?? '자산'}의 사용 종료일은 ${dateForMessage(dueDate)}입니다. 반납 준비 부탁드립니다.`
    return `<li class="asset-due-item${overdue ? ' is-overdue' : ''}">
      <div><strong>${escapeHtml(record.assetCode)}</strong><span>${escapeHtml(record.assetName ?? '자산명 미등록')}</span></div>
      <div><span>${escapeHtml(record.currentUserName ?? record.usageScope ?? '사용자 미등록')}</span><small>${overdue ? '기한 지남' : dueDate === input.today ? '오늘 반납' : '반납 예정'} · ${escapeHtml(dateForDisplay(dueDate) ?? dueDate)}</small>${smsEditor(message)}</div>
    </li>`
  }).join('')
  const pageCount = Math.max(1, Math.ceil(input.result.total / input.result.pageSize))
  const pagination = pageCount > 1
    ? `<nav class="asset-pagination" aria-label="자산 목록 페이지">
        ${input.result.page > 1 ? `<a class="button secondary" href="${assetLink(input.query, input.activeType, input.result.page - 1)}">← 이전</a>` : '<span></span>'}
        <span>${input.result.page} / ${pageCount}</span>
        ${input.result.page < pageCount ? `<a class="button secondary" href="${assetLink(input.query, input.activeType, input.result.page + 1)}">다음 →</a>` : '<span></span>'}
      </nav>`
    : ''

  return pageLayout(
    '자산관리대장',
    `${detailHeader('assets')}
    <main class="shell asset-shell">
      <a class="back" href="/">← 팀 업무공간</a>
      <section class="asset-page-heading">
        <p class="eyebrow">ASSET REGISTER</p>
        <h1>자산관리대장</h1>
        <p class="lead">자산코드, 자산명 또는 현재 사용자명으로 찾을 수 있습니다.</p>
      </section>
      ${input.dueReturns.length > 0 ? `<section class="asset-due-panel" aria-labelledby="asset-due-title">
        <div class="asset-list-heading"><div><h2 id="asset-due-title">반납기한 임박</h2><p>오늘 포함 30일 이내이거나 이미 기한이 지난 자산입니다.</p></div><span>${input.dueReturns.length}건</span></div>
        <ul class="asset-due-list">${dueRows}</ul>
      </section>` : ''}
      <form class="asset-search" method="get" action="/assets">
        ${input.activeType === null ? '' : `<input type="hidden" name="type" value="${input.activeType}">`}
        <label class="sr-only" for="asset-query">자산 검색</label>
        <input id="asset-query" name="q" value="${escapeHtml(input.query)}" maxlength="100" placeholder="예: 자산코드 또는 사용자명">
        <div class="asset-search-controls"><button type="submit">검색</button>${input.query === '' ? '' : '<a class="button secondary" href="/assets">초기화</a>'}</div>
        <nav class="asset-actions" aria-label="자산관리 작업"><a class="button" href="/assets/register">자산등록</a><a class="button secondary" href="/assets/outbound">반출·반납 관리</a></nav>
      </form>
      <nav class="asset-tabs" aria-label="자산 종류">${tabs}</nav>
      <section class="asset-list-panel">
        <div class="asset-list-heading"><h2>${input.query === '' ? '자산 목록' : `“${escapeHtml(input.query)}” 검색 결과`}</h2><span>${input.result.total}건</span></div>
        <div class="asset-table-wrap"><table class="asset-table">
          <thead><tr><th>자산코드</th><th>종류</th><th>자산명</th><th>현재 사용자</th><th>사용 구분</th><th>사용기간</th><th>관리</th></tr></thead>
          <tbody>${rows || '<tr><td class="asset-empty" colspan="7">조건에 맞는 자산이 없습니다.</td></tr>'}</tbody>
        </table></div>
        ${pagination}
      </section>
      ${smsCopyScript}
    </main>`,
  )
}

const assetManageNav = '<nav class="asset-manage-nav" aria-label="자산관리 페이지"><a class="button secondary" href="/assets">자산 목록</a><a class="button secondary" href="/assets/register">자산등록</a><a class="button secondary" href="/assets/outbound">반출·반납 관리</a></nav>'

const managementError = (error: string | null): string => {
  const messages: Record<string, string> = {
    duplicate: '이미 등록된 자산코드입니다. 자산코드를 확인해 주세요.',
    invalid: '필수 항목이나 날짜를 확인해 주세요.',
    asset: '선택한 자산을 찾을 수 없습니다.',
    outbound: '이 자산은 이미 반출 중입니다. 먼저 반납 처리해 주세요.',
    returnDate: '반납일은 반출일 이후 날짜로 입력해 주세요.',
    returned: '이미 반납 처리된 반출 기록입니다.',
  }
  return error && messages[error] ? `<p class="asset-form-error" role="alert">${messages[error]}</p>` : ''
}

const assetEditForm = (asset: Asset): string => `<form class="asset-management-form" method="post" action="/assets/${encodeURIComponent(asset.id)}">
  <fieldset>
    <legend>자산 정보 수정</legend>
    <div class="asset-form-grid">
      <label>자산코드<input name="assetCode" value="${escapeHtml(asset.assetCode)}" maxlength="100" required></label>
      <label>종류<select name="assetType" required>
        <option value="laptop"${asset.assetType === 'laptop' ? ' selected' : ''}>노트북</option>
        <option value="desktop"${asset.assetType === 'desktop' ? ' selected' : ''}>데스크탑</option>
        <option value="monitor"${asset.assetType === 'monitor' ? ' selected' : ''}>모니터</option>
        <option value="other"${asset.assetType === 'other' ? ' selected' : ''}>기타자산</option>
      </select></label>
      <label>자산명<input name="assetName" value="${escapeHtml(asset.assetName ?? '')}" maxlength="200" required></label>
      <label>현재 사용자<input name="currentUserName" value="${escapeHtml(asset.currentUserName ?? '')}" maxlength="200"></label>
      <label>사용 구분<input name="usageScope" value="${escapeHtml(asset.usageScope ?? '')}" maxlength="200"></label>
      <label>사용 시작일<input name="usageStartDate" type="date" value="${escapeHtml(asset.usageStartDate ?? '')}"></label>
      <label>사용 종료일<input name="usageEndDate" type="date" value="${escapeHtml(asset.usageEndDate ?? '')}"></label>
      <label class="wide">비고<textarea name="historyNote" maxlength="2000" rows="3">${escapeHtml(asset.historyNote ?? '')}</textarea></label>
    </div>
    <button type="submit">수정 저장</button>
  </fieldset>
</form>`

export function assetRegistrationPage(input: {
  error: string | null
}): string {
  return pageLayout(
    '자산등록',
    `${detailHeader('assets')}
    <main class="shell asset-shell">
      <a class="back" href="/assets">← 자산관리대장</a>
      <section class="asset-page-heading"><p class="eyebrow">NEW ASSET</p><h1>자산등록</h1><p class="lead">자산대장에 새 항목을 등록합니다.</p></section>
      ${assetManageNav}${managementError(input.error)}
      <form class="asset-management-form" method="post" action="/assets/register">
        <fieldset>
          <div class="asset-form-grid">
            <label>자산코드<input name="assetCode" maxlength="100" required></label>
            <label>종류<select name="assetType" required><option value="laptop">노트북</option><option value="desktop">데스크탑</option><option value="monitor">모니터</option><option value="other">기타자산</option></select></label>
            <label>자산명<input name="assetName" maxlength="200" required></label>
            <label>현재 사용자<input name="currentUserName" maxlength="200"></label>
            <label>사용 구분<input name="usageScope" maxlength="200"></label>
            <label>사용 시작일<input name="usageStartDate" type="date"></label>
            <label>사용 종료일<input name="usageEndDate" type="date"></label>
            <label class="wide">비고<textarea name="historyNote" maxlength="2000" rows="3"></textarea></label>
          </div>
          <button type="submit">자산 저장</button>
        </fieldset>
      </form>
    </main>`,
  )
}

export function assetOutboundPage(input: {
  assets: AssetChoice[]
  openRecords: AssetCustodyRecord[]
  returnedRecords: AssetCustodyRecord[]
  today: string
  error: string | null
}): string {
  const assetResults = input.assets.map((asset) => {
    const name = asset.assetName ?? '자산명 미등록'
    return `<button type="button" role="option" hidden data-asset-id="${escapeHtml(asset.id)}" data-asset-code="${escapeHtml(asset.assetCode)}" data-asset-name="${escapeHtml(name)}" data-asset-search="${escapeHtml(`${asset.assetCode} ${name}`.toLocaleLowerCase())}"><strong>${escapeHtml(asset.assetCode)}</strong><span>${escapeHtml(name)}</span></button>`
  }).join('')
  const openRows = input.openRecords.map((record) => {
    const expectedReturnMessage = record.expectedReturnDate
      ? `[자산 반납 안내] ${record.recipientName}님, ${record.assetCode} ${record.assetName ?? '자산'}의 예정 반납일은 ${dateForMessage(record.expectedReturnDate)}입니다. 반납 준비 부탁드립니다.`
      : ''
    return `<tr>
    <td><strong>${escapeHtml(record.assetCode)}</strong><small>${escapeHtml(record.assetName ?? '-')}</small></td>
    <td>${escapeHtml(record.outboundDepartment || '-')}</td><td>${escapeHtml(record.recipientName)}</td>
    <td>${escapeHtml(record.actualUserName ?? '-')}</td><td>${escapeHtml(dateForDisplay(record.outboundDate) ?? record.outboundDate)}</td>
    <td><span>${escapeHtml(dateForDisplay(record.expectedReturnDate) ?? '-')}</span>${expectedReturnMessage ? smsEditor(expectedReturnMessage) : ''}</td><td>${escapeHtml(record.purpose ?? '-')}</td>
    <td>${record.hasProposal ? '있음' : '없음'}</td>
    <td><form class="asset-return-form" method="post" action="/assets/outbound/${encodeURIComponent(record.id)}/return"><label><span class="sr-only">실제 반납일</span><input name="returnedDate" type="date" value="${escapeHtml(input.today)}" required></label><button type="submit">반납 처리</button></form></td>
  </tr>`
  }).join('')
  const returnedRows = input.returnedRecords.map((record) => `<tr>
    <td><strong>${escapeHtml(record.assetCode)}</strong><small>${escapeHtml(record.assetName ?? '-')}</small></td>
    <td>${escapeHtml(record.outboundDepartment || '-')}</td><td>${escapeHtml(record.recipientName)}</td>
    <td>${escapeHtml(record.actualUserName ?? '-')}</td><td>${escapeHtml(dateForDisplay(record.outboundDate) ?? record.outboundDate)}</td>
    <td>${escapeHtml(dateForDisplay(record.expectedReturnDate) ?? '-')}</td><td>${escapeHtml(dateForDisplay(record.returnedDate) ?? '-')}</td>
    <td>${escapeHtml(record.purpose ?? '-')}</td><td>${record.hasProposal ? '있음' : '없음'}</td>
  </tr>`).join('')
  const pickerScript = `<script>
    document.querySelectorAll('[data-asset-picker]').forEach((picker) => {
      const query = picker.querySelector('[data-asset-query]');
      const selected = picker.querySelector('[data-selected-asset]');
      const results = picker.querySelector('[data-asset-results]');
      const status = picker.querySelector('[data-asset-picker-status]');
      const choices = [...results.querySelectorAll('[data-asset-id]')];
      const update = () => {
        const term = query.value.trim().toLocaleLowerCase();
        selected.value = '';
        if (!term) {
          results.hidden = true;
          choices.forEach((choice) => { choice.hidden = true; });
          status.textContent = '자산코드 또는 자산명의 숫자·영문 일부를 입력하세요.';
          return;
        }
        results.hidden = false;
        let matches = 0;
        let shown = 0;
        choices.forEach((choice) => {
          const match = choice.dataset.assetSearch.includes(term);
          if (match) matches += 1;
          choice.hidden = !match || shown >= 20;
          if (match && shown < 20) shown += 1;
        });
        status.textContent = matches ? (matches > shown ? String(matches) + '개 일치 · 처음 ' + String(shown) + '개 표시' : String(matches) + '개 일치') : '일치하는 자산이 없습니다.';
      };
      query.addEventListener('input', () => { query.setCustomValidity(''); update(); });
      choices.forEach((choice) => choice.addEventListener('click', () => {
        selected.value = choice.dataset.assetId;
        query.value = choice.dataset.assetCode;
        query.setCustomValidity('');
        results.hidden = true;
        choices.forEach((item) => { item.hidden = true; });
        status.textContent = '선택됨: ' + choice.dataset.assetCode + ' · ' + choice.dataset.assetName;
      }));
      picker.closest('form').addEventListener('submit', (event) => {
        if (!selected.value) {
          event.preventDefault();
          query.setCustomValidity('검색 결과에서 자산을 하나 선택해 주세요.');
          query.reportValidity();
        }
      });
    });
  </script>`

  return pageLayout(
    '반출·반납 관리',
    `${detailHeader('assets')}
    <main class="shell asset-shell">
      <a class="back" href="/assets">← 자산관리대장</a>
      <section class="asset-page-heading"><p class="eyebrow">ASSET CUSTODY</p><h1>반출·반납 관리</h1><p class="lead">반출 상태와 반납일을 별도 이력으로 기록합니다. 자산대장의 현재 사용자·사용기간은 자동 변경하지 않습니다.</p></section>
      ${assetManageNav}${managementError(input.error)}
      <form class="asset-management-form" method="post" action="/assets/outbound">
        <fieldset>
          <div class="asset-form-grid">
            <div class="asset-form-field wide"><label for="outbound-asset-search">자산 검색</label>
              <div class="asset-picker" data-asset-picker>
                <input id="outbound-asset-search" data-asset-query type="search" autocomplete="off" placeholder="자산코드 또는 자산명 입력 (예: DS-26-D3-026)" required>
                <input type="hidden" name="assetId" data-selected-asset>
                <div class="asset-picker-results" data-asset-results role="listbox" aria-label="검색 결과" hidden>${assetResults}</div>
                <p class="asset-picker-status" data-asset-picker-status aria-live="polite">자산코드 또는 자산명의 숫자·영문 일부를 입력하세요.</p>
              </div>
            </div>
            <label>반출 부서<input name="outboundDepartment" maxlength="200" required></label>
            <label>반출 대상자<input name="recipientName" maxlength="200" required></label>
            <label>실사용자 <small>다른 경우 입력</small><input name="actualUserName" maxlength="200"></label>
            <label>반출일<input name="outboundDate" type="date" value="${escapeHtml(input.today)}" required></label>
            <label>예정 반납일<input name="expectedReturnDate" type="date"></label>
            <label class="wide">반출 목적<input name="purpose" maxlength="500"></label>
            <div class="asset-proposal-field wide"><span>기안 유무</span><label class="asset-proposal-check"><input type="checkbox" name="hasProposal" value="1"> 있음</label></div>
          </div>
          <button type="submit"${input.assets.length ? '' : ' disabled'}>반출 등록</button>
          ${input.assets.length ? '' : '<p class="asset-empty-note">등록된 자산이 없어 반출을 등록할 수 없습니다.</p>'}
        </fieldset>
      </form>
      ${pickerScript}${smsCopyScript}
      <section class="asset-history-panel asset-custody-panel">
        <div class="asset-list-heading"><div><h2>현재 반출 중</h2><p>반납 처리 전까지 이 목록에 표시됩니다.</p></div><span>${input.openRecords.length}건</span></div>
        <div class="asset-table-wrap"><table class="asset-table asset-custody-table"><thead><tr><th>자산</th><th>반출 부서</th><th>반출 대상자</th><th>실사용자</th><th>반출일</th><th>예정 반납일</th><th>목적</th><th>기안 유무</th><th>반납 처리</th></tr></thead><tbody>${openRows || '<tr><td class="asset-empty" colspan="9">현재 반출 중인 자산이 없습니다.</td></tr>'}</tbody></table></div>
      </section>
      <section class="asset-history-panel asset-custody-panel">
        <div class="asset-list-heading"><div><h2>반출·반납 이력</h2><p>이미 반납 처리한 기록입니다.</p></div><span>${input.returnedRecords.length}건</span></div>
        <div class="asset-table-wrap"><table class="asset-table asset-custody-table"><thead><tr><th>자산</th><th>반출 부서</th><th>반출 대상자</th><th>실사용자</th><th>반출일</th><th>예정 반납일</th><th>실제 반납일</th><th>목적</th><th>기안 유무</th></tr></thead><tbody>${returnedRows || '<tr><td class="asset-empty" colspan="9">반납 처리된 이력이 없습니다.</td></tr>'}</tbody></table></div>
      </section>
    </main>`,
  )
}

export function assetHistoryPage(input: { asset: Asset; history: AssetHistoryRecord[]; error: string | null }): string {
  const { asset, history } = input
  const rows = history.map((record) => `<tr>
    <td>${escapeHtml(record.recordedAtRaw ?? '날짜 미기재')}</td>
    <td>${escapeHtml(record.respondentName ?? '-')}</td>
    <td>${escapeHtml(record.department ?? '-')}</td>
    <td>${escapeHtml(record.equipmentLabel)}</td>
    <td>${escapeHtml(record.modelName ?? '-')}</td>
    <td>${escapeHtml(record.manufactureDateRaw ?? '-')}</td>
  </tr>`).join('')

  return pageLayout(
    '자산 과거 기록',
    `${detailHeader('assets')}
    <main class="shell asset-shell">
      <a class="back" href="/assets">← 자산 목록</a>
      <section class="asset-page-heading">
        <p class="eyebrow">ASSET HISTORY</p>
        <h1>${escapeHtml(asset.assetCode)}</h1>
        <p class="lead">${escapeHtml(asset.assetName ?? '자산명 미등록')} · 현재 사용자 ${escapeHtml(asset.currentUserName ?? '-')}</p>
      </section>
      ${assetManageNav}${managementError(input.error)}${assetEditForm(asset)}
      <section class="asset-history-panel">
        <div class="asset-list-heading">
          <div><h2>2025년 재물조사 기록</h2><p>조사 응답에서 자산번호가 일치한 기록만 표시합니다. 이전 연도의 이동 이력은 원본에 없습니다.</p></div>
          <span>${history.length}건</span>
        </div>
        <div class="asset-table-wrap"><table class="asset-table asset-history-table">
          <thead><tr><th>조사일</th><th>응답자</th><th>소속</th><th>장비</th><th>모델명</th><th>제조연월</th></tr></thead>
          <tbody>${rows || '<tr><td class="asset-empty" colspan="6">일치하는 과거 조사 기록이 없습니다. 자산 목록의 현재 정보는 변경하지 않았습니다.</td></tr>'}</tbody>
        </table></div>
      </section>
      <dl class="asset-current-details">
        <div><dt>현재 종류</dt><dd>${typeLabels[asset.assetType]}</dd></div>
        <div><dt>현재 사용 구분</dt><dd>${escapeHtml(asset.usageScope ?? '-')}</dd></div>
        <div><dt>현재 사용기간</dt><dd>${escapeHtml(periodText(asset))}</dd></div>
      </dl>
    </main>`,
  )
}
