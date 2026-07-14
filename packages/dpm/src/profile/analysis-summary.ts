import type {
  DpmProfileAnalysisSummary,
} from './analysis-summary-types.js'
import type {
  DpmProfileDriftSignal,
  DpmProfileKeyCandidate,
  DpmProfileRelationshipHintProposal,
  DpmProfileRiskIndicator,
} from './analysis-signal-types.js'
import type { DpmProfileArtifact } from './profile-artifact-types.js'

type DpmProfileAnalysisSummaryInput = {
  profileArtifact: Pick<DpmProfileArtifact, 'nodes' | 'edges' | 'metrics'>
  diagnostics: DpmProfileArtifact['diagnostics']
  relationshipHints: DpmProfileRelationshipHintProposal[]
  keyCandidates: DpmProfileKeyCandidate[]
  riskIndicators: DpmProfileRiskIndicator[]
  driftSignals: DpmProfileDriftSignal[]
}

export function createDpmProfileAnalysisSummary(input: DpmProfileAnalysisSummaryInput): DpmProfileAnalysisSummary {
  return {
    nodeCount: input.profileArtifact.nodes.length,
    edgeCount: input.profileArtifact.edges.length,
    metricCount: input.profileArtifact.metrics.length,
    diagnosticCount: input.diagnostics.length,
    relationshipHintCount: input.relationshipHints.length,
    keyCandidateCount: input.keyCandidates.length,
    riskIndicatorCount: input.riskIndicators.length,
    driftSignalCount: input.driftSignals.length,
  }
}

export function sortDpmProfileAnalysisDiagnostics(
  diagnostics: DpmProfileArtifact['diagnostics'],
): DpmProfileArtifact['diagnostics'] {
  return [...diagnostics].sort(byDiagnostic)
}

function byDiagnostic(left: DpmProfileArtifact['diagnostics'][number], right: DpmProfileArtifact['diagnostics'][number]): number {
  return `${left.severity}.${left.code}.${left.message}`.localeCompare(`${right.severity}.${right.code}.${right.message}`)
}
