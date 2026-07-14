import { describe, expect, it } from 'vitest'

import {
  DPM_PROFILE_ARTIFACT_KIND,
  normalizeDpmProfileArtifact,
  validateDpmProfileArtifactSchema,
} from '../src/index.js'
import {
  profileArtifactSourceCases,
  profileArtifactVersionHashPattern,
} from './support/profile-artifact-source-fixtures.js'

describe('DPM profile artifact normalization', () => {
  it('normalizes DB and Kafka evidence into the same profile artifact contract', () => {
    for (const { label, createInput } of profileArtifactSourceCases) {
      const profile = normalizeDpmProfileArtifact(createInput())
      expect(profile.kind).toBe(DPM_PROFILE_ARTIFACT_KIND)
      expect(profile.freshness.versionHash, `${label} freshness hash`)
        .toMatch(profileArtifactVersionHashPattern)
      expect(validateDpmProfileArtifactSchema(profile).valid, `${label} schema validity`).toBe(true)
    }
  })
})
