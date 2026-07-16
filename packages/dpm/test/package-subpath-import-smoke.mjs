const [
  packageModule,
  catalogModule,
  dataModule,
  profileModule,
  relationshipModule,
  gatewayModule,
  storageModule,
  publishingModule,
  authoringModule,
] = await Promise.all([
  import('@oa-sdk/dpm/package'),
  import('@oa-sdk/dpm/catalog'),
  import('@oa-sdk/dpm/data'),
  import('@oa-sdk/dpm/profile'),
  import('@oa-sdk/dpm/relationship'),
  import('@oa-sdk/dpm/gateway'),
  import('@oa-sdk/dpm/storage'),
  import('@oa-sdk/dpm/publishing'),
  import('@oa-sdk/dpm/authoring'),
])

const checks = [
  ['package', packageModule.DPM_PACKAGE_NAME === '@oa-sdk/dpm'],
  ['catalog', typeof catalogModule.normalizeCatalogSnapshot === 'function'],
  ['data', typeof dataModule.createDpmDataDefinitions === 'function'
    && typeof dataModule.createDpmApiBinding === 'function'
    && typeof dataModule.createDpmDataFieldIdentity === 'function'
    && typeof dataModule.createDpmIdentityDataDefinitions === 'function'
    && typeof dataModule.createDpmApiObjectCanonicalIdentity === 'function'],
  ['profile', typeof profileModule.normalizeDpmProfileArtifact === 'function'
    && typeof profileModule.profileKafkaTopic === 'function'
    && typeof profileModule.validateDpmKafkaTopicProfileInput === 'function'
    && typeof profileModule.createDpmRelationshipCandidateInputFromProfileHint === 'function'
    && typeof profileModule.resolveDpmProfileAnalysisPolicy === 'function'
    && Array.isArray(profileModule.DPM_KAFKA_TOPIC_PROFILE_CAPTURE_MODES)
    && profileModule.DEFAULT_DPM_PROFILE_ANALYSIS_POLICY.measuredRelationshipPresenceThreshold === 0.95],
  ['relationship', typeof relationshipModule.createLogicalRelationship === 'function'
    && relationshipModule.DPM_DEFAULT_CANONICAL_KEY_ENCODING_VERSION === 'string-v1'
    && relationshipModule.DPM_CANONICAL_KEY_ENCODING_VERSIONS.join(',') === 'string-v1,typed-v2'
    && typeof relationshipModule.assertDpmCanonicalKeyEncodingVersionMatchesPlan === 'function'
    && typeof relationshipModule.renderEntityCanonicalKeyForPlan === 'function'
    && typeof relationshipModule.renderRelationshipCanonicalKeyForPlan === 'function'
    && renderBuiltTypedV2Golden(relationshipModule)
      === 'typed-v2|n|8:customer|c|11:customer_no|n|1:1'],
  ['gateway', typeof gatewayModule.createDpmGatewayRuntime === 'function'
    && typeof gatewayModule.listDpmRegistryRelationshipAuditEventsRuntime === 'function'],
  ['storage', typeof storageModule.createDpmProfileBaselineRepository === 'function'
    && typeof storageModule.createDpmRegistryRelationshipRow === 'function'
    && typeof storageModule.DpmRegistryApprovedRelationshipConflictError === 'function'
    && typeof storageModule.isDpmRegistryApprovedRelationshipConflictError === 'function'
    && typeof storageModule.applyDpmRegistryStorageSchema === 'function'
    && Array.isArray(storageModule.DPM_REGISTRY_STORAGE_SCHEMA_SQL_BLOCKS)
    && storageModule.DPM_REGISTRY_APPROVED_RELATIONSHIP_CONFLICT_ERROR_CODE === 'DPM_REGISTRY_APPROVED_RELATIONSHIP_CONFLICT'
    && Array.isArray(storageModule.DPM_REGISTRY_RELATIONSHIP_AUDIT_EVENT_TYPES)],
  ['publishing', typeof publishingModule.createDpmPublishingContext === 'function'],
  ['authoring', typeof authoringModule.createDpmAuthoringService === 'function'
    && typeof authoringModule.createDpmInMemoryAuthoringRepository === 'function'
    && typeof authoringModule.createDpmAsyncAuthoringService === 'function'
    && typeof authoringModule.createDpmConfiguredAsyncAuthoringService === 'function'
    && typeof authoringModule.resolveDpmAuthoringBackend === 'function'
    && typeof authoringModule.selectDpmAuthoringBackendAdapter === 'function'
    && authoringModule.DPM_AUTHORING_BACKEND_ENV === 'DPM_AUTHORING_BACKEND'
    && authoringModule.DPM_AUTHORING_BACKEND_VALUES.join(',') === 'memory,postgres'
    && authoringModule.DPM_DEFAULT_AUTHORING_BACKEND === 'memory'
    && authoringModule.resolveDpmAuthoringBackend({ env: {} }).backend === 'memory'
    && typeof authoringModule.exportDpmAuthoringDefinitions === 'function'
    && typeof authoringModule.importDpmAuthoringDefinitions === 'function'
    && typeof authoringModule.explainDpmAuthoringDefinitions === 'function'
    && typeof authoringModule.createDpmAuthoringQuickFixes === 'function'
    && typeof authoringModule.DpmAuthoringError === 'function'
    && typeof authoringModule.createDpmPostgresAuthoringStorage === 'function'
    && Array.isArray(authoringModule.DPM_AUTHORING_STORAGE_SCHEMA_SQL_BLOCKS)],
]

const failures = checks
  .filter(([, passed]) => !passed)
  .map(([subpath]) => subpath)

if (failures.length > 0) {
  throw new Error(`DPM subpath import smoke failed: ${failures.join(', ')}`)
}

console.log('DPM subpath imports OK')

function renderBuiltTypedV2Golden(relationshipModule) {
  const entity = relationshipModule.createEntityDeclaration({
    name: 'customer',
    namespace: 'customer',
    root: {
      table: 'public.customers',
      columns: ['customer_no'],
    },
    keyStrategy: {
      type: 'single_column',
      canonicalColumns: ['customer_no'],
      encodingVersion: 'typed-v2',
    },
    transform: {
      type: 'deterministic_token',
      namespace: 'customer',
      reversible: true,
    },
  })
  return relationshipModule.renderEntityCanonicalKey(entity, { customer_no: 1 })
}
