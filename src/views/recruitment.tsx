import type { RecruitmentRecord, RecruitmentRecordKind, RecruitmentRecordStatus } from '../types'
import { detailHeader, escapeHtml, pageLayout } from './layout'

const kindLabels: Record<RecruitmentRecordKind, string> = {
  onboarding: '입사 체크리스트', resume: '이력서 송부 체크', interview: '면접 일정', executive: '경영진면접',
}
const statusLabels: Record<RecruitmentRecordStatus, string> = {
  pending: '대기', scheduled: '예정', sent: '발송완료', in_progress: '진행중', completed: '완료', on_hold: '보류', cancelled: '취소',
}
const statusOptions = (current: RecruitmentRecordStatus): string => (Object.keys(statusLabels) as RecruitmentRecordStatus[]).map((status) => `<option value="${status}"${status === current ? ' selected' : ''}>${statusLabels[status]}</option>`).join('')
const value = (input: string | null | undefined): string => escapeHtml(input ?? '')
const dateLabel = (date: string | null): string => date ? date.slice(2).replaceAll('-', '/') : '-'
const taskProgress = (record: RecruitmentRecord): string => record.tasks.length ? `${record.tasks.filter((task) => task.isCompleted).length}/${record.tasks.length}` : '-'
const areaLink = (area: RecruitmentRecordKind, query = ''): string => `/recruitment?area=${area}${query ? `&q=${encodeURIComponent(query)}` : ''}`
const latestFirst = (records: RecruitmentRecord[]): RecruitmentRecord[] => [...records].sort((left, right) => {
  const leftKey = `${left.eventDate ?? ''}T${left.eventTime ?? ''}`
  const rightKey = `${right.eventDate ?? ''}T${right.eventTime ?? ''}`
  return rightKey.localeCompare(leftKey) || right.name.localeCompare(left.name, 'ko')
})
const calendarPayload = (records: RecruitmentRecord[]): string => JSON.stringify(records.map((record) => ({ date: record.eventDate, time: record.eventTime, name: record.name, department: record.department, phone: record.phone, email: record.email, interviewer: record.interviewer, status: statusLabels[record.status] }))).replaceAll('<', '\\u003c').replaceAll('>', '\\u003e').replaceAll('&', '\\u0026')

const recordForm = (kind: RecruitmentRecordKind, record: RecruitmentRecord | null, query: string): string => {
  const current = record ?? { id: '', kind, name: '', department: null, position: null, experienceType: null, phone: null, email: null, jobTitle: null, recipient: null, eventDate: null, eventTime: null, interviewer: null, interviewerAvailability: null, location: null, status: 'pending' as RecruitmentRecordStatus, result: null, notes: null, tasks: [], createdAt: 0, updatedAt: 0 }
  const action = record ? `/recruitment/records/${encodeURIComponent(record.id)}` : '/recruitment/records'
  const common = `<input type="hidden" name="kind" value="${kind}"><input type="hidden" name="area" value="${kind}"><input type="hidden" name="q" value="${value(query)}">`
  const person = kind === 'resume'
    ? `<label>공고명<input name="jobTitle" value="${value(current.jobTitle)}" maxlength="300" required></label><label>수신처·수신자<input name="recipient" value="${value(current.recipient)}" maxlength="500"></label>`
    : `<label>이름<input class="recruitment-name-input" name="name" value="${value(current.name)}" maxlength="100" required></label><label>소속·지원부서<input name="department" value="${value(current.department)}" maxlength="200"></label>${kind === 'onboarding' ? '<label>직급·직무<input name="position" value="' + value(current.position) + '" maxlength="200"></label>' : ''}<label>신입·경력<select name="experienceType"><option value="">선택 안 함</option><option${current.experienceType === '신입' ? ' selected' : ''}>신입</option><option${current.experienceType === '경력' ? ' selected' : ''}>경력</option></select></label><label>연락처<input class="recruitment-phone-input" name="phone" value="${value(current.phone)}" maxlength="100"></label><label>이메일<input class="recruitment-email-input" name="email" type="email" value="${value(current.email)}" maxlength="200"></label>`
  const date = kind === 'resume' ? '발송일' : kind === 'onboarding' ? '입사일' : '면접일'
  const schedule = `<label>${date}<input name="eventDate" type="date" value="${value(current.eventDate)}"></label><label>${kind === 'resume' ? '발송 상태' : '상태'}<select name="status">${statusOptions(current.status)}</select></label>`
  const interview = kind === 'interview' || kind === 'executive' ? `<label>시간<input name="eventTime" type="time" value="${value(current.eventTime)}"></label><label>면접관<input name="interviewer" value="${value(current.interviewer)}" maxlength="300"></label><label>면접 장소<input name="location" value="${value(current.location)}" maxlength="200"></label><label>결과<input name="result" value="${value(current.result)}" maxlength="200" placeholder="합격·불합격·보류"></label>` : ''
  const savedAvailability = current.interviewerAvailability ?? ''
  const savedAvailabilityDate = savedAvailability.match(/\d{4}-\d{2}-\d{2}/)?.[0] ?? ''
  const savedAvailabilityTime = savedAvailability.match(/\d{2}:\d{2}/)?.[0] ?? ''
  const savedAvailabilityPeriod = savedAvailability.includes('오후') ? 'pm' : 'am'
  const interviewerAvailability = kind === 'interview' ? `<fieldset class="recruitment-availability"><legend>실무진면접관 가능일</legend><div class="recruitment-availability-grid"><label>가능일<input name="interviewerAvailability" type="date" value="${value(savedAvailabilityDate)}"></label><label>구분<select name="interviewerAvailabilityPeriod"><option value="am"${savedAvailabilityPeriod === 'am' ? ' selected' : ''}>오전</option><option value="pm"${savedAvailabilityPeriod === 'pm' ? ' selected' : ''}>오후</option></select></label><label>가능 시간<input name="interviewerAvailabilityTime" type="time" value="${value(savedAvailabilityTime)}"></label></div></fieldset>` : ''
  const resumeHelper = kind === 'interview' ? `<div class="recruitment-resume-helper"><label>지원자 이력서<input name="resumeFile" class="recruitment-resume-file" type="file" accept=".txt,.csv,.pdf,.doc,.docx"></label><p>텍스트로 읽을 수 있는 이력서에서 전화번호와 이메일을 찾아 입력칸에 채웁니다. 파일은 저장하지 않습니다.</p></div>` : ''
  const notes = `<label class="wide">메모<textarea name="notes" rows="3" maxlength="2000">${value(current.notes)}</textarea></label>`
  return `<form class="recruitment-record-form" method="post" action="${action}" enctype="multipart/form-data">${common}<div class="recruitment-form-grid">${person}${kind === 'resume' ? schedule : `${schedule}${interview}${interviewerAvailability}${resumeHelper}`}${notes}</div><button type="submit">${record ? '수정 저장' : '등록'}</button></form>`
}

const editControl = (record: RecruitmentRecord, query: string): string => `<details class="recruitment-edit"><summary>수정</summary>${recordForm(record.kind, record, query)}</details>`
const taskList = (record: RecruitmentRecord, area: RecruitmentRecordKind, query: string): string => record.tasks.length === 0 ? '' : `<details class="recruitment-task-panel"><summary>체크리스트 <strong>${taskProgress(record)}</strong></summary><ul>${record.tasks.map((task) => `<li class="${task.isCompleted ? 'is-completed' : ''}"><form method="post" action="/recruitment/tasks/${encodeURIComponent(task.id)}/toggle"><input type="hidden" name="area" value="${area}"><input type="hidden" name="q" value="${value(query)}"><button type="submit" aria-label="${task.isCompleted ? '미완료로 변경' : '완료로 변경'}">${task.isCompleted ? '✓' : '△'}</button></form><span>${escapeHtml(task.label)}</span></li>`).join('')}</ul></details>`

const onboardingView = (records: RecruitmentRecord[], query: string): string => `<div class="recruitment-card-list">${records.map((record) => `<article class="recruitment-card"><header><div><h3>${escapeHtml(record.name || '이름 미입력')}</h3><p>${escapeHtml([record.department, record.position, record.experienceType].filter(Boolean).join(' · ') || '소속·직무 미입력')}</p></div><span class="recruitment-status-badge">${statusLabels[record.status]}</span></header><dl><div><dt>입사일</dt><dd>${dateLabel(record.eventDate)}</dd></div><div><dt>연락처</dt><dd>${escapeHtml(record.phone ?? '-')}</dd></div><div><dt>진행률</dt><dd>${taskProgress(record)}</dd></div></dl><div class="recruitment-card-actions">${taskList(record, 'onboarding', query)}${editControl(record, query)}</div></article>`).join('') || '<p class="manual-empty">등록된 입사자가 없습니다. 아래 입력창에서 추가하세요.</p>'}</div>`
const resumeView = (records: RecruitmentRecord[], query: string): string => `<div class="recruitment-table-wrap"><table class="recruitment-work-table"><thead><tr><th>발송일</th><th>공고명</th><th>수신처·수신자</th><th>상태</th><th>메모</th><th>관리</th></tr></thead><tbody>${latestFirst(records).map((record) => `<tr><td class="recruitment-cell-date">${dateLabel(record.eventDate)}</td><td>${escapeHtml(record.jobTitle ?? '-')}</td><td>${escapeHtml(record.recipient ?? '-')}</td><td><span class="recruitment-status-badge">${statusLabels[record.status]}</span></td><td class="recruitment-cell-long">${escapeHtml(record.notes ?? '-')}</td><td>${editControl(record, query)}</td></tr>`).join('') || '<tr><td colspan="6" class="tool-empty">등록된 이력서 송부 기록이 없습니다.</td></tr>'}</tbody></table></div>`

const scheduleCalendar = (): string => `<section class="recruitment-calendar" data-recruitment-calendar><div class="recruitment-calendar-toolbar"><button type="button" data-calendar-prev aria-label="이전 달">‹</button><h3 data-calendar-month></h3><button type="button" data-calendar-next aria-label="다음 달">›</button></div><div class="recruitment-calendar-weekdays"><span>일</span><span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span>토</span></div><div class="recruitment-calendar-grid" data-calendar-grid></div></section>`

const scheduleCalendarScript = (records: RecruitmentRecord[]): string => `<script type="application/json" id="recruitment-calendar-data">${calendarPayload(records)}</script><script>
(() => {
  const dataNode = document.getElementById('recruitment-calendar-data');
  const root = document.querySelector('[data-recruitment-calendar]');
  if (!dataNode || !root) return;
  const events = JSON.parse(dataNode.textContent || '[]');
  const monthNode = root.querySelector('[data-calendar-month]');
  const grid = root.querySelector('[data-calendar-grid]');
  const firstDate = events.find((event) => event.date)?.date;
  const first = firstDate ? new Date(firstDate + 'T00:00:00') : new Date();
  let cursor = new Date(first.getFullYear(), first.getMonth(), 1);
  const render = () => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    monthNode.textContent = new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long' }).format(cursor);
    grid.innerHTML = '';
    const start = new Date(year, month, 1).getDay();
    const last = new Date(year, month + 1, 0).getDate();
    for (let blank = 0; blank < start; blank += 1) grid.appendChild(document.createElement('div'));
    for (let day = 1; day <= last; day += 1) {
      const cell = document.createElement('div');
      cell.className = 'recruitment-calendar-day';
      const label = document.createElement('strong');
      label.textContent = String(day);
      cell.appendChild(label);
      const date = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
      events.filter((event) => event.date === date).forEach((event) => {
        const item = document.createElement('div');
        item.className = 'recruitment-calendar-event';
        item.textContent = (event.time ? event.time + ' ' : '') + (event.name || '지원자 미입력') + (event.interviewer ? ' · ' + event.interviewer : '');
        item.title = [event.phone, event.email, event.department, event.status].filter(Boolean).join(' / ');
        cell.appendChild(item);
      });
      grid.appendChild(cell);
    }
  };
  root.querySelector('[data-calendar-prev]').addEventListener('click', () => { cursor = new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1); render(); });
  root.querySelector('[data-calendar-next]').addEventListener('click', () => { cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1); render(); });
  render();
})();
</script>`

const scheduleView = (records: RecruitmentRecord[], query: string, kind: RecruitmentRecordKind): string => {
  const sorted = latestFirst(records)
  const rows = sorted.map((record) => `<tr><td class="recruitment-cell-date">${dateLabel(record.eventDate)}</td><td class="recruitment-cell-date">${escapeHtml(record.eventTime ?? '-')}</td><td class="recruitment-cell-person"><strong>${escapeHtml(record.name || '이름 미입력')}</strong><small>${escapeHtml(record.phone ?? '-')}</small><small>${escapeHtml(record.email ?? '-')}</small></td><td>${escapeHtml(record.department ?? '-')}</td><td>${escapeHtml(record.experienceType ?? '-')}</td><td class="recruitment-cell-long">${escapeHtml(record.interviewer ?? '-')}</td><td>${escapeHtml(record.location ?? '-')}</td><td><span class="recruitment-status-badge">${statusLabels[record.status]}</span><small>${escapeHtml(record.result ?? '')}</small></td><td>${taskProgress(record)}</td><td>${taskList(record, kind, query)}${editControl(record, query)}</td></tr>`).join('')
  const table = `<div class="recruitment-table-wrap" data-recruitment-panel="table"><table class="recruitment-work-table"><thead><tr><th>면접일</th><th>시간</th><th>지원자</th><th>지원부서</th><th>신입·경력</th><th>면접관</th><th>장소</th><th>상태·결과</th><th>체크</th><th>관리</th></tr></thead><tbody>${rows || '<tr><td colspan="10" class="tool-empty">등록된 면접 일정이 없습니다.</td></tr>'}</tbody></table></div>`
  return `<div class="recruitment-view-switch" role="tablist" aria-label="면접 일정 보기"><button type="button" class="active" data-recruitment-view="table">표 보기</button><button type="button" data-recruitment-view="calendar">달력 보기</button></div><div class="recruitment-view-panels">${table}<div data-recruitment-panel="calendar" hidden>${scheduleCalendar()}</div></div>${scheduleCalendarScript(sorted)}<script>
(() => {
  document.querySelectorAll('[data-recruitment-view]').forEach((button) => button.addEventListener('click', () => {
    const view = button.dataset.recruitmentView;
    document.querySelectorAll('[data-recruitment-view]').forEach((item) => item.classList.toggle('active', item === button));
    document.querySelectorAll('[data-recruitment-panel]').forEach((panel) => { panel.hidden = panel.dataset.recruitmentPanel !== view; });
  }));
})();
</script>`
}

const resumeAutofillScript = `<script>
(() => {
  const phonePattern = /01[016789][\\s.-]?\\d{3,4}[\\s.-]?\\d{4}/;
  const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}/i;
  document.querySelectorAll('.recruitment-resume-file').forEach((fileInput) => fileInput.addEventListener('change', async () => {
    const file = fileInput.files && fileInput.files[0];
    const form = fileInput.closest('form');
    if (!file || !form) return;
    try {
      const request = new FormData();
      request.append('resumeFile', file);
      const response = await fetch('/recruitment/resume-extract', { method: 'POST', body: request });
      const extracted = response.ok ? await response.json() : {};
      let phone = extracted.phone;
      let email = extracted.email;
      if ((!phone || !email) && file.text) {
        const text = await file.text();
        phone = phone || text.match(phonePattern)?.[0];
        email = email || text.match(emailPattern)?.[0];
      }
      if (phone) form.querySelector('.recruitment-phone-input').value = phone;
      if (email) form.querySelector('.recruitment-email-input').value = email;
    } catch (error) {
      console.warn('이력서 텍스트 자동 추출을 건너뛰었습니다.', error);
    }
  }));
})();
</script>`

export function recruitmentPage(input: { area: RecruitmentRecordKind; records: RecruitmentRecord[]; counts: Record<RecruitmentRecordKind, number>; query: string; error: string | null }): string {
  const tabs = (Object.keys(kindLabels) as RecruitmentRecordKind[]).map((kind) => `<a class="recruitment-tab${kind === input.area ? ' active' : ''}" href="${areaLink(kind)}">${kindLabels[kind]}<span>${input.counts[kind]}</span></a>`).join('')
  const exportLink = `/recruitment/export?area=${input.area}${input.query ? `&q=${encodeURIComponent(input.query)}` : ''}`
  const error = input.error === 'invalid' ? '<p class="asset-form-error" role="alert">필수 항목과 날짜·시간 형식을 확인해 주세요.</p>' : ''
  const createForm = `<details class="recruitment-create" open><summary><strong>${kindLabels[input.area]} 등록</strong><span>필요한 항목만 입력하고 저장합니다.</span></summary>${recordForm(input.area, null, input.query)}</details>`
  const list = input.area === 'onboarding' ? onboardingView(input.records, input.query) : input.area === 'resume' ? resumeView(input.records, input.query) : scheduleView(input.records, input.query, input.area)
  return pageLayout('채용·입사', `${detailHeader('recruitment')}
    <main class="shell recruitment-shell"><a class="back" href="/">← 팀 업무공간</a><section class="manual-hero"><p class="eyebrow">RECRUITMENT WORKSPACE</p><h1>채용·입사</h1><p class="lead">스프레드시트를 복붙하는 화면이 아니라, 채용 담당자가 입력하고 확인하는 업무공간입니다.</p></section>
      <nav class="recruitment-tabs" aria-label="채용·입사 메뉴">${tabs}</nav><div class="recruitment-toolbar"><form class="manual-search" method="get" action="/recruitment"><input type="hidden" name="area" value="${input.area}"><label class="sr-only" for="recruitment-query">채용·입사 검색</label><input id="recruitment-query" name="q" value="${value(input.query)}" maxlength="100" placeholder="${input.area === 'resume' ? '공고명·수신처 검색' : '이름·부서·일정 검색'}"><button type="submit">검색</button>${input.query ? `<a class="button secondary" href="${areaLink(input.area)}">초기화</a>` : ''}</form><a class="button secondary recruitment-download" href="${exportLink}">엑셀 다운로드</a></div>
      ${error}${createForm}<div class="manual-results-heading"><h2>${kindLabels[input.area]} 목록</h2><span>${input.records.length}건</span></div>${list}<p class="recruitment-legacy-note">기존 엑셀 원본 행과 기존 면접일정 조율 데이터는 삭제하지 않고 내부 보관합니다. 새 입력 데이터는 이 화면에서 관리하고 필요할 때 엑셀로 내려받습니다.</p>
      ${resumeAutofillScript}</main>`)
}
