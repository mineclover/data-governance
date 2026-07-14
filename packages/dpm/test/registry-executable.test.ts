import { describe, expect, it } from 'vitest'

import { selectApprovedRelationships } from '../src/index.js'
import {
  readCommerceRegistrySnapshot,
} from './support/registry-yaml-fixtures.js'
import {
  expectedCommerceApprovedRelationshipNames,
  expectedCommerceNonExecutableStatuses,
} from './support/registry-projection-fixtures.js'

describe('DPM relationship registry executable selection', () => {
  it('selects only approved relationships for compilation', () => {
    const snapshot = readCommerceRegistrySnapshot()
    const approved = selectApprovedRelationships(snapshot)

    expect(approved.map(relationship => relationship.name)).toEqual([...expectedCommerceApprovedRelationshipNames])
    expect(approved.every(relationship => relationship.executable)).toBe(true)
    expect(snapshot.nonExecutableRelationships.map(relationship => relationship.status).sort()).toEqual([
      ...expectedCommerceNonExecutableStatuses,
    ])
  })
})
