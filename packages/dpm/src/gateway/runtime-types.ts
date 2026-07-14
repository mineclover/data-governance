import type { DpmCompileResult } from '../compiler/compile-types.js'
import type { DpmDryRunReport } from '../dry-run/report-types.js'
import type { DpmValidationResult } from '../validator/diagnostic-types.js'
import type { DpmGatewayRuntimeManifestInput } from './runtime-manifest-types.js'
import type {
  DpmGatewayProfileAnalysisInput,
  DpmGatewayProfileAnalysisResult,
  DpmGatewayProfileBaselineSummaryListInput,
  DpmGatewayProfileBaselineSummaryListResult,
  DpmGatewayProfileInspectionInput,
  DpmGatewayProfileInspectionResult,
  DpmGatewayProfileProposalReviewInput,
  DpmGatewayProfileProposalReviewResult,
} from './runtime-profile-types.js'
import type {
  DpmGatewayCandidateImportInput,
  DpmGatewayCandidateImportResult,
  DpmGatewayRegistryAuditEventListInput,
  DpmGatewayRegistryAuditEventListResult,
  DpmGatewayRegistrySnapshotExportInput,
  DpmGatewayRegistrySnapshotExportResult,
  DpmGatewayProfileRelationshipHintApprovalInput,
  DpmGatewayProfileRelationshipHintApprovalResult,
  DpmGatewayRelationshipApprovalInput,
  DpmGatewayRelationshipApprovalResult,
  DpmGatewayRelationshipDiscoveryInput,
  DpmGatewayRelationshipDiscoveryResult,
} from './runtime-relationship-types.js'
import type { DpmGatewayRuntimeResponse } from './runtime-response-types.js'

export type DpmGatewayRuntime = {
  inspectDpmProfile(
    input: DpmGatewayProfileInspectionInput,
  ): Promise<DpmGatewayRuntimeResponse<DpmGatewayProfileInspectionResult>>
  analyzeDpmProfile(
    input: DpmGatewayProfileAnalysisInput,
  ): Promise<DpmGatewayRuntimeResponse<DpmGatewayProfileAnalysisResult>>
  listDpmProfileBaselineSummaries(
    input: DpmGatewayProfileBaselineSummaryListInput,
  ): Promise<DpmGatewayRuntimeResponse<DpmGatewayProfileBaselineSummaryListResult>>
  reviewDpmProfileProposal(
    input: DpmGatewayProfileProposalReviewInput,
  ): Promise<DpmGatewayRuntimeResponse<DpmGatewayProfileProposalReviewResult>>
  discoverDpmRelationships(
    input: DpmGatewayRelationshipDiscoveryInput,
  ): Promise<DpmGatewayRuntimeResponse<DpmGatewayRelationshipDiscoveryResult>>
  importDpmRelationshipCandidates(
    input: DpmGatewayCandidateImportInput,
  ): Promise<DpmGatewayRuntimeResponse<DpmGatewayCandidateImportResult>>
  approveDpmRelationshipCandidate(
    input: DpmGatewayRelationshipApprovalInput,
  ): Promise<DpmGatewayRuntimeResponse<DpmGatewayRelationshipApprovalResult>>
  approveDpmProfileRelationshipHint(
    input: DpmGatewayProfileRelationshipHintApprovalInput,
  ): Promise<DpmGatewayRuntimeResponse<DpmGatewayProfileRelationshipHintApprovalResult>>
  exportDpmRegistrySnapshot(
    input: DpmGatewayRegistrySnapshotExportInput,
  ): Promise<DpmGatewayRuntimeResponse<DpmGatewayRegistrySnapshotExportResult>>
  listDpmRegistryRelationshipAuditEvents(
    input: DpmGatewayRegistryAuditEventListInput,
  ): Promise<DpmGatewayRuntimeResponse<DpmGatewayRegistryAuditEventListResult>>
  validateDpmManifest(input: DpmGatewayRuntimeManifestInput): Promise<DpmGatewayRuntimeResponse<DpmValidationResult>>
  compileDpmManifest(input: DpmGatewayRuntimeManifestInput): Promise<DpmGatewayRuntimeResponse<DpmCompileResult>>
  dryRunDpmManifest(input: DpmGatewayRuntimeManifestInput): Promise<DpmGatewayRuntimeResponse<DpmCompileResult | DpmDryRunReport>>
}
