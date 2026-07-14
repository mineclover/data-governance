import type { DpmProfileConnectorResult } from './connector-types.js'
import { connectorDiagnostic } from './connector-validation-diagnostic.js'
import type { DpmProfileDiagnostic } from './profile-artifact-types.js'
import { validateDpmProfileArtifactSchema } from './schema.js'

export function addDpmProfileConnectorPayloadDiagnostics(
  diagnostics: DpmProfileDiagnostic[],
  result: DpmProfileConnectorResult,
): boolean {
  if (result.status === 'failed' && result.diagnostics.length === 0) {
    diagnostics.push(connectorDiagnostic(
      'CONN105',
      `Failed connector result ${result.connectorId} must include at least one diagnostic.`,
      result.connectorId,
    ))
  }

  if (result.status !== 'failed' && !result.profileArtifact) {
    diagnostics.push(connectorDiagnostic(
      'CONN106',
      `Completed connector result ${result.connectorId} must include a profile artifact.`,
      result.connectorId,
    ))
  }

  if (!result.profileArtifact) return false

  const artifactSchemaResult = validateDpmProfileArtifactSchema(result.profileArtifact)
  if (!artifactSchemaResult.valid) {
    diagnostics.push(connectorDiagnostic(
      'CONN107',
      `Connector ${result.connectorId} emitted an invalid profile artifact.`,
      result.connectorId,
    ))
    return false
  }

  const mismatchedSource = result.profileArtifact.sources.find(source =>
    source.connectorId !== result.connectorId || source.connectorVersion !== result.connectorVersion,
  )
  if (mismatchedSource) {
    diagnostics.push(connectorDiagnostic(
      'CONN108',
      `Profile source ${mismatchedSource.id} does not match connector result identity ${result.connectorId}.`,
      result.connectorId,
    ))
  }

  return true
}
