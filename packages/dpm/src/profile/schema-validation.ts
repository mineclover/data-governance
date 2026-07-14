import Ajv2020 from 'ajv/dist/2020.js'

import { DPM_PROFILE_ARTIFACT_SCHEMA } from './schema-document.js'
import { toDpmProfileArtifactSchemaIssue } from './schema-issues.js'
import type { DpmProfileArtifactSchemaValidationResult } from './schema-types.js'

const ajv = new Ajv2020({ allErrors: true, strict: false })
const validateDpmProfileArtifactSchemaDocument = ajv.compile(DPM_PROFILE_ARTIFACT_SCHEMA)

export function validateDpmProfileArtifactSchema(artifact: unknown): DpmProfileArtifactSchemaValidationResult {
  const valid = validateDpmProfileArtifactSchemaDocument(artifact)
  if (valid) {
    return {
      valid: true,
      issues: [],
    }
  }

  return {
    valid: false,
    issues: (validateDpmProfileArtifactSchemaDocument.errors ?? []).map(toDpmProfileArtifactSchemaIssue),
  }
}
