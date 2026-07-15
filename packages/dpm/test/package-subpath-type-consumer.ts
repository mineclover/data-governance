import {
  DPM_PACKAGE_NAME,
  type DpmVersion,
} from '@oa-sdk/dpm/package'
import {
  computeCatalogFreshnessHash,
  type CatalogSnapshot,
} from '@oa-sdk/dpm/catalog'
import {
  createDpmIdentityDataDefinitions,
  type DpmIdentityDataDefinitions,
  type DpmNeutralDataBindingArtifact,
} from '@oa-sdk/dpm/data'
import {
  createDpmRelationshipCandidateInputFromResolvedProfileHint,
  createDpmRelationshipCandidateInputFromProfileHint,
  computeDpmProfileAnalysisPolicyHash,
  DEFAULT_DPM_PROFILE_ANALYSIS_POLICY,
  DPM_KAFKA_TOPIC_PROFILE_CAPTURE_MODES,
  DPM_KAFKA_TOPIC_PROFILE_CONNECTOR_ID,
  DPM_PROFILE_ARTIFACT_KIND,
  resolveDpmRelationshipCandidateEndpointsFromProfileHint,
  resolveDpmProfileAnalysisPolicy,
  profileKafkaTopic,
  validateDpmKafkaTopicProfileInput,
  type DpmProfileArtifact,
  type DpmProfileAnalysisPolicy,
  type DpmProfileRelationshipEndpointResolution,
  type DpmProfileRelationshipEndpointResolverInput,
  type DpmProfileRelationshipTargetRefResolution,
  type DpmProfileRelationshipCandidateBridgeInput,
  type DpmProfileResolvedRelationshipCandidateBridgeInput,
  type DpmKafkaTopicProfileInput,
  type DpmKafkaTopicProfileCaptureMode,
  type DpmKafkaTopicProfileInputValidationResult,
} from '@oa-sdk/dpm/profile'
import {
  DPM_CANONICAL_KEY_ENCODING_VERSIONS,
  DPM_DEFAULT_CANONICAL_KEY_ENCODING_VERSION,
  assertDpmCanonicalKeyEncodingVersionMatchesPlan,
  renderEntityCanonicalKeyForPlan,
  renderRelationshipCanonicalKeyForPlan,
  REGISTRY_RELATIONSHIP_STATUSES,
  type ApprovedRegistryApprovalMetadata,
  type ApprovedRegistryRelationshipInput,
  type DpmCanonicalKeyEncodingVersion,
  type DpmCanonicalKeyEncodingPlan,
  type RegistryRelationshipStatus,
} from '@oa-sdk/dpm/relationship'
import {
  DPM_GATEWAY_RUNTIME_OPERATION_IDS,
  approveDpmProfileRelationshipHintRuntime,
  createDpmGatewayRuntime,
  getDpmGatewayOpenApiDocument,
  listDpmRegistryRelationshipAuditEventsRuntime,
  type DpmGatewayProfileRelationshipHintApprovalRequest,
  type DpmGatewayProfileRelationshipHintApprovalBlockingResult,
  type DpmGatewayRegistryAuditEventListInput,
  type DpmGatewayRegistryAuditEventListResult,
  type DpmGatewayProfileRelationshipHintApprovalInput,
  type DpmGatewayProfileRelationshipHintApprovalSuccessResult,
  type DpmGatewayRegistryRelationshipWriteReceipt,
  type DpmGatewayRuntime,
} from '@oa-sdk/dpm/gateway'
import {
  DPM_REGISTRY_APPROVED_RELATIONSHIP_CONFLICT_ERROR_CODE,
  appendDpmPostgresRegistryRelationshipAuditEvent,
  applyDpmRegistryStorageSchema,
  commitDpmPostgresRegistryRelationshipApproval,
  createDpmPostgresRegistryStorage,
  createDpmRegistryRelationshipRow,
  DpmRegistryApprovedRelationshipConflictError,
  DPM_REGISTRY_STORAGE_SCHEMA_SQL_BLOCKS,
  DPM_REGISTRY_RELATIONSHIP_AUDIT_EVENT_TYPES,
  isDpmRegistryApprovedRelationshipConflictError,
  DPM_PROFILE_BASELINE_SELECTION_STRATEGIES,
  listDpmPostgresRegistryRelationshipAuditEvents,
  listDpmPostgresRegistryRelationshipRows,
  upsertDpmPostgresRegistryRelationshipRow,
  type DpmPostgresRegistryClient,
  type DpmPostgresRegistryQueryClient,
  type DpmRegistryCanonicalKeyEncodingClaimInput,
  type DpmRegistryCanonicalKeyEncodingContract,
  type DpmRegistryCanonicalKeyEncodingContractRequest,
  type DpmRegistryAuditEventReader,
  type DpmRegistryStorageSchemaApplyResult,
  type DpmRegistryStorageSchemaQueryClient,
  type DpmRegistryRelationshipApprovalCommitInput,
  type DpmRegistryRelationshipApprovalCommitResult,
  type DpmRegistryRelationshipAuditEventRow,
  type DpmRegistryRelationshipSaveInput,
  type DpmRegistryRelationshipSaveResult,
  type DpmRegistryWritableRepository,
  type DpmProfileBaselineSummary,
  type DpmRegistryApprovedRelationshipConflictDetails,
  type DpmRegistryApprovedRelationshipConflictErrorCode,
} from '@oa-sdk/dpm/storage'
import {
  DPM_PUBLISHING_CONTEXT_KIND,
  type DpmPublishingContext,
} from '@oa-sdk/dpm/publishing'
import {
  createDpmAsyncAuthoringService,
  createDpmAuthoringQuickFixes,
  createDpmAuthoringService,
  createDpmInMemoryAuthoringRepository,
  exportDpmAuthoringDefinitions,
  explainDpmAuthoringDefinitions,
  importDpmAuthoringDefinitions,
  type DpmAsyncAuthoringRepository,
  type DpmAuthoringActor,
  type DpmAuthoringFieldLookup,
  type DpmAuthoringSemanticDiff,
} from '@oa-sdk/dpm/authoring'

type DpmSubpathTypeSmoke = {
  catalog?: CatalogSnapshot
  profile?: DpmProfileArtifact
  profileAnalysisPolicy?: DpmProfileAnalysisPolicy
  profileRelationshipEndpointResolution?: DpmProfileRelationshipEndpointResolution
  profileRelationshipEndpointResolver?: DpmProfileRelationshipEndpointResolverInput
  profileRelationshipCandidateBridge?: DpmProfileRelationshipCandidateBridgeInput
  resolvedProfileRelationshipCandidateBridge?: DpmProfileResolvedRelationshipCandidateBridgeInput
  kafkaTopicProfile?: DpmKafkaTopicProfileInput
  kafkaTopicProfileCaptureMode?: DpmKafkaTopicProfileCaptureMode
  kafkaTopicProfileInputValidation?: DpmKafkaTopicProfileInputValidationResult
  profileRelationshipHintApproval?: DpmGatewayProfileRelationshipHintApprovalInput
  profileRelationshipHintApprovalRequest?: DpmGatewayProfileRelationshipHintApprovalRequest
  profileRelationshipHintApprovalSuccess?: DpmGatewayProfileRelationshipHintApprovalSuccessResult
  profileRelationshipHintApprovalBlocking?: DpmGatewayProfileRelationshipHintApprovalBlockingResult
  registryRelationshipWriteReceipt?: DpmGatewayRegistryRelationshipWriteReceipt
  registryAuditEventList?: DpmGatewayRegistryAuditEventListInput
  registryAuditEventListResult?: DpmGatewayRegistryAuditEventListResult
  baseline?: DpmProfileBaselineSummary
  registryAuditEvent?: DpmRegistryRelationshipAuditEventRow
  registryAuditEventReader?: DpmRegistryAuditEventReader
  registryStorageSchemaClient?: DpmRegistryStorageSchemaQueryClient
  registryStorageSchemaApplyResult?: DpmRegistryStorageSchemaApplyResult
  postgresRegistryClient?: DpmPostgresRegistryClient
  postgresRegistryQueryClient?: DpmPostgresRegistryQueryClient
  registryEncodingClaim?: DpmRegistryCanonicalKeyEncodingClaimInput
  registryEncodingContract?: DpmRegistryCanonicalKeyEncodingContract
  registryEncodingContractRequest?: DpmRegistryCanonicalKeyEncodingContractRequest
  registryRelationshipApprovalCommitInput?: DpmRegistryRelationshipApprovalCommitInput
  registryRelationshipApprovalCommitResult?: DpmRegistryRelationshipApprovalCommitResult
  registryRelationshipSave?: DpmRegistryRelationshipSaveInput
  registryRelationshipSaveResult?: DpmRegistryRelationshipSaveResult
  registryApprovedConflictDetails?: DpmRegistryApprovedRelationshipConflictDetails
  registryApprovedConflictCode?: DpmRegistryApprovedRelationshipConflictErrorCode
  approvedRegistryApproval?: ApprovedRegistryApprovalMetadata
  approvedRegistryRelationship?: ApprovedRegistryRelationshipInput
  canonicalKeyEncodingVersion?: DpmCanonicalKeyEncodingVersion
  canonicalKeyEncodingPlan?: DpmCanonicalKeyEncodingPlan
  registryRepository?: DpmRegistryWritableRepository
  publishing?: DpmPublishingContext
  authoring?: DpmAuthoringActor
  authoringLookup?: DpmAuthoringFieldLookup
  authoringQuickFixes?: ReturnType<typeof createDpmAuthoringQuickFixes>
  dataDefinitions?: DpmIdentityDataDefinitions
  neutralDataBindingArtifact?: DpmNeutralDataBindingArtifact
}

const packageName: '@oa-sdk/dpm' = DPM_PACKAGE_NAME
const manifestVersion: DpmVersion = '1.0'
const gatewayRuntime: DpmGatewayRuntime = createDpmGatewayRuntime()
const registryStatus: RegistryRelationshipStatus = REGISTRY_RELATIONSHIP_STATUSES[0]
const canonicalKeyEncodingVersion: DpmCanonicalKeyEncodingVersion =
  DPM_DEFAULT_CANONICAL_KEY_ENCODING_VERSION
const canonicalKeyEncodingPlan: DpmCanonicalKeyEncodingPlan = {
  canonicalKeyEncodingVersion,
}
const targetRefResolution: DpmProfileRelationshipTargetRefResolution = {
  endpointRef: 'public.customers.customer_no',
  catalogAuthority: 'commerce',
}
const typeSmoke: DpmSubpathTypeSmoke = {}
const authoringActor: DpmAuthoringActor = { id: 'smoke', roles: ['editor'] }
const authoringLookup: DpmAuthoringFieldLookup = {
  entity: { datasetId: 'commerce_ai', namespace: 'customer' },
  type: 'string',
  lifecycle: 'active',
}
const authoring = createDpmAuthoringService({ repository: createDpmInMemoryAuthoringRepository() })
const authoringDiff: DpmAuthoringSemanticDiff = {
  definitionId: 'smoke-definition',
  baseRevisionId: 'revision-1',
  draftId: 'draft-1',
  breaking: false,
  changes: [],
}
const authoringQuickFixes = createDpmAuthoringQuickFixes(authoringDiff)
const asyncAuthoring = createDpmAsyncAuthoringService({
  repository: {} as DpmAsyncAuthoringRepository,
})
const dataDefinitions = createDpmIdentityDataDefinitions({
  version: '1.1',
  fields: [{
    objectId: 'customer-number',
    revisionId: 'customer-number-rev-1',
    entity: { datasetId: 'commerce_ai', namespace: 'customer', name: 'customer' },
    name: 'customerNo',
    type: 'string',
    origin: 'api_only',
  }],
})

void [
  packageName,
  manifestVersion,
  gatewayRuntime,
  registryStatus,
  canonicalKeyEncodingVersion,
  canonicalKeyEncodingPlan,
  assertDpmCanonicalKeyEncodingVersionMatchesPlan,
  renderEntityCanonicalKeyForPlan,
  renderRelationshipCanonicalKeyForPlan,
  getDpmGatewayOpenApiDocument().paths,
  DPM_GATEWAY_RUNTIME_OPERATION_IDS,
  DPM_PROFILE_ARTIFACT_KIND,
  DPM_CANONICAL_KEY_ENCODING_VERSIONS,
  DPM_REGISTRY_APPROVED_RELATIONSHIP_CONFLICT_ERROR_CODE,
  DPM_KAFKA_TOPIC_PROFILE_CAPTURE_MODES,
  DPM_KAFKA_TOPIC_PROFILE_CONNECTOR_ID,
  DEFAULT_DPM_PROFILE_ANALYSIS_POLICY,
  profileKafkaTopic,
  validateDpmKafkaTopicProfileInput,
  DPM_PROFILE_BASELINE_SELECTION_STRATEGIES,
  DPM_PUBLISHING_CONTEXT_KIND,
  dataDefinitions,
  computeCatalogFreshnessHash,
  createDpmRelationshipCandidateInputFromResolvedProfileHint,
  createDpmRelationshipCandidateInputFromProfileHint,
  computeDpmProfileAnalysisPolicyHash,
  resolveDpmRelationshipCandidateEndpointsFromProfileHint,
  resolveDpmProfileAnalysisPolicy,
  approveDpmProfileRelationshipHintRuntime,
  listDpmRegistryRelationshipAuditEventsRuntime,
  DPM_REGISTRY_STORAGE_SCHEMA_SQL_BLOCKS,
  applyDpmRegistryStorageSchema,
  DpmRegistryApprovedRelationshipConflictError,
  DPM_REGISTRY_RELATIONSHIP_AUDIT_EVENT_TYPES,
  isDpmRegistryApprovedRelationshipConflictError,
  createDpmRegistryRelationshipRow,
  createDpmPostgresRegistryStorage,
  listDpmPostgresRegistryRelationshipRows,
  upsertDpmPostgresRegistryRelationshipRow,
  commitDpmPostgresRegistryRelationshipApproval,
  appendDpmPostgresRegistryRelationshipAuditEvent,
  listDpmPostgresRegistryRelationshipAuditEvents,
  targetRefResolution,
  typeSmoke,
  authoringActor,
  authoringLookup,
  authoringQuickFixes,
  exportDpmAuthoringDefinitions,
  explainDpmAuthoringDefinitions,
  importDpmAuthoringDefinitions,
  authoring,
  asyncAuthoring,
]
