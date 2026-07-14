import { describe, expect, it } from 'vitest'

import {
  readCommerceRegistrySnapshot,
} from './support/registry-yaml-fixtures.js'
import {
  createReorderedCommerceRegistrySnapshot,
} from './support/registry-reorder-fixtures.js'

describe('DPM relationship registry identity', () => {
  it('keeps snapshot identity stable for equivalent relationship ordering', () => {
    const snapshot = readCommerceRegistrySnapshot()
    const reordered = createReorderedCommerceRegistrySnapshot(snapshot)

    expect(reordered.identity).toBe(snapshot.identity)
    expect(reordered.relationships.map(relationship => relationship.identity)).toEqual(
      snapshot.relationships.map(relationship => relationship.identity),
    )
  })
})
