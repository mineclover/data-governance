export type DpmManifestSchemaIssue = {
  instancePath: string
  schemaPath: string
  keyword: string
  message: string
}

export type DpmManifestSchemaValidationResult = {
  valid: boolean
  issues: DpmManifestSchemaIssue[]
}
