import { escapeHtml, pageLayout } from './layout'

export function loginPage(error?: string): string {
  const errorMessage = error
    ? `<p role="alert" aria-live="polite">${escapeHtml(error)}</p>`
    : ''
  return pageLayout(
    '팀 업무공간 로그인',
    `<main class="login-wrap">
      <h1>팀 업무공간</h1>
      <p>현재 가상 데이터로 확인 중입니다. 실제 회사 정보는 입력하지 마세요.</p>
      ${errorMessage}
      <form method="post" action="/login">
        <label for="loginId">아이디</label>
        <input id="loginId" name="loginId" autocomplete="username" required maxlength="100">
        <label for="password">비밀번호</label>
        <input id="password" name="password" type="password" autocomplete="current-password" required maxlength="200">
        <button type="submit">로그인</button>
      </form>
    </main>`,
  )
}

