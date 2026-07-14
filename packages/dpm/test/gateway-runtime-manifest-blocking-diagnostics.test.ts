import { describe, expect, it } from 'vitest'

import { createDpmGatewayRuntime } from '../src/index.js'
import { createBlockingRuntimeInput } from './support/gateway-runtime-manifest-fixtures.js'

describe('DPM gateway manifest blocking diagnostic runtime response', () => {
  it('returns blocking diagnostics as a structured runtime response', async () => {
    const runtime = createDpmGatewayRuntime()
    const input = createBlockingRuntimeInput()
    const response = await runtime.validateDpmManifest(input)
    const compileResponse = await runtime.compileDpmManifest(input)

    expect(response.statusCode).toBe(400)
    expect(response.body.command).toBe('validate')
    expect(response.body.result.valid).toBe(false)
    expect(response.body.result.diagnostics).toContainEqual(expect.objectContaining({
      code: 'SAF013',
      sourcePointer: '/columns/3',
    }))
    expect(compileResponse.statusCode).toBe(400)
    expect(compileResponse.body.command).toBe('compile')
    expect(compileResponse.body.result.ok).toBe(false)
    expect('plan' in compileResponse.body.result).toBe(false)
  })
})
