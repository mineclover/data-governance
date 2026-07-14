import type { DpmGatewayRuntime } from './runtime-types.js'
import {
  compileDpmManifestRuntime,
  dryRunDpmManifestRuntime,
  validateDpmManifestRuntime,
} from './runtime-manifest.js'
import {
  analyzeDpmProfileRuntime,
  inspectDpmProfileRuntime,
  listDpmProfileBaselineSummariesRuntime,
  reviewDpmProfileProposalRuntime,
} from './runtime-profile.js'
import { importDpmRelationshipCandidatesRuntime } from './runtime-relationship-candidate-import.js'
import { approveDpmRelationshipCandidateRuntime } from './runtime-relationship-approve.js'
import { approveDpmProfileRelationshipHintRuntime } from './runtime-profile-relationship-hint-approval.js'
import { discoverDpmRelationshipsRuntime } from './runtime-relationship-discover.js'
import { exportDpmRegistrySnapshotRuntime } from './runtime-relationship-registry-export.js'
import { listDpmRegistryRelationshipAuditEventsRuntime } from './runtime-relationship-registry-audit-events.js'

export function createDpmGatewayRuntime(): DpmGatewayRuntime {
  return {
    inspectDpmProfile: inspectDpmProfileRuntime,
    analyzeDpmProfile: analyzeDpmProfileRuntime,
    listDpmProfileBaselineSummaries: listDpmProfileBaselineSummariesRuntime,
    reviewDpmProfileProposal: reviewDpmProfileProposalRuntime,
    discoverDpmRelationships: discoverDpmRelationshipsRuntime,
    importDpmRelationshipCandidates: importDpmRelationshipCandidatesRuntime,
    approveDpmRelationshipCandidate: approveDpmRelationshipCandidateRuntime,
    approveDpmProfileRelationshipHint: approveDpmProfileRelationshipHintRuntime,
    exportDpmRegistrySnapshot: exportDpmRegistrySnapshotRuntime,
    listDpmRegistryRelationshipAuditEvents: listDpmRegistryRelationshipAuditEventsRuntime,
    validateDpmManifest: validateDpmManifestRuntime,
    compileDpmManifest: compileDpmManifestRuntime,
    dryRunDpmManifest: dryRunDpmManifestRuntime,
  }
}
