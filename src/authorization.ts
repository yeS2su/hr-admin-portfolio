import type { MiddlewareHandler } from 'hono'

import type { AppContext } from './auth'
import { recordActivity } from './db'
import type { SessionContext } from './types'

export const isOwner = (sessionUserId: string, ownerUserId: string): boolean =>
  sessionUserId === ownerUserId

export const hasActiveEditWindow = (session: SessionContext, now: number): boolean =>
  session.editUnlockedUntil !== null && session.editUnlockedUntil > now

const requestedAction = (path: string): string => {
  if (path.endsWith('/toggle')) return 'work.toggle'
  if (/\/entries\/[^/]+\/delete$/.test(path)) return 'work.delete'
  if (/\/monthly-entries\/[^/]+\/delete$/.test(path)) return 'work.delete.monthly'
  if (/\/monthly-entries\/[^/]+$/.test(path)) return 'work.update.monthly'
  if (path.endsWith('/monthly-entries')) return 'work.create.monthly'
  if (/\/entries\/[^/]+$/.test(path)) return 'work.update'
  return 'work.create'
}

const requestedTargetId = (path: string): string | null => {
  const match = path.match(/\/(?:monthly-entries|entries)\/([^/]+)(?:\/(?:toggle|delete))?$/)
  return match?.[1] ? decodeURIComponent(match[1]) : null
}

async function recordBlockedWrite(
  db: D1Database,
  actorUserId: string,
  path: string,
): Promise<void> {
  await recordActivity(db, {
    id: crypto.randomUUID(),
    actorUserId,
    action: requestedAction(path),
    targetType: 'work_entry',
    targetId: requestedTargetId(path),
    succeeded: false,
    createdAt: Date.now(),
  })
}

export const requireWorkspaceEdit: MiddlewareHandler<AppContext> = async (c, next) => {
  const session = c.get('session')
  if (!session) return c.text('수정하려면 업무공간 비밀번호를 확인해 주세요.', 401)

  const ownerUserId = c.req.param('ownerId') ?? ''
  if (!isOwner(session.userId, ownerUserId)) {
    await recordBlockedWrite(c.env.DB, session.userId, c.req.path)
    return c.text('다른 사용자의 업무는 수정할 수 없습니다.', 403)
  }
  if (!hasActiveEditWindow(session, Date.now())) {
    await recordBlockedWrite(c.env.DB, session.userId, c.req.path)
    return c.text('수정 모드를 열려면 비밀번호를 다시 확인해 주세요.', 403)
  }

  await next()
}


