import type { Context, MiddlewareHandler } from 'hono'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'

import {
  countRecentFailedLogins,
  createSession,
  deleteSession,
  extendEditSession,
  findSessionContext,
  findUserById,
  findUserByLoginId,
  recordLoginAttempt,
  touchSession,
  unlockSession,
} from './db'
import {
  createLoginKeyHash,
  generateSessionToken,
  LOGIN_WINDOW_MS,
  MAX_FAILED_LOGINS,
  normalizeLoginId,
  SESSION_COOKIE,
  SESSION_DURATION_MS,
  sha256,
  verifyPassword,
} from './security'
import type { Env, SessionContext } from './types'
import { isOwner } from './authorization'
import { loginPage } from './views/login'

export type AppVariables = {
  session: SessionContext | null
  sessionTokenHash: string | null
}

export type AppContext = {
  Bindings: Env
  Variables: AppVariables
}

const GENERIC_LOGIN_ERROR = '아이디 또는 비밀번호를 확인해 주세요.'
const RATE_LIMIT_ERROR = '로그인 시도가 많습니다. 잠시 후 다시 시도해 주세요.'

export const loadSession: MiddlewareHandler<AppContext> = async (c, next) => {
  const token = getCookie(c, SESSION_COOKIE)
  if (!token) {
    c.set('session', null)
    c.set('sessionTokenHash', null)
    await next()
    return
  }

  const tokenHash = await sha256(token)
  const session = await findSessionContext(c.env.DB, tokenHash)
  const now = Date.now()
  if (!session || session.expiresAt <= now) {
    if (session) await deleteSession(c.env.DB, tokenHash)
    deleteCookie(c, SESSION_COOKIE, { path: '/', secure: true })
    c.set('session', null)
    c.set('sessionTokenHash', null)
    await next()
    return
  }

  c.set('session', session)
  c.set('sessionTokenHash', tokenHash)
  await touchSession(c.env.DB, tokenHash, now)
  if (session.editUnlockedUntil !== null) {
    const editSessionDuration = 400 * 24 * 60 * 60 * 1000
    const refreshedUntil = now + editSessionDuration
    await extendEditSession(c.env.DB, tokenHash, refreshedUntil)
    session.expiresAt = refreshedUntil
    session.editUnlockedUntil = refreshedUntil
    setCookie(c, SESSION_COOKIE, token, {
      path: '/', secure: true, httpOnly: true, sameSite: 'Lax',
      maxAge: editSessionDuration / 1000,
    })
  }
  await next()
}

export const requireSession: MiddlewareHandler<AppContext> = async (c, next) => {
  if (!c.get('session')) {
    if (c.req.method === 'GET') return c.redirect('/login')
    return c.text('로그인이 필요합니다.', 401)
  }
  await next()
}

export function showLogin(c: Context<AppContext>): Response {
  if (c.get('session')) return c.redirect('/')
  return c.html(loginPage())
}

export async function login(c: Context<AppContext>): Promise<Response> {
  const body = await c.req.parseBody()
  const rawLoginId = typeof body.loginId === 'string' ? body.loginId : ''
  const password = typeof body.password === 'string' ? body.password : ''
  const loginId = normalizeLoginId(rawLoginId)
  const now = Date.now()
  const requestIp = c.req.header('cf-connecting-ip') ?? 'unknown'
  const loginKeyHash = await createLoginKeyHash(loginId, requestIp)

  const failedCount = await countRecentFailedLogins(
    c.env.DB,
    loginKeyHash,
    now - LOGIN_WINDOW_MS,
  )
  if (failedCount >= MAX_FAILED_LOGINS) {
    return c.html(loginPage(RATE_LIMIT_ERROR), 429)
  }

  const fieldsValid =
    loginId.length >= 1 && loginId.length <= 100 && password.length >= 1 && password.length <= 200
  const user = fieldsValid ? await findUserByLoginId(c.env.DB, loginId) : null
  const passwordMatches = await verifyPassword(password, user?.passwordHash ?? null)
  const succeeded = Boolean(fieldsValid && user?.isActive && passwordMatches)

  await recordLoginAttempt(c.env.DB, {
    id: crypto.randomUUID(),
    loginKeyHash,
    attemptedAt: now,
    succeeded,
  })

  if (!succeeded || !user) {
    return c.html(loginPage(GENERIC_LOGIN_ERROR), 401)
  }

  const token = generateSessionToken()
  const tokenHash = await sha256(token)
  await createSession(c.env.DB, {
    tokenHash,
    userId: user.id,
    expiresAt: now + SESSION_DURATION_MS,
    editUnlockedUntil: null,
    lastSeenAt: now,
    createdAt: now,
  })
  setCookie(c, SESSION_COOKIE, token, {
    path: '/',
    secure: true,
    httpOnly: true,
    sameSite: 'Lax',
    maxAge: SESSION_DURATION_MS / 1000,
  })
  return c.redirect('/')
}

export async function logout(c: Context<AppContext>): Promise<Response> {
  const tokenHash = c.get('sessionTokenHash')
  if (tokenHash) await deleteSession(c.env.DB, tokenHash)
  deleteCookie(c, SESSION_COOKIE, { path: '/', secure: true })
  return c.redirect('/login')
}
export async function unlockWorkspace(c: Context<AppContext>): Promise<Response> {
  const ownerUserId = c.req.param('ownerId') ?? ''
  const owner = await findUserById(c.env.DB, ownerUserId)
  if (!owner || !owner.isActive) return c.text('업무공간을 찾을 수 없습니다.', 404)

  const body = await c.req.parseBody()
  const password = typeof body.password === 'string' ? body.password : ''
  const now = Date.now()
  const requestIp = c.req.header('cf-connecting-ip') ?? 'unknown'
  const loginKeyHash = await createLoginKeyHash(owner.id, requestIp)
  const failedCount = await countRecentFailedLogins(c.env.DB, loginKeyHash, now - LOGIN_WINDOW_MS)
  if (failedCount >= MAX_FAILED_LOGINS) {
    return c.text('비밀번호 입력 시도가 많습니다. 잠시 후 다시 시도해 주세요.', 429)
  }
  const passwordMatches = await verifyPassword(password, owner.passwordHash)
  await recordLoginAttempt(c.env.DB, {
    id: crypto.randomUUID(),
    loginKeyHash,
    attemptedAt: now,
    succeeded: passwordMatches,
  })
  if (!passwordMatches) return c.text('비밀번호를 확인해 주세요.', 401)

  const previousTokenHash = c.get('sessionTokenHash')
  if (previousTokenHash) await deleteSession(c.env.DB, previousTokenHash)

  const editSessionDuration = 400 * 24 * 60 * 60 * 1000
  const token = generateSessionToken()
  const tokenHash = await sha256(token)
  await createSession(c.env.DB, {
    tokenHash,
    userId: owner.id,
    expiresAt: now + editSessionDuration,
    editUnlockedUntil: now + editSessionDuration,
    lastSeenAt: now,
    createdAt: now,
  })
  setCookie(c, SESSION_COOKIE, token, {
    path: '/',
    secure: true,
    httpOnly: true,
    sameSite: 'Lax',
    maxAge: editSessionDuration / 1000,
  })
  return c.redirect(`/workspace/${ownerUserId}`)
}




