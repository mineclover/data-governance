import { describe, expect, it } from 'vitest'

import { validateDpmManifest } from '../src/index.js'
import {
  createApprovedRegistrySnapshotMismatchInput,
  expectedApprovedRegistrySnapshotMismatchDiagnosticCodes,
} from './support/validator-relationship-registry-fixtures.js'

describe('DPM relationship validator registry snapshot gates', () => {
  it('rejects manifests that spoof an approved registry relationship by changing its approved namespace', () => {
    const result = validateDpmManifest(createApprovedRegistrySnapshotMismatchInput())

    expect(result.valid).toBe(false)
    expect(result.diagnostics.map(diagnostic => diagnostic.code)).toEqual([
      ...expectedApprovedRegistrySnapshotMismatchDiagnosticCodes,
    ])
    expect(result.diagnostics.find(diagnostic => diagnostic.code === 'REL013')).toMatchObject({
      sourcePointer: '/relationships/0/namespace',
      registryCoordinate: {
        datasetId: 'commerce_ai',
        registryVersion: 'reg-2026-07-01',
        relationshipName: 'rel_orders_customer',
        relationshipVersion: '1',
        status: 'approved',
      },
    })
  })
})
