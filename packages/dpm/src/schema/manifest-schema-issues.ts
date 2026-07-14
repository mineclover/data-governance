import type { ErrorObject } from 'ajv/dist/2020.js'

import type { DpmManifestSchemaIssue } from './manifest-schema-types.js'

export function toDpmManifestSchemaIssue(error: ErrorObject): DpmManifestSchemaIssue {
  return {
    instancePath: error.instancePath || '/',
    schemaPath: error.schemaPath,
    keyword: error.keyword,
    message: formatSchemaMessage(error),
  }
}

function formatSchemaMessage(error: ErrorObject): string {
  const message = error.message ?? 'failed JSON Schema validation'
  const missingProperty = typeof error.params?.missingProperty === 'string'
    ? `: ${error.params.missingProperty}`
    : ''
  return `DPM manifest schema ${message}${missingProperty}.`
}
