import { describe, expect, it } from 'vitest'

import {
  DPM_MANIFEST_SCHEMA_ID,
  getDpmGatewayOpenApiDocument,
} from '../src/index.js'
import { compileGatewayComponentSchema } from './support/gateway-schema.js'

describe('DPM gateway manifest policy schema', () => {
  it('references the DPM manifest JSON Schema without taking ownership of policy semantics', () => {
    const document = getDpmGatewayOpenApiDocument()
    const manifestSchema = document.components?.schemas?.DpmManifestPolicy as Record<string, any>
    const compiledManifestPolicy = compileGatewayComponentSchema('DpmManifestPolicy')

    expect(manifestSchema['x-dpm-manifest-schema-id']).toBe(DPM_MANIFEST_SCHEMA_ID)
    expect(manifestSchema.additionalProperties).toBe(true)
    expect(manifestSchema.properties).toBeUndefined()
    expect(compiledManifestPolicy({})).toBe(true)
  })
})
