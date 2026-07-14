import type {
  DpmProfileArtifact,
} from './profile-artifact-types.js'
import type {
  DpmProfileNode,
} from './profile-graph-types.js'

export function isIdentifierLikeNode(node: DpmProfileNode): boolean {
  if (node.kind !== 'column' && node.kind !== 'message_field' && node.kind !== 'message_key') return false
  const value = `${node.label}.${node.coordinate.path}`.toLowerCase()
  return /(^|[._-])(id|no|key)$/.test(value) ||
    /(^|[._-])(tenant_id|customer_no|order_id|user_id|account_id)([._-]|$)/.test(value)
}

export function evidenceIdsForNode(profile: DpmProfileArtifact, nodeId: string): string[] {
  const evidenceIds = new Set<string>()
  for (const edge of profile.edges) {
    if (edge.fromNodeId === nodeId || edge.toNodeId === nodeId) {
      for (const evidenceId of edge.evidenceIds) evidenceIds.add(evidenceId)
    }
  }
  for (const metric of profile.metrics) {
    if (metric.subjectId === nodeId) {
      for (const evidenceId of metric.evidenceIds) evidenceIds.add(evidenceId)
    }
  }
  return [...evidenceIds].sort()
}

export function readStringShape(node: DpmProfileNode | undefined, key: string): string | undefined {
  const value = node?.shape?.[key]
  return typeof value === 'string' ? value : undefined
}
