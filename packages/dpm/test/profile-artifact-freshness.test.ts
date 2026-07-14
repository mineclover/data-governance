import { describe, expect, it } from 'vitest'

import {
  normalizeDpmProfileArtifact,
} from '../src/index.js'
import { createDbProfileInput } from './support/profile-artifact-db-inputs.js'
import {
  profileArtifactFreshnessChangeCases,
} from './support/profile-artifact-freshness-fixtures.js'
import {
  createReorderedDbProfileInput,
} from './support/profile-artifact-reorder-fixtures.js'

describe('DPM profile artifact freshness', () => {
  it('changes freshness when normalized profile evidence changes', () => {
    for (const {
      label,
      createOriginalInput,
      createChangedInput,
    } of profileArtifactFreshnessChangeCases) {
      const original = normalizeDpmProfileArtifact(createOriginalInput())
      const changed = normalizeDpmProfileArtifact(createChangedInput())

      expect(changed.freshness.versionHash, label).not.toBe(original.freshness.versionHash)
    }
  })

  it('normalizes equivalent profile artifacts to the same freshness hash', () => {
    const first = normalizeDpmProfileArtifact(createDbProfileInput())
    const second = normalizeDpmProfileArtifact(createReorderedDbProfileInput())

    expect(second.freshness.versionHash).toBe(first.freshness.versionHash)
    expect(second.nodes.map(node => node.id)).toEqual(first.nodes.map(node => node.id))
  })
})
