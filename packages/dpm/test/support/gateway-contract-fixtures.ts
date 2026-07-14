export const GATEWAY_OPENAPI_PATHS = [
  '/dpm/catalog/profile',
  '/dpm/jobs/execute',
  '/dpm/jobs/{jobId}/report',
  '/dpm/manifests/compile',
  '/dpm/manifests/dry-run',
  '/dpm/manifests/validate',
  '/dpm/profiles/analyze',
  '/dpm/profiles/baselines/summaries',
  '/dpm/profiles/inspect',
  '/dpm/profiles/proposals/{proposalId}/review',
  '/dpm/profiles/relationship-hints/{relationshipName}/approve',
  '/dpm/registry/audit-events/list',
  '/dpm/registry/snapshots/{datasetId}/{registryVersion}',
  '/dpm/relationships/candidates/import',
  '/dpm/relationships/discover',
  '/dpm/relationships/{relationshipName}/approve',
] as const

export const GATEWAY_SECRET_BEARING_OPERATION_FRAGMENTS = [
  'sourcedbcredential',
  'source_db_credential',
  'vaultkey',
  'reverse token',
  '/tokens/resolve',
] as const
