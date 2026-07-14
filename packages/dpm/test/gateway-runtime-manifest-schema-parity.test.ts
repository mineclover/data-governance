import { describe, expect, it } from 'vitest'

import { createDpmGatewayRuntime } from '../src/index.js'
import { compileGatewayComponentSchema } from './support/gateway-schema.js'
import { createRuntimeInput } from './support/gateway-runtime-manifest-fixtures.js'

describe('DPM gateway manifest runtime schema parity', () => {
  it('keeps gateway response schemas aligned with actual runtime response payloads', async () => {
    const runtime = createDpmGatewayRuntime()
    const input = createRuntimeInput()
    const compile = await runtime.compileDpmManifest(input)
    const dryRun = await runtime.dryRunDpmManifest(input)

    const compileSchema = compileGatewayComponentSchema('DpmCompileResult')
    const dryRunSchema = compileGatewayComponentSchema('DpmDryRunResult')

    expect(compileSchema(compile.body.result), JSON.stringify(compileSchema.errors, null, 2)).toBe(true)
    expect(dryRunSchema(dryRun.body.result), JSON.stringify(dryRunSchema.errors, null, 2)).toBe(true)
  })
})
