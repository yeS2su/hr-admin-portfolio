const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')

export function pageLayout(title: string, content: string): string {
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="/styles.css?v=20261002-4">
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 64 64%27%3E%3Crect width=%2764%27 height=%2764%27 rx=%2714%27 fill=%27%2310264f%27/%3E%3Cpath d=%27M18 17h8v11h12V17h8v30h-8V35H26v12h-8z%27 fill=%27white%27/%3E%3C/svg%3E">
</head>
<body>
  ${content}
</body>
</html>`
}

export function detailHeader(active: 'workspaces' | 'recruitment' | 'coordination' | 'manual' | 'assets' | 'patents' | 'visitors'): string {
  return `<header class="topbar detail-topbar"><div class="shell detail-header-inner">
    <a class="home-brand" href="/"><span class="home-brand-mark">HR</span><span>PEOPLE GARDEN</span></a>
    <nav class="detail-nav" aria-label="공간 이동">
      <a class="${active === 'workspaces' ? 'active' : ''}" href="/">업무공간</a>
      <details class="detail-nav-group"${active === 'recruitment' ? ' open' : ''}><summary class="${active === 'recruitment' ? 'active' : ''}">채용·입사</summary><div>
        <a href="/recruitment?area=onboarding">입사 체크리스트</a>
        <a href="/recruitment?area=resume">이력서 송부 체크</a>
        <a href="/recruitment?area=interview">면접 일정</a>
        <a href="/recruitment?area=executive">경영진면접</a>
      </div></details>
      <details class="detail-nav-group"${['assets', 'patents', 'visitors'].includes(active) ? ' open' : ''}><summary class="${['assets', 'patents', 'visitors'].includes(active) ? 'active' : ''}">총무관리</summary><div>
        <a href="/?#general-expenses">총무비용</a>
        <a href="/assets">자산관리대장</a>
        <a href="/visitor-cards">방문증 관리</a>
        <a href="/patents">특허관리</a>
      </div></details>
      <a class="${active === 'manual' ? 'active' : ''}" href="/manual">업무매뉴얼</a>
    </nav>
    <div class="home-actions"><span>알림</span><b>C</b></div>
  </div></header>`
}

export { escapeHtml }

