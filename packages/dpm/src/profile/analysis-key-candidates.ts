import type { DpmProfileKeyCandidate } from './analysis-signal-types.js'
import {
  byId,
} from './analysis-ordering-utils.js'
import {
  evidenceIdsForNode,
  isIdentifierLikeNode,
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

export function analyzeKeyCandidates(
  profile: DpmProfileArtifact,
  policy: DpmProfileAnalysisPolicy = DEFAULT_DPM_PROFILE_ANALYSIS_POLICY,
): DpmProfileKeyCandidate[] {
  const candidates = new Map<string, DpmProfileKeyCandidate>()
  const nodes = new Map(profile.nodes.map(node => [node.id, node]))
  const metricsBySubject = groupMetricsBySubject(profile.metrics)

  for (const metric of profile.metrics) {
    if (metric.kind !== 'key_coverage_ratio' || typeof metric.value !== 'number') continue
    candidates.set(`key-candidate:${metric.subjectId}:message_key`, {
      id: `key-candidate:${metric.subjectId}:message_key`,
      kind: 'message_key',
      nodeId: metric.subjectId,
      confidence: roundRatio(metric.value),
      reason: 'Message key coverage metric suggests a stable key candidate.',
      evidenceIds: [...metric.evidenceIds].sort(),
    })
  }

  for (const node of profile.nodes) {
    if (!isIdentifierLikeNode(node)) continue
    const metrics = metricsBySubject.get(node.id) ?? []
    const presence = metrics.find(metric => metric.kind === 'presence_ratio' && typeof metric.value === 'number')
    const confidence = typeof presence?.value === 'number'
      ? roundRatio(presence.value)
      : policy.identifierKeyCandidateFallbackConfidence
    candidates.set(`key-candidate:${node.id}:identifier_like_field`, {
      id: `key-candidate:${node.id}:identifier_like_field`,
      kind: 'identifier_like_field',
      nodeId: node.id,
      confidence,
      reason: 'Field name and type resemble an identifier or join key.',
      evidenceIds: [...(presence?.evidenceIds ?? evidenceIdsForNode(profile, node.id))].sort(),
    })
  }

  return [...candidates.values()].filter(candidate => nodes.has(candidate.nodeId)).sort(byId)
}
