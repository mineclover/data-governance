import { describe, expect, it } from 'vitest'

import { GATEWAY_WORKFLOW_RESPONSE_SCHEMA_NAMES } from './support/gateway-workflow-response-schema-fixtures.js'
import { compileGatewayComponentSchema } from './support/gateway-schema.js'

describe('DPM gateway required response schemas', () => {
  it('rejects incomplete response payloads for gateway workflow schemas', () => {
    for (const schemaName of GATEWAY_WORKFLOW_RESPONSE_SCHEMA_NAMES) {
      const schema = compileGatewayComponentSchema(schemaName)
      expect(schema({}), `${schemaName} unexpectedly accepted an empty object`).toBe(false)
    }
  })
})
