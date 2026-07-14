import { describe, expect, it } from 'vitest'

import {
  normalizeDpmProfileArtifact,
  validateDpmProfileArtifactSchema,
  type DpmProfileArtifact,
} from '../src/index.js'
import { createKafkaProfileInput } from './support/profile-artifact-kafka-inputs.js'
import { profileArtifactSchemaIssueCases } from './support/profile-schema-issue-fixtures.js'

describe('DPM profile artifact schema validation', () => {
  it('returns normalized schema issues for invalid profile artifacts', () => {
    const profile = normalizeDpmProfileArtifact(createKafkaProfileInput()) as DpmProfileArtifact

    for (const { label, createPayload, expectedInstancePathFragment } of profileArtifactSchemaIssueCases) {
      const result = validateDpmProfileArtifactSchema(createPayload(profile))

      expect(result.valid, label).toBe(false)
      expect(
        result.issues.some(issue => issue.instancePath.includes(expectedInstancePathFragment)),
        label,
      ).toBe(true)
    }
  })
})
