import { describe, expect, it } from 'vitest'

import { validateDpmManifest } from '../src/index.js'
import {
  createValidationInput,
  expectedMissingRelationshipSafetyDiagnosticCodes,
} from './support/validator-fixtures.js'

describe('DPM validator safety gates', () => {
  it.each([
    {
      label: 'identical',
      duplicate: (column: Record<string, any>) => structuredClone(column),
    },
    {
      label: 'conflicting',
      duplicate: (column: Record<string, any>) => ({
        ...structuredClone(column),
        role: 'business_metric',
        pii: false,
        transform: { type: 'keep' },
      }),
    },
  ])('rejects $label policies for the same table and column', ({ duplicate }) => {
    const input = createValidationInput()
    const manifest = structuredClone(input.manifest) as Record<string, any>
    manifest.columns.push(duplicate(manifest.columns[0]))

    const result = validateDpmManifest({
      ...input,
      manifest,
    })

    expect(result.valid).toBe(false)
    expect(result.diagnostics.filter(diagnostic => diagnostic.code === 'SAF013')).toEqual([
      expect.objectContaining({
        severity: 'error',
        sourcePointer: '/columns/3',
        catalogCoordinate: {
          table: 'public.customers',
          column: 'customer_no',
        },
      }),
    ])
  })

  it('rejects columns that reference a relationship absent from the manifest relationship set', () => {
    const input = createValidationInput()
    const manifest = structuredClone(input.manifest) as Record<string, any>
    manifest.columns[1].relationship = 'rel_missing_customer'
    manifest.columns[1].transform.relationship = 'rel_missing_customer'

    const result = validateDpmManifest({
      ...input,
      manifest,
    })

    expect(result.valid).toBe(false)
    expect(result.diagnostics.map(diagnostic => diagnostic.code)).toEqual([
      ...expectedMissingRelationshipSafetyDiagnosticCodes,
    ])
    expect(result.diagnostics.find(diagnostic => diagnostic.code === 'SAF012')).toMatchObject({
      sourcePointer: '/columns/1/relationship',
      registryCoordinate: {
        datasetId: 'commerce_ai',
        registryVersion: 'reg-2026-07-01',
        relationshipName: 'rel_missing_customer',
      },
    })
  })
})
