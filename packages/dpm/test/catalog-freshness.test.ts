import { describe, expect, it } from 'vitest'

import {
  createPostgresCatalogSnapshot,
} from '../src/index.js'
import {
  createChangedPostgresCatalogSnapshot,
  createReorderedPostgresCatalogSnapshot,
} from './support/catalog-postgres-freshness-fixtures.js'
import { readPostgresCatalogFixture } from './support/catalog-postgres-input-fixtures.js'

describe('DPM catalog snapshot freshness', () => {
  it('changes the freshness hash when catalog structure changes', () => {
    const fixture = readPostgresCatalogFixture()
    const original = createPostgresCatalogSnapshot(fixture)
    const changed = createChangedPostgresCatalogSnapshot()

    expect(changed.freshness.versionHash).not.toBe(original.freshness.versionHash)
  })

  it('normalizes equivalent snapshots to the same freshness hash', () => {
    const fixture = readPostgresCatalogFixture()
    const first = createPostgresCatalogSnapshot(fixture)
    const second = createReorderedPostgresCatalogSnapshot()

    expect(second.freshness.versionHash).toBe(first.freshness.versionHash)
  })
})
