import { describe, expect, it } from 'vitest'

import { gatewayInvalidResponseTaxonomyCases } from './support/gateway-response-taxonomy-fixtures.js'
import { compileGatewayComponentSchema } from './support/gateway-schema.js'

describe('DPM gateway response taxonomy schemas', () => {
  it('rejects workflow response taxonomy values outside DPM review and registry contracts', () => {
    for (const [schemaName, payload, label] of gatewayInvalidResponseTaxonomyCases) {
      const schema = compileGatewayComponentSchema(schemaName)
      expect(schema(payload), `${schemaName} unexpectedly accepted ${label}`).toBe(false)
    }
  })
})
