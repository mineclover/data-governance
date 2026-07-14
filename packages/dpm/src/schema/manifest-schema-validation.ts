import Ajv2020 from 'ajv/dist/2020.js'

import dpmManifestSchema from './dpm-manifest.schema.json'
import { toDpmManifestSchemaIssue } from './manifest-schema-issues.js'
import type { DpmManifestSchemaValidationResult } from './manifest-schema-types.js'

const ajv = new Ajv2020({ allErrors: true, strict: false })
const validateDpmManifestSchemaDocument = ajv.compile(dpmManifestSchema)

export function validateDpmManifestSchema(manifest: unknown): DpmManifestSchemaValidationResult {
  const valid = validateDpmManifestSchemaDocument(manifest)
  if (valid) {
    return {
      valid: true,
      issues: [],
    }
  }

  return {
    valid: false,
    issues: (validateDpmManifestSchemaDocument.errors ?? []).map(toDpmManifestSchemaIssue),
  }
}
