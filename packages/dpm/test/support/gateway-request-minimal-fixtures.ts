import {
  profileArtifact,
  profileCoordinate,
  relationshipHint,
} from './gateway-profile-fixtures.js'
import {
  readCommerceDiscoveryReport,
  readCommerceDiscoveryReportInput,
} from './discovery-fixtures.js'
import type {
  GatewayWriteRequestSchemaName,
} from './gateway-request-schema-fixtures.js'

type GatewayMinimalRequestCase =
  readonly [GatewayWriteRequestSchemaName, Record<string, unknown>]

const snapshotRef = { ref: 'catalog://commerce/v1', versionHash: 'sha256:test' }
const manifest = { dpm_version: '1.0' }
const discoveryCandidate = readCommerceDiscoveryReportInput().candidates[0]!
const relationshipCandidate = readCommerceDiscoveryReport().candidates[0]!

export const gatewayMinimalRequestCases = [
  ['DpmCatalogProfileRequest', { datasetId: 'commerce_ai', catalogSourceRef: 'source://catalog', manifest }],
  ['DpmProfileInspectionRequest', { profileArtifact }],
  ['DpmProfileAnalysisRequest', { profileArtifact }],
  ['DpmProfileBaselineSummaryListRequest', { datasetId: 'commerce_ai', profileId: 'profile:kafka:orders-created' }],
  ['DpmProfileProposalReviewRequest', {
    status: 'accepted',
    reviewedBy: 'privacy-reviewer',
    reason: 'reviewed against catalog evidence',
    coordinate: profileCoordinate,
    relationshipHint,
  }],
  ['DpmProfileRelationshipHintApprovalRequest', {
    profileArtifact,
    relationshipHint,
    childTableByPathPrefix: {
      'orders.created': 'public.orders',
    },
    registryVersion: 'registry-profile-workflow-v1',
    version: '1',
    namespace: 'customer',
    transformStrategy: 'relationship_token',
    orphanPolicy: 'block',
    owner: 'privacy-platform',
    approvedBy: 'privacy-reviewer',
    reason: 'reviewed relationship hint',
  }],
  ['DpmRelationshipDiscoveryRequest', { manifest, catalogSnapshot: snapshotRef }],
  ['DpmCandidateImportRequest', {
    datasetId: 'commerce_ai',
    candidates: [discoveryCandidate],
  }],
  ['DpmRelationshipApprovalRequest', {
    candidate: relationshipCandidate,
    version: '1',
    namespace: 'customer',
    transformStrategy: 'entity_token',
    orphanPolicy: 'block',
    owner: 'privacy',
    approvedBy: 'reviewer',
    reason: 'reviewed',
  }],
  ['DpmRegistryAuditEventListRequest', {
    datasetId: 'commerce_ai',
    registryVersion: 'reg-2026-07-01',
  }],
  ['DpmManifestValidationRequest', { manifest, catalogSnapshot: snapshotRef, registrySnapshot: snapshotRef }],
  ['DpmManifestCompileRequest', { manifest, catalogSnapshot: snapshotRef, registrySnapshot: snapshotRef }],
  ['DpmManifestDryRunRequest', { manifest, catalogSnapshot: snapshotRef, registrySnapshot: snapshotRef }],
  ['DpmExecuteJobRequest', { planRef: 'compiled-plan://commerce', targetDatasetRef: 'target://ai' }],
] as const satisfies readonly GatewayMinimalRequestCase[]
