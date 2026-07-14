import { describe, expect, it } from 'vitest'

import { compileGatewayComponentSchema } from './support/gateway-schema.js'
import { GATEWAY_RUNTIME_RESULT_SCHEMA_NAMES } from './support/gateway-runtime-manifest-result-schema-fixtures.js'

describe('DPM gateway manifest runtime response schemas', () => {
  it('rejects incomplete gateway response payloads for core runtime schemas', () => {
    for (const schemaName of GATEWAY_RUNTIME_RESULT_SCHEMA_NAMES) {
      const schema = compileGatewayComponentSchema(schemaName)
      expect(schema({}), `${schemaName} unexpectedly accepted an empty object`).toBe(false)
    }
  })

  it('rejects information-empty nested dry-run response objects', () => {
    const dryRunSchema = compileGatewayComponentSchema('DpmDryRunResult')

    expect(dryRunSchema({
      kind: 'dpm.dry-run-report.v1',
      planIdentity: 'plan-001',
      manifestId: 'manifest-001',
      stale: false,
      impact: {},
      categories: [],
      rawValuesIncluded: false,
    }), 'DpmDryRunResult unexpectedly accepted an empty impact object').toBe(false)
  })
})
