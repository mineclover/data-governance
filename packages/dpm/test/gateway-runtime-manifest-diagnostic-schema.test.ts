import { describe, expect, it } from 'vitest'

import { compileGatewayComponentSchema } from './support/gateway-schema.js'

const missingRelationshipDiagnostic = {
  severity: 'error',
  code: 'REL001',
  message: 'missing relationship',
  sourcePointer: '/relationships/0/name',
}

describe('DPM gateway manifest runtime diagnostic schemas', () => {
  it('rejects information-empty diagnostic coordinates', () => {
    const diagnosticSchema = compileGatewayComponentSchema('DpmDiagnostic')

    expect(diagnosticSchema({
      ...missingRelationshipDiagnostic,
      catalogCoordinate: {},
    }), 'DpmDiagnostic unexpectedly accepted an empty catalog coordinate').toBe(false)
    expect(diagnosticSchema({
      ...missingRelationshipDiagnostic,
      registryCoordinate: {},
    }), 'DpmDiagnostic unexpectedly accepted an empty registry coordinate').toBe(false)
  })

  it('accepts minimal informative diagnostic coordinates', () => {
    const diagnosticSchema = compileGatewayComponentSchema('DpmDiagnostic')

    expect(diagnosticSchema({
      ...missingRelationshipDiagnostic,
      catalogCoordinate: { table: 'orders' },
    }), JSON.stringify(diagnosticSchema.errors, null, 2)).toBe(true)
    expect(diagnosticSchema({
      ...missingRelationshipDiagnostic,
      registryCoordinate: { relationshipName: 'rel_orders_customer' },
    }), JSON.stringify(diagnosticSchema.errors, null, 2)).toBe(true)
  })

  it('rejects diagnostic codes outside the DPM diagnostic taxonomy', () => {
    const diagnosticSchema = compileGatewayComponentSchema('DpmDiagnostic')

    expect(diagnosticSchema({
      severity: 'error',
      code: 'FOO999',
      message: 'unknown code',
      sourcePointer: '/relationships/0/name',
    }), 'DpmDiagnostic unexpectedly accepted an unknown diagnostic code').toBe(false)
  })
})
