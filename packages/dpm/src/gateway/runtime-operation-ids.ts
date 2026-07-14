export const DPM_GATEWAY_RUNTIME_OPERATION_IDS = [
  'inspectDpmProfile',
  'analyzeDpmProfile',
  'listDpmProfileBaselineSummaries',
  'reviewDpmProfileProposal',
  'discoverDpmRelationships',
  'importDpmRelationshipCandidates',
  'approveDpmRelationshipCandidate',
  'approveDpmProfileRelationshipHint',
  'exportDpmRegistrySnapshot',
  'listDpmRegistryRelationshipAuditEvents',
  'validateDpmManifest',
  'compileDpmManifest',
  'dryRunDpmManifest',
] as const

export type DpmGatewayRuntimeOperationId = typeof DPM_GATEWAY_RUNTIME_OPERATION_IDS[number]
