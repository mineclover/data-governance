import { describe, expect, it } from 'vitest'

import { getDpmGatewayOpenApiDocument } from '../src/index.js'
import { compileGatewayComponentSchema } from './support/gateway-schema.js'

const exhaustiveGatewaySchemaValidationTimeoutMs = 30_000

describe('DPM gateway component schemas', () => {
  it('rejects empty objects for every non-opaque gateway component schema', () => {
    const document = getDpmGatewayOpenApiDocument()
    const schemaNames = Object.keys(document.components?.schemas ?? {})
      .filter(schemaName => schemaName !== 'DpmManifestPolicy')

    for (const schemaName of schemaNames) {
      const schema = compileGatewayComponentSchema(schemaName)
      expect(schema({}), `${schemaName} unexpectedly accepted an empty object`).toBe(false)
    }
  }, exhaustiveGatewaySchemaValidationTimeoutMs)
})
