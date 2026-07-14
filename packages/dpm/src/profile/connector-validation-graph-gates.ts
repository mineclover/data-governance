import type { DpmProfileConnectorResult } from './connector-types.js'
import type { DpmProfileDiagnostic } from './profile-artifact-types.js'
import {
  collectDpmProfileGraphIntegrityIssues,
  type DpmProfileGraphIntegrityIssue,
} from './profile-graph-integrity.js'

export function addDpmProfileConnectorGraphDiagnostics(
  diagnostics: DpmProfileDiagnostic[],
  result: DpmProfileConnectorResult,
): void {
  const profile = result.profileArtifact
  if (!profile) return

  diagnostics.push(
    ...collectDpmProfileGraphIntegrityIssues(profile).map(issue =>
      graphDiagnostic(issue, result.connectorId)
    ),
  )
}

function graphDiagnostic(
  issue: DpmProfileGraphIntegrityIssue,
  connectorId: string,
): DpmProfileDiagnostic {
  return {
    severity: 'error',
    code: graphDiagnosticCode(issue),
    message: issue.message,
    connectorId,
    coordinate: {
      kind: 'manual_import',
      path: `${connectorId}.${issue.path}`,
    },
  }
}

function graphDiagnosticCode(
  issue: DpmProfileGraphIntegrityIssue,
): DpmProfileDiagnostic['code'] {
  switch (issue.kind) {
    case 'duplicate_source_id':
      return 'CONN109'
    case 'duplicate_graph_id':
      return 'CONN109'
    case 'missing_edge_node':
      return 'CONN110'
    case 'missing_evidence':
      return 'CONN111'
    case 'missing_metric_subject':
      return 'CONN112'
    case 'missing_source':
      return 'CONN113'
  }
}
