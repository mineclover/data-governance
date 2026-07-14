import { describe, expect, it } from 'vitest'

import { gatewayMinimalResponseCases } from './support/gateway-workflow-response-minimal-fixtures.js'
import { compileGatewayComponentSchema } from './support/gateway-schema.js'

describe('DPM gateway minimal response schemas', () => {
  it('accepts minimal response payloads for gateway workflow schemas', () => {
    for (const [schemaName, payload] of gatewayMinimalResponseCases) {
      const schema = compileGatewayComponentSchema(schemaName)
      expect(schema(payload), JSON.stringify(schema.errors, null, 2)).toBe(true)
    }
  })
})
