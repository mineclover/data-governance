export type DpmProfileArtifactSchemaIssue = {
  instancePath: string
  schemaPath: string
  keyword: string
  message: string
}

export type DpmProfileArtifactSchemaValidationResult = {
  valid: boolean
  issues: DpmProfileArtifactSchemaIssue[]
}
