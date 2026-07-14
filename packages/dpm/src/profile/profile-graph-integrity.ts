import type { DpmProfileArtifact } from './profile-artifact-types.js'

export type DpmProfileGraphIntegrityIssueKind =
  | 'duplicate_source_id'
  | 'duplicate_graph_id'
  | 'missing_edge_node'
  | 'missing_evidence'
  | 'missing_metric_subject'
  | 'missing_source'

export type DpmProfileGraphIntegrityIssue = {
  kind: DpmProfileGraphIntegrityIssueKind
  message: string
  path: string
}

export function collectDpmProfileGraphIntegrityIssues(
  profile: DpmProfileArtifact,
): DpmProfileGraphIntegrityIssue[] {
  const issues: DpmProfileGraphIntegrityIssue[] = []
  const sourceIds = new Set(profile.sources.map(source => source.id))
  const evidenceIds = new Set(Object.keys(profile.evidenceSources))
  const nodeIds = new Set(profile.nodes.map(node => node.id))
  const edgeIds = new Set(profile.edges.map(edge => edge.id))
  const graphSubjectIds = new Set([...nodeIds, ...edgeIds])

  issues.push(...duplicateSourceIdIssues(profile.sources.map(source => source.id)))
  issues.push(...duplicateGraphIdIssues('node', 'nodes', profile.nodes.map(node => node.id)))
  issues.push(...duplicateGraphIdIssues('edge', 'edges', profile.edges.map(edge => edge.id)))
  issues.push(...duplicateGraphIdIssues('metric', 'metrics', profile.metrics.map(metric => metric.id)))

  for (const edge of profile.edges) {
    const missingNodeIds = [edge.fromNodeId, edge.toNodeId].filter(nodeId => !nodeIds.has(nodeId))
    if (missingNodeIds.length > 0) {
      issues.push({
        kind: 'missing_edge_node',
        message: `Profile edge ${edge.id} references missing node ids: ${missingNodeIds.join(', ')}.`,
        path: `profileArtifact.edges.${edge.id}`,
      })
    }

    issues.push(...missingEvidenceIssues(
      `edge ${edge.id}`,
      `profileArtifact.edges.${edge.id}`,
      edge.evidenceIds,
      evidenceIds,
    ))
  }

  for (const metric of profile.metrics) {
    if (!graphSubjectIds.has(metric.subjectId)) {
      issues.push({
        kind: 'missing_metric_subject',
        message: `Profile metric ${metric.id} references missing graph subject ${metric.subjectId}.`,
        path: `profileArtifact.metrics.${metric.id}`,
      })
    }

    issues.push(...missingEvidenceIssues(
      `metric ${metric.id}`,
      `profileArtifact.metrics.${metric.id}`,
      metric.evidenceIds,
      evidenceIds,
    ))
  }

  for (const diagnostic of profile.diagnostics) {
    issues.push(...missingEvidenceIssues(
      `diagnostic ${diagnostic.code}`,
      `profileArtifact.diagnostics.${diagnostic.code}`,
      diagnostic.evidenceIds ?? [],
      evidenceIds,
    ))
  }

  for (const [evidenceId, evidenceSource] of Object.entries(profile.evidenceSources).sort(byEntryKey)) {
    const sourceId = evidenceSource.coordinate.sourceId
    if (sourceId && !sourceIds.has(sourceId)) {
      issues.push({
        kind: 'missing_source',
        message: `Profile evidence source ${evidenceId} references missing source ${sourceId}.`,
        path: `profileArtifact.evidenceSources.${evidenceId}`,
      })
    }
  }

  for (const node of profile.nodes) {
    const sourceId = node.coordinate.sourceId
    if (sourceId && !sourceIds.has(sourceId)) {
      issues.push({
        kind: 'missing_source',
        message: `Profile node ${node.id} references missing source ${sourceId}.`,
        path: `profileArtifact.nodes.${node.id}`,
      })
    }
  }

  return issues
}

function duplicateSourceIdIssues(ids: readonly string[]): DpmProfileGraphIntegrityIssue[] {
  return duplicateIdIssues('duplicate_source_id', 'source', 'sources', ids)
}

function duplicateGraphIdIssues(
  kind: 'node' | 'edge' | 'metric',
  collection: 'nodes' | 'edges' | 'metrics',
  ids: readonly string[],
): DpmProfileGraphIntegrityIssue[] {
  return duplicateIdIssues('duplicate_graph_id', kind, collection, ids)
}

function duplicateIdIssues(
  issueKind: 'duplicate_source_id' | 'duplicate_graph_id',
  kind: 'source' | 'node' | 'edge' | 'metric',
  collection: 'sources' | 'nodes' | 'edges' | 'metrics',
  ids: readonly string[],
): DpmProfileGraphIntegrityIssue[] {
  const seen = new Set<string>()
  const duplicates = new Set<string>()

  for (const id of ids) {
    if (seen.has(id)) duplicates.add(id)
    seen.add(id)
  }

  return [...duplicates].sort().map(id => ({
    kind: issueKind,
    message: `Profile artifact contains duplicate ${kind} id ${id}.`,
    path: `profileArtifact.${collection}.${id}`,
  }))
}

function missingEvidenceIssues(
  ownerLabel: string,
  ownerPath: string,
  ownerEvidenceIds: readonly string[],
  evidenceIds: ReadonlySet<string>,
): DpmProfileGraphIntegrityIssue[] {
  const missingEvidenceIds = ownerEvidenceIds.filter(evidenceId => !evidenceIds.has(evidenceId))
  if (missingEvidenceIds.length === 0) return []

  return [{
    kind: 'missing_evidence',
    message: `Profile ${ownerLabel} references missing evidence ids: ${[...missingEvidenceIds].sort().join(', ')}.`,
    path: ownerPath,
  }]
}

function byEntryKey(
  left: readonly [string, unknown],
  right: readonly [string, unknown],
): number {
  return left[0].localeCompare(right[0])
}
