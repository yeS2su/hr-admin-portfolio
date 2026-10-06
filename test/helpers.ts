import { createExecutionContext, env, waitOnExecutionContext } from 'cloudflare:test'

import worker from '../src/index'

export const testEnv = env as unknown as { DB: D1Database }

export async function fetchWorker(request: Request): Promise<Response> {
  const ctx = createExecutionContext()
  const response = await worker.fetch(request, env, ctx)
  await waitOnExecutionContext(ctx)
  return response
}

export function formRequest(
  path: string,
  values: Record<string, string>,
  cookie?: string,
): Request {
  const headers = new Headers({
    'content-type': 'application/x-www-form-urlencoded',
    origin: 'https://example.test',
    'cf-connecting-ip': '203.0.113.10',
  })
  if (cookie) headers.set('cookie', cookie)
  return new Request(`https://example.test${path}`, {
    method: 'POST',
    headers,
    body: new URLSearchParams(values),
  })
}

export function responseCookie(response: Response): string {
  const setCookie = response.headers.get('set-cookie') ?? ''
  return setCookie.split(';', 1)[0] ?? ''
}

