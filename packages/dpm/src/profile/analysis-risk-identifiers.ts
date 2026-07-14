import type { DpmProfileRiskIndicator } from './analysis-signal-types.js'
import {
  evidenceIdsForNode,
  isIdentifierLikeNode,
} from './analysis-node-utils.js'
import type { DpmProfileArtifact } from './profile-artifact-types.js'

export function analyzeIdentifierLikeFieldRisks(
  profile: DpmProfileArtifact,
): DpmProfileRiskIndicator[] {
  const risks: DpmProfileRiskIndicator[] = []

  for (const node of profile.nodes) {
    if (!isIdentifierLikeNode(node)) continue
    risks.push({
      id: `risk:${node.id}:identifier_like_field`,
      kind: 'identifier_like_field',
      severity: 'warning',
      nodeId: node.id,
      evidenceIds: evidenceIdsForNode(profile, node.id),
      explanation: 'Profile coordinate resembles an identifier-like field and should be reviewed before publishing.',
    })
  }

  return risks
}
