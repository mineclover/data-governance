import type { DpmProfileRelationshipHintProposal } from './analysis-signal-types.js'
import {
  byId,
} from './analysis-ordering-utils.js'
import {
  evidenceIdsForNode,
  isIdentifierLikeNode,
  readStringShape,
} from './analysis-node-utils.js'
import {
  groupMetricsBySubject,
  roundRatio,
} from './analysis-metric-utils.js'
import {
  DEFAULT_DPM_PROFILE_ANALYSIS_POLICY,
  type DpmProfileAnalysisPolicy,
} from './analysis-policy.js'
import type { DpmProfileArtifact } from './profile-artifact-types.js'
import type {
  DpmProfileEdge,
  DpmProfileMetric,
  DpmProfileNode,
} from './profile-graph-types.js'

export function analyzeRelationshipHints(
  profile: DpmProfileArtifact,
  policy: DpmProfileAnalysisPolicy = DEFAULT_DPM_PROFILE_ANALYSIS_POLICY,
): DpmProfileRelationshipHintProposal[] {
  const nodes = new Map(profile.nodes.map(node => [node.id, node]))
  const explicitSourceNodeIds = new Set(
    profile.edges
      .filter(edge => edge.kind === 'candidate_relationship')
      .filter(edge => isResolvableRelationshipHintEdge(edge, nodes))
      .map(edge => edge.fromNodeId),
  )

  const explicitHints = profile.edges
    .filter(edge => edge.kind === 'candidate_relationship')
    .filter(edge => isResolvableRelationshipHintEdge(edge, nodes))
    .map(edge => {
      const hintNode = nodes.get(edge.toNodeId)!
      const targetRef = readStringShape(hintNode, 'toRef') ?? hintNode?.coordinate.externalId
      return {
        id: `proposal:${edge.id}`,
        status: 'review' as const,
        source: 'explicit_hint' as const,
        fromNodeId: edge.fromNodeId,
        hintNodeId: edge.toNodeId,
        ...(targetRef ? { targetRef } : {}),
        confidence: edge.confidence ?? 0,
        evidenceIds: [...edge.evidenceIds].sort(),
        explanation: hintNode?.label ?? `Review candidate relationship ${edge.id}.`,
      }
    })

  return [
    ...explicitHints,
    ...analyzeMeasuredRelationshipCandidates(profile, nodes, explicitSourceNodeIds, policy),
  ].sort(byId)
}

function isResolvableRelationshipHintEdge(
  edge: DpmProfileEdge,
  nodes: ReadonlyMap<string, DpmProfileNode>,
): boolean {
  const sourceNode = nodes.get(edge.fromNodeId)
  const hintNode = nodes.get(edge.toNodeId)

  return Boolean(sourceNode && hintNode?.kind === 'relationship_hint')
}

function analyzeMeasuredRelationshipCandidates(
  profile: DpmProfileArtifact,
  nodes: ReadonlyMap<string, DpmProfileNode>,
  explicitSourceNodeIds: ReadonlySet<string>,
  policy: DpmProfileAnalysisPolicy,
): DpmProfileRelationshipHintProposal[] {
  const metricsBySubject = groupMetricsBySubject(profile.metrics)
  const candidates: DpmProfileRelationshipHintProposal[] = []

  for (const node of profile.nodes) {
    if (explicitSourceNodeIds.has(node.id)) continue
    if (!isMeasuredRelationshipCandidateNode(node)) continue

    const presence = measuredPresenceMetric(
      metricsBySubject.get(node.id) ?? [],
      policy.measuredRelationshipPresenceThreshold,
    )
    if (!presence) continue

    candidates.push({
      id: `proposal:measured:${node.id}:identifier_like_field`,
      status: 'review',
      source: 'measured_key_candidate',
      fromNodeId: node.id,
      confidence: roundRatio(Math.min(policy.measuredRelationshipConfidenceCap, presence.value)),
      evidenceIds: [...(presence.evidenceIds.length > 0
        ? presence.evidenceIds
        : evidenceIdsForNode(profile, node.id))].sort(),
      explanation: `Measured identifier-like field ${node.label} has high presence and should be reviewed as a relationship candidate.`,
    })
  }

  return candidates.filter(candidate => nodes.has(candidate.fromNodeId))
}

function isMeasuredRelationshipCandidateNode(node: DpmProfileNode): boolean {
  return (node.kind === 'message_field' || node.kind === 'column') && isIdentifierLikeNode(node)
}

function measuredPresenceMetric(
  metrics: readonly DpmProfileMetric[],
  threshold: number,
): (DpmProfileMetric & { value: number }) | undefined {
  return metrics.find((metric): metric is DpmProfileMetric & { value: number } =>
    metric.kind === 'presence_ratio' &&
    typeof metric.value === 'number' &&
    metric.value >= threshold
  )
}
