import { describe, expect, it } from 'vitest'

import {
  readCommerceRegistrySnapshot,
} from './support/registry-yaml-fixtures.js'
import {
  expectedCommerceDeprecatedRelationshipHistory,
  expectedCommerceRejectedRelationshipHistory,
  expectedCommerceSupersededRelationshipHistory,
} from './support/registry-projection-fixtures.js'

describe('DPM relationship registry non-executable history', () => {
  it('loads rejected, deprecated, and superseded relationships as non-executable history', () => {
    const snapshot = readCommerceRegistrySnapshot()
    const history = snapshot.nonExecutableRelationships

    expect(history.find(relationship => relationship.status === 'rejected'))
      .toMatchObject(expectedCommerceRejectedRelationshipHistory)
    expect(history.find(relationship => relationship.status === 'deprecated'))
      .toMatchObject(expectedCommerceDeprecatedRelationshipHistory)
    expect(history.find(relationship => relationship.status === 'superseded'))
      .toMatchObject(expectedCommerceSupersededRelationshipHistory)
  })
})
