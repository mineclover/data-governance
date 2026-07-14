export const GATEWAY_WRITE_REQUEST_SCHEMA_NAMES = [
  'DpmCatalogProfileRequest',
  'DpmProfileInspectionRequest',
  'DpmProfileAnalysisRequest',
  'DpmProfileBaselineSummaryListRequest',
  'DpmProfileProposalReviewRequest',
  'DpmProfileRelationshipHintApprovalRequest',
  'DpmRelationshipDiscoveryRequest',
  'DpmCandidateImportRequest',
  'DpmRelationshipApprovalRequest',
  'DpmRegistryAuditEventListRequest',
  'DpmManifestValidationRequest',
  'DpmManifestCompileRequest',
  'DpmManifestDryRunRequest',
  'DpmExecuteJobRequest',
] as const

export type GatewayWriteRequestSchemaName =
  typeof GATEWAY_WRITE_REQUEST_SCHEMA_NAMES[number]
