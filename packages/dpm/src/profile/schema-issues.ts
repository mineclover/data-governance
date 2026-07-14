import type { ErrorObject } from 'ajv'

import type { DpmProfileArtifactSchemaIssue } from './schema-types.js'

export function toDpmProfileArtifactSchemaIssue(error: ErrorObject): DpmProfileArtifactSchemaIssue {
  return {
    instancePath: error.instancePath || '/',
    schemaPath: error.schemaPath,
    keyword: error.keyword,
    message: formatProfileSchemaMessage(error),
  }
}

function formatProfileSchemaMessage(error: ErrorObject): string {
  const message = error.message ?? 'failed JSON Schema validation'
  const missingProperty = typeof error.params?.missingProperty === 'string'
    ? `: ${error.params.missingProperty}`
    : ''
  return `DPM profile artifact schema ${message}${missingProperty}.`
}
