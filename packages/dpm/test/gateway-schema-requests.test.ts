import { describe, expect, it } from 'vitest'

import { gatewayMinimalRequestCases } from './support/gateway-request-minimal-fixtures.js'
import { GATEWAY_WRITE_REQUEST_SCHEMA_NAMES } from './support/gateway-request-schema-fixtures.js'
import { compileGatewayComponentSchema } from './support/gateway-schema.js'

describe('DPM gateway request schemas', () => {
  it('rejects incomplete request payloads for gateway write operations', () => {
    for (const schemaName of GATEWAY_WRITE_REQUEST_SCHEMA_NAMES) {
      const schema = compileGatewayComponentSchema(schemaName)
      expect(schema({}), `${schemaName} unexpectedly accepted an empty object`).toBe(false)
    }
  })

  it('accepts minimal request payloads for gateway write operations', () => {
    for (const [schemaName, payload] of gatewayMinimalRequestCases) {
      const schema = compileGatewayComponentSchema(schemaName)
      expect(schema(payload), JSON.stringify(schema.errors, null, 2)).toBe(true)
    }
  })
})
