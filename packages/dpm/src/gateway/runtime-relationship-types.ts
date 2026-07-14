import type {
  CatalogSnapshot,
  PostgresCatalogSnapshotInput,
} from '../catalog/types.js'
import type {
  DiscoveryThresholds,
  ExcludedRelationshipCandidate,
  RelationshipCandidate,
  RelationshipCandidateInput,
  RelationshipDiscoveryReport,
} from '../discovery/types.js'
import type {
  DpmProfileResolvedRelationshipCandidateBridgeInput,
} from '../profile/analysis-relationship-candidate.js'
import type { DpmProfileDiagnostic } from '../profile/types.js'
import type { DpmCanonicalKeyEncodingVersion } from '../model/canonical-key-encoding.js'
import type {
  ApprovedRegistryRelationshipInput,
  RegistryRelationshipStatus,
  RegistryOrphanPolicy,
  RegistryTransformStrategy,
  RegistrySnapshot,
} from '../registry/types.js'
import type {
  DpmRegistryRelationshipAuditEventRequest,
  DpmRegistryRelationshipAuditEventRow,
  DpmRegistryAuditEventReader,
  DpmRegistryRepository,
  DpmRegistryWritableRepository,
} from '../storage/registry-repository-types.js'
import type { DpmGatewaySnapshotRef } from './runtime-manifest-request-types.js'

export type DpmGatewayRelationshipDiscoveryRequest = {
  manifest: unknown
  catalogSnapshot: DpmGatewaySnapshotRef
}

export type DpmGatewayRelationshipDiscoverySnapshotResolver = {
  resolveCatalogSnapshot(
    snapshot: DpmGatewaySnapshotRef,
  ): CatalogSnapshot | PostgresCatalogSnapshotInput | Promise<CatalogSnapshot | PostgresCatalogSnapshotInput>
}

export type DpmGatewayRelationshipDiscoveryInput = {
  manifest: unknown
  catalog: CatalogSnapshot | PostgresCatalogSnapshotInput
  generatedAt?: string
  thresholds?: Partial<DiscoveryThresholds>
}

export type DpmGatewayRelationshipDiscoveryResult = RelationshipDiscoveryReport

export type DpmGatewayCandidateImportInput = {
  datasetId: string
  generatedAt?: string
  thresholds?: Partial<DiscoveryThresholds>
  candidates: RelationshipCandidateInput[]
  exclusions?: ExcludedRelationshipCandidate[]
}

export type DpmGatewayCandidateImportResult = {
  imported: number
  rejected: number
  report: RelationshipDiscoveryReport
}

export type DpmGatewayRelationshipApprovalInput = {
  relationshipName: string
  candidate: RelationshipCandidate
  version: string
  namespace: string
  transformStrategy: RegistryTransformStrategy
  orphanPolicy: RegistryOrphanPolicy
  owner: string
  approvedBy: string
  reason: string
  approvedAt?: string
}

export type DpmGatewayRelationshipApprovalResult = {
  relationshipName: string
  status: 'approved'
  relationship: ApprovedRegistryRelationshipInput
}

export type DpmGatewayProfileRelationshipHintApprovalInput =
  DpmProfileResolvedRelationshipCandidateBridgeInput & {
    registryVersion: string
    canonicalKeyEncodingVersion?: DpmCanonicalKeyEncodingVersion
    version: string
    namespace: string
    transformStrategy: RegistryTransformStrategy
    orphanPolicy: RegistryOrphanPolicy
    owner: string
    approvedBy: string
    reason: string
    approvedAt?: string
    auditEventId?: string
    generatedAt?: string
    exportedAt?: string
    createdAt?: string
    updatedAt?: string
    sourceFreshnessHash?: string
    thresholds?: Partial<DiscoveryThresholds>
    registryRepository: DpmRegistryWritableRepository
  }

export type DpmGatewayProfileRelationshipHintApprovalRequest =
  Omit<DpmGatewayProfileRelationshipHintApprovalInput, 'relationshipName' | 'registryRepository'>

export type DpmGatewayRegistryRelationshipWriteReceipt = {
  kind: 'dpm.relationship.registry-write-receipt.v1'
  datasetId: string
  registryVersion: string
  relationshipName: string
  relationshipVersion: string
  relationshipIdentity: string
  status: RegistryRelationshipStatus
  approvalAuditEventId?: string
  sourceFreshnessHash?: string
  savedAt?: string
}

export type DpmGatewayProfileRelationshipHintApprovalSuccessResult = {
  relationshipName: string
  status: 'approved'
  candidateInput: RelationshipCandidateInput
  reviewCandidate: RelationshipCandidate
  candidateImport: DpmGatewayCandidateImportResult
  relationship: ApprovedRegistryRelationshipInput
  relationshipWriteReceipt: DpmGatewayRegistryRelationshipWriteReceipt
  registrySnapshot: RegistrySnapshot
}

export type DpmGatewayProfileRelationshipHintApprovalBlockingResult = {
  relationshipName: string
  status: 'blocked'
  diagnostics: DpmProfileDiagnostic[]
}

export type DpmGatewayProfileRelationshipHintApprovalResult =
  | DpmGatewayProfileRelationshipHintApprovalSuccessResult
  | DpmGatewayProfileRelationshipHintApprovalBlockingResult

export type DpmGatewayRegistrySnapshotExportInput = {
  datasetId: string
  registryVersion: string
  expectedCanonicalKeyEncodingVersion?: DpmCanonicalKeyEncodingVersion
  exportedAt?: string
  registryRepository: DpmRegistryRepository
}

export type DpmGatewayRegistrySnapshotExportResult = RegistrySnapshot

export type DpmGatewayRegistryAuditEventListInput =
  DpmRegistryRelationshipAuditEventRequest & {
    registryAuditEventRepository: DpmRegistryAuditEventReader
  }

export type DpmGatewayRegistryAuditEventListResult = {
  auditEvents: DpmRegistryRelationshipAuditEventRow[]
}
