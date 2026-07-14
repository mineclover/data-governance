import type {
  DpmProfileDriftSignal,
} from './analysis-signal-types.js'
import type { DpmProfileArtifact } from './profile-artifact-types.js'

export function analyzeNodeDriftSignals(
  current: DpmProfileArtifact,
  previous: DpmProfileArtifact,
): DpmProfileDriftSignal[] {
  const signals: DpmProfileDriftSignal[] = []
  const previousNodes = new Set(previous.nodes.map(node => node.id))
  const currentNodes = new Set(current.nodes.map(node => node.id))
  for (const nodeId of [...currentNodes].filter(nodeId => !previousNodes.has(nodeId)).sort()) {
    signals.push({
      id: `drift:node-added:${nodeId}`,
      kind: 'node_added',
      severity: 'info',
      nodeId,
      explanation: `Profile node ${nodeId} was added.`,
    })
  }
  for (const nodeId of [...previousNodes].filter(nodeId => !currentNodes.has(nodeId)).sort()) {
    signals.push({
      id: `drift:node-removed:${nodeId}`,
      kind: 'node_removed',
      severity: 'warning',
      nodeId,
      explanation: `Profile node ${nodeId} was removed.`,
    })
  }
  return signals
}
