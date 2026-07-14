import type { DpmProfileArtifact } from './profile-artifact-types.js'
import type { DpmProfileDiagnostic } from './profile-diagnostic-types.js'
import {
  collectDpmProfileGraphIntegrityIssues,
  type DpmProfileGraphIntegrityIssue,
} from './profile-graph-integrity.js'

export function createDpmProfileAnalysisGraphDiagnostics(
  profile: DpmProfileArtifact,
): DpmProfileDiagnostic[] {
  return collectDpmProfileGraphIntegrityIssues(profile).map(profileGraphDiagnostic)
}

function profileGraphDiagnostic(
  issue: DpmProfileGraphIntegrityIssue,
): DpmProfileDiagnostic {
  return {
    severity: 'warning',
    code: profileGraphDiagnosticCode(issue),
    message: issue.message,
    coordinate: {
      kind: 'manual_import',
      path: issue.path,
    },
  }
}

function profileGraphDiagnosticCode(
  issue: DpmProfileGraphIntegrityIssue,
): DpmProfileDiagnostic['code'] {
  switch (issue.kind) {
    case 'duplicate_source_id':
      return 'PROF303'
    case 'missing_edge_node':
      return 'PROF302'
    case 'duplicate_graph_id':
      return 'PROF303'
    case 'missing_metric_subject':
      return 'PROF304'
    case 'missing_source':
      return 'PROF305'
    case 'missing_evidence':
      return 'PROF306'
  }
}
