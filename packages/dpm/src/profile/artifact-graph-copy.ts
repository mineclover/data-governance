import type {
  DpmProfileEdge,
  DpmProfileMetric,
  DpmProfileNode,
} from './profile-graph-types.js'
import { copyCoordinate } from './artifact-source-copy.js'

export function copyNode(node: DpmProfileNode): DpmProfileNode {
  return {
    id: node.id,
    kind: node.kind,
    label: node.label,
    coordinate: copyCoordinate(node.coordinate),
    ...(node.dataType ? { dataType: node.dataType } : {}),
    ...(node.shape ? { shape: sortShape(node.shape) } : {}),
  }
}

export function copyEdge(edge: DpmProfileEdge): DpmProfileEdge {
  return {
    id: edge.id,
    kind: edge.kind,
    fromNodeId: edge.fromNodeId,
    toNodeId: edge.toNodeId,
    evidenceIds: [...edge.evidenceIds].sort(),
    ...(edge.confidence !== undefined ? { confidence: edge.confidence } : {}),
  }
}

export function copyMetric(metric: DpmProfileMetric): DpmProfileMetric {
  return {
    id: metric.id,
    kind: metric.kind,
    subjectId: metric.subjectId,
    value: metric.value,
    ...(metric.unit ? { unit: metric.unit } : {}),
    evidenceIds: [...metric.evidenceIds].sort(),
  }
}

function sortShape(shape: Record<string, string | number | boolean | null>): Record<string, string | number | boolean | null> {
  const sorted: Record<string, string | number | boolean | null> = {}
  for (const key of Object.keys(shape).sort()) {
    const value = shape[key]
    if (value !== undefined) sorted[key] = value
  }
  return sorted
}
