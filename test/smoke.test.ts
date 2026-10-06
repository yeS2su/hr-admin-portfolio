import {
  createExecutionContext,
  env,
  waitOnExecutionContext,
} from 'cloudflare:test'
import { describe, expect, it } from 'vitest'

import worker from '../src/index'

describe('foundation worker', () => {
  it('opens the team home without a site login', async () => {
    const request = new Request('https://example.test/')
    const ctx = createExecutionContext()
    const response = await worker.fetch(request, env, ctx)
    await waitOnExecutionContext(ctx)

    expect(response.status).toBe(200)
    expect(await response.text()).toContain('팀 업무공간')
  })
})


