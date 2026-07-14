import Ajv2020 from 'ajv/dist/2020.js'
import { describe, expect, it } from 'vitest'

import {
  DPM_PROFILE_ARTIFACT_SCHEMA,
  normalizeDpmProfileArtifact,
  type DpmProfileArtifact,
} from '../src/index.js'
import { createKafkaProfileInput } from './support/profile-artifact-kafka-inputs.js'
import { profileArtifactSchemaRejectionCases } from './support/profile-schema-rejection-fixtures.js'
import { profileArtifactSchemaTaxonomyProjectionCases } from './support/profile-schema-taxonomy-fixtures.js'
import {
  formatSchemaPath,
  getSchemaPathValue,
} from './support/schema-path.js'

function compileProfileSchema() {
  const ajv = new Ajv2020({ allErrors: true, strict: false })
  return ajv.compile(DPM_PROFILE_ARTIFACT_SCHEMA)
}

describe('DPM profile artifact JSON Schema contract', () => {
  it('projects runtime profile taxonomies into the JSON Schema contract', () => {
    for (const { label, path, expected } of profileArtifactSchemaTaxonomyProjectionCases) {
      expect(getSchemaPathValue(DPM_PROFILE_ARTIFACT_SCHEMA, path), `${label}: ${formatSchemaPath(path)}`).toEqual([
        ...expected,
      ])
    }
  })

  it('rejects unknown taxonomy values, missing provenance, and raw sample payload fields', () => {
    const validate = compileProfileSchema()
    const profile = normalizeDpmProfileArtifact(createKafkaProfileInput()) as DpmProfileArtifact

    for (const { label, createPayload } of profileArtifactSchemaRejectionCases) {
      expect(validate(createPayload(profile)), `profile unexpectedly accepted ${label}`).toBe(false)
    }
  })
})
