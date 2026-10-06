import { compare } from 'bcryptjs'

export const SESSION_COOKIE = 'hr_session'
export const SESSION_DURATION_MS = 8 * 60 * 60 * 1000
export const LOGIN_WINDOW_MS = 15 * 60 * 1000
export const MAX_FAILED_LOGINS = 5

const DUMMY_PASSWORD_HASH =
  '$2b$12$xShMvfgaUuex8HZmOV2cQurePOnLhd0QYXw/s0c9NdYvFsZfn2ec2'

export const normalizeLoginId = (value: string): string => value.trim().toLowerCase()

export const verifyPassword = async (
  password: string,
  passwordHash: string | null,
): Promise<boolean> => compare(password, passwordHash ?? DUMMY_PASSWORD_HASH)

export function generateSessionToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  const binary = String.fromCharCode(...bytes)
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}

export async function sha256(value: string): Promise<string> {
  const data = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export const createLoginKeyHash = (loginId: string, ip: string): Promise<string> =>
  sha256(`${normalizeLoginId(loginId)}|${ip}`)
