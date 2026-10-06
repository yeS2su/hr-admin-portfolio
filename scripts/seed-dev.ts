import { spawnSync } from 'node:child_process'
import { join } from 'node:path'

import { hash } from 'bcryptjs'

const MOCK_PASSWORD = 'DemoOnly!2026'
const now = Date.now()
const passwordHash = await hash(MOCK_PASSWORD, 12)

const quote = (value: string) => `'${value.replaceAll("'", "''")}'`

const users = [
  ['00000000-0000-4000-8000-00000000000a', 'user-a', '사용자 A'],
  ['00000000-0000-4000-8000-00000000000b', 'user-b', '사용자 B'],
  ['00000000-0000-4000-8000-00000000000c', 'user-c', '사용자 C'],
] as const

const entries = [
  ['10000000-0000-4000-8000-00000000000a', users[0][0], '2026-09-21', '주간 일정 확인', 0],
  ['10000000-0000-4000-8000-00000000000b', users[1][0], '2026-09-21', '문서 목록 정리', 1],
  ['10000000-0000-4000-8000-00000000000c', users[2][0], '2026-09-22', '회의 준비', 0],
] as const

const statements = [
  ...users.map(
    ([id, loginId, displayName]) =>
      `INSERT INTO users (id, login_id, display_name, password_hash, is_active, created_at, updated_at)
       VALUES (${quote(id)}, ${quote(loginId)}, ${quote(displayName)}, ${quote(passwordHash)}, 1, ${now}, ${now})
       ON CONFLICT(id) DO UPDATE SET login_id = excluded.login_id, display_name = excluded.display_name,
       password_hash = excluded.password_hash, is_active = 1, updated_at = excluded.updated_at;`,
  ),
  ...entries.map(
    ([id, ownerId, workDate, content, completed]) =>
      `INSERT INTO work_entries (id, owner_user_id, work_date, content, is_completed, created_at, updated_at)
       VALUES (${quote(id)}, ${quote(ownerId)}, ${quote(workDate)}, ${quote(content)}, ${completed}, ${now}, ${now})
       ON CONFLICT(id) DO UPDATE SET work_date = excluded.work_date, content = excluded.content,
       is_completed = excluded.is_completed, updated_at = excluded.updated_at;`,
  ),
]

const wrangler = join(process.cwd(), 'node_modules', 'wrangler', 'bin', 'wrangler.js')
for (const statement of statements) {
  const result = spawnSync(
    process.execPath,
    [wrangler, 'd1', 'execute', 'DB', '--local', '--command', statement],
    { stdio: 'inherit' },
  )
  if (result.error) {
    throw result.error
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

console.log('가상 계정 3개와 가상 업무 3개를 준비했습니다.')


